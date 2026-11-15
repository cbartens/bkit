
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
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

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
> bkit ci slop

[bkit-ci] base dd8b4390c4bbba6cc0bffdd59303832b8dc6d826 (dd8b4390c4bbba6cc0bffdd59303832b8dc6d826) vs working tree
[bkit-ci] added 1, resolved 1, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: dd8b4390c4bbba6cc0bffdd59303832b8dc6d826
base: dd8b4390c4bbba6cc0bffdd59303832b8dc6d826
added: 1
resolved: 1
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 21685ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 550ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 499ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 449ms
     ✓ a new run of the same FID rewrites startSha 925ms
     ✓ a resume of the same FID reuses the record 704ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 471ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 522ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 587ms
     ✓ a stale record without a lock is replaced 687ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 469ms
     ✓ refuses inherited unpublished dev commits in every ship mode 1648ms
     ✓ names inherited commits and ship recovery in the refusal 422ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 521ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 546ms
   ✓ bkit worktrees remove (18)
     ✓ preserves a marked worktree with uncommitted changes and its marker 307ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 657ms
       ✓ preserves staged-only mode during landed cleanup 626ms
       ✓ preserves staged-only type during landed cleanup 564ms
       ✓ preserves staged-only deletion during landed cleanup 594ms
       ✓ removes landed staged content when both index and working contents are on dev 618ms
       ✓ deletes the proved local and remote branch at their landed tips 808ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1315ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 306ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 501ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 21926ms
   ✓ best effort comment friction (4)
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 1049ms
   ✓ bounded nonfatal publication (10)
     ✓ reserves new comment opportunity within total delivery budget 434ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 593ms
     ✓ seals unavailable or unstable representation evidence 530ms
     ✓ uses accepted final preflight eligibility without provider atomicity 434ms
     ✓ rejects marker preserving external edits 582ms
     ✓ preserves generated first line and extracts versioned h6 section markers 576ms
     ✓ returns owned comment identity and stable representation evidence 526ms
     ✓ selects newest created comment across complete pages 893ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 660ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 352ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 560ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 474ms
     ✓ fetches the issue and its comments as GitHub returns them 490ms
     ✓ github fetch marks a closed issue terminal and an open one not 600ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 479ms
     ✓ keeps original body identity separate from time and changed output 306ms
     ✓ reuses matching invocation state without adopting foreign ownership 310ms
     ✓ invalidates missing corrupt and unsupported progress cache 732ms
     ✓ contains cache read and write failures as standalone degradation 418ms
     ✓ uses legacy receipts and contains receipt failures 304ms
     ✓ records an engine-action row and skips the same key + body on a re-run 484ms
     ✓ a recent identical comment counts as done (the final close comment) 438ms
     ✓ a failed post reports done false with the reason and never leaks a token 478ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 528ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 306ms
     ✓ an HTTP 403 from gh is scope 369ms
   ✓ blockers (4)
     ✓ github: no block, no blockers and no further reads 406ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 434ms
     ✓ a different marker hash posts 738ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 27129ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 873ms
     ✓ names each net-new and worsened finding in the log and the JSON 858ms
     ✓ fails on a net score rise with no net count change 509ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 663ms
     ✓ treats a net score at or below 0.001 as float noise 748ms
     ✓ passes when the change only resolves findings 682ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 539ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 642ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 484ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 602ms
     ✓ exits 4 on a dropped net field instead of silently passing 593ms
     ✓ exits 4 on no summary instead of silently passing 906ms
     ✓ exits 4 on output that is not JSON instead of silently passing 704ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 738ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 551ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 580ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 533ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 581ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1183ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 543ms
     ✓ explicit globs can select ignored prose and nested checkout files 366ms
     ✓ fails (exit 1) when vale reports alerts 453ms
     ✓ exits 6 on a vale runtime error 487ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 400ms
     ✓ falls back to vale sync when the main worktree has none 486ms
     ✓ fails when vale sync cannot restore the required styles 471ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 547ms
   ✓ bkit ci min-push (22)
     ✓ checks every --ref: one code ref among min-push refs fails the push 391ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 310ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 441ms
     ✓ refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end 331ms
     ✓ refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end 351ms
     ✓ refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end 351ms
     ✓ refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end 313ms
     ✓ refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end 311ms
     ✓ refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end 312ms
     ✓ refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below 305ms
     ✓ --update exits 0 when the update changes only an audit template's project section, and logs the template once 388ms
     ✓ --update exits 1 and lists only the code file when a project-section edit ships beside a code file 354ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (115 tests) 28372ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 520ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1149ms
     ✓ always writes the marker, even with no plan 380ms
     ✓ writes the linear marker shape, taking the tracker from package.json 645ms
     ✓ writes the jira marker shape, taking the tracker from package.json 340ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 649ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 613ms
     ✓ retries a failed create once, and exits 5 when it fails twice 618ms
     ✓ exits 5 when the open-PR probe errors 396ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 650ms
     ✓ prs open still opens against any other base 367ms
     ✓ exits 6 when the created PR's base is not --base 464ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 1633ms
     ✓ refuses merged entry when current feature evidence cannot be read 819ms
     ✓ qualifies MCP merged PR facts against newer feature work without gh 457ms
   ✓ bkit prs probe (7)
     ✓ exits 1 with found=false when there is none 350ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 395ms
     ✓ --number reads one PR, mergeable included 442ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 322ms
     ✓ exits 4 when gh errors and 80 when it needs auth 354ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 478ms
     ✓ classifies a refused merge with a new dev conflict as integration 378ms
     ✓ returns an explicit terminal reason for other merge refusals 381ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 348ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 441ms
     ✓ drops the force-build marker from the title subject 405ms
     ✓ takes an explicit --subject 475ms
     ✓ runs no merge when the PR is already MERGED 472ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 462ms
     ✓ prs merge refuses when the PR base is unknown 355ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 729ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 322ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 630ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 607ms
     ✓ ignores dev rulesets that require no checks 593ms
   ✓ bkit prs checks (7)
     ✓ counts an unfinished check run and a PENDING commit status as pending 517ms
     ✓ is not green on an empty rollup (total 0) 617ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 338ms
   ✓ bkit prs verbose-ci (4)
     ✓ strips the marker, with or without its bkit prefix 400ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 367ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (154 tests) 30949ms
   ✓ CI evidence test rounds (4)
     ✓ runs local gates only after current-generation remediation or soak 1050ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 387ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 623ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 336ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 540ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 648ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 589ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 459ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 464ms
     ✓ PASS is 0 failures with or without reports 658ms
     ✓ clears a previous attempt's reports before the gate runs 402ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 480ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 946ms
     ✓ a log under the outbox is named main-checkout relative in the record 722ms
     ✓ a log small enough is copied whole: not clamped, raw null 318ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 656ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 474ms
     ✓ numbers runs within the workflow's active run and per step 480ms
     ✓ without --file no row is written and the output carries row null 481ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 590ms
     ✓ a planned test that passes is a vacuous gap, exit 1 433ms
     ✓ a planned test absent from a loaded report is a missing gap 481ms
     ✓ a file that fails to load is a red of kind red-not-loaded 572ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 625ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 558ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 395ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 692ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 986ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 519ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 632ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 722ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 769ms
     ✓ green: a passed-accepted test is already landed, not a gap 482ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 775ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 424ms
     ✓ green: --group audits only that group's tasks 463ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 482ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 615ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 434ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 565ms
     ✓ green: lists each gap kind, with the runner output 632ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 867ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 374ms
 ✓ .bkit/core/engine/commands/land.test.ts (45 tests) 34035ms
   ✓ pushToDev (31)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 794ms
     ✓ runs code.ts through its declared gate in the built checkout 906ms
     ✓ runs code.ts through its declared gate in the built checkout 844ms
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 828ms
     ✓ runs an audit template's project-section change through bkit:gate:min 1027ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 765ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 738ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 769ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 520ms
     ✓ runs the full gate for replayed debug code 776ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 720ms
     ✓ installs local dependencies against the built target tree 954ms
     ✓ runs the configured frozen install even without root dependencies 867ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 964ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 966ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1146ms
     ✓ never pushes local dev commits missing from origin/dev 1136ms
     ✓ dev moved: rebuilds on the new dev and pushes again 1947ms
     ✓ dev moved before every push: exhausted, nothing landed 2834ms
     ✓ any other refusal is returned, not retried 1563ms
     ✓ pushToDev replays a commit range onto origin/dev 1171ms
     ✓ a replay retries on the new dev when dev moved 2064ms
     ✓ pushToDev log line names what it lands 1055ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1134ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1209ms
     ✓ a push that fails without a server answer is returned once, never retried 1115ms
     ✓ a failed fetch is returned before anything is built 377ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1674ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1305ms
     ✓ lands from a clone whose fetch refspec omits dev 1404ms
     ✓ build throwing stops the landing and removes the throwaway checkout 453ms
