
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
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
 723:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


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

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
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

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 16.3 on 10 cores: unit limits 12650ms per test, 25300ms per hook (x2.53)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (115 tests) 59332ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 407ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 702ms
     ✓ --file needs --workflow 359ms
     ✓ always writes the marker, even with no plan 611ms
     ✓ writes the linear marker shape, taking the tracker from package.json 516ms
     ✓ writes the jira marker shape, taking the tracker from package.json 455ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 527ms
     ✓ refuses a github marker with fid "12-x" issue "abc" (exit 2) 300ms
     ✓ refuses a PR from dev, main, or the base itself 644ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 635ms
     ✓ retries a failed create once, and exits 5 when it fails twice 794ms
     ✓ exits 5 when the open-PR probe errors 517ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 707ms
     ✓ prs open refuses --base=refs/heads/main, the same branch as main 314ms
     ✓ prs open still opens against any other base 815ms
     ✓ exits 6 when the created PR's base is not --base 773ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 6140ms
     ✓ refuses merged entry when current feature evidence cannot be read 2321ms
     ✓ qualifies MCP merged PR facts against newer feature work without gh 2099ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 674ms
     ✓ exits 1 with found=false when there is none 566ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1334ms
     ✓ --number reads one PR, mergeable included 762ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 886ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1018ms
     ✓ refuses a bad --state or --number 519ms
   ✓ bkit prs scan-body (10)
     ✓ flags [ci skip] in the landed commit body (exit 1) 315ms
     ✓ flags [actions skip] in the landed commit body (exit 1) 450ms
     ✓ flags [SKIP CI] in the landed commit body (exit 1) 462ms
     ✓ passes a token-free body 704ms
     ✓ passes a deliberate token in the SUBJECT with a clean body (docs-only close) 375ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 539ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 496ms
     ✓ classifies a refused merge with a new dev conflict as integration 717ms
     ✓ returns an explicit terminal reason for other merge refusals 906ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 413ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 894ms
     ✓ drops the force-build marker from the title subject 800ms
     ✓ takes an explicit --subject 641ms
     ✓ runs no merge when the PR is already MERGED 474ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1279ms
     ✓ prs merge refuses a PR whose base is main 593ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 936ms
     ✓ prs merge refuses when the PR base is unknown 526ms
     ✓ prs merge reads the base from the one pr view it already makes 578ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 811ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 587ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 526ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 555ms
     ✓ never reads dev's required checks without --only-if-required 739ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 755ms
     ✓ updates when a dev ruleset requires status checks 658ms
     ✓ updates when dev's branch protection requires status checks 634ms
     ✓ ignores dev rulesets that require no checks 995ms
     ✓ updates when the repo cannot be resolved 715ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 720ms
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 471ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 344ms
     ✓ is not green when a check failed, naming it (exit 1) 487ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 834ms
     ✓ is not green on an empty rollup (total 0) 354ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 875ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 795ms
     ✓ is a no-op when the title already says so 333ms
     ✓ strips the marker, with or without its bkit prefix 1050ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1270ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ scans a clean landed body and records the close-transport row 680ms
     ✓ records a skip token found in the body, then exits 1 498ms
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 530ms
     ✓ needs --scan or --scan-result 315ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 70480ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 37213ms
     ✓ every fence parses under zsh -n 32878ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 83280ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 743ms
     ✓ names each net-new and worsened finding in the log and the JSON 1156ms
     ✓ fails on a net score rise with no net count change 867ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1445ms
     ✓ treats a net score at or below 0.001 as float noise 790ms
     ✓ passes when the change only resolves findings 1040ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1045ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 486ms
     ✓ skips (exit 0) when the base resolves to HEAD 440ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1172ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 1195ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 436ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1555ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 2439ms
     ✓ exits 4 on a dropped net field instead of silently passing 1692ms
     ✓ exits 4 on no summary instead of silently passing 1661ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1195ms
     ✓ exits 5 when the base worktree cannot be created 605ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1986ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 4955ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 3714ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 4061ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 2951ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 3203ms
   ✓ bkit ci prose — file selection (7)
     ✓ keeps tracked ignored prose and unusual filenames, skipping deleted tracked files 501ms
     ✓ does not follow a directory symlink replacing tracked prose 447ms
     ✓ a one-level glob does not descend; ** does; each file once across globs 373ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 969ms
     ✓ explicit globs can select ignored prose and nested checkout files 691ms
     ✓ fails closed when the git index cannot be read 504ms
     ✓ fails when vale is not installed 336ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 635ms
     ✓ fails (exit 1) when vale reports alerts 679ms
     ✓ exits 6 on a vale runtime error 933ms
     ✓ skips with exit 0 when no file matches 833ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1041ms
     ✓ falls back to vale sync when the main worktree has none 791ms
     ✓ fails when vale sync cannot restore the required styles 661ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 678ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 510ms
     ✓ is a usage error when the commit cannot be read 512ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 793ms
     ✓ exits 1 naming the code file, whatever the commit message says 1147ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 981ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 752ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 2362ms
     ✓ exits 7 when a commit cannot be read 685ms
   ✓ bkit ci min-push (22)
     ✓ exits 0 when every changed file is a plan log or a ledger 949ms
     ✓ exits 1 naming the files outside, whatever the commit message says 874ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1300ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 856ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 988ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 1419ms
     ✓ a top-level glob in the setting does not reach into folders 797ms
     ✓ a push that changes no files is not proven a min push 861ms
     ✓ exits 7 when a commit or its base cannot be read 1353ms
     ✓ exits 0 when every changed file is an audit report under docs/audits 852ms
     ✓ exits 0 when an audit template changes only below its bkit:end, and says why 1361ms
     ✓ refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end 1124ms
     ✓ refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end 991ms
     ✓ refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end 1341ms
     ✓ refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end 854ms
     ✓ refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end 1083ms
     ✓ refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end 1147ms
     ✓ refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end 1174ms
     ✓ refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below 939ms
     ✓ refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below 888ms
     ✓ --update exits 0 when the update changes only an audit template's project section, and logs the template once 1458ms
     ✓ --update exits 1 and lists only the code file when a project-section edit ships beside a code file 1320ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (154 tests) 85110ms
   ✓ CI evidence test rounds (4)
     ✓ runs local gates only after current-generation remediation or soak 1339ms
   ✓ resolveGate (6)
     ✓ no package.json, no scripts, or unparseable -> null 377ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 960ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 467ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 1041ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 547ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 434ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 636ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 936ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 697ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 432ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 819ms
     ✓ PASS is 0 failures with or without reports 1120ms
     ✓ clears a previous attempt's reports before the gate runs 990ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1698ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1567ms
     ✓ a log under the outbox is named main-checkout relative in the record 1088ms
     ✓ a log small enough is copied whole: not clamped, raw null 1053ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 820ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 2150ms
     ✓ numbers runs within the workflow's active run and per step 1509ms
     ✓ without --file no row is written and the output carries row null 648ms
   ✓ parseJunit (5)
     ✓ keeps a failure's text as detail, CDATA as written and tags stripped 325ms
     ✓ survives a raw > inside an attribute and a closing tag inside CDATA 349ms
   ✓ bkit tests plan-check (35)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 532ms
     ✓ plan-check refuses a task without DONE WHEN 374ms
     ✓ plan-check refuses DEPENDS ON a later group 658ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 482ms
     ✓ plan-check matches a Markdown heading symbol 354ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 384ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 410ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 533ms
     ✓ plan-check refuses a matrix header with no Task column, naming the column to add 391ms
     ✓ plan-check refuses a matrix header with an extra leading # column 483ms
     ✓ plan-check refuses a matrix header with Task not last 515ms
     ✓ plan-check refuses synonym matrix column names 376ms
     ✓ plan-check refuses a matrix header with no closing pipe 389ms
     ✓ plan-check refuses a Task cell naming an undefined task 351ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 653ms
     ✓ plan-check refuses a group with 6 tasks 396ms
     ✓ plan-check refuses a group with 26 planned tests 341ms
     ✓ plan-check accepts 5 tasks and 25 tests in one group 384ms
     ✓ plan-check follows bkit.workflows.tasks 320ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 560ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1339ms
     ✓ a planned test that passes is a vacuous gap, exit 1 756ms
     ✓ a planned test absent from a loaded report is a missing gap 1052ms
     ✓ a file that fails to load is a red of kind red-not-loaded 2016ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1665ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 824ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 2034ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 670ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1051ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 543ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 2908ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1628ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 2209ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1667ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 2227ms
     ✓ green: a passed-accepted test is already landed, not a gap 1156ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1258ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 536ms
     ✓ green refuses a plan with no task markers 522ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1737ms
     ✓ green: --group audits only that group's tasks 1135ms
     ✓ green: --group naming a group with no tasks is refused 344ms
     ✓ green: a code fence never closed is the reason, not missing task markers 459ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1694ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 2212ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1393ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1558ms
     ✓ green: lists each gap kind, with the runner output 1457ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 2590ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 934ms
       ✓ green clears an exception-only task from a human commit 854ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (131 tests) 104715ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 1116ms
     ✓ finishes a CI round only with its own failed job count 944ms
     ✓ preserves local clamp enforcement when completing test rounds 393ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 355ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 833ms
     ✓ done --group writes group on the row 437ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 727ms
     ✓ --commit=none writes the row and leaves it uncommitted 310ms
     ✓ build-group-start records parentSha and group 320ms
     ✓ carries extra fields, parsed as JSON when they are JSON 578ms
     ✓ rejects ["--field=verdict=PASS"] 334ms
     ✓ rejects ["--status=SKIPPED"] 308ms
     ✓ reports a failed commit with exit 8 without writing the row 959ms
     ✓ a failed commit leaves no row staged in the index 1297ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 3143ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1992ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1568ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1356ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1663ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 439ms
     ✓ a missing artifact exits 4 447ms
     ✓ no marker artifact exits 2 430ms
     ✓ disallowed artifact exits 3 461ms
     ✓ bad failures artifact exits 4 651ms
     ✓ a required field that is absent is invalid (re-prompt) 928ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 654ms
     ✓ only reads above the marker 650ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 1424ms
     ✓ fails when no row was written for the step 302ms
     ✓ --ref reads the status file as committed on that ref, not from disk 618ms
     ✓ --ref exits 3 when the ref does not carry the status file 805ms
     ✓ fails on a placeholder left in the artifact 958ms
     ✓ fails when the row's verdict differs from the artifact's 905ms
     ✓ fails when the row does not list the artifact, or carries another attempt 872ms
     ✓ fails on a missing artifact 741ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 634ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 423ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 394ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 395ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 348ms
     ✓ fails a diagnose row missing its strategy, passes with it 1212ms
     ✓ fails a run-tests row missing its scope, and an empty scope 1278ms
     ✓ names every missing field at once 499ms
     ✓ asks nothing of a step that writes none of them 485ms
   ✓ bkit steps finish (16)
     ✓ preserves challenge findings in the event when a later round overwrites the report 490ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 837ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 535ms
     ✓ a true | false header field is true when any agent sets it true 408ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 305ms
     ✓ records the header's Strategy on the row 559ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 992ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 311ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 473ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 1308ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 2734ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 1326ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 1186ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 2771ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 1530ms
     ✓ --post needs --number; without --post there is no tracker key 1064ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 503ms
     ✓ --strip-header drops the prior version's own header 304ms
     ✓ exits 4 when the prior version is missing or empty 312ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 415ms
     ✓ checks the FID's shape for the wired tracker 405ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 685ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 316ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 1275ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 956ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 656ms
       ✓ gate --issue="" under none keeps today's check 312ms
     ✓ --attempt-of checks the row carries the derived counter 1051ms
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 1107ms
     ✓ continues after friction and diagnostic writes fail without recursion 1149ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 1128ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 5758ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rolls over after intervening comments external edits and deletion 889ms
     ✓ starts only new source after overflow or missing source 911ms
     ✓ uses exact new comment after a failed eligibility read 499ms
   ✓ bounded nonfatal publication (10)
     ✓ falls back to a new comment after failed or uncertain append 596ms
     ✓ recognizes append success within budget without unnecessary resend 405ms
     ✓ preserves a human correction after lost append recognition and a later report 741ms
     ✓ contains exhausted append and create failures without fabricated success 1098ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 879ms
     ✓ keeps positive acknowledgment after receipt cache or postflight failure 773ms
     ✓ reserves new comment opportunity within total delivery budget 2179ms
     ✓ contains preparation state lock and reconciliation exceptions 1143ms
     ✓ attempts independent attention after routine uncertainty 1767ms
     ✓ seals an acknowledged segment after a postflight intervening comment 1320ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 711ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 498ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 646ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 748ms
     ✓ fetches the issue and its comments as GitHub returns them 523ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ initialize -> session id -> tools/call addOrEditJiraIssueComment, Bearer key, non-default UA 313ms
     ✓ splits a body over 32,767 characters into consecutive comments 377ms
     ✓ a tool error maps to a reason; HTTP 401 on initialize is auth 377ms
     ✓ fetches through getJiraIssue (evidence view) and pages listJiraIssueComments 565ms
     ✓ jira fetch marks a done-category status renamed Shipped terminal and an indeterminate one not 578ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 1639ms
     ✓ invalidates missing corrupt and unsupported progress cache 3024ms
     ✓ contains cache read and write failures as standalone degradation 2901ms
     ✓ uses legacy receipts and contains receipt failures 1511ms
     ✓ skips issue-less runs and tracker none 839ms
     ✓ records an engine-action row and skips the same key + body on a re-run 1722ms
     ✓ a recent identical comment counts as done (the final close comment) 1036ms
     ✓ a failed post reports done false with the reason and never leaks a token 913ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1018ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker 451ms
     ✓ a different marker hash posts 2104ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1018ms
   ✓ linear: errors on a non-2xx answer and comment paging (2)
     ✓ a 400 carrying a GraphQL RATELIMITED / AUTHENTICATION_ERROR code maps by code 925ms
     ✓ fetchIssue pages comments past the first page 690ms
   ✓ jira: HTML comment pages and non-string bodies (2)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 3351ms
     ✓ runs an audit template's project-section change through bkit:gate:min 5577ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 4032ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 4986ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 3748ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 2030ms
     ✓ runs the full gate for replayed debug code 2991ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 4539ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 5100ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 5734ms
     ✓ a push that fails without a server answer is returned once, never retried 7153ms
     ✓ a failed fetch is returned before anything is built 1910ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 10131ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 6012ms
     ✓ lands from a clone whose fetch refspec omits dev 12209ms
     ✓ build throwing stops the landing and removes the throwaway checkout 3494ms
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 1081ms
     ✓ fails with a fetch error when there is no origin to rebase onto 1089ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 1182ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 1943ms
     ✓ tells a caller inside the removed worktree where to cd 2835ms
     ✓ fails with its own exit code when git cannot remove a marked path 819ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 5968ms
