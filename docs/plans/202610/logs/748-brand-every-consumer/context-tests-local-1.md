
> @cbartens/bkit@6.0.0 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> pnpm bkit:gate:static-unit && pnpm test:integration


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


0/168 files need formatting

> @cbartens/bkit@6.0.0 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


 .bkit/core/.bkit/README.md
 342:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


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
 600:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 822:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 991:108   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1093:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1254:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1312:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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

[bkit-ci] base 9fe3aaf590bf743321b7d6671880959e4b3ec94f (9fe3aaf590bf743321b7d6671880959e4b3ec94f) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 9fe3aaf590bf743321b7d6671880959e4b3ec94f
base: 9fe3aaf590bf743321b7d6671880959e4b3ec94f
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 10.6 on 10 cores: unit limits 5289ms per test, 10578ms per hook (x1.06)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
      Coverage enabled with v8

 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 13636ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 13623ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 57925ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 1213ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 887ms
     ✓ always writes the marker, even with no plan 842ms
     ✓ writes the linear marker shape, taking the tracker from package.json 688ms
     ✓ writes the jira marker shape, taking the tracker from package.json 472ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 581ms
     ✓ refuses a PR from dev, main, or the base itself 1022ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 746ms
     ✓ retries a failed create once, and exits 5 when it fails twice 935ms
     ✓ exits 5 when the open-PR probe errors 632ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 773ms
     ✓ prs open refuses --base=main 357ms
     ✓ prs open refuses --base=refs/heads/main, the same branch as main 371ms
     ✓ prs open refuses --base=origin/main, the same branch as main 387ms
     ✓ prs open refuses --base=heads/main, the same branch as main 398ms
     ✓ prs open refuses --base=refs/remotes/origin/main, the same branch as main 407ms
     ✓ prs open still opens against any other base 900ms
     ✓ exits 6 when the created PR's base is not --base 678ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 610ms
     ✓ exits 1 with found=false when there is none 613ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 990ms
     ✓ --number reads one PR, mergeable included 846ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 1216ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1279ms
     ✓ refuses a bad --state or --number 709ms
   ✓ bkit prs scan-body (10)
     ✓ flags [skip ci] in the landed commit body (exit 1) 591ms
     ✓ flags [ci skip] in the landed commit body (exit 1) 699ms
     ✓ flags [no ci] in the landed commit body (exit 1) 506ms
     ✓ flags [skip actions] in the landed commit body (exit 1) 337ms
     ✓ flags [actions skip] in the landed commit body (exit 1) 306ms
     ✓ flags [SKIP CI] in the landed commit body (exit 1) 301ms
     ✓ passes a token-free body 367ms
     ✓ passes a deliberate token in the SUBJECT with a clean body (docs-only close) 663ms
     ✓ exits 2 on an empty or option-like sha, 3 on an unreadable one 378ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 953ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 639ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 893ms
     ✓ drops the force-build marker from the title subject 527ms
     ✓ takes an explicit --subject 591ms
     ✓ runs no merge when the PR is already MERGED 802ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 871ms
     ✓ prs merge refuses a PR whose base is main 853ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 524ms
     ✓ prs merge refuses when the PR base is unknown 451ms
     ✓ prs merge reads the base from the one pr view it already makes 482ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 561ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 653ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 538ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 416ms
     ✓ exits 2 on a bad --number 321ms
     ✓ never reads dev's required checks without --only-if-required 548ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 2300ms
     ✓ updates when a dev ruleset requires status checks 1089ms
     ✓ updates when dev's branch protection requires status checks 819ms
     ✓ ignores dev rulesets that require no checks 1209ms
     ✓ updates when the repo cannot be resolved 1280ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 2449ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 1286ms
     ✓ is not green when a check failed, naming it (exit 1) 902ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 1102ms
     ✓ is not green on an empty rollup (total 0) 2385ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 990ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1320ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 596ms
     ✓ is a no-op when the title already says so 491ms
     ✓ strips the marker, with or without its bkit prefix 886ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 994ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ scans a clean landed body and records the close-transport row 357ms
     ✓ exits 8 on an unreadable commit, writing nothing 338ms
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 376ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (135 tests) 66860ms
   ✓ resolveGate (6)
     ✓ no package.json, no scripts, or unparseable -> null 572ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 424ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 404ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 462ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 409ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 348ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 470ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 501ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 333ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 392ms
     ✓ PASS is 0 failures with or without reports 371ms
     ✓ clears a previous attempt's reports before the gate runs 543ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 317ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 830ms
     ✓ a log under the outbox is named main-checkout relative in the record 669ms
     ✓ a log small enough is copied whole: not clamped, raw null 599ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 380ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 551ms
     ✓ numbers runs within the workflow's active run and per step 469ms
     ✓ without --file no row is written and the output carries row null 468ms
   ✓ bkit tests plan-check (28)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 468ms
     ✓ plan-check refuses a task without DONE WHEN 538ms
     ✓ plan-check refuses DEPENDS ON a later group 530ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 587ms
     ✓ plan-check matches a Markdown heading symbol 1111ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 399ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 383ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 567ms
     ✓ plan-check skips existence on ticked tasks 535ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 928ms
     ✓ plan-check refuses an unmapped matrix row 309ms
     ✓ plan-check refuses a delete with no supersession row 754ms
     ✓ plan-check refuses a matrix row mapped to two tasks 319ms
     ✓ plan-check refuses a task no matrix row maps to 313ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 321ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 631ms
     ✓ plan-check refuses a group with 6 tasks 333ms
     ✓ plan-check accepts 5 tasks and 25 tests in one group 311ms
     ✓ plan-check report lists groups, not a verdict 678ms
     ✓ plan-check refuses a task over the per-task caps, naming the task and the cap 304ms
     ✓ plan-check follows bkit.workflows.tasks 411ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 561ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1164ms
     ✓ a planned test that passes is a vacuous gap, exit 1 961ms
     ✓ a planned test absent from a loaded report is a missing gap 1226ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1141ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1304ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 667ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 2300ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 1967ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1243ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 1108ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 4806ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 2714ms
       ✓ a later unproven result never replaces a proven red of the same lines 1356ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 2495ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1300ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1159ms
     ✓ green: a passed-accepted test is already landed, not a gap 737ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 671ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 422ms
     ✓ green refuses a plan with no task markers 316ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 657ms
     ✓ green: --group audits only that group's tasks 501ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1074ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 992ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 842ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 741ms
     ✓ green: lists each gap kind, with the runner output 640ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1578ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 954ms
       ✓ green clears an exception-only task from a human commit 1035ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (60 tests) 73162ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1465ms
     ✓ names each net-new and worsened finding in the log and the JSON 1272ms
     ✓ fails on a net score rise with no net count change 861ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1125ms
     ✓ treats a net score at or below 0.001 as float noise 899ms
     ✓ passes when the change only resolves findings 972ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1176ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 644ms
     ✓ skips (exit 0) when the base resolves to HEAD 736ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1275ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 1339ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 1039ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1318ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1209ms
     ✓ exits 4 on a dropped net field instead of silently passing 1410ms
     ✓ exits 4 on no summary instead of silently passing 2397ms
     ✓ exits 4 on output that is not JSON instead of silently passing 2083ms
     ✓ exits 5 when the base worktree cannot be created 1085ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1787ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 3090ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 2105ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1470ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1932ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 3278ms
   ✓ bkit ci prose — file selection (3)
     ✓ defaults to every markdown file outside node_modules 1759ms
     ✓ a one-level glob does not descend; ** does; each file once across globs 1027ms
   ✓ bkit ci prose — gate (5)
     ✓ fails when vale is not installed 771ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 1260ms
     ✓ fails (exit 1) when vale reports alerts 1421ms
     ✓ exits 6 on a vale runtime error 2567ms
     ✓ skips with exit 0 when no file matches 1652ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1700ms
     ✓ falls back to vale sync when the main worktree has none 3145ms
     ✓ fails when vale sync cannot restore the required styles 941ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 1288ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 801ms
     ✓ is a usage error when the commit cannot be read 883ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 1058ms
     ✓ exits 1 naming the code file, whatever the commit message says 661ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 843ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 462ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 1341ms
     ✓ exits 7 when a commit cannot be read 781ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 795ms
     ✓ exits 1 naming the files outside, whatever the commit message says 1032ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1447ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 1030ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 773ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 1873ms
     ✓ a top-level glob in the setting does not reach into folders 1864ms
     ✓ a push that changes no files is not proven a min push 1863ms
     ✓ exits 7 when a commit or its base cannot be read 1932ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 81672ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 1848ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 1955ms
     ✓ brand-new untracked ledger is staged and committed 1885ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 1320ms
     ✓ path containing a space is staged and committed 819ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 603ms
     ✓ staging failure: exit 4 and no commit is created, no false success 1041ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 1203ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 596ms
     ✓ --mode=stage stages the sweep but creates no commit 930ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 2396ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 1227ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 1291ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 635ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 631ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 591ms
     ✓ --root defaults to the working directory 822ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 3564ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 2294ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 4691ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 1083ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 2952ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 1362ms
     ✓ a path outside the checkout exits 6 with nothing committed 860ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 876ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 564ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 1929ms
     ✓ --path records its commit on the run's record, like every other commit mode 1173ms
     ✓ a recorded ledger commits only the rows the run appended 1559ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 2520ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 2055ms
     ✓ commitBookkeeping refuses when a recorded path changed 1178ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 1358ms
     ✓ under --mode=commit counts the squashed paths as something to commit 1893ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 2709ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 1250ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 1510ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 611ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 420ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 678ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 491ms
     ✓ carries untracked ledgers too 594ms
     ✓ keeps rows on separate lines when the destination has no final newline 598ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 1143ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 1890ms
     ✓ a source file in the range: exit 7, path listed 898ms
     ✓ another FID's plan file in the range: exit 7 2104ms
     ✓ from not an ancestor of to: exit 7 2709ms
     ✓ unknown commit exits 3; a missing flag exits 2 938ms
   ✓ bkit ledgers append (20)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 358ms
     ✓ append writes nothing when one row is invalid 370ms
     ✓ append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts 670ms
     ✓ append bumps a round-second mint 356ms
     ✓ append refuses a writer not listed for the kind 338ms
     ✓ append carries firstTs forward and counts updates, across calls and within one batch 303ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 397ms
     ✓ triage keeps an own-cycle deferral exempt 417ms
     ✓ triage marks an unjustified deferral lazy 972ms
     ✓ triage writes an unjustified row with a minted ts 494ms
     ✓ triage writes no row for a closed deferral 410ms
     ✓ triage reports an adjudicated unjustified row outside exempt 407ms
     ✓ triage ignores another feature's deferral rows 447ms
     ✓ triage writes nothing when the FID has no deferral row 387ms
     ✓ triage refuses a plan with no task blocks 567ms
     ✓ triage refuses a plan whose task blocks do not parse 480ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 383ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (109 tests) 104458ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 1239ms
     ✓ done --group writes group on the row 866ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 847ms
     ✓ build-group-start records parentSha and group 332ms
     ✓ carries extra fields, parsed as JSON when they are JSON 464ms
     ✓ needs a message unless --commit=none 359ms
     ✓ reports a failed commit with exit 8 without writing the row 1418ms
     ✓ a failed commit leaves no row staged in the index 1191ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1707ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1272ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1518ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 804ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1395ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 544ms
     ✓ a missing artifact exits 4 477ms
     ✓ empty artifact exits 0 406ms
     ✓ pending artifact exits 1 833ms
     ✓ no marker artifact exits 2 481ms
     ✓ disallowed artifact exits 3 438ms
     ✓ bad failures artifact exits 4 545ms
     ✓ a required field that is absent is invalid (re-prompt) 696ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 741ms
     ✓ only reads above the marker 380ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 1066ms
     ✓ fails when no row was written for the step 355ms
     ✓ --ref reads the status file as committed on that ref, not from disk 710ms
     ✓ --ref exits 3 when the ref does not carry the status file 858ms
     ✓ fails on a placeholder left in the artifact 957ms
     ✓ fails when the row's verdict differs from the artifact's 1216ms
     ✓ fails when the row does not list the artifact, or carries another attempt 1040ms
     ✓ fails on a missing artifact 919ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 896ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 300ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 816ms
     ✓ fails a diagnose row missing its strategy, passes with it 643ms
     ✓ fails a run-tests row missing its scope, and an empty scope 1023ms
     ✓ names every missing field at once 307ms
     ✓ asks nothing of a step that writes none of them 378ms
   ✓ bkit steps finish (15)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 1080ms
     ✓ re-asks (exit 6) when a field the prompt declares is missing 515ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 1725ms
     ✓ a true | false header field is true when any agent sets it true 1021ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 961ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 1436ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1664ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 947ms
     ✓ --post needs --number; without --post there is no tracker key 619ms
   ✓ bkit steps stub (3)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ checks the FID's shape for the wired tracker 497ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 703ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 1233ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 967ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 719ms
       ✓ gate --issue="" under none keeps today's check 318ms
     ✓ --attempt-of checks the row carries the derived counter 1195ms