[feat/test 260b44c] gate
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (23 tests) 17708ms
   ✓ verified incremental push gates (23)
     ✓ keeps the later failure when two full gates overlap on the same commit 1494ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 1563ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 1861ms
     ✓ does not fall back through a malformed later success receipt 1059ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 635ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 615ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1231ms
     ✓ a full-gate receipt carries an audit template's project-section increment to the minimum gate 1101ms
     ✓ requires proof even when the pushed increment changes no files 700ms
     ✓ ignores malformed receipts 655ms
     ✓ does not record a untracked tree 333ms
     ✓ does not record a mutated tree 399ms
     ✓ does not record a committed tree 403ms
     ✓ records no proof for a failed gate or lighter gate 684ms
     ✓ requires integration proof when integration is declared 980ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 1614ms
     ✓ invalidates proof when the gate definition changes 740ms
     ✓ keeps whole-branch docs-only classification and rejects mixed argument modes 422ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (107 tests) 20591ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 607ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 320ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 314ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 354ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 312ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 452ms
     ✓ --path records its commit on the run's record, like every other commit mode 422ms
     ✓ a recorded ledger commits only the rows the run appended 618ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 808ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 626ms
     ✓ commitBookkeeping refuses when a recorded path changed 313ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 407ms
     ✓ under --mode=commit counts the squashed paths as something to commit 480ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 312ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 358ms
   ✓ bkit ledgers append --invocation (5)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 512ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 394ms
   ✓ bkit ledgers append --operation (3)
     ✓ keeps ledger operation intents and receipts out of committed book paths 401ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 10759ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 515ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 450ms
     ✓ CI=true -> GITHUB_ACTION 301ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 669ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 309ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 343ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 331ms
     ✓ LOCAL -> runtimeHeadless=false 313ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 309ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 358ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 358ms
     ✓ UNKNOWN -> runtimeHeadless=false 348ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 383ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 336ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 651ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ re-derives per call: one run's answer does not leak into the next 389ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 473ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 365ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 648ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 500ms
     ✓ --file into a missing directory is refused, not created 470ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 16911ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 656ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 456ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 326ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 341ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 341ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 549ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 782ms
     ✓ counts commits behind origin/dev and the divergence age 550ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 977ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 706ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 368ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 495ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 354ms
     ✓ an unpinned repo reports nulls and asks no registry 682ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 388ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 483ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 525ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 350ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 714ms
     ✓ counts files committed since --base 670ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 459ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 469ms
     ✓ runs the --fallback gate even when no file changed, as it did before 482ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 521ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1560ms
     ✓ a refused dev push is logged, never fails the close 1783ms
     ✓ an unreachable remote is logged, never fails the close 604ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/audits/templates/context-vercel-block.test.ts (22 tests) 10358ms
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 622ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 485ms
     ✓ follows summary cursors even when the first page is shorter than the limit 544ms
     ✓ reports excluded intervals as unread even when pagination finishes 453ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 385ms
     ✓ reports an unread remainder at the page cap 372ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 753ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 542ms
     ✓ rejects missing summaries instead of treating them as empty results 346ms
     ✓ reports a failed first page as unavailable 372ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 401ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 361ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 434ms
     ✓ follows summary cursors even when the first page is shorter than the limit 554ms
     ✓ reports excluded intervals as unread even when pagination finishes 356ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 427ms
     ✓ reports an unread remainder at the page cap 356ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 993ms
     ✓ rejects missing summaries instead of treating them as empty results 446ms
     ✓ reports a failed first page as unavailable 364ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 520ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (101 tests) 9301ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 778ms
     ✓ resolves config from the repo root when run from a subdirectory 369ms
     ✓ exits 6 when the PUT fails 389ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 553ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 616ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 659ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 9853ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (15)
     ✓ locates CI evidence using prompt saved issue and local precedence 1624ms
     ✓ saves the failed job count without the capstone job 603ms
     ✓ counts the capstone job when it is the only failed job 587ms
     ✓ saves no failed job count when no job failed 598ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1051ms
     ✓ freezes explicit workflow run attempt and all failed job pages 585ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 970ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1472ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 978ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1229ms
     ✓ checks the named repository base and fails closed on missing evidence 609ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 519ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 530ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 325ms
       ✓ a source change past the validated head refuses (17) and names the path 328ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 402ms
       ✓ --validated without --month / --fid is a usage error (2) 305ms
       ✓ a validated sha that is not an ancestor refuses (17) 324ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 341ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 698ms
     ✓ a failed re-trigger push names the cause in the log 917ms
     ✓ a failed re-trigger push leaves no orphan commit behind 793ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1335ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 563ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 304ms
     ✓ gh-error: every poll errored 302ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 641ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 589ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 673ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 666ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 1939ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1956ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 503ms
     ✓ re-trigger on dev only uses the record of its own FID 608ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 638ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 1762ms
   ✓ bkit runs context (12)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 406ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 394ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 367ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 476ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 617ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 662ms
     ✓ --file and --step go together 591ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (73 tests) 4857ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1332ms
     ✓ runGit names ENOBUFS when output passes the limit 842ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1016ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 402ms
     ✓ finishes a CI round only with its own failed job count 394ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 304ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 373ms
     ✓ reports a failed commit with exit 8 without writing the row 593ms
     ✓ a failed commit leaves no row staged in the index 646ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 622ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 603ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1036ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 624ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 837ms
   ✓ bkit steps gate (8)
     ✓ --ref reads the status file as committed on that ref, not from disk 323ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 460ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 827ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 544ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 706ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 647ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 316ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (22 tests) 2528ms
   ✓ bkit tasks currency (6)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 522ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1273ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 363ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (23 tests) 4137ms
   ✓ publication ownership lock (4)
     ✓ reclaims only a proven dead matching process identity 356ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 308ms
   ✓ bkit locks release (5)
     ✓ locks release removes the FID shared-checkout record 363ms
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ answers for the cwd, not an inherited GIT_DIR 370ms
   ✓ guardRepoConfig (6)
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 352ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 379ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 335ms
 ✓ .bkit/core/engine/checks/tips/index.test.ts (28 tests) 1216ms
   ✓ tipsBase (4)
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts (5 tests) 2434ms
   ✓ withChildDeadline (5)
     ✓ stops a spawnSync with no timeout at the remaining time and names it 307ms
     ✓ leaves an explicit timeout as the caller set it 1203ms
     ✓ limits execSync and execFileSync the same way 607ms
     ✓ stops a child that ignores SIGTERM at the remaining time 302ms
