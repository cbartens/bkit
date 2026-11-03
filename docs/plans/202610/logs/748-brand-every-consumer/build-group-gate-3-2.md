
> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/167 files need formatting

> @cbartens/bkit@6.0.0 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


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

> @cbartens/bkit@6.0.0 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
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

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
      Coverage enabled with v8

 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 12874ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 7964ms
     ✓ every fence parses under zsh -n 4838ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (109 tests) 24395ms
   ✓ bkit steps done (24)
     ✓ reports a failed commit with exit 8 without writing the row 930ms
     ✓ a failed commit leaves no row staged in the index 493ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 584ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 456ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 712ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 610ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 576ms
   ✓ bkit steps finish (15)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 466ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 374ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 499ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 368ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 493ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 633ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 429ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 485ms
     ✓ writeStepRow refuses when a recorded path changed 579ms
     ✓ writeStepRow appends its commit sha to the record 519ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 961ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (9)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 415ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 392ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 862ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 510ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 312ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 758ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ commits a package.json change outside bkit.workflows 346ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 683ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (60 tests) 25641ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 857ms
     ✓ names each net-new and worsened finding in the log and the JSON 542ms
     ✓ fails on a net score rise with no net count change 523ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 813ms
     ✓ treats a net score at or below 0.001 as float noise 790ms
     ✓ passes when the change only resolves findings 423ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 495ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 866ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 319ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 623ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1003ms
     ✓ exits 4 on a dropped net field instead of silently passing 772ms
     ✓ exits 4 on no summary instead of silently passing 804ms
     ✓ exits 4 on output that is not JSON instead of silently passing 818ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1017ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 688ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 639ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 772ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 678ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1457ms
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 1032ms
     ✓ fails (exit 1) when vale reports alerts 839ms
     ✓ exits 6 on a vale runtime error 499ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 540ms
     ✓ falls back to vale sync when the main worktree has none 521ms
     ✓ fails when vale sync cannot restore the required styles 393ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 320ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 389ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 533ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 311ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 462ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 328ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 571ms
     ✓ a push that changes no files is not proven a min push 369ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 15413ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 496ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 394ms
     ✓ CI=true -> GITHUB_ACTION 712ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 695ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 820ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 587ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 833ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 515ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 600ms
     ✓ LOCAL -> runtimeHeadless=false 515ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 537ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 609ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 411ms
     ✓ UNKNOWN -> runtimeHeadless=false 791ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 397ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 758ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 375ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 407ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 455ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 463ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 730ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1166ms
     ✓ --file into a missing directory is refused, not created 743ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (133 tests) 29627ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 766ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 402ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 361ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 507ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 574ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 338ms
     ✓ clears a previous attempt's reports before the gate runs 349ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 603ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 431ms
     ✓ a log under the outbox is named main-checkout relative in the record 353ms
     ✓ a log small enough is copied whole: not clamped, raw null 391ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 982ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 681ms
     ✓ numbers runs within the workflow's active run and per step 798ms
     ✓ without --file no row is written and the output carries row null 634ms
   ✓ bkit tests red / green (31)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 337ms
     ✓ a planned test that passes is a vacuous gap, exit 1 582ms
     ✓ a planned test absent from a loaded report is a missing gap 697ms
     ✓ a file that fails to load is a red of kind red-not-loaded 749ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 826ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 809ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 761ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 507ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 710ms
     ✓ per-test proof (3)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 611ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 927ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 915ms
     ✓ green: a passed-accepted test is already landed, not a gap 455ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 406ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 583ms
     ✓ green: --group audits only that group's tasks 393ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 549ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 508ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 820ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1178ms
     ✓ green: lists each gap kind, with the runner output 728ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 919ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 343ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (96 tests) 31855ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 17524ms
     ✓ sync has nothing left to rewrite 11499ms
     ✓ every clause reaches the cut-off of one surface it applies to 1042ms
   ✓ fully retired clauses (6)
     ✓ output-cap's sentence stays inline in the abort handover prompt 1422ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 33198ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 496ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 834ms
     ✓ writes the linear marker shape, taking the tracker from package.json 357ms
     ✓ writes the jira marker shape, taking the tracker from package.json 554ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 683ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 344ms
     ✓ retries a failed create once, and exits 5 when it fails twice 301ms
     ✓ exits 5 when the open-PR probe errors 631ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 406ms
     ✓ prs open still opens against any other base 739ms
     ✓ exits 6 when the created PR's base is not --base 992ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 480ms
     ✓ exits 1 with found=false when there is none 535ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 745ms
     ✓ --number reads one PR, mergeable included 643ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 497ms
     ✓ exits 4 when gh errors and 80 when it needs auth 911ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 505ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 454ms
     ✓ drops the force-build marker from the title subject 626ms
     ✓ takes an explicit --subject 813ms
     ✓ runs no merge when the PR is already MERGED 692ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 676ms
     ✓ prs merge refuses a PR whose base is main 741ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 536ms
     ✓ prs merge refuses when the PR base is unknown 498ms
     ✓ prs merge reads the base from the one pr view it already makes 580ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 534ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 547ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 413ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 644ms
     ✓ never reads dev's required checks without --only-if-required 338ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 459ms
     ✓ updates when a dev ruleset requires status checks 744ms
     ✓ updates when dev's branch protection requires status checks 433ms
     ✓ ignores dev rulesets that require no checks 398ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 460ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 461ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 738ms
     ✓ is not green on an empty rollup (total 0) 1151ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 766ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 815ms
   ✓ bkit prs verbose-ci (4)
     ✓ is a no-op when the title already says so 416ms
     ✓ strips the marker, with or without its bkit prefix 1463ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1132ms
 ✓ .bkit/core/engine/commands/land.test.ts (30 tests) 12659ms
   ✓ pushToDev (16)
     ✓ lands the commit on origin/dev and leaves the main checkout alone 672ms
     ✓ never pushes local dev commits missing from origin/dev 624ms
     ✓ dev moved: rebuilds on the new dev and pushes again 730ms
     ✓ dev moved before every push: exhausted, nothing landed 1338ms
     ✓ any other refusal is returned, not retried 1675ms
     ✓ pushToDev replays a commit range onto origin/dev 630ms
     ✓ a replay retries on the new dev when dev moved 864ms
     ✓ pushToDev log line names what it lands 518ms
     ✓ runs no git hooks in the throwaway checkout, and says so 549ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 653ms
     ✓ a push that fails without a server answer is returned once, never retried 533ms
     ✓ a failed fetch is returned before anything is built 329ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1068ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1148ms
     ✓ lands from a clone whose fetch refspec omits dev 828ms
     ✓ build throwing stops the landing and removes the throwaway checkout 491ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 9448ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 595ms
     ✓ patch (v1 driver): checks every Add / Update / Move-to / Delete target 670ms
     ✓ apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target 663ms
     ✓ apply_patch (v1 driver): checks every Add / Update / Move-to / Delete target 653ms
     ✓ deny mode blocks when any patch target is a first touch, and records all of them 604ms
   ✓ dual driver shape (OpenCode 1.x server() + 2.0 setup()) (6)
     ✓ both drivers emit the same advisory for the same edit 317ms
     ✓ deny mode blocks the first touch on BOTH drivers 332ms
 ✓ .bkit/core/engine/audits/repo/resolve-push-base.test.ts (17 tests) 12279ms
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 2376ms
       ✓ falls back to event.before when gh prints unparseable output 1077ms
       ✓ reports last-green-run as the source when the green head is an ancestor 2380ms
       ✓ CI mode: falls back to event.before and says so when the run list is unreadable 990ms
       ✓ local mode (3)
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 1833ms
         ✓ tests ancestry against --head, not HEAD 2093ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 1526ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (56 tests) 20605ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 1019ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 748ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 653ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 697ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 1058ms
     ✓ fetches the issue and its comments as GitHub returns them 1107ms
   ✓ postCommentOnce (4)
     ✓ records an engine-action row and skips the same key + body on a re-run 1122ms
     ✓ a recent identical comment counts as done (the final close comment) 1273ms
     ✓ a failed post reports done false with the reason and never leaks a token 751ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1217ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 588ms
     ✓ a board the token cannot see is scope 969ms
     ✓ an HTTP 403 from gh is scope 1098ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 1050ms
     ✓ github: no block, no blockers and no further reads 754ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 1529ms
     ✓ a different marker hash posts 1543ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1143ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 14546ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 590ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 311ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 306ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 331ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 331ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 354ms
     ✓ --path records its commit on the run's record, like every other commit mode 385ms
     ✓ a recorded ledger commits only the rows the run appended 600ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 815ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 539ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 312ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 328ms
 ✓ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests) 9952ms
   ✓ bkit skills prune (10)
     ✓ uninstalls unlisted skills from the union of folders and lock keys, never bkit-* 1565ms
     ✓ matches whole names only: a listed name inside a longer one does not keep it 1530ms
     ✓ treats regex characters in a skill name literally 1166ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 1154ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 1111ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 1154ms
     ✓ runs from the checkout top even when called from a subfolder 1132ms
     ✓ keeps bkit-* skills, from folders or the lock, even when .agents/skills.md does not list them 1101ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 4279ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 4272ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 15013ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 1332ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 1525ms
     ✓ resolves config from the repo root when run from a subdirectory 782ms
     ✓ exits 6 when the PUT fails 1168ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1038ms
   ✓ bkit setup protect-main — pre-flight (6)
     ✓ exits 4 when the CI workflow file is missing, before any write 1099ms
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 1177ms
     ✓ asks a human to log in when gh is not authenticated 1125ms
     ✓ exits 3 when gh repo view names no repository 1083ms
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 1075ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 1381ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 999ms
     ✓ exits 6 when the api answer is not JSON 1147ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (64 tests) 16447ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 615ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 582ms
     ✓ a new run of the same FID rewrites startSha 888ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 425ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 880ms
     ✓ a refused dev push is logged, never fails the close 1956ms
     ✓ an unreachable remote is logged, never fails the close 948ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 36965ms
   ✓ bkit repo info (11)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 1122ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 936ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1414ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1180ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 1461ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 1011ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1135ms
     ✓ an unpinned repo reports nulls and asks no registry 1174ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 1107ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 1236ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 810ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 617ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 17309ms
   ✓ bkit fids parse --prompt-file (68)
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ answers for the cwd, not an inherited GIT_DIR 325ms
   ✓ guardRepoConfig (6)
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 323ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 350ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 318ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (171 tests) 66175ms
   ✓ bkit runs gate (68)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 378ms
       ✓ a source change past the validated head refuses (17) and names the path 370ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 384ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 697ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 1395ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 856ms
     ✓ CLI: a failed gh workflow run exits 5 437ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1874ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 390ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 615ms
     ✓ a failed re-trigger push names the cause in the log 922ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1092ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 855ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 438ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 474ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 480ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 524ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 528ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 1407ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 922ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 322ms
     ✓ re-trigger on dev only uses the record of its own FID 387ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 502ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 1281ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 919ms
     ✓ a refused capstone records FAIL with its reason 1013ms
     ✓ an unreadable PR is an API error (20) with no head 725ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 1268ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 2298ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1163ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 1024ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1212ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1578ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1411ms
     ✓ --file and --step go together 1074ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (38 tests) 4940ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1037ms
     ✓ counts files committed since --base 1089ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 794ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 795ms
     ✓ runs the --fallback gate even when no file changed, as it did before 640ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 686ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 734ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 445ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (25 tests) 888ms
   ✓ retired lite labels (2)
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 437ms
     ✓ is null when pnpm fails or prints something that is not a version 887ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > repeat harvest of same rows does not duplicate (idempotent)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 672ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1350ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 399ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 1191ms
   ✓ shipped hook templates (5)
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 810 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 128 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 364ms
 ✓ .bkit/core/engine/audits/templates/context-templates.test.ts (74 tests) 1715ms
   ✓ .bkit/templates/context/ (74)
     ✓ bkit-playwright.md: playwright self-skips with no credentials 310ms
     ✓ install copies them into .bkit/templates/context/ 500ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (100 tests) 276ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 249ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 116ms
stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing
[bkit-install] Wrote .bkit/advisories.md (1 item).

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > overwrites an existing artifact on each call
[bkit-install] Wrote .bkit/advisories.md (0 items).

 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 166ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 302ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 448ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 349ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (283 tests) 158ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-lNK2kP/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 147ms
 ✓ .bkit/core/engine/checks/after/index.test.ts (53 tests) 438ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 35ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 140ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 64ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (258 tests) 425ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 327ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 43ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-sH6CfC/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 120ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 410ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 252ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 387ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (32 tests) 34ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 25ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 258ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (53 tests) 304ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 180ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 88ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 85ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 23ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 100ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 87ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 71ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 87ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 18ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 40ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 65ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 38ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 148ms
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

 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 40ms
 ✓ .bkit/core/engine/render/hosts.test.ts (125 tests) 137ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 83ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 121ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (254 tests) 181ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 42ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 72ms
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

 ✓ .bkit/core/engine/install/manifest.test.ts (49 tests) 83ms
 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 57ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793593938040.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793593938043.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793593938044.md — skipping (expected exactly one of each)

 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 56ms
stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793593938057.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 31ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 147ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (49 tests) 56ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 157ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 77ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 104ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (40 tests) 103ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 33ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (105 tests) 113ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 45ms
(node:44349) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:44349) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (65 tests) 135ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 86ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 102ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 83ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 76ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > writes the file when absent and records the write
[test] core: .bkit/allowlist.json

 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (28 tests | 2 skipped) 42ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 37ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (25 tests) 99ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 27ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 52ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 41ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 38ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 12ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 34ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 35ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 23ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 11ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 24ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 22ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (27 tests) 30ms