> [bkit] TRUNCATED HERE — 56 lines omitted. Dropped content was NOT read.
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 961ms
     ✓ fails with a fetch error when there is no origin to rebase onto 1839ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 720ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 550ms
     ✓ tells a caller inside the removed worktree where to cd 438ms
     ✓ fails with its own exit code when git cannot remove a marked path 357ms
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 1407ms
> [bkit] TRUNCATED HERE — 96 lines omitted. Dropped content was NOT read.
     ✓ 5. an issue-less mint a finished run used takes the next free suffix 384ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 685ms
     ✓ 6. a FID that fails the format check exits 1 316ms
   ✓ bkit fids design --description-file --prompt-file (5)
     ✓ a plan issue's Workstreams line lists the workstreams the plan covers 415ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 2385ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1597ms
     ✓ a push that fails without a server answer is returned once, never retried 1349ms
     ✓ a failed fetch is returned before anything is built 868ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 3453ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2047ms
     ✓ lands from a clone whose fetch refspec omits dev 1000ms
     ✓ build throwing stops the landing and removes the throwaway checkout 489ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (171 tests) 144599ms
   ✓ fixture gh stub (10)
     ✓ BKIT_FAKE_RATELIMITED=1: the run list fails rate-limit-shaped, rate_limit still answers 450ms
   ✓ bkit runs gate (68)
     ✓ accepts a green capstone at the head (exit 0) and says so 306ms
     ✓ rejects a green run at a superseded head (14), given --branch 308ms
     ✓ --fetch refreshes origin/<branch> before gating 924ms
     ✓ exit 12 failed steps (10)
       ✓ bkit.testing.ciGenerated adds steps to the floor 324ms
     ✓ skipped lanes (16 is opt-in) (5)
       ✓ refuses a skipped lane named in bkit.testing.ciRequired (16) 371ms
       ✓ a required lane naming a different lane does not refuse 318ms
     ✓ tells an API error (20) from no run (10) 559ms
     ✓ stderr noise on a successful gh call does not corrupt the JSON read 307ms
     ✓ config (5)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 658ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 513ms
       ✓ a run still in progress whose capstone already passed passes 322ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 695ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 2709ms
       ✓ a source change past the validated head refuses (17) and names the path 1960ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 2030ms
       ✓ --validated without --month / --fid is a usage error (2) 697ms
       ✓ a validated sha that is not an ancestor refuses (17) 1159ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 1461ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 645ms
     ✓ CLI: a failed gh workflow run exits 5 778ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1942ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 1028ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1772ms
     ✓ a failed re-trigger push names the cause in the log 3481ms
     ✓ a failed re-trigger push leaves no orphan commit behind 4233ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 9997ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 2475ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 1197ms
     ✓ gh-error: every poll errored 742ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1314ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1340ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1996ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1803ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 8117ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 4659ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1426ms
     ✓ re-trigger on dev only uses the record of its own FID 1692ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1564ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 791ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 1022ms
     ✓ a refused capstone records FAIL with its reason 1138ms
     ✓ an unreadable PR is an API error (20) with no head 638ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 1221ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 1954ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1556ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 1130ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 2294ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1709ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1912ms
     ✓ --file and --step go together 2542ms
 ❯ .bkit/core/engine/tools/instructions.test.ts (96 tests | 1 failed) 145860ms
   ❯ the corpus matches the instructions store (8)
     ✓ finds prompts, workflows, both rules files, and every audit template with its adopted copy 2ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ loads every shipped doc master with a bkit block as a doc, never an installed copy 1ms
     ✓ checks a doc inside its bkit block only and pools it with the plan template and AGENTS.md 0ms
     × has no findings 112356ms
     ✓ every prompt, workflow and utility agent has the three header blocks 1235ms
     ✓ sync has nothing left to rewrite 26985ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ the retired scoped policy is not restated as current 0ms
   ✓ the checker rejects what it should (22)
     ✓ a missing required clause fails 2ms
     ✓ a duplicated clause fails 1ms
     ✓ a weakened rewrite is a near-copy, not a match 2ms
     ✓ an unrelated sentence is not a near-copy 0ms
     ✓ a clause inside a fenced block does not count 0ms
     ✓ a forbidden clause fails where present 0ms
     ✓ if-verdict is required with a verdict header and forbidden without 3ms
     ✓ an excepted file is not checked 0ms
     ✓ retired wording fails 1ms
     ✓ an anchored template fails on a line that starts it but does not match 1ms
     ✓ position: first fails when another bullet opens the block 1ms
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
     ✓ a required clause is checked inside the managed block only 1ms
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
     ✓ two swapped lines in one block fail 0ms
     ✓ a clause in the wrong block fails 0ms
     ✓ a placed clause in the body fails 1ms
     ✓ a CAUTION box, a missing block and blocks out of order fail 1ms
     ✓ files outside prompts, workflows and repo agents need no blocks 0ms
     ✓ the wording file takes block and position: first, and rejects anything else 2ms
   ✓ rule copies outside the Rules block (2)
     ✓ a rule's copy in Protocol or Contract fails, a cut-short copy included 10ms
     ✓ a line sharing only the rule's label, and the Rules block copy, pass 3ms
   ✓ fully retired clauses (6)