> [bkit] TRUNCATED HERE — 128 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 211 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 345ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 125ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 367ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 286ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 301ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 270ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 261ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (275 tests) 555ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 165ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (38 tests) 6634ms
   ✓ bkit disk prune — step files (10)
     ✓ min runs only min steps; max runs both 307ms
   ✓ bkit disk prune — lock (9)
     ✓ worktree setup's low-disk sweep waits for a running sweep 407ms
     ✓ replaces a lock whose process is gone, or that is an hour old, and releases it 310ms
   ✓ bkit disk prune --auto (8)
     ✓ each checkout's repo steps keep their own day; machine steps share one 339ms
   ✓ bkit disk prune — notes (5)
     ✓ a sweep reports its notes and keeps them for that checkout until the next sweep 454ms
     ✓ a worktree of the checkout sees the main checkout's notes 375ms
     ✓ bkit tips prints the notes first, as a list with what to ask 364ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 577ms
stdout | .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent
[bkit-install] skip: docs/security.md — .agents/docs.md already lists engineering/security.md for this topic, so no row was added. Add a row by hand if both documents matter.

 ✓ .bkit/core/engine/checks/after/tools.test.ts (52 tests) 279ms
 ✓ .bkit/core/engine/tools/instructions-coverage.test.ts (28 tests) 1514ms
   ✓ the repo (7)
     ✓ has no coverage findings 1193ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 142ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 401ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-0Z62HY/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 238ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 215ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 174ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 104ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (57 tests) 322ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 187ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 173ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 174ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 71ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-7SbJ3l/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 38ms
 ✓ .bkit/core/engine/install/write.test.ts (80 tests) 158ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 245ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 203ms
