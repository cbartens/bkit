
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 803-close-codex-opencode build-group-gate-2 is waiting for tests (up to 1200s), 2nd in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block (pid 52239, since 16:41:13), last run took 17m6s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 803-close-codex-opencode build-group-gate-2 is waiting for tests (still, 1 min so far) (up to 1200s), 2nd in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block (pid 52239, since 16:41:13), last run took 17m6s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 803-close-codex-opencode build-group-gate-2 is waiting for tests (still, 2 min so far) (up to 1200s), 2nd in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block (pid 52239, since 16:41:13), last run took 17m6s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 803-close-codex-opencode build-group-gate-2 is waiting for tests (still, 3 min so far) (up to 1200s), 2nd in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block (pid 52239, since 16:41:13), last run took 17m6s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 803-close-codex-opencode build-group-gate-2 is waiting for tests (still, 4 min so far) (up to 1200s), 2nd in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block (pid 52239, since 16:41:13), last run took 17m6s

> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
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
 383:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 423:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 494:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 47 warnings and 0 suggestions in 152 files.
passed: true
skipped: null
files: 152

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> bkit ci slop

[bkit-ci] base dd8b4390c4bbba6cc0bffdd59303832b8dc6d826 (dd8b4390c4bbba6cc0bffdd59303832b8dc6d826) vs working tree
[bkit-ci] added 3, resolved 3, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: dd8b4390c4bbba6cc0bffdd59303832b8dc6d826
base: dd8b4390c4bbba6cc0bffdd59303832b8dc6d826
added: 3
resolved: 3
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 9.1 on 10 cores: unit limits 9050ms per test, 18100ms per hook (x1.81)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (115 tests) 49181ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 790ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1503ms
     ✓ always writes the marker, even with no plan 612ms
     ✓ writes the linear marker shape, taking the tracker from package.json 585ms
     ✓ writes the jira marker shape, taking the tracker from package.json 903ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 550ms
     ✓ refuses a PR from dev, main, or the base itself 531ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 692ms
     ✓ retries a failed create once, and exits 5 when it fails twice 690ms
     ✓ exits 5 when the open-PR probe errors 1084ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1365ms
     ✓ prs open still opens against any other base 808ms
     ✓ exits 6 when the created PR's base is not --base 826ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 3464ms
     ✓ refuses merged entry when current feature evidence cannot be read 946ms
     ✓ qualifies MCP merged PR facts against newer feature work without gh 1284ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 601ms
     ✓ exits 1 with found=false when there is none 449ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 556ms
     ✓ --number reads one PR, mergeable included 432ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 998ms
     ✓ exits 4 when gh errors and 80 when it needs auth 664ms
     ✓ refuses a bad --state or --number 500ms
   ✓ bkit prs scan-body (10)
     ✓ flags [skip ci] in the landed commit body (exit 1) 1079ms
     ✓ flags [ci skip] in the landed commit body (exit 1) 362ms
     ✓ exits 2 on an empty or option-like sha, 3 on an unreadable one 308ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 1012ms
     ✓ classifies a refused merge with a new dev conflict as integration 474ms
     ✓ returns an explicit terminal reason for other merge refusals 806ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 909ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 854ms
     ✓ drops the force-build marker from the title subject 549ms
     ✓ takes an explicit --subject 560ms
     ✓ runs no merge when the PR is already MERGED 472ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 815ms
     ✓ prs merge refuses a PR whose base is main 391ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 484ms
     ✓ prs merge refuses when the PR base is unknown 493ms
     ✓ prs merge reads the base from the one pr view it already makes 633ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 609ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 392ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 417ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 388ms
     ✓ never reads dev's required checks without --only-if-required 391ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 563ms
     ✓ updates when a dev ruleset requires status checks 505ms
     ✓ updates when dev's branch protection requires status checks 697ms
     ✓ ignores dev rulesets that require no checks 520ms
     ✓ updates when the repo cannot be resolved 449ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 523ms
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 421ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 401ms
     ✓ is not green when a check failed, naming it (exit 1) 434ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 399ms
     ✓ is not green on an empty rollup (total 0) 756ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 400ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 672ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 406ms
     ✓ is a no-op when the title already says so 409ms
     ✓ strips the marker, with or without its bkit prefix 582ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 940ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 58154ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1318ms
     ✓ names each net-new and worsened finding in the log and the JSON 1088ms
     ✓ fails on a net score rise with no net count change 990ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1495ms
     ✓ treats a net score at or below 0.001 as float noise 1023ms
     ✓ passes when the change only resolves findings 919ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 880ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 413ms
     ✓ skips (exit 0) when the base resolves to HEAD 541ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1027ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 711ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 397ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1346ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1004ms
     ✓ exits 4 on a dropped net field instead of silently passing 1064ms
     ✓ exits 4 on no summary instead of silently passing 1389ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1198ms
     ✓ exits 5 when the base worktree cannot be created 556ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1291ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 2408ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1464ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 2022ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 2368ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 2095ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 891ms
     ✓ explicit globs can select ignored prose and nested checkout files 635ms
     ✓ fails closed when the git index cannot be read 373ms
     ✓ fails when vale is not installed 563ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 629ms
     ✓ fails (exit 1) when vale reports alerts 574ms
     ✓ exits 6 on a vale runtime error 552ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 812ms
     ✓ falls back to vale sync when the main worktree has none 630ms
     ✓ fails when vale sync cannot restore the required styles 1010ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 610ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 416ms
     ✓ is a usage error when the commit cannot be read 322ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 582ms
     ✓ exits 1 naming the code file, whatever the commit message says 510ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 988ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 416ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 1119ms
     ✓ exits 7 when a commit cannot be read 366ms
   ✓ bkit ci min-push (22)
     ✓ exits 0 when every changed file is a plan log or a ledger 558ms
     ✓ exits 1 naming the files outside, whatever the commit message says 507ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1239ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 640ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 515ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 1008ms
     ✓ a top-level glob in the setting does not reach into folders 726ms
     ✓ a push that changes no files is not proven a min push 576ms
     ✓ exits 7 when a commit or its base cannot be read 525ms
     ✓ exits 0 when every changed file is an audit report under docs/audits 574ms
     ✓ exits 0 when an audit template changes only below its bkit:end, and says why 537ms
     ✓ refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end 676ms
     ✓ refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end 1017ms
     ✓ refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end 728ms
     ✓ refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end 651ms
     ✓ refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end 672ms
     ✓ refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end 723ms
     ✓ refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end 699ms
     ✓ refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below 900ms
     ✓ refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below 662ms
     ✓ --update exits 0 when the update changes only an audit template's project section, and logs the template once 872ms
     ✓ --update exits 1 and lists only the code file when a project-section edit ships beside a code file 541ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 62166ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 405ms
     ✓ adopts the main checkout even when called from a linked worktree 752ms
     ✓ plan refuses to work in place on dev 451ms
     ✓ build refuses to work in place on dev 343ms
     ✓ design and plan in place on main are refused 533ms
     ✓ still adopts a cloud session branch whose upstream is main 545ms
     ✓ refuses a detached HEAD 310ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1805ms
     ✓ may debug in place on dev 767ms
     ✓ never in place on main 324ms
     ✓ adopts in place when the session is already on feat/{fid} 466ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 1568ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1305ms
     ✓ a new run of the same FID rewrites startSha 2463ms
     ✓ a resume of the same FID reuses the record 2272ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1589ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1730ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1855ms
     ✓ a stale record without a lock is replaced 1925ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 2750ms
     ✓ refuses inherited unpublished dev commits in every ship mode 5219ms
     ✓ names inherited commits and ship recovery in the refusal 1548ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1538ms
     ✓ ship names a missing feat branch 523ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1827ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 455ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 309ms
     ✓ fails with a fetch error when there is no origin to rebase onto 548ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 387ms
       ✓ checks no disk when there are no cleanup step files 480ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 951ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 545ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 429ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 391ms
     ✓ never commits an entry only the main checkout's copy list names 466ms
   ✓ bkit worktrees remove (18)
     ✓ preserves a marked worktree with uncommitted changes and its marker 962ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 353ms
     ✓ tells a caller inside the removed worktree where to cd 468ms
     ✓ fails with its own exit code when git cannot remove a marked path 354ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1355ms
       ✓ preserves staged-only mode during landed cleanup 1647ms
       ✓ preserves staged-only type during landed cleanup 1367ms
       ✓ preserves staged-only deletion during landed cleanup 1828ms
       ✓ removes landed staged content when both index and working contents are on dev 1570ms
       ✓ deletes the proved local and remote branch at their landed tips 2191ms
       ✓ retains the remote branch when origin refuses its conditional deletion 2491ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 904ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 618ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 389ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 687ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1302ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (131 tests) 68098ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 720ms
     ✓ finishes a CI round only with its own failed job count 910ms
   ✓ progress command output (4)
     ✓ gate progress number validation 323ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 789ms
     ✓ done --group writes group on the row 551ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 947ms
     ✓ --commit=none writes the row and leaves it uncommitted 306ms
     ✓ carries extra fields, parsed as JSON when they are JSON 540ms
     ✓ reports a failed commit with exit 8 without writing the row 1452ms
     ✓ a failed commit leaves no row staged in the index 1288ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1159ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1168ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1118ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1058ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1179ms
   ✓ bkit steps verdict (10)
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 347ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 626ms
     ✓ fails when no row was written for the step 306ms
     ✓ --ref reads the status file as committed on that ref, not from disk 625ms
     ✓ --ref exits 3 when the ref does not carry the status file 701ms
     ✓ fails on a placeholder left in the artifact 539ms
     ✓ fails when the row's verdict differs from the artifact's 521ms
     ✓ fails when the row does not list the artifact, or carries another attempt 585ms
     ✓ fails on a missing artifact 685ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 1575ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 404ms
     ✓ fails a run-tests row missing its scope, and an empty scope 657ms
   ✓ bkit steps finish (16)
     ✓ preserves challenge findings in the event when a later round overwrites the report 543ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 685ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 752ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 401ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 587ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 769ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1073ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 780ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 1288ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1423ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 877ms
     ✓ --post needs --number; without --post there is no tracker key 302ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 418ms
     ✓ --strip-header drops the prior version's own header 335ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 443ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 838ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 646ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 479ms
       ✓ gate --issue without --fid is a usage error 402ms
     ✓ --attempt-of checks the row carries the derived counter 502ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1191ms
     ✓ writeStepRow refuses when a recorded path changed 1761ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 644ms
     ✓ writeStepRow appends its commit sha to the record 1286ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1722ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (12)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 532ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 956ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 909ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 960ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 807ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1638ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 750ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 1114ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 574ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1379ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 533ms
     ✓ does not count an artifact the run found committed when it started 1054ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 480ms
     ✓ commits a package.json change outside bkit.workflows 748ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1274ms
   ✓ bkit steps stub --result-file (12)
     ✓ renders and verifies the header of every prompt that declares one 667ms
 ✓ .bkit/core/engine/commands/land.test.ts (45 tests) 86363ms
   ✓ pushToDev (31)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 2473ms
     ✓ runs code.ts through its declared gate in the built checkout 2765ms
     ✓ runs code.ts through its declared gate in the built checkout 2548ms
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 2376ms
     ✓ runs an audit template's project-section change through bkit:gate:min 2800ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 2046ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 2318ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 2610ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 1520ms
     ✓ runs the full gate for replayed debug code 2264ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 3657ms
     ✓ installs local dependencies against the built target tree 3005ms
     ✓ runs the configured frozen install even without root dependencies 2788ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 2338ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 2847ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 2986ms
     ✓ never pushes local dev commits missing from origin/dev 2266ms
     ✓ dev moved: rebuilds on the new dev and pushes again 4744ms
     ✓ dev moved before every push: exhausted, nothing landed 6922ms
     ✓ any other refusal is returned, not retried 3596ms
     ✓ pushToDev replays a commit range onto origin/dev 2678ms
     ✓ a replay retries on the new dev when dev moved 4881ms
     ✓ pushToDev log line names what it lands 2326ms
     ✓ runs no git hooks in the throwaway checkout, and says so 2560ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2678ms
     ✓ a push that fails without a server answer is returned once, never retried 2214ms
     ✓ a failed fetch is returned before anything is built 683ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 3191ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2283ms
     ✓ lands from a clone whose fetch refspec omits dev 2979ms
     ✓ build throwing stops the landing and removes the throwaway checkout 998ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (103 tests) 86424ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 857ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 551ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1445ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 564ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 655ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 831ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1044ms
     ✓ an unpinned repo reports nulls and asks no registry 616ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 1026ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 499ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 543ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 837ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 478ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 938ms
     ✓ staging failure: exit 4 and no commit is created, no false success 442ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 452ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 409ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 462ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 312ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 933ms
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 643ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 441ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 474ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 477ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 457ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 519ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 579ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 608ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 426ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1327ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 696ms
     ✓ PASS is 0 failures with or without reports 597ms
     ✓ clears a previous attempt's reports before the gate runs 450ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 762ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 439ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 803ms
     ✓ numbers runs within the workflow's active run and per step 696ms
     ✓ without --file no row is written and the output carries row null 410ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 661ms
     ✓ a planned test absent from a loaded report is a missing gap 958ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1016ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 940ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 327ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1400ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 893ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1003ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1388ms
     ✓ green: lists each gap kind, with the runner output 926ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 2204ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 695ms
       ✓ green clears an exception-only task from a human commit 436ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 45985ms
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 352ms
     ✓ continues after friction and diagnostic writes fail without recursion 387ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 553ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 3484ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ rolls over after intervening comments external edits and deletion 606ms
     ✓ starts only new source after overflow or missing source 410ms
     ✓ uses exact new comment after a failed eligibility read 436ms
   ✓ bounded nonfatal publication (10)
     ✓ recognizes append success within budget without unnecessary resend 318ms
     ✓ preserves a human correction after lost append recognition and a later report 392ms
     ✓ contains exhausted append and create failures without fabricated success 375ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 450ms
     ✓ keeps positive acknowledgment after receipt cache or postflight failure 609ms
     ✓ reserves new comment opportunity within total delivery budget 1087ms
     ✓ contains preparation state lock and reconciliation exceptions 332ms
     ✓ attempts independent attention after routine uncertainty 482ms
     ✓ seals an acknowledged segment after a postflight intervening comment 364ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 612ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 845ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 600ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 748ms
     ✓ fetches the issue and its comments as GitHub returns them 609ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 1021ms
     ✓ invalidates missing corrupt and unsupported progress cache 1719ms
     ✓ contains cache read and write failures as standalone degradation 678ms
     ✓ uses legacy receipts and contains receipt failures 762ms
     ✓ skips issue-less runs and tracker none 514ms
     ✓ records an engine-action row and skips the same key + body on a re-run 610ms
     ✓ a recent identical comment counts as done (the final close comment) 498ms
     ✓ a failed post reports done false with the reason and never leaks a token 491ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 573ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 1246ms
     ✓ a different marker hash posts 1050ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 696ms