> [bkit] TRUNCATED HERE — 51 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
(node:10342) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 1111ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 823ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1850ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1039ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 1149ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 1801ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1598ms
     ✓ an unpinned repo reports nulls and asks no registry 1466ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 1494ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 1264ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 1891ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 823ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 681ms
     ✓ keeps each context's own section banner and drops every other context's 1759ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 431ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ clamps a ci block with the ci profile and a runtime block without it 381ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 640ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2266ms
     ✓ a refused dev push is logged, never fails the close 3549ms
     ✓ an unreachable remote is logged, never fails the close 1039ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 36330ms
   ✓ bkit runtime detect — the table (17)
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1488ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 1642ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 1580ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 1096ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1531ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1156ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 930ms
     ✓ --file into a missing directory is refused, not created 1208ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 1354ms
     ✓ resolves config from the repo root when run from a subdirectory 1224ms
     ✓ exits 6 when the PUT fails 1816ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1605ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 820ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 1242ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 1334ms
     ✓ exits 6 when the api answer is not JSON 1634ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (69 tests) 3541ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1134ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1720ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1516ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 2427ms
     ✓ fetches the issue and its comments as GitHub returns them 1869ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ records an engine-action row and skips the same key + body on a re-run 1810ms
     ✓ a recent identical comment counts as done (the final close comment) 1521ms
     ✓ a failed post reports done false with the reason and never leaks a token 1690ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1895ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker 382ms
     ✓ a different marker hash posts 870ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 608ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (25 tests) 1186ms
   ✓ retired lite labels (2)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1901ms
     ✓ counts files committed since --base 1720ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1178ms
     ✓ runs nothing and exits 0 when no file changed 760ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 903ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 2321ms
       ✓ falls back to event.before when gh prints unparseable output 714ms
       ✓ reports last-green-run as the source when the green head is an ancestor 858ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 1136ms
         ✓ tests ancestry against --head, not HEAD 1778ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 1841ms
 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (50 tests) 1873ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (37 tests) 9304ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 1113ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1920ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 1262ms
     ✓ challenge gate exits 5 when --base names no commit 383ms
 ✓ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests) 6059ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ treats regex characters in a skill name literally 872ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 870ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 854ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 515ms
     ✓ runs from the checkout top even when called from a subfolder 630ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
   ✓ bkit issues labels --write (5)
     ✓ reads the labels itself, writes the transition and the state, prints tracker done 366ms
     ✓ a failed read prints done false and the transition of the given --label set 393ms
     ✓ a malformed board target is refused before any label is written 355ms
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 1079ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (38 tests) 11387ms
   ✓ bkit disk prune — step files (10)
     ✓ min runs only min steps; max runs both 781ms
     ✓ a failing or throwing step is reported and the next step still runs 328ms
   ✓ bkit disk prune — lock (9)
     ✓ renews its lock while a long step runs, so a waiter never takes it over 594ms