> [bkit] TRUNCATED HERE — 112 lines omitted. Dropped content was NOT read.
     ✓ a bare number with no issue prints a hint to write #N 348ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 3849ms
     ✓ a missing prompt file exits 7; --prompt-file with --branch is a usage error 504ms
   ✓ bkit fids resolve (12)
     ✓ 1. a FID the prompt names wins 630ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ refuses (exit 9) to mint from the workflow name when the prompt holds only a bare number 642ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 734ms
     ✓ 6. a FID that fails the format check exits 1 748ms
     ✓ a missing title or prompt file exits 7 499ms
   ✓ bkit fids plans (2)
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 1418ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 702ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 3745ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1272ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 1052ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 1128ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1144ms
     ✓ an unpinned repo reports nulls and asks no registry 1312ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 468ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 372ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 763ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 525ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 760ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 977ms
     ✓ staging failure: exit 4 and no commit is created, no false success 806ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 1251ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 1192ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 1032ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 752ms
     ✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 403ms
     ✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 355ms
     ✓ --root defaults to the working directory 865ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 1108ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 1345ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 580ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 2748ms
> [bkit] TRUNCATED HERE — 84 lines omitted. Dropped content was NOT read.
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 330ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 640ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees not allowed (cloud) -> adopts the repo root 336ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ --file appends one line per call, so the ledger stays NDJSON 692ms
     ✓ --file into a missing directory is refused, not created 531ms
   ✓ bkit runtime assert (8)
     ✓ reads the LATEST row, optionally for one workflow 316ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (23 tests) 128456ms
   ✓ verified incremental push gates (23)
     ✓ keeps the later failure when two full gates overlap on the same commit 10964ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 9395ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 1377ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 1348ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 1687ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 16844ms
     ✓ does not fall back through a malformed later success receipt 8714ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 7918ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 6605ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 11465ms
     ✓ a full-gate receipt carries an audit template's project-section increment to the minimum gate 11992ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 2107ms
     ✓ does not record a committed tree 2977ms
     ✓ records no proof for a failed gate or lighter gate 4593ms
     ✓ requires integration proof when integration is declared 4812ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 5810ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 870ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 528ms
     ✓ follows summary cursors even when the first page is shorter than the limit 641ms
     ✓ reports excluded intervals as unread even when pagination finishes 625ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 1293ms
     ✓ reports an unread remainder at the page cap 889ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 551ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 381ms
     ✓ rejects missing summaries instead of treating them as empty results 635ms
     ✓ reports a failed first page as unavailable 369ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 318ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 850ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 526ms
     ✓ follows summary cursors even when the first page is shorter than the limit 993ms
     ✓ reports excluded intervals as unread even when pagination finishes 536ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 654ms
     ✓ reports an unread remainder at the page cap 533ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 410ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 368ms
     ✓ rejects missing summaries instead of treating them as empty results 343ms
     ✓ reports a failed first page as unavailable 317ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 418ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (202 tests) 218925ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (15)
     ✓ locates CI evidence using prompt saved issue and local precedence 2562ms
     ✓ saves the failed job count without the capstone job 1537ms
     ✓ counts the capstone job when it is the only failed job 1480ms
     ✓ saves no failed job count when no job failed 1706ms
     ✓ counts fallback evidence jobs without the capstone job 1000ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 971ms
     ✓ filters branch and PR discovery by configured workflow and exact head 2150ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1781ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 5316ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 4074ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 4405ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 3359ms
     ✓ checks the named repository base and fails closed on missing evidence 1867ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 2273ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 3169ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ rejects a green run whose capstone concluded 'skipped' (12) 350ms
     ✓ rejects a green run whose capstone concluded 'stale' (12) 407ms
     ✓ exit 12 failed steps (10)
       ✓ a stale register alone is regenerable; the capstone is left out 308ms
       ✓ both floor steps failing is regenerable 319ms
       ✓ any failed step off the list makes the whole result unregenerable 349ms
       ✓ a job that concluded 'timed_out' with no failed step is {job}/ and unregenerable 333ms
       ✓ a timed-out step counts as failed 320ms
       ✓ bkit.testing.ciGenerated adds steps to the floor 359ms
     ✓ tells an API error (20) from no run (10) 621ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 389ms
     ✓ --event (5)
       ✓ --event push selects the green push run beside an in-flight pull_request run 388ms
       ✓ --event push reds on a failed push run even when a newer pull_request run is green 395ms
       ✓ without --event the newer green pull_request run masks the failed push run 388ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 552ms
       ✓ a run still in progress whose capstone already passed passes 459ms
       ✓ a capstone still running is in progress (11) 387ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 1199ms
       ✓ a source change past the validated head refuses (17) and names the path 1732ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 1200ms
       ✓ --validated without --month / --fid is a usage error (2) 681ms
       ✓ a validated sha that is not an ancestor refuses (17) 972ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 1093ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1752ms
     ✓ a failed re-trigger push names the cause in the log 1787ms
     ✓ a failed re-trigger push leaves no orphan commit behind 2209ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 4110ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 4149ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 1146ms
     ✓ gh-error: every poll errored 1093ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 2078ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 2626ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 2906ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 2341ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 13545ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 15062ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 4445ms
     ✓ re-trigger on dev only uses the record of its own FID 5031ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 2627ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 1106ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 895ms
     ✓ a refused capstone records FAIL with its reason 619ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 1295ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 1512ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 686ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 382ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 885ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 2194ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1282ms
     ✓ --file and --step go together 801ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 6371ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 584ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 582ms
     ✓ exits 6 when the PUT fails 421ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 311ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 344ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 532ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 339ms
     ✓ exits 6 when the api answer is not JSON 460ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 23180ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 675ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 3221ms
     ✓ a refused dev push is logged, never fails the close 4138ms
     ✓ an unreachable remote is logged, never fails the close 994ms
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (12 tests) 8140ms
   ✓ changedFiles (2)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1414ms
     ✓ counts files committed since --base 1084ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 801ms
     ✓ runs nothing and exits 0 when no file changed 473ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 767ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ reads files: GitHub created_at array and Linear {comments} wrapper; cut honours sort order 305ms
   ✓ bkit issues labels (25)
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 360ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 506ms
     ✓ builds the two board payloads from bkit.tracker.github.project 500ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ posts the printed body; an identical recent comment is not posted twice 802ms
     ✓ renders audit comments from validated result and preserves tracker adapters 1294ms
     ✓ a failed post exits 0 with done false and the reason 472ms
     ✓ --file: an engine-action row per run dedups a re-run without reading the issue 374ms
   ✓ bkit issues comment workflow-run proof (7)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ checks the run proof before skipping an issue-less call 595ms
   ✓ bkit issues labels --write (5)
     ✓ a failed read prints done false and the transition of the given --label set 356ms
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 724ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 29244ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 3294ms
     ✓ keeps each context's own section banner and drops every other context's 6368ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 941ms
   ✓ untouched originals (keepRaw) (4)
     ✓ clamp keeps the original in the outbox, never under logs/, and the record names it with its source 395ms