[feat/test 01b5dec] gate
 ✓ .bkit/core/engine/audits/templates/context-vercel-block.test.ts (22 tests) 15251ms
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 841ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 542ms
     ✓ follows summary cursors even when the first page is shorter than the limit 625ms
     ✓ reports excluded intervals as unread even when pagination finishes 1652ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 881ms
     ✓ reports an unread remainder at the page cap 609ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 1073ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 582ms
     ✓ rejects missing summaries instead of treating them as empty results 659ms
     ✓ reports a failed first page as unavailable 433ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 559ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 526ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 507ms
     ✓ follows summary cursors even when the first page is shorter than the limit 877ms
     ✓ reports excluded intervals as unread even when pagination finishes 910ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 645ms
     ✓ reports an unread remainder at the page cap 741ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 654ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 378ms
     ✓ rejects missing summaries instead of treating them as empty results 694ms
     ✓ reports a failed first page as unavailable 470ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 389ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (202 tests) 119795ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (15)
     ✓ locates CI evidence using prompt saved issue and local precedence 2702ms
     ✓ saves the failed job count without the capstone job 1135ms
     ✓ counts the capstone job when it is the only failed job 1113ms
     ✓ saves no failed job count when no job failed 982ms
     ✓ counts fallback evidence jobs without the capstone job 409ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 458ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1359ms
     ✓ freezes explicit workflow run attempt and all failed job pages 918ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2794ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 3087ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 2397ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 3221ms
     ✓ checks the named repository base and fails closed on missing evidence 1458ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1468ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1588ms
     ✓ rejects MCP capstone jobs belonging to another run 2197ms
     ✓ --fetch refreshes origin/<branch> before gating 833ms
     ✓ exit 12 failed steps (10)
       ✓ a job that concluded 'timed_out' with no failed step is {job}/ and unregenerable 373ms
     ✓ tells an API error (20) from no run (10) 301ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 625ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 1135ms
       ✓ a source change past the validated head refuses (17) and names the path 790ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 788ms
       ✓ --validated without --month / --fid is a usage error (2) 557ms
       ✓ a validated sha that is not an ancestor refuses (17) 638ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 830ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1374ms
     ✓ a failed re-trigger push names the cause in the log 1563ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1699ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2804ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1387ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 701ms
     ✓ gh-error: every poll errored 888ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1313ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1187ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1679ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1393ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 3994ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3648ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 981ms
     ✓ re-trigger on dev only uses the record of its own FID 1079ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1262ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 569ms
     ✓ --snapshot scopes its run list and dev lookups to --repo 707ms
     ✓ a refused capstone records FAIL with its reason 323ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 686ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 664ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 474ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 471ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 684ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1020ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1107ms
     ✓ --file and --step go together 712ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 466ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 335ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 418ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 467ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 494ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 412ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 408ms
     ✓ --file into a missing directory is refused, not created 341ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (23 tests) 38069ms
   ✓ verified incremental push gates (23)
     ✓ keeps the later failure when two full gates overlap on the same commit 3325ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 3558ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 412ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 474ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 750ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 3742ms
     ✓ does not fall back through a malformed later success receipt 2086ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1740ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1242ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2532ms
     ✓ a full-gate receipt carries an audit template's project-section increment to the minimum gate 2313ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 675ms
     ✓ does not record a committed tree 813ms
     ✓ records no proof for a failed gate or lighter gate 1879ms
     ✓ requires integration proof when integration is declared 1856ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 3240ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