(node:73049) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:73049) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:73049) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:73049) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 83ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (57 tests) 231ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 96ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 259ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 187ms
(node:73984) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:73984) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 168ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 95ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 161ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 109ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 104ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 93ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 107ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 48ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (105 tests) 244ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 127ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 111ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (73 tests) 176ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 50ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 119ms
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

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 122ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 71ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 326ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 104ms
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

 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 28ms
 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 45ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 137ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 44ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 24ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 67ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 11682ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 11669ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 84ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 69ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 35ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 101ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794718833782.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794718833787.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794718833789.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794718833806.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (39 tests) 41ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 70ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (65 tests) 71ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 54ms
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

 ✓ .bkit/core/engine/install/project-docs.test.ts (14 tests) 59ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 30ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 55ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 44ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 60ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 27ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 33005ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 15878ms
     ✓ every fence parses under zsh -n 17008ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 71ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 41ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 56ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 33ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 57ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 22ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 30ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (16 tests) 31ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 38ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 50ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 32ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (3 tests) 17ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 30ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 39ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 25ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 27ms
 ✓ .bkit/core/engine/commands/workflow/tests-jump.test.ts (3 tests) 21ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 27ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 16ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 22ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (15 tests) 72ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 12ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 10ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 48ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (6 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 16ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 12ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 14ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 22ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 28ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 15ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 30ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 12ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 16ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 15ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 7ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 8ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (108 tests) 52338ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 30130ms
     ✓ every prompt, workflow and utility agent has the three header blocks 761ms
     ✓ sync has nothing left to rewrite 19073ms
     ✓ every clause reaches the cut-off of one surface it applies to 1781ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (171 tests) 114333ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 638ms
   ✓ bkit workflows start — resume facts (11)
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 316ms
   ✓ bkit workflows fail (24)
     ✓ aborts a rebase only when one is in progress 372ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 301ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 355ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 419ms
       ✓ counts subagents of an earlier chat the run's session rows name 405ms
       ✓ records no context block, and still closes, outside a Claude Code session 373ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 429ms
     ✓ records ending held and publish false on the workflow-done row 433ms
     ✓ defaults the close row to ending done 394ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 419ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 470ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 482ms
     ✓ always writes the telemetry, whatever the runtime 405ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 357ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 438ms
     ✓ an unwritable stats path is logged and never fails the close 373ms
     ✓ appends the completeness row before the workflow-done row 482ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 459ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 443ms
     ✓ writes one completeness row per close 670ms
     ✓ leaves out the previous run's rows that share a second with this run's start 379ms
     ✓ still closes when the completeness check throws 396ms
     ✓ still closes when the completeness row write throws 410ms
     ✓ ship: run.pr, size of the squash commit, and coverage 509ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 704ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 516ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 411ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 513ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 523ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 607ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 550ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 527ms
     ✓ --record-step writes the close step's row before workflow-done 398ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 491ms
     ✓ --number without --outbox is a usage error 468ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 559ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 581ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 694ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 641ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 548ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1619ms
     ✓ --flush with nothing to record commits and pushes nothing 828ms
     ✓ --flush carries the named worktree's logs into the dev commit 1476ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2187ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1674ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2204ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1856ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2155ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1774ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1940ms
     ✓ --push on dev never carries a row whose references name another feature 2081ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1964ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 3600ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2272ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1107ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 2620ms
     ✓ preserves unlanded file deletions and ledger additions on close 5490ms
     ✓ preserves dirty work and uncertain branch evidence during close 6375ms
     ✓ preserves a local feature ref changed after its cleanup proof 7427ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 4824ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3604ms
     ✓ a close that landed releases the lock 4379ms
     ✓ removes the worktree before it releases the lock 2701ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2882ms
       ✓ closePr refuses when the PR base is unknown 2573ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1987ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 531ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 322ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 893ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 383ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 345ms
     ✓ a second run's record does not let this FID's close commit 451ms
     ✓ record is present after workflows close and before the push 797ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1553ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 306ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 329ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 601ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 472ms
     ✓ puts each --line after the summary, in flag order 493ms
     ✓ --summary prints the file and keeps a copy in --outbox 470ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 480ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 195515ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 435ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 455ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 332ms
     ✓ a refused --continue carries git's own reason 381ms
     ✓ refuses a code conflict and aborts the rebase on the spot 345ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1193ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 393ms
     ✓ produces byte-identical output to merge=union 713ms
     ✓ restores a trailing newline so the next append starts on its own line 397ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 390ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 599ms
     ✓ refuses a union that leaves a line which is not JSON 355ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 497ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1138ms
     ✓ refuses a lockfile whose regenerate command fails 632ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 668ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 551ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 626ms
     ✓ refuses and aborts when both sides changed the hand-written region 404ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 426ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 518ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 806ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 413ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 556ms
     ✓ refuses and aborts when a side deleted the install record 432ms
     ✓ refuses a conflicted doc the repo's script does not list 361ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 365ms
     ✓ removes a stale sentinel when the rebase succeeds 540ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 618ms
     ✓ resolves a conflict in each of two replayed commits across rounds 545ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) when the base is unreachable in this clone 346ms
       ✓ skips (12) when nothing landed since the base 377ms
       ✓ runs (0) with the landed path count once dev moved 641ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 416ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 657ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 346ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 503ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 983ms
     ✓ runs exactly one git push 893ms
     ✓ --set-upstream records the upstream 548ms
     ✓ refuses with no branch checked out 473ms
     ✓ --mode=dev refuses a feature checkout 417ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 888ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1544ms
     ✓ --require-ci pushes as-is when dev has not moved 670ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1223ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1726ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 485ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1064ms
     ✓ --mode=abort pushes when the branch has no open PR 703ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 822ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 363ms
     ✓ --open-pr carries the MCP answer and skips gh 585ms
     ✓ --mode=abort on dev pushes plainly without probing 504ms
     ✓ rejects an unknown mode 390ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1793ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1036ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1168ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2783ms
     ✓ skip-ci HEAD on the replay is refused 767ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1787ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2804ms
     ✓ a level local dev is a plain push, recording nothing extra 1091ms
     ✓ a record with no commits pushes nothing 762ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 551ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1373ms
     ✓ a rewritten branch is refused, never forced 782ms
     ✓ refuses dev and main with exit 21 and pushes nothing 480ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1306ms
     ✓ refuses a detached HEAD (exit 5) 494ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1088ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1109ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1253ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1385ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 551ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1403ms
     ✓ an up-to-date branch is a no-op 974ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1449ms
     ✓ a fetch that fails exits 10 643ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 933ms
     ✓ scan-diff still reports a new skip when its test … 930ms
     ✓ scan-diff reports a skip moved onto a different t… 878ms
     ✓ scan-diff does not cancel a skip moved between am… 894ms
     ✓ scan-diff does not spend an unchanged duplicate t… 965ms
     ✓ scan-diff recognizes a renamed test file 936ms
     ✓ scan-diff recognizes a suite moved into a differe… 988ms
     ✓ scan-diff does not let unrelated additions hide a… 984ms
     ✓ scan-diff attributes deletion to its old test ins… 868ms
     ✓ scan-diff consumes each moved assertion once and … 1028ms
     ✓ scan-diff does not match identical assertions fro… 985ms
     ✓ scan-diff does not match the same leaf test name … 1040ms
     ✓ scan-diff does not match a same-named test with d… 1444ms
     ✓ scan-diff does not match a same-named test with c… 1150ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1216ms
     ✓ --paths with no match exits 1 1119ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 872ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1635ms
     ✓ --marker reads a diff over 1 MiB 1280ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1398ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1255ms
     ✓ scan-diff finds an added skip 1345ms
     ✓ scan-diff ignores a skip predating the base 1122ms
     ✓ scan-diff reports a disabled test with its line 1296ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1195ms
     ✓ scan-diff ignores a removed comment in a test file 1043ms
     ✓ scan-diff ignores an assertion moved within the file 542ms
     ✓ scan-diff still reports a removed assertion 472ms
     ✓ scan-diff reports an assertion re-added only outside the test file 477ms
     ✓ scan-diff finds an added pytest mark skip 541ms
     ✓ scan-diff finds an added unittest skip 558ms
     ✓ scan-diff finds an added bare skip call 609ms
     ✓ scan-diff ignores a quoted skip in a documentation file 527ms
     ✓ scan-diff ignores a marker literal in a non-test source file 505ms
     ✓ scan-diff ignores an assertion whose expectation changed 499ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 555ms
     ✓ scan-diff reports a deleted test file 620ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 465ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1481ms
     ✓ a title that already carries the marker is left alone 1083ms
     ✓ with no open PR: pushes the marker commit and edits no title 1072ms
     ✓ a re-run is deduped: no second marker commit 1099ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1236ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 386ms
     ✓ --title-set skips gh entirely 643ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1283ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 2366ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1294ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2822ms
     ✓ continues only the explicitly recorded target through the public merge command 1542ms
     ✓ fetches the unseen feature head before classifying the base 1035ms
     ✓ fast forwards the feature before either base path is chosen 2170ms
     ✓ merges divergent feature tips without rebasing either side 1285ms
     ✓ continues the feature merge before starting a dev merge 2028ms
     ✓ publishes local code with a CI running head before bookkeeping 2262ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2941ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1873ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1335ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 356ms
     ✓ Path B once dev moved; --head checks a given commit 561ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 545ms
     ✓ --merge-docs merges dev when docs/ is behind 638ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 620ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 871ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 886ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 743ms
     ✓ --merge-docs skips an empty bkit:generate script 682ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 566ms
     ✓ --merge-docs never merges on dev itself 497ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 725ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 726ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 677ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 711ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 393ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 965ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 948ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1167ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 905ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 899ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1088ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 898ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1025ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 677ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 473ms
     ✓ exits 10 when the fetch fails 303ms
     ✓ refuses --merge-docs with --head, and an unknown --head 310ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 585ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 801ms
     ✓ a failed install stops ship (16) 717ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 606ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 588ms
     ✓ exits 10 when the fetch fails 448ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 320ms
     ✓ preserves unlanded file type changes in the shared landed comparison 331ms
   ✓ branches land (28)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 312ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1471ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1498ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1481ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1489ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2828ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 3234ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 531ms
     ✓ local: names unpushed dev as the cause when the branch carries it 558ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 612ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1426ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1496ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1067ms
     ✓ uses tree entry equivalence for design and plan land cleanup 4504ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1181ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1276ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1140ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 715ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1801ms
     ✓ land removes the worktree when only the copied .env is untracked 1494ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1244ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1250ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1627ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 995ms
     ✓ landPr refuses a main-based PR without retrying 549ms
     ✓ landPr refuses when the PR base is unknown 529ms
     ✓ PR not open (closed): stops (17) at once, no retry 647ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 410ms
     ✓ --attempt names the merge round in a fix commit 354ms
     ✓ commits a rewritten and a deleted tracked file 366ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 317ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 301ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 360ms

 Test Files  178 passed (178)
      Tests  7724 passed | 2 skipped (7726)
   Start at  14:59:04
   Duration  196.54s (tests 95%, setup 2%, import 2%, transform 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/814-local-test-limits/build-group-gate-1-3.log.reports/vitest-37801.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   88.58 |    82.36 |   94.53 |   90.07 |                   
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
Branches     : 82.36% ( 16271/19755 )
Functions    : 94.53% ( 3353/3547 )
Lines        : 90.07% ( 18377/20403 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 462 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 215 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 207 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 204 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 203 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 204 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 71 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 235 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 204 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 206 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 210 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 211 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 214 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 230 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 865 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 527 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 16 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 17 ms
ok 19 stub: the response selector is cleared before running its body # in 15 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 19 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 21 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 19 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 19 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 21 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 14 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 33 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 49 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 623 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 379 ms
ok 30 refresh drops a file deleted in the index from the build # in 330 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 413 ms
ok 32 a key removed from the env file is unset on the next run # in 182 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 154 ms
ok 34 non-BKIT_ keys are skipped # in 149 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 162 ms
ok 36 a failed unsetenv is retried on the next run # in 177 ms
ok 37 logs key names only, never values # in 134 ms
ok 38 missing env file exits 0 without calling launchctl # in 23 ms
ok 39 the sweep prints the summary line the lane greps for # in 246 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 9 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (86.634666ms)
✔ shell cancellation waits for SIGTERM cleanup (155.432833ms)
✔ direct cancellation waits for SIGINT cleanup (85.492334ms)
✔ shell cancellation waits for SIGINT cleanup (153.721333ms)
✔ direct cancellation waits for SIGHUP cleanup (85.575042ms)
✔ shell cancellation waits for SIGHUP cleanup (157.217292ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (376.488375ms)
✔ shell cancellation follows a worker orphaned by a nested shell (220.902917ms)
✔ direct cancellation preserves a nested machine-lock owner (422.205042ms)
✔ shell cancellation preserves a nested machine-lock owner (451.200583ms)
✔ nested shell cancellation preserves a nested machine-lock owner (446.470209ms)
✔ a hard process-group timeout reaches a shell command during cleanup (64.809ms)
✔ ships a command-scoped sleep prevention wrapper (0.112541ms)
✔ preserves arguments, output and nonzero exit status (44.936916ms)
✔ runs an entire shell chain and retains its failure (25.413ms)
✔ reports a missing command as 127 (24.036042ms)
✔ requires a command (22.018ms)
✔ non-macOS platform selection runs commands without sleep prevention (36.631709ms)
✔ hard timeout escalation reaches a command that ignores TERM (141.868917ms)
✔ forwards POSIX cancellation to the command and releases the assertion (47.983875ms)
✔ holds a real macOS assertion only while the command runs (59.448375ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3138.397625
> [bkit] TRUNCATED — kept 1752 of 3190 lines (124 KB of 246 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