> [bkit] TRUNCATED HERE — 46 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 1295ms
     ✓ passes every rule on a clean head 462ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 559ms
 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (291 tests) 1331ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (31 tests) 4098ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ is undefined outside a repo 327ms
   ✓ guardRepoConfig (6)
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 434ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 607ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 437ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (58 tests) 3042ms
   ✓ bkit counters route --point (7)
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
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 423ms
     ✓ is null when pnpm fails or prints something that is not a version 1451ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > writes plugin.json, hooks.json, both hook scripts, and emits the setup advisory
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
> [bkit] TRUNCATED HERE — 53 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 869 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 168 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/workflow/status.test.ts (70 tests) 1926ms
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 476ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (9 tests) 1771ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (100 tests) 350ms
stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles a file with only malformed lines without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-5t4UvC/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

 ✓ scripts/harvest/ledgers.test.ts (7 tests) 1247ms
   ✓ Harvest dedup by per-kind composite identity (WS4-T2) (3)
     ✓ repeat harvest of same rows does not duplicate (idempotent) 418ms
   ✓ Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) (3)
     ✓ handles a file with only malformed lines without throwing 308ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 177ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (283 tests) 199ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 124ms
 ✓ .bkit/core/engine/render/trackers.test.ts (102 tests) 204ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 219ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 256ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (254 tests) 125ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 378ms