(node:92614) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
     ✓ refuses (exit 9) to mint from the workflow name when the prompt holds only a bare number 328ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 543ms
     ✓ 6. a FID that fails the format check exits 1 336ms
   ✓ bkit fids design --description-file --prompt-file (5)
     ✓ a plan issue's Workstreams line lists the workstreams the plan covers 484ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 494ms
     ✓ resolves config from the repo root when run from a subdirectory 691ms
     ✓ exits 6 when the PUT fails 875ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 574ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 522ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 365ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 543ms
     ✓ exits 6 when the api answer is not JSON 502ms
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (12 tests) 8008ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1041ms
     ✓ counts files committed since --base 1250ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 880ms
     ✓ runs nothing and exits 0 when no file changed 404ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 783ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ checks the run proof before skipping an issue-less call 494ms
   ✓ bkit issues blocked-by (3)
     ✓ exits 80 with the reason when the tracker read fails 359ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 953ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 835ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 3094ms
     ✓ a refused dev push is logged, never fails the close 2844ms
     ✓ an unreachable remote is logged, never fails the close 942ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 17413ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 412ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1420ms
     ✓ runGit names ENOBUFS when output passes the limit 1449ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1701ms
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 1180ms
     ✓ passes every rule on a clean head 402ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 531ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (23 tests) 6387ms
   ✓ publication ownership lock (4)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ releases only its delivery token on every exit 350ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 312ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 379ms
   ✓ bkit locks release (5)
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 964ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1575ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 465ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 5140ms
   ✓ selected CI context evidence (3)
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
   ✓ guardRepoConfig (6)
     ✓ passes when only another key changed, such as a branch's upstream 347ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 421ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 396ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 348ms
 ✓ .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts (5 tests) 1442ms
   ✓ withChildDeadline (5)
     ✓ stops a spawnSync with no timeout at the remaining time and names it 310ms
     ✓ limits execSync and execFileSync the same way 611ms
     ✓ stops a child that ignores SIGTERM at the remaining time 304ms