> [bkit] TRUNCATED HERE — 51 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 337ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1381ms
     ✓ runGit names ENOBUFS when output passes the limit 3492ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 4339ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ a finding reported again in round 2 reruns its open round-1 task instead of a twin 366ms
     ✓ a finding whose round-1 task is ticked done but comes back in round 2 gets a new task 500ms
     ✓ a failed LOW deferral append leaves the plan unchanged; the re-run writes both 353ms
     ✓ writes LOW deferrals at the checkout root when run from a subfolder 384ms
   ✓ bkit challenge gate (5)
     ✓ challenge gate writes a challenge-gate row 883ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1299ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 321ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (82 tests) 6604ms
   ✓ debug evidence state (5)
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 573ms
     ✓ passes every rule on a clean head 302ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 549ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (275 tests) 1403ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (77 tests) 10112ms
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
     ✓ answers for the cwd, not an inherited GIT_DIR 429ms
   ✓ guardRepoConfig (6)
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 323ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 447ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (47 tests) 3132ms
   ✓ runLines (5)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts (5 tests) 1457ms
   ✓ withChildDeadline (5)
     ✓ stops a spawnSync with no timeout at the remaining time and names it 322ms
     ✓ limits execSync and execFileSync the same way 609ms
     ✓ stops a child that ignores SIGTERM at the remaining time 303ms
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 692 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 242 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 920ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-TDUb2x/architecture.md — skipping (expected exactly one start/end)