(node:45618) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:45618) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:45618) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:45618) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 13ms
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 67ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 38ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 17ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 43ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (152 tests) 81059ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 637ms
   ✓ bkit workflows fail (19)
     ✓ aborts a rebase only when one is in progress 473ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 365ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 384ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 377ms
       ✓ counts subagents of an earlier chat the run's session rows name 351ms
       ✓ records no context block, and still closes, outside a Claude Code session 376ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 357ms
     ✓ records ending held and publish false on the workflow-done row 582ms
     ✓ defaults the close row to ending done 451ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 409ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 467ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 461ms
     ✓ always writes the telemetry, whatever the runtime 453ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 426ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 431ms
     ✓ an unwritable stats path is logged and never fails the close 511ms
     ✓ appends the completeness row before the workflow-done row 409ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 363ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 342ms
     ✓ writes one completeness row per close 541ms
     ✓ leaves out the previous run's rows that share a second with this run's start 313ms
     ✓ still closes when the completeness check throws 337ms
     ✓ still closes when the completeness row write throws 364ms
     ✓ ship: run.pr, size of the squash commit, and coverage 440ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 594ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 392ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 375ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 506ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 511ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 779ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 507ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 507ms
     ✓ --record-step writes the close step's row before workflow-done 426ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 397ms
     ✓ --number without --outbox is a usage error 413ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 559ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 637ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 733ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 802ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 443ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 774ms
     ✓ --flush with nothing to record commits and pushes nothing 594ms
     ✓ --flush carries the named worktree's logs into the dev commit 873ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 1877ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 942ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1690ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 905ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1201ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1063ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1196ms
     ✓ --push on dev never carries a row whose references name another feature 1244ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 945ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 1973ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2447ms
     ✓ --push commits in the named worktree, not the checkout it runs from 714ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1242ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1048ms
     ✓ a close that landed releases the lock 1420ms
     ✓ removes the worktree before it releases the lock 1501ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4402ms
       ✓ closePr refuses when the PR base is unknown 3759ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1345ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 468ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 327ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 383ms
     ✓ names the branch, not the remote-tracking ref, in each URL 359ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 308ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 315ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 621ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 379ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1146ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 667ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 652ms
     ✓ a second run's record does not let this FID's close commit 862ms
     ✓ record is present after workflows close and before the push 1506ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2237ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 328ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 532ms
     ✓ --plan is appended when the file exists and skipped when it does not 405ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 568ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 1134ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 946ms
     ✓ puts each --line after the summary, in flag order 934ms
     ✓ --summary prints the file and keeps a copy in --outbox 1142ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 979ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 346ms
     ✓ a missing summary file exits 13 before anything is written 324ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 367ms
     ✓ a folder outside the outbox sessions folder is kept 369ms
     ✓ without --session-dir prints no sessionRemoved 323ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 19ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 35ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 16ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 26ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 24ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 24ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 18ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 12ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 9ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 27ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 15ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 21ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 12ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 5ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 9ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (224 tests) 129177ms
   ✓ branches rebase: behaviour (19)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 469ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 463ms
     ✓ --file records nothing for a refused rebase 351ms
     ✓ refuses a code conflict and aborts the rebase on the spot 430ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 728ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 325ms
     ✓ produces byte-identical output to merge=union 712ms
     ✓ restores a trailing newline so the next append starts on its own line 553ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 517ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 734ms
     ✓ refuses a union that leaves a line which is not JSON 447ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 549ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1300ms
     ✓ refuses a lockfile whose regenerate command fails 816ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 321ms
     ✓ removes a stale sentinel when the rebase succeeds 418ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 548ms
     ✓ resolves a conflict in each of two replayed commits across rounds 748ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 310ms
       ✓ skips (12) with no anchor 323ms
       ✓ skips (12) when the base is unreachable in this clone 402ms
       ✓ skips (12) when nothing landed since the base 374ms
       ✓ runs (0) with the landed path count once dev moved 809ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 380ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 770ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 379ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 470ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1134ms
     ✓ runs exactly one git push 1403ms
     ✓ --set-upstream records the upstream 458ms
     ✓ refuses with no branch checked out 391ms
     ✓ --mode=dev refuses a feature checkout 355ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 906ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1709ms
     ✓ --require-ci pushes as-is when dev has not moved 706ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1114ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1875ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 432ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1016ms
     ✓ --mode=abort pushes when the branch has no open PR 1171ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 955ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 410ms
     ✓ --open-pr carries the MCP answer and skips gh 518ms
     ✓ --mode=abort on dev pushes plainly without probing 347ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 866ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 768ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1182ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2753ms
     ✓ skip-ci HEAD on the replay is refused 598ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1218ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2236ms
     ✓ a level local dev is a plain push, recording nothing extra 850ms
     ✓ a record with no commits pushes nothing 631ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 372ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1913ms
     ✓ a rewritten branch is refused, never forced 486ms
     ✓ refuses dev and main with exit 21 and pushes nothing 345ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 889ms
     ✓ refuses a detached HEAD (exit 5) 356ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 814ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 844ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 868ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1142ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 477ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1064ms
     ✓ an up-to-date branch is a no-op 702ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1024ms
     ✓ a fetch that fails exits 10 424ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 514ms
     ✓ --paths with no match exits 1 650ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 514ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 978ms
     ✓ --marker reads a diff over 1 MiB 559ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 712ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 675ms
     ✓ scan-diff finds an added skip 667ms
     ✓ scan-diff ignores a skip predating the base 572ms
     ✓ scan-diff reports a disabled test with its line 992ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 786ms
     ✓ scan-diff ignores a removed comment in a test file 770ms
     ✓ scan-diff ignores an assertion moved within the file 775ms
     ✓ scan-diff still reports a removed assertion 760ms
     ✓ scan-diff reports an assertion re-added only outside the test file 613ms
     ✓ scan-diff finds an added pytest mark skip 736ms
     ✓ scan-diff finds an added unittest skip 792ms
     ✓ scan-diff finds an added bare skip call 875ms
     ✓ scan-diff ignores a quoted skip in a documentation file 932ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1040ms
     ✓ scan-diff ignores an assertion whose expectation changed 828ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 959ms
     ✓ scan-diff reports a deleted test file 1043ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 773ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1901ms
     ✓ a title that already carries the marker is left alone 1592ms
     ✓ with no open PR: pushes the marker commit and edits no title 1682ms
     ✓ a re-run is deduped: no second marker commit 2302ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 2653ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 528ms
     ✓ --title-set skips gh entirely 482ms
   ✓ branches sync (24)
     ✓ Path B once dev moved; --head checks a given commit 398ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 391ms
     ✓ --merge-docs merges dev when docs/ is behind 454ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 452ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 2663ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 541ms
     ✓ --merge-docs skips an empty bkit:generate script 452ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 398ms
     ✓ --merge-docs never merges on dev itself 367ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 697ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1411ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 686ms
     ✓ --merge merges dev into the feature branch with a skip-ci merge commit, never a rebase 573ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 679ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 683ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 785ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 719ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output with skip ci 835ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 569ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 383ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 468ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 699ms
     ✓ a failed install stops ship (16) 560ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 448ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 439ms
     ✓ exits 10 when the fetch fails 332ms
   ✓ branches land (27)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 330ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 977ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1000ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 981ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1031ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2109ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2607ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 468ms
     ✓ local: names unpushed dev as the cause when the branch carries it 510ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 507ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 975ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1045ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 999ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 773ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1099ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 985ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 669ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1009ms
     ✓ land removes the worktree when only the copied .env is untracked 844ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 808ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 917ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1489ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 815ms
     ✓ landPr refuses a main-based PR without retrying 539ms
     ✓ landPr refuses when the PR base is unknown 549ms
     ✓ PR not open (closed): stops (17) at once, no retry 650ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 476ms
     ✓ --attempt names the merge round in a fix commit 407ms
     ✓ commits a rewritten and a deleted tracked file 419ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 357ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 330ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 409ms

 Test Files  166 passed (166)
      Tests  6959 passed | 2 skipped (6961)
   Start at  14:30:58
   Duration  129.91s (tests 96%, setup 2%, import 1%, worker 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/748-brand-every-consumer/build-group-gate-3-2.log.reports/vitest-94130.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.73 |    82.71 |   94.98 |   91.02 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   90.85 |    85.85 |   95.09 |   94.66 |                   
  auth.ts          |   98.46 |    98.11 |     100 |   97.95 | 69                
  ci-yml.ts        |   90.74 |    82.83 |     100 |   93.01 | ...09,422-424,435 
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
 ...mmands/install |   47.86 |    45.74 |   58.75 |   48.22 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |      20 |     26.5 |      50 |   17.77 | ...42-146,217-613 
  uninstall.ts     |   67.79 |    64.46 |      70 |   68.92 | ...1101,1124-1291 
  upgrade.ts       |   32.34 |    30.88 |   33.33 |   33.45 | 350-378,560-1066  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   92.53 |    84.16 |    96.4 |      94 |                   
  branches.ts      |   89.58 |     82.9 |   97.74 |   90.97 | ...2550,2555,2580 
  challenge.ts     |   96.59 |    83.03 |     100 |      98 | 178,368-370,652   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.36 |    86.99 |      98 |   97.28 | ...1622,1793,1882 
  counters.ts      |   98.26 |    94.38 |     100 |    98.7 | 203,502           
  decisions.ts     |   95.32 |    80.72 |   97.72 |   98.36 | 195,300,369       
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   97.87 |    91.54 |   98.24 |   98.79 | 195,436-437,765   
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
  tests.ts         |   97.18 |     89.2 |   97.17 |   98.12 | ...2083,2179-2181 
  tracker.ts       |   92.89 |    73.23 |     100 |   96.73 | ...36,848,931,979 
  workflows.ts     |   93.38 |    82.47 |   97.29 |   95.03 | ...1747,1921,2642 
  worktrees.ts     |   59.49 |     56.7 |   64.81 |   60.25 | ...1074,1077-1078 
 engine/install    |   93.17 |    84.64 |   94.15 |   95.96 |                   
  cloud-env.ts     |    96.9 |     91.3 |     100 |   99.64 | 223               
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,294            
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
Statements   : 89.73% ( 17324/19306 )
Branches     : 82.71% ( 12259/14820 )
Functions    : 94.98% ( 2824/2973 )
Lines        : 91.02% ( 15138/16631 )
================================================================================

> @cbartens/bkit@6.0.0 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/*.bats

1..36
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 490 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 232 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 231 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 214 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 202 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 224 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 74 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 229 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 197 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 202 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 210 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 206 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 211 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 209 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 873 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 523 ms
ok 17 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 20 ms
ok 18 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 22 ms
ok 19 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 17 ms
ok 20 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 15 ms
ok 21 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 19 ms
ok 22 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 14 ms
ok 23 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 32 ms
ok 24 stub: --paginate emits one document per page; --slurp collapses them into an array # in 47 ms
ok 25 refresh builds the register from the staged files, not HEAD or unstaged edits # in 539 ms
ok 26 refresh drops a file deleted in the index from the build # in 321 ms
ok 27 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 411 ms
ok 28 a key removed from the env file is unset on the next run # in 181 ms
ok 29 an empty value unsets the key instead of setting an empty string # in 169 ms
ok 30 non-BKIT_ keys are skipped # in 145 ms
ok 31 one failing key does not stop the others and the exit status is non-zero # in 158 ms
ok 32 a failed unsetenv is retried on the next run # in 177 ms
ok 33 logs key names only, never values # in 143 ms
ok 34 missing env file exits 0 without calling launchctl # in 25 ms
ok 35 the sweep prints the summary line the lane greps for # in 282 ms
ok 36 the lane's grep pattern rejects output without the summary line # in 8 ms
> [bkit] TRUNCATED — kept 1683 of 3142 lines (118 KB of 243 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