> [bkit] TRUNCATED HERE — 799 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 309 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 709ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 422ms
 ✓ .bkit/core/engine/checks/after/index.test.ts (55 tests) 518ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 401ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 327ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 229ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 239ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (57 tests) 282ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 191ms
stdout | .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent
[bkit-install] skip: docs/security.md — .agents/docs.md already lists engineering/security.md for this topic, so no row was added. Add a row by hand if both documents matter.

(node:3080) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 165ms
(node:3080) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:3080) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:3080) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 266ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (52 tests) 227ms
(node:3631) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3631) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 177ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 197ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-pypiPi/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 165ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 267ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 350ms
 ✓ .bkit/core/engine/install/write.test.ts (80 tests) 271ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 299ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 241ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 166ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 93ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 177ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 187ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 183ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > upgrades a file with no consumer drift (update action)
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > reports conflict when consumer drift detected (does NOT overwrite)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting

 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 136ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > creates new files that do not yet exist on disk
[bkit-upgrade] upgrade: .claude/agents/bkit-new.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > dry-run does not write files but reports what would change
[bkit-upgrade] [dry-run] upgrade: .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] upgrade: .claude/agents/bkit-update.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] conflict: .claude/agents/bkit-conflict.md — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > skips missing template files without throwing
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-wjzwDp/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 88ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 173ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 104ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (57 tests) 157ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 195ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 114ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 100ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 113ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (22 tests) 235ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 364ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 149ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (105 tests) 207ms
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

 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 199ms
 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 89ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (69 tests) 162ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 156ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 88ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 26ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (65 tests) 209ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 124ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 185ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 87ms
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

 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 88ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 78ms
 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 133ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 69ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (6 tests) 67ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 71ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 90ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 65ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 92ms
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

 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 40ms
 ✓ .bkit/core/engine/install/project-docs.test.ts (14 tests) 60ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 62ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 49ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 31ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 153ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 35ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 34ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 34ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 38ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794639250759.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794639250779.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794639250780.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794639250793.js — skipping

 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 48ms
 ✓ .bkit/core/engine/install/managed-block.test.ts (39 tests) 65ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 54ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 21ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 29ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (16 tests) 31ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 40ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 49ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 38ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 33ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 50ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 73ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 48ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 26ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 15ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 22ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 37ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 31ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 13ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/commands/workflow/tests-jump.test.ts (3 tests) 18ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 20ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (3 tests) 14ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 117ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 50ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 15ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 17ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 29ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 14ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 36ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 6ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (171 tests) 189338ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 482ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 2421ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 586ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 444ms
     ✓ writes no limits for a workflow with no ask point 436ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 433ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 654ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 671ms
       ✓ a new run in the same chat gets its own session row 561ms
       ✓ writes none outside Claude Code 478ms
     ✓ opens the next run after a finished one, and after another workflow's run 552ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 645ms
     ✓ design / plan / build / debug book in the current worktree 548ms
     ✓ refuses when the lock is live, writing no row 401ms
     ✓ --lock-held checks the lock is ours 547ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 463ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 633ms
   ✓ bkit workflows start — resume facts (11)
     ✓ a new run has no last step and no open decision 471ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 427ms
     ✓ an OPEN decision of an earlier run never resurfaces 572ms
     ✓ an OPEN decision mid-build prints its header fields 468ms
     ✓ openDecision carries the Gate header 429ms
     ✓ workflows start reports openDecision for a DECIDED decision file that no build-decision row names 364ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 793ms
     ✓ workflows start does not report openDecision for a DECIDED decision file that a build-decision row names 416ms
     ✓ openDecision gate is null without the header 416ms
     ✓ openDecision gate ignores a Gate line below the header 445ms
     ✓ reads Test attempt from a tests pause 451ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 687ms
     ✓ writes no row when status.jsonl does not exist 567ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 515ms
     ✓ aborts a rebase only when one is in progress 1366ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 943ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 935ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 623ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 607ms
     ✓ --max-exceeded says a handover is due without any sentinel 555ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 499ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 1788ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 623ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 300ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 311ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 341ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 341ms
     ✓ bkit workflows fail refuses a multi-line, non-/bkit- or markdown-carrying --next-step before any write 722ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 691ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 434ms
     ✓ bkit workflows fail treats an empty --next-step as absent 335ms
     ✓ a debug run in SOAK mode always needs a handover 458ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1665ms
       ✓ counts subagents of an earlier chat the run's session rows name 1115ms
       ✓ records no context block, and still closes, outside a Claude Code session 1045ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1120ms
     ✓ records ending held and publish false on the workflow-done row 1468ms
     ✓ defaults the close row to ending done 1008ms
     ✓ refuses an unknown ending 447ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1535ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1095ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1042ms
     ✓ always writes the telemetry, whatever the runtime 946ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 1056ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 920ms
     ✓ an unwritable stats path is logged and never fails the close 898ms
     ✓ appends the completeness row before the workflow-done row 1144ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1140ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1050ms
     ✓ writes one completeness row per close 2209ms
     ✓ leaves out the previous run's rows that share a second with this run's start 970ms
     ✓ still closes when the completeness check throws 1105ms
     ✓ still closes when the completeness row write throws 1196ms
     ✓ refuses without status.jsonl and writes nothing 444ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1283ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1251ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1325ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 937ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1320ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1649ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1351ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1712ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1274ms
     ✓ --record-step writes the close step's row before workflow-done 864ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1398ms
     ✓ --number without --outbox is a usage error 951ms
     ✓ --flush is ship only 408ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1290ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1631ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1328ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1594ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1122ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 454ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 426ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3079ms
     ✓ --flush with nothing to record commits and pushes nothing 1587ms
     ✓ --flush carries the named worktree's logs into the dev commit 3382ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3898ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3680ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 4268ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 3232ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 4430ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3456ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 3631ms
     ✓ --push on dev never carries a row whose references name another feature 3582ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 3441ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 5975ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3565ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1989ms
     ✓ rejects --push with --flush, and --flush outside ship 368ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 4133ms
     ✓ preserves unlanded file deletions and ledger additions on close 8571ms
     ✓ preserves dirty work and uncertain branch evidence during close 8415ms
     ✓ preserves a local feature ref changed after its cleanup proof 7810ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3646ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1223ms
     ✓ a close that landed releases the lock 1946ms
     ✓ removes the worktree before it releases the lock 2081ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2664ms
       ✓ closePr refuses when the PR base is unknown 2449ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1311ms
   ✓ bkit workflows promote (7)
     ✓ stamps the anchor from the runtime-resolved base commit 439ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 680ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 407ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 713ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 335ms
     ✓ a second run's record does not let this FID's close commit 667ms
     ✓ record is present after workflows close and before the push 723ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1678ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 813ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 415ms
     ✓ puts each --line after the summary, in flag order 398ms
     ✓ --summary prints the file and keeps a copy in --outbox 710ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 415ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 301421ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 762ms
     ✓ rejects missing explicit and ambiguous existing branch selections 741ms
   ✓ branches rebase: classification (31)
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 421ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1464ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1398ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 1098ms
     ✓ a refused --continue carries git's own reason 1189ms
     ✓ --file records nothing for a refused rebase 925ms
     ✓ refuses a code conflict and aborts the rebase on the spot 976ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1985ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 872ms
     ✓ produces byte-identical output to merge=union 2158ms
     ✓ restores a trailing newline so the next append starts on its own line 1231ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 1272ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1928ms
     ✓ refuses a union that leaves a line which is not JSON 1147ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1470ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1850ms
     ✓ refuses a lockfile whose regenerate command fails 2177ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1946ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1973ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1605ms
     ✓ refuses and aborts when both sides changed the hand-written region 1024ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1510ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1366ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 2099ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 1048ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1156ms
     ✓ refuses and aborts when a side deleted the install record 885ms
     ✓ refuses a conflicted doc the repo's script does not list 1180ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 829ms
     ✓ removes a stale sentinel when the rebase succeeds 1171ms
     ✓ exits 4 when no rebase is in progress 300ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1748ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1204ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 1003ms
       ✓ skips (12) with no anchor 662ms
       ✓ skips (12) when the base is unreachable in this clone 770ms
       ✓ skips (12) when nothing landed since the base 780ms
       ✓ runs (0) with the landed path count once dev moved 1723ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 744ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1546ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 1236ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1307ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 2709ms
     ✓ runs exactly one git push 1487ms
     ✓ --set-upstream records the upstream 1346ms
     ✓ refuses with no branch checked out 812ms
     ✓ --mode=dev refuses a feature checkout 777ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2400ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 3384ms
     ✓ --require-ci pushes as-is when dev has not moved 1385ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2475ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 3838ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 780ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1566ms
     ✓ --mode=abort pushes when the branch has no open PR 1732ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1340ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 901ms
     ✓ --open-pr carries the MCP answer and skips gh 1171ms
     ✓ --mode=abort on dev pushes plainly without probing 1094ms
     ✓ rejects an unknown mode 757ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3427ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 2090ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2005ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4757ms
     ✓ skip-ci HEAD on the replay is refused 1401ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3749ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 4155ms
     ✓ a level local dev is a plain push, recording nothing extra 2002ms
     ✓ a record with no commits pushes nothing 1191ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 789ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1944ms
     ✓ a rewritten branch is refused, never forced 1167ms
     ✓ refuses dev and main with exit 21 and pushes nothing 696ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 2334ms
     ✓ refuses a detached HEAD (exit 5) 811ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 2045ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1586ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1936ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1815ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 1109ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 2017ms
     ✓ an up-to-date branch is a no-op 1248ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2453ms
     ✓ a fetch that fails exits 10 933ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 1335ms
     ✓ scan-diff still reports a new skip when its test … 984ms
     ✓ scan-diff reports a skip moved onto a different t… 1082ms
     ✓ scan-diff does not cancel a skip moved between am… 1438ms
     ✓ scan-diff does not spend an unchanged duplicate t… 1137ms
     ✓ scan-diff recognizes a renamed test file 1096ms
     ✓ scan-diff recognizes a suite moved into a differe… 1222ms
     ✓ scan-diff does not let unrelated additions hide a… 1270ms
     ✓ scan-diff attributes deletion to its old test ins… 1238ms
     ✓ scan-diff consumes each moved assertion once and … 1161ms
     ✓ scan-diff does not match identical assertions fro… 1418ms
     ✓ scan-diff does not match the same leaf test name … 1093ms
     ✓ scan-diff does not match a same-named test with d… 1005ms
     ✓ scan-diff does not match a same-named test with c… 1445ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1241ms
     ✓ --paths with no match exits 1 985ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 840ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1442ms
     ✓ --marker reads a diff over 1 MiB 1131ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1669ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1026ms
     ✓ scan-diff finds an added skip 1117ms
     ✓ scan-diff ignores a skip predating the base 1146ms
     ✓ scan-diff reports a disabled test with its line 1222ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1017ms
     ✓ scan-diff ignores a removed comment in a test file 770ms
     ✓ scan-diff ignores an assertion moved within the file 413ms
     ✓ scan-diff still reports a removed assertion 428ms
     ✓ scan-diff reports an assertion re-added only outside the test file 407ms
     ✓ scan-diff finds an added pytest mark skip 516ms
     ✓ scan-diff finds an added unittest skip 679ms
     ✓ scan-diff finds an added bare skip call 441ms
     ✓ scan-diff ignores a quoted skip in a documentation file 457ms
     ✓ scan-diff ignores a marker literal in a non-test source file 478ms
     ✓ scan-diff ignores an assertion whose expectation changed 798ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 460ms
     ✓ scan-diff reports a deleted test file 453ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 329ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1435ms
     ✓ a title that already carries the marker is left alone 1062ms
     ✓ with no open PR: pushes the marker commit and edits no title 802ms
     ✓ a re-run is deduped: no second marker commit 1204ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1031ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 338ms
     ✓ --title-set skips gh entirely 820ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1138ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 2656ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1172ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2763ms
     ✓ continues only the explicitly recorded target through the public merge command 1907ms
     ✓ fetches the unseen feature head before classifying the base 1459ms
     ✓ fast forwards the feature before either base path is chosen 2304ms
     ✓ merges divergent feature tips without rebasing either side 1354ms
     ✓ continues the feature merge before starting a dev merge 2175ms
     ✓ publishes local code with a CI running head before bookkeeping 2434ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 3331ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 2164ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1512ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 414ms
     ✓ Path B once dev moved; --head checks a given commit 687ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 2852ms
     ✓ --merge-docs merges dev when docs/ is behind 1124ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 867ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1279ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1171ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1001ms
     ✓ --merge-docs skips an empty bkit:generate script 916ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 779ms
     ✓ --merge-docs never merges on dev itself 654ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1234ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 973ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 887ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 957ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 521ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1246ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1461ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1529ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1162ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1253ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1573ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 1114ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1337ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 953ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 663ms
     ✓ exits 10 when the fetch fails 380ms
     ✓ refuses --merge-docs with --head, and an unknown --head 418ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 815ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1154ms
     ✓ a failed install stops ship (16) 958ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 884ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 835ms
     ✓ exits 10 when the fetch fails 608ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 452ms
     ✓ preserves unlanded file type changes in the shared landed comparison 450ms
   ✓ branches land (28)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 508ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 2013ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 2130ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 2039ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 2011ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 4097ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 4741ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 756ms
     ✓ local: names unpushed dev as the cause when the branch carries it 889ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 925ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2308ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2135ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1568ms
     ✓ uses tree entry equivalence for design and plan land cleanup 6690ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1988ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1695ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1583ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1035ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2708ms
     ✓ land removes the worktree when only the copied .env is untracked 2121ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1801ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 2072ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 3176ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 2286ms
     ✓ landPr refuses a main-based PR without retrying 751ms
     ✓ landPr refuses when the PR base is unknown 756ms
     ✓ PR not open (closed): stops (17) at once, no retry 1096ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 774ms
     ✓ --attempt names the merge round in a fix commit 650ms
     ✓ commits a rewritten and a deleted tracked file 749ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 596ms
     ✓ reports undeclared and runs nothing with no scripts 401ms
     ✓ reports undeclared and runs nothing with an empty script 429ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 572ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 614ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 423ms

 Test Files  178 passed (178)
      Tests  7714 passed | 2 skipped (7716)
   Start at  16:51:28
   Duration  302.81s (tests 97%, import 1%, setup 1%, transform 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/803-close-codex-opencode/build-group-gate-2-1.log.reports/vitest-34064.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   88.58 |    82.35 |   94.53 |   90.06 |                   
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
 .../checks/before |   94.59 |     88.7 |   95.83 |   97.89 |                   
  context-fetch.ts |    98.8 |    91.95 |     100 |     100 | ...17,539,553,600 
  env.ts           |   90.16 |    79.62 |     100 |   91.83 | 176-181,188-196   
  files.ts         |   94.31 |    91.37 |   95.45 |   98.55 | 166               
  index.ts         |   83.33 |    72.34 |     100 |     100 | ...40,148,156-178 
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
 ...mmands/install |    47.4 |    45.14 |   57.14 |   47.81 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |   18.35 |    22.15 |      50 |   16.48 | ...30-134,205-616 
  uninstall.ts     |   67.58 |     64.3 |   67.56 |   68.53 | ...1113,1136-1303 
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
  telemetry.ts     |   96.09 |    91.45 |   98.64 |   96.42 | ...1858,2016,2377 
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
Statements   : 88.58% ( 20985/23689 )
Branches     : 82.35% ( 16304/19798 )
Functions    : 94.53% ( 3359/3553 )
Lines        : 90.06% ( 18403/20433 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 602 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 347 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 351 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 341 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 342 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 352 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 146 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 348 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 348 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 356 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 358 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 337 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 351 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 385 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 1264 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 824 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 31 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 30 ms
ok 19 stub: the response selector is cleared before running its body # in 31 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 36 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 39 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 33 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 30 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 40 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 27 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 63 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 101 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 830 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 649 ms
ok 30 refresh drops a file deleted in the index from the build # in 584 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 473 ms
ok 32 a key removed from the env file is unset on the next run # in 301 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 316 ms
ok 34 non-BKIT_ keys are skipped # in 265 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 273 ms
ok 36 a failed unsetenv is retried on the next run # in 329 ms
ok 37 logs key names only, never values # in 259 ms
ok 38 missing env file exits 0 without calling launchctl # in 51 ms
ok 39 the sweep prints the summary line the lane greps for # in 582 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 21 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (183.362542ms)
✔ shell cancellation waits for SIGTERM cleanup (322.497917ms)
✔ direct cancellation waits for SIGINT cleanup (604.938375ms)
✔ shell cancellation waits for SIGINT cleanup (289.7205ms)
✔ direct cancellation waits for SIGHUP cleanup (162.824916ms)
✔ shell cancellation waits for SIGHUP cleanup (245.685083ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (501.230208ms)
✔ shell cancellation follows a worker orphaned by a nested shell (301.59375ms)
✔ direct cancellation preserves a nested machine-lock owner (626.792417ms)
✔ shell cancellation preserves a nested machine-lock owner (1049.608708ms)
✔ nested shell cancellation preserves a nested machine-lock owner (778.325167ms)
✔ a hard process-group timeout reaches a shell command during cleanup (107.444375ms)
✔ ships a command-scoped sleep prevention wrapper (0.15075ms)
✔ preserves arguments, output and nonzero exit status (95.145209ms)
✔ runs an entire shell chain and retains its failure (56.816333ms)
✔ reports a missing command as 127 (51.30075ms)
✔ requires a command (41.704042ms)
✔ non-macOS platform selection runs commands without sleep prevention (73.672042ms)
✔ hard timeout escalation reaches a command that ignores TERM (182.699083ms)
✔ forwards POSIX cancellation to the command and releases the assertion (98.159167ms)
✔ holds a real macOS assertion only while the command runs (123.814083ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5963.048125
> [bkit] TRUNCATED — kept 1855 of 3574 lines (133 KB of 275 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