(node:98366) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:98366) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:98366) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:98366) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 174ms
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 172ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (105 tests) 87ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 245ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 189ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 78ms
(node:99064) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:99064) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (66 tests) 110ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (49 tests) 57ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-XWEBdV/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 86ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 150ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 109ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 81ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 63ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 103ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 94ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 104ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 57ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 170ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 82ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (41 tests) 122ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 105ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (28 tests | 2 skipped) 38ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (27 tests) 28ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 98ms
 ✓ .bkit/core/engine/install/manifest.test.ts (49 tests) 95ms
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

 ✓ .bkit/core/engine/render/hosts.test.ts (125 tests) 77ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 32ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 95ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 61ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 26ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 61ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (28 tests) 84ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 35ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (32 tests) 22ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 68ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 30ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 23ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 106ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 74ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 17ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 49ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 28ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 41ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 60ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 54ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 81ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 19ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 34ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 27ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 57ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 39ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 45ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 26ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 33ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 79ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 93ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 39ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 39ms
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

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793659261223.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793659261227.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793659261227.md — skipping (expected exactly one of each)

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 54ms
stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793659261242.js — skipping

 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 26ms
 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 38ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 35ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 30ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 30ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 36ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 10ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 34ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 13ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 13ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 20ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 21ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 21ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 42ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 12ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 12ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 16ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 22ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 25ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 15ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 12ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (7 tests) 15ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (152 tests) 203441ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 1028ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 2240ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 456ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 365ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 418ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 385ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 585ms
       ✓ a new run in the same chat gets its own session row 594ms
       ✓ writes none outside Claude Code 801ms
     ✓ opens the next run after a finished one, and after another workflow's run 772ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 759ms
     ✓ design / plan / build / debug book in the current worktree 946ms
     ✓ refuses when the lock is live, writing no row 482ms
     ✓ --lock-held checks the lock is ours 802ms
     ✓ rejects an unknown workflow 559ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 1031ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 1328ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 753ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 508ms
     ✓ an OPEN decision of an earlier run never resurfaces 1003ms
     ✓ an OPEN decision mid-build prints its header fields 961ms
     ✓ reads Test attempt from a tests pause 1426ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 1744ms
     ✓ writes no row when status.jsonl does not exist 1172ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 1023ms
     ✓ aborts a rebase only when one is in progress 1498ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 1916ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1493ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 916ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 1050ms
     ✓ --max-exceeded says a handover is due without any sentinel 550ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 641ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 1207ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 930ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 450ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 465ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 322ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 551ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 422ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 679ms
     ✓ a debug run in SOAK mode always needs a handover 2703ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 3197ms
       ✓ counts subagents of an earlier chat the run's session rows name 5245ms
       ✓ records no context block, and still closes, outside a Claude Code session 4875ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 2562ms
     ✓ records ending held and publish false on the workflow-done row 1900ms
     ✓ defaults the close row to ending done 1274ms
     ✓ refuses an unknown ending 476ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1141ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1888ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1641ms
     ✓ always writes the telemetry, whatever the runtime 1309ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 1130ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1546ms
     ✓ an unwritable stats path is logged and never fails the close 3030ms
     ✓ appends the completeness row before the workflow-done row 3316ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1530ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1779ms
     ✓ writes one completeness row per close 3650ms
     ✓ leaves out the previous run's rows that share a second with this run's start 1934ms
     ✓ still closes when the completeness check throws 4195ms
     ✓ still closes when the completeness row write throws 1838ms
     ✓ refuses without status.jsonl and writes nothing 566ms
     ✓ ship: run.pr, size of the squash commit, and coverage 2034ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 2912ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1673ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1406ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1893ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1725ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 2837ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 2354ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 3284ms
     ✓ --record-step writes the close step's row before workflow-done 2640ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 2516ms
     ✓ --number without --outbox is a usage error 1353ms
     ✓ --flush is ship only 409ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1605ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1789ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1766ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1782ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1486ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 534ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 506ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3470ms
     ✓ --flush with nothing to record commits and pushes nothing 1973ms
     ✓ --flush carries the named worktree's logs into the dev commit 3776ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3428ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1416ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1876ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1534ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3041ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1888ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2132ms
     ✓ --push on dev never carries a row whose references name another feature 2486ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2012ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 5030ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3331ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1590ms
     ✓ rejects --push with --flush, and --flush outside ship 443ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 4716ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3703ms
     ✓ a close that landed releases the lock 4327ms
     ✓ removes the worktree before it releases the lock 2807ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4453ms
       ✓ closePr refuses when the PR base is unknown 3324ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2325ms
   ✓ bkit workflows promote (7)
     ✓ exits 12 when there is no versioned draft 362ms
     ✓ stamps the anchor from the runtime-resolved base commit 591ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 493ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 310ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 409ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 332ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 784ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 357ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 310ms
     ✓ a second run's record does not let this FID's close commit 616ms
     ✓ record is present after workflows close and before the push 890ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1647ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 738ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 522ms
     ✓ puts each --line after the summary, in flag order 501ms
     ✓ --summary prints the file and keeps a copy in --outbox 409ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 421ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (224 tests) 283323ms
   ✓ branches rebase: behaviour (19)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1942ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1437ms
     ✓ --file records nothing for a refused rebase 851ms
     ✓ refuses a code conflict and aborts the rebase on the spot 825ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1033ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 1403ms
     ✓ produces byte-identical output to merge=union 3142ms
     ✓ restores a trailing newline so the next append starts on its own line 2095ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 1596ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 3896ms
     ✓ refuses a union that leaves a line which is not JSON 2817ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 2090ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 2562ms
     ✓ refuses a lockfile whose regenerate command fails 1969ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 1440ms
     ✓ removes a stale sentinel when the rebase succeeds 1548ms
     ✓ exits 4 when no rebase is in progress 873ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 2256ms
     ✓ resolves a conflict in each of two replayed commits across rounds 2069ms
   ✓ branches anchor-stamp (19)
     ✓ records the bkit release, and warns visibly under the block when it is outdated 2175ms
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 764ms
     ✓ re-stamping with a different base replaces the block instead of adding a second 459ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 425ms
     ✓ --design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha 728ms
     ✓ two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard) 344ms
   ✓ branches anchor-read (15)
     ✓ round-trips every field 933ms
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 4151ms
       ✓ skips (12) with no anchor 2474ms
       ✓ skips (12) when the base is unreachable in this clone 3499ms
       ✓ skips (12) when nothing landed since the base 1548ms
       ✓ runs (0) with the landed path count once dev moved 2329ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 1085ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1765ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 1574ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1932ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 2782ms
     ✓ runs exactly one git push 3187ms
     ✓ --set-upstream records the upstream 3828ms
     ✓ refuses with no branch checked out 1139ms
     ✓ --mode=dev refuses a feature checkout 1447ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 4508ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 8610ms
     ✓ --require-ci pushes as-is when dev has not moved 2241ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 3955ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 4926ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 1346ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 2383ms
     ✓ --mode=abort pushes when the branch has no open PR 3333ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 2452ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 2591ms
     ✓ --open-pr carries the MCP answer and skips gh 2616ms
     ✓ --mode=abort on dev pushes plainly without probing 1404ms
     ✓ rejects an unknown mode 918ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3255ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 2400ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2631ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4860ms
     ✓ skip-ci HEAD on the replay is refused 1584ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3969ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3494ms
     ✓ a level local dev is a plain push, recording nothing extra 1014ms
     ✓ a record with no commits pushes nothing 726ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 558ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 3287ms
     ✓ a rewritten branch is refused, never forced 905ms
     ✓ refuses dev and main with exit 21 and pushes nothing 838ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1374ms
     ✓ refuses a detached HEAD (exit 5) 711ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1481ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1844ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1359ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1710ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 670ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 3102ms
     ✓ an up-to-date branch is a no-op 1502ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2169ms
     ✓ a fetch that fails exits 10 704ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1069ms
     ✓ --paths with no match exits 1 1588ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 1483ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 2042ms
     ✓ --marker reads a diff over 1 MiB 1370ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 2656ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 2122ms
     ✓ scan-diff finds an added skip 1696ms
     ✓ scan-diff ignores a skip predating the base 1307ms
     ✓ scan-diff reports a disabled test with its line 1117ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1049ms
     ✓ scan-diff ignores a removed comment in a test file 1317ms
     ✓ scan-diff ignores an assertion moved within the file 1227ms
     ✓ scan-diff still reports a removed assertion 1143ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1220ms
     ✓ scan-diff finds an added pytest mark skip 1228ms
     ✓ scan-diff finds an added unittest skip 1082ms
     ✓ scan-diff finds an added bare skip call 1079ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1059ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1101ms
     ✓ scan-diff ignores an assertion whose expectation changed 1295ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 810ms
     ✓ scan-diff reports a deleted test file 476ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 319ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1222ms
     ✓ a title that already carries the marker is left alone 748ms
     ✓ with no open PR: pushes the marker commit and edits no title 1129ms
     ✓ a re-run is deduped: no second marker commit 1443ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1360ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 328ms
     ✓ --title-set skips gh entirely 711ms
     ✓ refuses dev and main (exit 21) 373ms
   ✓ branches sync (24)
     ✓ Path A when origin/dev is an ancestor of HEAD 569ms
     ✓ Path B once dev moved; --head checks a given commit 843ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 693ms
     ✓ --merge-docs merges dev when docs/ is behind 773ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 691ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 4581ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1274ms
     ✓ --merge-docs skips an empty bkit:generate script 691ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1119ms
     ✓ --merge-docs never merges on dev itself 2666ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1408ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 2588ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 2998ms
     ✓ --merge merges dev into the feature branch with a skip-ci merge commit, never a rebase 1384ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 808ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1972ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1097ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1352ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1068ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output with skip ci 1823ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 2012ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 1121ms
     ✓ exits 10 when the fetch fails 480ms
     ✓ refuses --merge-docs with --head, and an unknown --head 335ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 493ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 658ms
     ✓ a failed install stops ship (16) 638ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 723ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 536ms
     ✓ exits 10 when the fetch fails 440ms
   ✓ branches land (27)
     ✓ refuses a workflow other than design or plan 380ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 323ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 935ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 927ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1323ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 988ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 1829ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2176ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 3426ms
     ✓ local: names unpushed dev as the cause when the branch carries it 1589ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 701ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1338ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1181ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 2169ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2248ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1909ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1570ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 891ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2360ms
     ✓ land removes the worktree when only the copied .env is untracked 1753ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1730ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1504ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2429ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1411ms
     ✓ landPr refuses a main-based PR without retrying 663ms
     ✓ landPr refuses when the PR base is unknown 607ms
     ✓ PR not open (closed): stops (17) at once, no retry 875ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 810ms
     ✓ --attempt names the merge round in a fix commit 646ms
     ✓ commits a rewritten and a deleted tracked file 629ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 777ms
     ✓ reports undeclared and runs nothing with no scripts 435ms
     ✓ reports undeclared and runs nothing with an empty script 497ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 575ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 599ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 351ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/tools/instructions.test.ts > the corpus matches the instructions store > has no findings