(node:26368) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:26368) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 290ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 334ms
 ✓ .bkit/core/engine/install/write.test.ts (80 tests) 230ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (57 tests) 403ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 354ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 10ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (57 tests) 197ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 157ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 28ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 57ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 676ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 292ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 197ms
stdout | .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent
[bkit-install] skip: docs/security.md — .agents/docs.md already lists engineering/security.md for this topic, so no row was added. Add a row by hand if both documents matter.

(node:29268) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:29268) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:29268) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:29268) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/checks/after/tools.test.ts (52 tests) 387ms
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 242ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 217ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-JFiZn4/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 217ms
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

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 50ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 130ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 277ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 361ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 291ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 188ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 281ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 167ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (105 tests) 208ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 146ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 52ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 173ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (66 tests) 292ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 111ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 182ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 165ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 92ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 94ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 48ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 43ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 25ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 196ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 222ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 160ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 162ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 181ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 93ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 45ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 46ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 81ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 7ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 96ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 124ms
stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > migrates the wrapper and registers a row, then repeats as a no-op
[bkit-install] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] register: docs/noise.md in .agents/docs.md (Project Documents)

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > writes nothing on a dry run
[bkit-install] [dry-run] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] [dry-run] register: docs/noise.md in .agents/docs.md (Project Documents)

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

 ✓ .bkit/core/engine/install/project-docs.test.ts (14 tests) 148ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 88ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 126ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 173ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (16 tests) 170ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 21ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 62ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 33ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 31ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794689477903.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794689477909.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794689477911.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794689477931.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (39 tests) 43ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 88ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 24ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 20ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 118ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 70ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 32ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 83ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 46ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 22ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 19ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 11ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 12ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 69ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (3 tests) 10ms
 ✓ .bkit/core/engine/commands/workflow/tests-jump.test.ts (3 tests) 13ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (6 tests) 25ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 159ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 8ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 8ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 16ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 10ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 14ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 5ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 25ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (108 tests) 101868ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 87208ms
     ✓ every prompt, workflow and utility agent has the three header blocks 418ms
     ✓ sync has nothing left to rewrite 12233ms
     ✓ every clause reaches the cut-off of one surface it applies to 1443ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (171 tests) 300874ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 578ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 3251ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 570ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 322ms
     ✓ writes no limits for a workflow with no ask point 404ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 391ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 684ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 753ms
       ✓ a new run in the same chat gets its own session row 717ms
       ✓ writes none outside Claude Code 545ms
     ✓ opens the next run after a finished one, and after another workflow's run 977ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 866ms
     ✓ design / plan / build / debug book in the current worktree 752ms
     ✓ refuses when the lock is live, writing no row 735ms
     ✓ --lock-held checks the lock is ours 1432ms
     ✓ rejects an unknown workflow 301ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 1218ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 1967ms
   ✓ bkit workflows start — resume facts (11)
     ✓ a new run has no last step and no open decision 788ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 711ms
     ✓ an OPEN decision of an earlier run never resurfaces 979ms
     ✓ an OPEN decision mid-build prints its header fields 630ms
     ✓ openDecision carries the Gate header 1122ms
     ✓ workflows start reports openDecision for a DECIDED decision file that no build-decision row names 935ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 1382ms
     ✓ workflows start does not report openDecision for a DECIDED decision file that a build-decision row names 1717ms
     ✓ openDecision gate is null without the header 1250ms
     ✓ openDecision gate ignores a Gate line below the header 1126ms
     ✓ reads Test attempt from a tests pause 820ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 792ms
     ✓ writes no row when status.jsonl does not exist 638ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 768ms
     ✓ aborts a rebase only when one is in progress 1650ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 1177ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1064ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 1003ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 1235ms
     ✓ --max-exceeded says a handover is due without any sentinel 1099ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 1130ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 1246ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 791ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 599ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 548ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 540ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 314ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 539ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 415ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 383ms
     ✓ bkit workflows fail refuses a multi-line, non-/bkit- or markdown-carrying --next-step before any write 741ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 795ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 731ms
     ✓ bkit workflows fail treats an empty --next-step as absent 704ms
     ✓ a debug run in SOAK mode always needs a handover 1393ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 2520ms
       ✓ counts subagents of an earlier chat the run's session rows name 1595ms
       ✓ records no context block, and still closes, outside a Claude Code session 2403ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 2558ms
     ✓ records ending held and publish false on the workflow-done row 2266ms
     ✓ defaults the close row to ending done 1785ms
     ✓ refuses an unknown ending 694ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1809ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1765ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 2340ms
     ✓ always writes the telemetry, whatever the runtime 1982ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 1642ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 2022ms
     ✓ an unwritable stats path is logged and never fails the close 1824ms
     ✓ appends the completeness row before the workflow-done row 1646ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 2061ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1721ms
     ✓ writes one completeness row per close 3044ms
     ✓ leaves out the previous run's rows that share a second with this run's start 1512ms
     ✓ still closes when the completeness check throws 1644ms
     ✓ still closes when the completeness row write throws 2119ms
     ✓ refuses without status.jsonl and writes nothing 596ms
     ✓ ship: run.pr, size of the squash commit, and coverage 2611ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 4916ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 2438ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 2398ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 3148ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 2707ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 2613ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 3240ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 3748ms
     ✓ --record-step writes the close step's row before workflow-done 3943ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 2976ms
     ✓ --number without --outbox is a usage error 4240ms
     ✓ --flush is ship only 1233ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 3490ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 3748ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 4957ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 6448ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 4379ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 2262ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 1752ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 13540ms
     ✓ --flush with nothing to record commits and pushes nothing 3718ms
     ✓ --flush carries the named worktree's logs into the dev commit 8840ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 8161ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 7954ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 6533ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 5191ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 5481ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3261ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 4944ms
     ✓ --push on dev never carries a row whose references name another feature 3922ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 3495ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 6383ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3812ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1712ms
     ✓ rejects --push with --flush, and --flush outside ship 477ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 4264ms
     ✓ preserves unlanded file deletions and ledger additions on close 6651ms
     ✓ preserves dirty work and uncertain branch evidence during close 5991ms
     ✓ preserves a local feature ref changed after its cleanup proof 5519ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2895ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2013ms
     ✓ a close that landed releases the lock 2831ms
     ✓ removes the worktree before it releases the lock 2583ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3531ms
       ✓ closePr refuses when the PR base is unknown 3428ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2007ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 625ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 360ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 987ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 476ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 449ms
     ✓ a second run's record does not let this FID's close commit 456ms
     ✓ record is present after workflows close and before the push 936ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1768ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 355ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 447ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 783ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 619ms
     ✓ puts each --line after the summary, in flag order 720ms
     ✓ --summary prints the file and keeps a copy in --outbox 585ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 515ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 380437ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 778ms
     ✓ rejects missing explicit and ambiguous existing branch selections 1257ms
   ✓ branches rebase: classification (31)
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 399ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1433ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1170ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 878ms
     ✓ a refused --continue carries git's own reason 1186ms
     ✓ --file records nothing for a refused rebase 793ms
     ✓ refuses a code conflict and aborts the rebase on the spot 1206ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1923ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 1869ms
     ✓ produces byte-identical output to merge=union 3834ms
     ✓ restores a trailing newline so the next append starts on its own line 1750ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 2232ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 3488ms
     ✓ refuses a union that leaves a line which is not JSON 2950ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1756ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1828ms
     ✓ refuses a lockfile whose regenerate command fails 1492ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 2191ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 3176ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 2785ms
     ✓ refuses and aborts when both sides changed the hand-written region 1502ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1371ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1856ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 3435ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 1931ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1329ms
     ✓ refuses and aborts when a side deleted the install record 1425ms
     ✓ refuses a conflicted doc the repo's script does not list 1622ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 1512ms
     ✓ removes a stale sentinel when the rebase succeeds 2354ms
     ✓ exits 4 when no rebase is in progress 541ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 2106ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1675ms
   ✓ branches anchor-stamp (19)
     ✓ records the bkit release, and warns visibly under the block when it is outdated 401ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 896ms
       ✓ skips (12) with no anchor 980ms
       ✓ skips (12) when the base is unreachable in this clone 1529ms
       ✓ skips (12) when nothing landed since the base 1210ms
       ✓ runs (0) with the landed path count once dev moved 2163ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 1610ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 2083ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 1070ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1844ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 3077ms
     ✓ runs exactly one git push 1763ms
     ✓ --set-upstream records the upstream 1783ms
     ✓ refuses with no branch checked out 1004ms
     ✓ --mode=dev refuses a feature checkout 1101ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 3349ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 6721ms
     ✓ --require-ci pushes as-is when dev has not moved 2135ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 4897ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 5045ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 1686ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1805ms
     ✓ --mode=abort pushes when the branch has no open PR 2238ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 3033ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 2881ms
     ✓ --open-pr carries the MCP answer and skips gh 2838ms
     ✓ --mode=abort on dev pushes plainly without probing 4410ms
     ✓ rejects an unknown mode 2600ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 11215ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 9008ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 7121ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 13796ms
     ✓ skip-ci HEAD on the replay is refused 4475ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 8388ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 8706ms
     ✓ a level local dev is a plain push, recording nothing extra 3286ms
     ✓ a record with no commits pushes nothing 3238ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 1785ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 2446ms
     ✓ a rewritten branch is refused, never forced 1266ms
     ✓ refuses dev and main with exit 21 and pushes nothing 804ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1916ms
     ✓ refuses a detached HEAD (exit 5) 2026ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1977ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 2746ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1588ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 2003ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 795ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 2361ms
     ✓ an up-to-date branch is a no-op 1912ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2425ms
     ✓ a fetch that fails exits 10 1115ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 927ms
     ✓ scan-diff still reports a new skip when its test … 1171ms
     ✓ scan-diff reports a skip moved onto a different t… 1003ms
     ✓ scan-diff does not cancel a skip moved between am… 969ms
     ✓ scan-diff does not spend an unchanged duplicate t… 994ms
     ✓ scan-diff recognizes a renamed test file 1030ms
     ✓ scan-diff recognizes a suite moved into a differe… 1144ms
     ✓ scan-diff does not let unrelated additions hide a… 1076ms
     ✓ scan-diff attributes deletion to its old test ins… 1079ms
     ✓ scan-diff consumes each moved assertion once and … 1244ms
     ✓ scan-diff does not match identical assertions fro… 1027ms
     ✓ scan-diff does not match the same leaf test name … 1268ms
     ✓ scan-diff does not match a same-named test with d… 1090ms
     ✓ scan-diff does not match a same-named test with c… 1343ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 962ms
     ✓ --paths with no match exits 1 1255ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 606ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1596ms
     ✓ --marker reads a diff over 1 MiB 1237ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1168ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 854ms
     ✓ scan-diff finds an added skip 1012ms
     ✓ scan-diff ignores a skip predating the base 816ms
     ✓ scan-diff reports a disabled test with its line 1029ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 902ms
     ✓ scan-diff ignores a removed comment in a test file 1031ms
     ✓ scan-diff ignores an assertion moved within the file 818ms
     ✓ scan-diff still reports a removed assertion 703ms
     ✓ scan-diff reports an assertion re-added only outside the test file 988ms
     ✓ scan-diff finds an added pytest mark skip 892ms
     ✓ scan-diff finds an added unittest skip 699ms
     ✓ scan-diff finds an added bare skip call 818ms
     ✓ scan-diff ignores a quoted skip in a documentation file 950ms
     ✓ scan-diff ignores a marker literal in a non-test source file 763ms
     ✓ scan-diff ignores an assertion whose expectation changed 860ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 848ms
     ✓ scan-diff reports a deleted test file 949ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 518ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1495ms
     ✓ a title that already carries the marker is left alone 1219ms
     ✓ with no open PR: pushes the marker commit and edits no title 1208ms
     ✓ a re-run is deduped: no second marker commit 1344ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1566ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 582ms
     ✓ --title-set skips gh entirely 908ms
     ✓ refuses dev and main (exit 21) 413ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1806ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 3444ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1658ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 3828ms
     ✓ continues only the explicitly recorded target through the public merge command 2590ms
     ✓ fetches the unseen feature head before classifying the base 1617ms
     ✓ fast forwards the feature before either base path is chosen 3199ms
     ✓ merges divergent feature tips without rebasing either side 1884ms
     ✓ continues the feature merge before starting a dev merge 3237ms
     ✓ publishes local code with a CI running head before bookkeeping 3643ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 3990ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 2409ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1538ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 391ms
     ✓ Path B once dev moved; --head checks a given commit 560ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 643ms
     ✓ --merge-docs merges dev when docs/ is behind 734ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 777ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1051ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1114ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 953ms
     ✓ --merge-docs skips an empty bkit:generate script 804ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 705ms
     ✓ --merge-docs never merges on dev itself 585ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 795ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 884ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 806ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 719ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 447ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 997ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1398ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1107ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 985ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 998ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1113ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 798ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 947ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 622ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 505ms
     ✓ exits 10 when the fetch fails 355ms
     ✓ refuses --merge-docs with --head, and an unknown --head 361ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 641ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 896ms
     ✓ a failed install stops ship (16) 783ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 692ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 648ms
     ✓ exits 10 when the fetch fails 470ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 311ms
     ✓ preserves unlanded file type changes in the shared landed comparison 321ms
   ✓ branches land (28)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 307ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1611ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 2043ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1406ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1315ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2658ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 3138ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 524ms
     ✓ local: names unpushed dev as the cause when the branch carries it 553ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 596ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1495ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1447ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1150ms
     ✓ uses tree entry equivalence for design and plan land cleanup 5281ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1282ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1277ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1319ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 764ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1525ms
     ✓ land removes the worktree when only the copied .env is untracked 1108ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1346ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1630ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2489ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1537ms
     ✓ landPr refuses a main-based PR without retrying 666ms
     ✓ landPr refuses when the PR base is unknown 612ms
     ✓ PR not open (closed): stops (17) at once, no retry 778ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 680ms
     ✓ --attempt names the merge round in a fix commit 602ms
     ✓ commits a rewritten and a deleted tracked file 573ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 495ms
     ✓ reports undeclared and runs nothing with no scripts 337ms
     ✓ reports undeclared and runs nothing with an empty script 335ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 497ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 545ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 399ms

 Test Files  178 passed (178)
      Tests  7748 passed | 2 skipped (7750)
   Start at  06:46:45
   Duration  381.92s (tests 97%, setup 1%, import 1%, transform 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/895-one-question-format/build-group-gate-2-2.log.reports/vitest-56313.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |    88.6 |    82.37 |   94.53 |   90.08 |                   
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
 engine/commands   |    88.6 |    83.37 |   93.29 |    90.1 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...81,194,196,203 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |    90.7 |    86.38 |   96.42 |   94.53 | ...20-823,870-885 
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
 ...mands/workflow |   90.15 |       83 |    95.3 |   91.69 |                   
  branches.ts      |    89.6 |     83.5 |   98.82 |   91.24 | ...3265,3290,3433 
  challenge.ts     |   96.28 |    85.36 |     100 |   97.43 | ...80,412-414,700 
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.47 |    95.98 |     100 |   99.11 | 314,735           
  decisions.ts     |   94.81 |    84.24 |   98.27 |   97.54 | ...07,445,522,716 
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   94.11 |    86.99 |   97.43 |   95.62 | ...1300,1320-1330 
  junit.ts         |   94.23 |    73.84 |     100 |   93.75 | 47-48,51          
  ledgers.ts       |   88.42 |    79.07 |   95.26 |   91.36 | ...2357-2358,2386 
  locks.ts         |   92.81 |    88.59 |    92.3 |    94.4 | ...91-292,461-462 
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
Statements   : 88.6% ( 20985/23685 )
Branches     : 82.37% ( 16300/19787 )
Functions    : 94.53% ( 3359/3553 )
Lines        : 90.08% ( 18401/20427 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 379 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 268 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 310 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 312 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 261 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 262 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 116 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 271 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 251 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 255 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 340 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 296 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 249 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 265 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 896 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 572 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 21 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 23 ms
ok 19 stub: the response selector is cleared before running its body # in 29 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 41 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 49 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 37 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 46 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 42 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 35 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 56 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 73 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 465 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 680 ms
ok 30 refresh drops a file deleted in the index from the build # in 875 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 248 ms
ok 32 a key removed from the env file is unset on the next run # in 247 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 570 ms
ok 34 non-BKIT_ keys are skipped # in 364 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 217 ms
ok 36 a failed unsetenv is retried on the next run # in 366 ms
ok 37 logs key names only, never values # in 260 ms
ok 38 missing env file exits 0 without calling launchctl # in 31 ms
ok 39 the sweep prints the summary line the lane greps for # in 334 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 19 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (118.668291ms)
✔ shell cancellation waits for SIGTERM cleanup (181.374916ms)
✔ direct cancellation waits for SIGINT cleanup (113.642ms)
✔ shell cancellation waits for SIGINT cleanup (165.149583ms)
✔ direct cancellation waits for SIGHUP cleanup (161.755375ms)
✔ shell cancellation waits for SIGHUP cleanup (179.068459ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (416.059042ms)
✔ shell cancellation follows a worker orphaned by a nested shell (246.687833ms)
✔ direct cancellation preserves a nested machine-lock owner (544.592042ms)
✔ shell cancellation preserves a nested machine-lock owner (574.675125ms)
✔ nested shell cancellation preserves a nested machine-lock owner (567.252875ms)
✔ a hard process-group timeout reaches a shell command during cleanup (108.631625ms)
✔ ships a command-scoped sleep prevention wrapper (0.082166ms)
✔ preserves arguments, output and nonzero exit status (61.367625ms)
✔ runs an entire shell chain and retains its failure (40.134792ms)
✔ reports a missing command as 127 (39.613167ms)
✔ requires a command (35.305458ms)
✔ non-macOS platform selection runs commands without sleep prevention (56.877958ms)
✔ hard timeout escalation reaches a command that ignores TERM (169.123041ms)
✔ forwards POSIX cancellation to the command and releases the assertion (66.910584ms)
✔ holds a real macOS assertion only while the command runs (90.049625ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3976.739958
> [bkit] TRUNCATED — kept 1909 of 3881 lines (135 KB of 296 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