Error: Test timed out in 63463ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/tools/instructions.test.ts:213:3
    211|   });
    212|
    213|   it("has no findings", CORPUS_CASE, () => {
       |   ^
    214|     const findings = checkClauses(CLAUSES, CORPUS).map(formatFinding);
    215|     expect(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 165 passed (166)
      Tests  1 failed | 6979 passed | 2 skipped (6982)
   Start at  08:37:50
   Duration  284.47s (tests 97%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/748-brand-every-consumer/context-tests-local-1.log.reports/vitest-50744.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.74 |    82.71 |   94.96 |   91.05 |                   
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
 engine/commands   |   89.97 |    83.96 |   92.25 |   90.71 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   97.46 |    91.11 |     100 |     100 | 87-91,156,162     
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   93.79 |    87.74 |   95.31 |   97.08 | ...03,439,490-493 
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
 ...mands/workflow |   92.55 |    84.17 |   96.41 |   94.04 |                   
  branches.ts      |   89.58 |     82.9 |   97.74 |   90.97 | ...2550,2555,2580 
  challenge.ts     |   96.59 |    83.03 |     100 |      98 | 178,368-370,652   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.44 |    87.09 |   98.03 |   97.34 | ...1661,1832,1921 
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
  tests.ts         |   97.03 |    88.99 |   97.25 |   98.21 | ...2176,2272-2274 
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
Statements   : 89.74% ( 17385/19371 )
Branches     : 82.71% ( 12295/14864 )
Functions    : 94.96% ( 2831/2981 )
Lines        : 91.05% ( 15194/16687 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1886 of 3751 lines (133 KB of 284 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
