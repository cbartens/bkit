
> @cbartens/bkit@6.0.0 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> pnpm bkit:gate:static-unit && pnpm test:integration


> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs


0/149 files need formatting

> @cbartens/bkit@6.0.0 lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'

✔ 0 errors, 0 warnings and 0 suggestions in 147 files.
passed: true
skipped: null
files: 147

> @cbartens/bkit@6.0.0 slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> bkit ci slop

[bkit-ci] base 5bb26e7c6ae15bc6bb8ae02054846025d5a45882 (5bb26e7c6ae15bc6bb8ae02054846025d5a45882) vs working tree
[bkit-ci] added 3, resolved 3, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 5bb26e7c6ae15bc6bb8ae02054846025d5a45882
base: 5bb26e7c6ae15bc6bb8ae02054846025d5a45882
added: 3
resolved: 3
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 23.1 on 10 cores: unit limits 11565ms per test, 23129ms per hook (x2.31)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
      Coverage enabled with v8

 ❯ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (20 tests | 1 failed) 41ms
   ❯ every phase workflow grades itself at close through bkit workflows close (20)
     ✓ bkit-design.md closes through exactly one workflows close call 7ms
     ✓ bkit-design.md never runs the grader itself 3ms
     ✓ bkit-design.md: the close call commits what it graded 0ms
     ✓ bkit-design.md writes close telemetry once and embeds it in the close comment 1ms
     ✓ bkit-plan.md closes through exactly one workflows close call 0ms
     ✓ bkit-plan.md never runs the grader itself 1ms
     ✓ bkit-plan.md: the close call commits what it graded 0ms
     ✓ bkit-plan.md writes close telemetry once and embeds it in the close comment 0ms
     × bkit-build.md closes through exactly one workflows close call 16ms
     ✓ bkit-build.md never runs the grader itself 1ms
     ✓ bkit-build.md: the close call commits what it graded 1ms
     ✓ bkit-build.md writes close telemetry once and embeds it in the close comment 0ms
     ✓ bkit-debug.md closes through exactly one workflows close call 2ms
     ✓ bkit-debug.md never runs the grader itself 0ms
     ✓ bkit-debug.md: the close call commits what it graded 0ms
     ✓ bkit-debug.md writes close telemetry once and embeds it in the close comment 0ms
     ✓ bkit-ship.md closes through exactly one workflows close call 0ms
     ✓ bkit-ship.md never runs the grader itself 0ms
     ✓ bkit-ship.md: the close call commits what it graded 0ms
     ✓ bkit-ship.md writes close telemetry once and embeds it in the close comment 0ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 53614ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 771ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1078ms
     ✓ always writes the marker, even with no plan 779ms
     ✓ writes the linear marker shape, taking the tracker from package.json 786ms
     ✓ writes the jira marker shape, taking the tracker from package.json 816ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 757ms
     ✓ refuses a github marker with fid "../../etc" issue "12" (exit 2) 314ms
     ✓ refuses a title carrying [CI SKIP] before calling gh (exit 4) 309ms
     ✓ refuses a PR from dev, main, or the base itself 715ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1168ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1075ms
     ✓ exits 5 when the open-PR probe errors 624ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 981ms
     ✓ prs open still opens against any other base 566ms
     ✓ exits 6 when the created PR's base is not --base 798ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 627ms
     ✓ exits 1 with found=false when there is none 705ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 581ms
     ✓ --number reads one PR, mergeable included 651ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 665ms
     ✓ exits 4 when gh errors and 80 when it needs auth 829ms
     ✓ refuses a bad --state or --number 362ms
   ✓ bkit prs scan-body (10)
     ✓ flags [skip ci] in the landed commit body (exit 1) 348ms
     ✓ flags [ci skip] in the landed commit body (exit 1) 377ms
     ✓ flags [no ci] in the landed commit body (exit 1) 329ms
     ✓ flags [skip actions] in the landed commit body (exit 1) 311ms
     ✓ flags [actions skip] in the landed commit body (exit 1) 442ms
     ✓ flags [SKIP CI] in the landed commit body (exit 1) 335ms
     ✓ passes a deliberate token in the SUBJECT with a clean body (docs-only close) 328ms
     ✓ exits 2 on an empty or option-like sha, 3 on an unreadable one 357ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 484ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 736ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 1059ms
     ✓ drops the force-build marker from the title subject 737ms
     ✓ takes an explicit --subject 989ms
     ✓ runs no merge when the PR is already MERGED 487ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 917ms
     ✓ prs merge refuses a PR whose base is main 632ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 800ms
     ✓ prs merge refuses when the PR base is unknown 626ms
     ✓ prs merge reads the base from the one pr view it already makes 587ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 1035ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 726ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 577ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 1117ms
     ✓ exits 2 on a bad --number 796ms
     ✓ never reads dev's required checks without --only-if-required 1283ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 1844ms
     ✓ updates when a dev ruleset requires status checks 1305ms
     ✓ updates when dev's branch protection requires status checks 1272ms
     ✓ ignores dev rulesets that require no checks 1122ms
     ✓ updates when the repo cannot be resolved 943ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 1102ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 557ms
     ✓ is not green when a check failed, naming it (exit 1) 520ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 495ms
     ✓ is not green on an empty rollup (total 0) 523ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 463ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 876ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 689ms
     ✓ is a no-op when the title already says so 1034ms
     ✓ strips the marker, with or without its bkit prefix 938ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1129ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ scans a clean landed body and records the close-transport row 629ms
     ✓ records a skip token found in the body, then exits 1 301ms
     ✓ exits 8 on an unreadable commit, writing nothing 378ms
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 475ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (53 tests) 54515ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1236ms
     ✓ names each net-new and worsened finding in the log and the JSON 1505ms
     ✓ fails on a net score rise with no net count change 1538ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1333ms
     ✓ treats a net score at or below 0.001 as float noise 1191ms
     ✓ passes when the change only resolves findings 1144ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1187ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 469ms
     ✓ skips (exit 0) when the base resolves to HEAD 572ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1805ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 1111ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 571ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1484ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1376ms
     ✓ exits 4 on a dropped net field instead of silently passing 1276ms
     ✓ exits 4 on no summary instead of silently passing 1351ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1143ms
     ✓ exits 5 when the base worktree cannot be created 706ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1347ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1711ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1441ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1439ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1663ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 2641ms
   ✓ bkit ci prose — file selection (3)
     ✓ defaults to every markdown file outside node_modules 595ms
     ✓ a one-level glob does not descend; ** does; each file once across globs 584ms
   ✓ bkit ci prose — gate (5)
     ✓ skips with exit 0 when vale is not installed 711ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 707ms
     ✓ fails (exit 1) when vale reports alerts 1103ms
     ✓ exits 6 on a vale runtime error 1235ms
     ✓ skips with exit 0 when no file matches 1013ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 2320ms
     ✓ falls back to vale sync when the main worktree has none 1084ms
     ✓ skips loudly with exit 0 when vale sync cannot restore it either 1390ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 1366ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 680ms
     ✓ is a usage error when the commit cannot be read 656ms
   ✓ bkit ci min-push (8)
     ✓ exits 0 when every changed file is a plan log or a ledger 711ms
     ✓ exits 1 naming the files outside, whatever the commit message says 907ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1477ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 2060ms
     ✓ reads bkit.testing.minPushPaths from package.json; an explicit [] turns it off 2333ms
     ✓ a top-level glob does not reach into folders 712ms
     ✓ a push that changes no files is not proven a min push 785ms
     ✓ exits 7 when a commit or its base cannot be read 746ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (64 tests) 59050ms
   ✓ bkit worktrees setup — usage (9)
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=2026-10"] 320ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 547ms
     ✓ adopts the main checkout even when called from a linked worktree 605ms
     ✓ design refuses to work in place on dev 478ms
     ✓ plan refuses to work in place on dev 447ms
     ✓ build refuses to work in place on dev 551ms
     ✓ ship refuses to work in place on dev 440ms
     ✓ build in place on main is refused 392ms
     ✓ design and plan in place on main are refused 723ms
     ✓ still adopts a cloud session branch whose upstream is main 743ms
     ✓ refuses a detached HEAD 461ms
   ✓ bkit worktrees setup — debug (4)
     ✓ may debug in place on dev 994ms
     ✓ never in place on main 338ms
     ✓ adopts in place when the session is already on feat/{fid} 592ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 2318ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1982ms
     ✓ a new run of the same FID rewrites startSha 3404ms
     ✓ a resume of the same FID reuses the record 3047ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1732ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1831ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1938ms
     ✓ a stale record without a lock is replaced 2302ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 2088ms
     ✓ ship names a missing feat branch 1126ms
     ✓ ship on dev refuses with the releases-stay-manual text 535ms
     ✓ refuses dev / main as the ship branch 691ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 2802ms
     ✓ --issue is ship only 787ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 1602ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 1437ms
     ✓ fails with a fetch error when there is no origin to rebase onto 1493ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 1083ms
       ✓ checks no disk when there are no cleanup step files 1029ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 940ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 867ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 772ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 486ms
     ✓ never commits an entry only the main checkout's copy list names 727ms
   ✓ paths (2)
     ✓ resolves the same marker from inside the worktree 341ms
   ✓ bkit worktrees remove (12)
     ✓ answers absent when there is no worktree 539ms
     ✓ leaves a worktree without the marker in place 854ms
     ✓ removes a marked worktree with uncommitted changes and clears the marker 1291ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 998ms
     ✓ tells a caller inside the removed worktree where to cd 868ms
     ✓ fails with its own exit code when git cannot remove a marked path 332ms
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 1552ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 868ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 772ms
       ✓ a branch already gone everywhere is reported deleted 793ms
       ✓ refuses to delete dev (2) 320ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 867ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1652ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (93 tests) 67412ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 1141ms
     ✓ done --group writes group on the row 693ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 979ms
     ✓ --commit=none writes the row and leaves it uncommitted 428ms
     ✓ build-group-start records parentSha and group 369ms
     ✓ carries extra fields, parsed as JSON when they are JSON 954ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 319ms
     ✓ refuses an empty artifact 313ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 320ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 317ms
     ✓ rejects ["--failures=-1"] 386ms
     ✓ rejects ["--status=SKIPPED"] 312ms
     ✓ reports a failed commit with exit 8 without writing the row 1134ms
     ✓ a failed commit leaves no row staged in the index 1012ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1766ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1162ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1416ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1417ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1359ms
   ✓ bkit steps verdict (10)
     ✓ a missing artifact exits 4 382ms
     ✓ no marker artifact exits 2 326ms
     ✓ disallowed artifact exits 3 311ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 589ms
     ✓ fails when no row was written for the step 382ms
     ✓ --ref reads the status file as committed on that ref, not from disk 641ms
     ✓ --ref exits 3 when the ref does not carry the status file 821ms
     ✓ fails on a placeholder left in the artifact 689ms
     ✓ fails when the row's verdict differs from the artifact's 574ms
     ✓ fails when the row does not list the artifact, or carries another attempt 649ms
     ✓ fails on a missing artifact 583ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 574ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 318ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 306ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 523ms
     ✓ fails a run-tests row missing its scope, and an empty scope 865ms
     ✓ names every missing field at once 356ms
     ✓ asks nothing of a step that writes none of them 454ms
   ✓ bkit steps finish (14)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 1327ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 488ms
     ✓ re-asks (exit 6) when a field the prompt declares is missing 635ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 511ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 674ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 775ms
     ✓ records the header's Strategy on the row 979ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 1466ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 2199ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 706ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 1441ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 1752ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1555ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 942ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 1066ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 2248ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 1762ms
     ✓ --post needs --number; without --post there is no tracker key 544ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 365ms
     ✓ --strip-header drops the prior version's own header 433ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks the FID's shape for the wired tracker 424ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 581ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 311ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 1124ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 813ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 589ms
       ✓ gate --issue without --fid is a usage error 304ms
       ✓ gate --issue="" under none keeps today's check 411ms
     ✓ --attempt-of checks the row carries the derived counter 623ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1691ms
     ✓ writeStepRow refuses when a recorded path changed 3357ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 1013ms
     ✓ writeStepRow appends its commit sha to the record 2090ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 2279ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (125 tests) 69674ms
   ✓ resolveGate (6)
     ✓ no package.json, no scripts, or unparseable -> null 330ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 474ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 776ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 782ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 824ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 419ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 439ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 450ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 460ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 431ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 592ms
     ✓ PASS is 0 failures with or without reports 667ms
     ✓ clears a previous attempt's reports before the gate runs 520ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 398ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1109ms
     ✓ a log under the outbox is named main-checkout relative in the record 789ms
     ✓ a log small enough is copied whole: not clamped, raw null 826ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 786ms
   ✓ bkit tests plan-check (27)
     ✓ plan-check refuses an UPDATE symbol missing from its file 318ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 372ms
     ✓ plan-check refuses a delete with no supersession row 383ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 302ms
   ✓ bkit tests red / green (38)
     ✓ records a red: the named test failed; row, log and test snapshot written, path passed whole 1918ms
     ✓ refuses a run that is not a red: exit 1, reason printed, no red row 880ms
     ✓ a red refused as passed notes HEAD and the uncommitted files for green 1233ms
     ✓ lints the test before its red when bkit:lint:file is declared; a lint failure records nothing 1050ms
     ✓ an undeclared bkit:lint:file is skipped with a note, and the red still runs 829ms
     ✓ a red already recorded for the unchanged test stands on resume; a changed test runs again 936ms
     ✓ refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2) 669ms
     ✓ a script that cannot run is exit 4, not a rejected red 629ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 497ms
     ✓ green refuses a plan with no task markers 376ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1236ms
     ✓ green: --group audits only that group's tasks 1090ms
     ✓ green: --group naming a group with no tasks is refused 532ms
     ✓ green: a code fence never closed is the reason, not missing task markers 917ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 2071ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 2327ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1556ms
     ✓ green prints a verdict and a fixable per gap 1715ms
     ✓ green verdict is FAIL when a gap is unfixable 983ms
     ✓ green leaves a diff-reading kind fixable null 1187ms
     ✓ green prints verdict null when a gap needs a diff read 1182ms
     ✓ green: lists each gap kind, with the diff for a test changed since its red 1020ms
     ✓ green: a red recorded for a different test than the plan names is a red-mismatch 968ms
     ✓ green: a planned test that moved is a red-mismatch saying whether the recorded test passes now 788ms
     ✓ green: every test a task names needs its own red and its own pass 1653ms
     ✓ test order (13)
       ✓ green finds the code commit for DONE — TASK N 2913ms
       ✓ a red recorded before the task's code commit stands, across a resumed execute 1692ms
       ✓ a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked 1093ms
       ✓ a test found by name in its file is judged on its own lines and the code it runs (3)
         ✓ another test's edit 1228ms
         ✓ its own body's edit 943ms
         ✓ its helper's edit 1053ms
       ✓ a red run refused as passed (3)
         ✓ on another task's committed code that shares its file is already landed, not no-red 2099ms
         ✓ with the task's own files uncommitted then stays no-red, naming them 2196ms
         ✓ with no other task's code sharing a file stays no-red, saying so 1768ms
       ✓ green emits a test-changed gap for a red whose test gained added lines only 1205ms
       ✓ green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green 2271ms
       ✓ green refuses an exception-only task from a workflow step commit 1019ms
       ✓ green clears an exception-only task from a human commit 874ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 34015ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 757ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 670ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 1108ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 1057ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 1205ms
     ✓ gh not on PATH at all also falls back to the remote 783ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 541ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 964ms
     ✓ counts commits behind origin/dev and the divergence age 1649ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 971ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 2167ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 826ms
     ✓ from a worktree, still names the main checkout and its outbox 996ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 1080ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 1169ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 1091ms
     ✓ prints the Jira site and project under jira 808ms
     ✓ prints the board under github 836ms
     ✓ prints the github progress and review states, defaults for a key left unset 868ms
     ✓ prints the linear progress and review states, defaults for a key left unset 793ms
     ✓ prints the jira progress and review states, defaults for a key left unset 892ms
     ✓ prints the linear progress and review states, defaults for a key left unset 787ms
     ✓ prints null progress and review states under none 653ms
     ✓ prints buildPublishRemote and buildPublishLocal 708ms
     ✓ prints the publish defaults when package.json omits them 861ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 791ms
     ✓ prints nulls under github without a board, and for keys left unset 1813ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 897ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 726ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 859ms
     ✓ an unpinned repo reports nulls and asks no registry 1081ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 470ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 466ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 605ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 684ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 20745ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 794ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 1241ms
     ✓ CI=true -> GITHUB_ACTION 1025ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 892ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 474ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 761ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 703ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 743ms
     ✓ classifyAt reads the marker from the main checkout inside a linked worktree 698ms
     ✓ classifyAt outside a git repo reads the marker under the folder itself 475ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 601ms
     ✓ LOCAL -> runtimeHeadless=false 618ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 561ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 714ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 1063ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 422ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 709ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 712ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 491ms
     ✓ --file into a missing directory is refused, not created 765ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 621ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 630ms
     ✓ staging failure: exit 4 and no commit is created, no false success 552ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 919ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 1119ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 596ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 560ms
     ✓ usage error ["--scope=core","--mode=commit"] exits 2 339ms
     ✓ --root defaults to the working directory 574ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 1061ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 838ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 440ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 1613ms
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
     ✓ triage refuses a plan whose task blocks do not parse 611ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 494ms
 ❯ .bkit/core/engine/tools/instructions.test.ts (96 tests | 1 failed) 113436ms
   ❯ the corpus matches the instructions store (8)
     ✓ finds prompts, workflows, both rules files, and every audit template with its adopted copy 7ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ loads every shipped doc master with a bkit block as a doc, never an installed copy 5ms
     ✓ checks a doc inside its bkit block only and pools it with the plan template and AGENTS.md 1ms
     × has no findings 68628ms
     ✓ every prompt, workflow and utility agent has the three header blocks 706ms
     ✓ sync has nothing left to rewrite 38165ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ the retired scoped policy is not restated as current 1ms
   ✓ the checker rejects what it should (22)
     ✓ a missing required clause fails 5ms
     ✓ a duplicated clause fails 1ms
     ✓ a weakened rewrite is a near-copy, not a match 4ms
     ✓ an unrelated sentence is not a near-copy 1ms
     ✓ a clause inside a fenced block does not count 1ms
     ✓ a forbidden clause fails where present 1ms
     ✓ if-verdict is required with a verdict header and forbidden without 5ms
     ✓ an excepted file is not checked 0ms
     ✓ retired wording fails 1ms
     ✓ an anchored template fails on a line that starts it but does not match 1ms
     ✓ position: first fails when another bullet opens the block 1ms
     ✓ rules files are checked inside the managed block only 0ms
     ✓ a sentence shared by 2 prompts but not listed fails 2ms
     ✓ a sentence shared by 2 docs inside their bkit blocks but not listed fails 2ms
     ✓ a sentence a doc holds below bkit:end never counts toward the doc cut-off 1ms
     ✓ AGENTS.md and the plan template count toward the doc cut-off and take doc modes 1ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ one drifted copy does not hide a sentence the other prompts share 2ms
     ✓ a fragment after ; is its own sentence for the cut-off 1ms
     ✓ a sentence shared by 2 workflows but not listed fails; one workflow fewer passes 1ms
     ✓ each surface keeps its own cut-off: prompts and workflows never pool 0ms
     ✓ headings, HTML comments, and table rows never count toward the cut-off 0ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ a required clause is checked inside the managed block only 3ms
     ✓ a near-copy in an audit template is flagged and sync rewrites the template and its adopted copy alike 3ms
     ✓ a sentence shared by 5 audit templates but not listed fails 1ms
     ✓ an adopted copy never counts twice toward the cut-off 0ms
     ✓ text below `bkit:end` never counts toward the cut-off 0ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
   ✓ templates (3)
     ✓ an anchored line may match any one of several templates 0ms
     ✓ a drifted anchored line fails 0ms
     ✓ a line two overlapping templates both fit counts once 0ms
   ✓ header blocks (7)
     ✓ each clause in its block, in wording-file order, passes; local lines in between allowed 6ms
     ✓ two swapped lines in one block fail 1ms
     ✓ a clause in the wrong block fails 1ms
     ✓ a placed clause in the body fails 3ms
     ✓ a CAUTION box, a missing block and blocks out of order fail 0ms
     ✓ files outside prompts, workflows and repo agents need no blocks 0ms
     ✓ the wording file takes block and position: first, and rejects anything else 3ms
   ✓ rule copies outside the Rules block (2)
     ✓ a rule's copy in Protocol or Contract fails, a cut-short copy included 15ms
     ✓ a line sharing only the rule's label, and the Rules block copy, pass 46ms
   ✓ fully retired clauses (6)
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 2753ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2426ms
     ✓ a push that fails without a server answer is returned once, never retried 1228ms
     ✓ a failed fetch is returned before anything is built 740ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2909ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 3385ms
     ✓ lands from a clone whose fetch refspec omits dev 2418ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1566ms
> [bkit] TRUNCATED HERE — 68 lines omitted. Dropped content was NOT read.
     ✓ a bare number with no issue prints a hint to write #N 369ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 2873ms
     ✓ a missing prompt file exits 7; --prompt-file with --branch is a usage error 403ms
   ✓ bkit fids resolve (12)
     ✓ 1. a FID the prompt names wins 441ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ refuses (exit 9) to mint from the workflow name when the prompt holds only a bare number 471ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 734ms
     ✓ 6. a FID that fails the format check exits 1 528ms
   ✓ bkit fids design --description-file --prompt-file (5)
     ✓ the issue's Parent design link wins; audit paths are listed in order 333ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (161 tests) 130332ms
   ✓ bkit runs gate (58)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ skipped lanes (16 is opt-in) (5)
       ✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 330ms
     ✓ tells an API error (20) from no run (10) 473ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 414ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ --event push selects the green push run beside an in-flight pull_request run 340ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 366ms
       ✓ a run still in progress whose capstone already passed passes 374ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 476ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 1342ms
       ✓ a source change past the validated head refuses (17) and names the path 1003ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 1094ms
       ✓ --validated equal to --head is the plain head check 301ms
       ✓ --validated without --month / --fid is a usage error (2) 882ms
       ✓ a validated sha that is not an ancestor refuses (17) 990ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 2080ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 1045ms
     ✓ CLI: a failed gh workflow run exits 5 1038ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 2003ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 776ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1849ms
     ✓ a failed re-trigger push names the cause in the log 2728ms
     ✓ a failed re-trigger push leaves no orphan commit behind 3884ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 6711ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1898ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 964ms
     ✓ gh-error: every poll errored 878ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 2949ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1989ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1687ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1463ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 5496ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 4350ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1445ms
     ✓ re-trigger on dev only uses the record of its own FID 2153ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1611ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 1445ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 1131ms
     ✓ a refused capstone records FAIL with its reason 1534ms
     ✓ an unreadable PR is an API error (20) with no head 680ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 1299ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 2120ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1221ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 872ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 2299ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 2283ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 2050ms
     ✓ --file and --step go together 1891ms
(node:82511) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 1470ms
     ✓ resolves config from the repo root when run from a subdirectory 1449ms
     ✓ exits 6 when the PUT fails 1255ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1319ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 1304ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 882ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 978ms
     ✓ exits 6 when the api answer is not JSON 522ms
 ✓ .bkit/core/engine/audits/repo/resolve-push-base.test.ts (17 tests) 7791ms
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 1235ms
       ✓ falls back to event.before when gh prints unparseable output 833ms
       ✓ reports last-green-run as the source when the green head is an ancestor 1290ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 1132ms
         ✓ tests ancestry against --head, not HEAD 1238ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 1383ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 28980ms
   ✓ gateguard opencode plugin — advisory mode (default) (7)
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 446ms
     ✓ source file is not treated as gate config 440ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 538ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 1976ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1141ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1322ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1214ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 1032ms
     ✓ fetches the issue and its comments as GitHub returns them 1466ms
   ✓ linear client (4)
     ✓ no key -> auth, and fetch is never called 366ms
   ✓ jira client (MCP over HTTP) (5)
     ✓ a tool error maps to a reason; HTTP 401 on initialize is auth 334ms
     ✓ fetches through getJiraIssue (evidence view) and pages listJiraIssueComments 476ms
   ✓ postCommentOnce (4)
     ✓ skips issue-less runs and tracker none 775ms
     ✓ records an engine-action row and skips the same key + body on a re-run 1657ms
     ✓ a recent identical comment counts as done (the final close comment) 1812ms
     ✓ a failed post reports done false with the reason and never leaks a token 981ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1419ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker 316ms
     ✓ a different marker hash posts 1534ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 644ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 20144ms
   ✓ bkit issues labels (25)
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 548ms
     ✓ merged drops every phase label and bkit:failed; refuses --failed=on with it 453ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 805ms
     ✓ refuses an unknown phase or on/off value 367ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 1161ms
     ✓ keeps each context's own section banner and drops every other context's 2657ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 501ms
   ✓ untouched originals (keepRaw) (4)
     ✓ clamp keeps the original in the outbox, never under logs/, and the record names it with its source 368ms
   ✓ bkit context provision (3)
     ✓ runs every recipe, lists each failed one with its last error line, and keeps going 490ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped fetch keeps the whole payload in the outbox; the record carries the block body as its source 350ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 1320ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 2451ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 904ms
     ✓ challenge gate exits 5 when --base names no commit 393ms
 ✓ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests) 5269ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ treats regex characters in a skill name literally 558ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 558ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 720ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 667ms
     ✓ runs from the checkout top even when called from a subfolder 774ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 1459ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 3052ms
     ✓ a refused dev push is logged, never fails the close 4326ms
     ✓ an unreachable remote is logged, never fails the close 2404ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 8879ms
   ✓ gradeCompliance — the grade bkit workflows close runs before its report (7)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 2637ms
     ✓ passes every rule on a clean head 573ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 941ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (19 tests) 9531ms
   ✓ bkit locks acquire --kind=workflow — month bucket (5)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --month is used as given 311ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 914ms
     ✓ reclaims a fresh lock over an IN_PROGRESS run idle 30+ minutes 467ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 862ms
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
     ✓ passes when nothing changed 540ms
     ✓ passes when only another key changed, such as a branch's upstream 527ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 698ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 726ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 852ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (19 tests) 5051ms
   ✓ bkit tasks currency (5)
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 901ms
   ✓ lookupLatestPublished (3)
     ✓ is null when pnpm fails or prints something that is not a version 557ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > repeat harvest of same rows does not duplicate (idempotent)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
> [bkit] TRUNCATED HERE — 177 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 793 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 56 lines omitted. Dropped content was NOT read.
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

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — nuke > --nuke --yes deletes all present files without interactive prompt
[bkit-uninstall-test] delete: AGENTS.md
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/version
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
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
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete: .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/.env.example
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/mcp.json (file not found — nothing to do)
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

 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 18665ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 18646ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (52 tests) 341ms
 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 521ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 482ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 354ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 246ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (277 tests) 214ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 175ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (73 tests) 261ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-Q6Qjky/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 212ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 328ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (249 tests) 516ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-wxxxON/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 127ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 194ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 246ms
 ✓ .bkit/core/engine/shared/settings.test.ts (31 tests) 173ms
 ✓ .bkit/core/engine/render/trackers.test.ts (102 tests) 220ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 180ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 186ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 116ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 170ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 100ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (96 tests) 141ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 96ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 183ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 107ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 102ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (247 tests) 159ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (65 tests) 144ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 102ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (41 tests) 152ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (30 tests) 100ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (23 tests) 118ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 119ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 108ms
 ✓ .bkit/core/engine/install/manifest.test.ts (48 tests) 179ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (64 tests) 149ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 223ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (6 tests) 103ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (33 tests) 142ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (60 tests) 44ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 143ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 101ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (35 tests) 141ms
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

 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (48 tests) 75ms
 ✓ .bkit/core/engine/render/hosts.test.ts (125 tests) 102ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 73ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 95ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (25 tests) 31ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 47ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 32ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 24ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 27ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 34ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 44ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 25ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 52ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (23 tests | 1 skipped) 45ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 14ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 141ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 55ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 72ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 44ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 40ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 43ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 35ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 63ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 34ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793247112168.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793247112172.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793247112173.md — skipping (expected exactly one of each)

 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 30ms
stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793247112185.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 36ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 22ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (32 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (8 tests) 31ms
stdout | .bkit/core/engine/commands/stats.test.ts > bkit stats > writes .bkit/stats.md, and the same ledgers give the same file
# bkit stats

This repo only: `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`. Written by `bkit stats`; workflow closes append the rows.

## Rows

<!-- prettier-ignore -->
| Kind | Rows |
| --- | --- |
| outcome | 1 |

<!-- prettier-ignore -->
| Workflow | Rows |
| --- | --- |
| build | 1 |

## Run durations

No outcome row records a duration.

## Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |

Attempt counters: 0 counted by the shell (trusted), 1 reported by the model (untrusted).

## Agent context peaks

No context data. A close records it from the Claude Code session that ran the workflow.

# bkit stats

This repo only: `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`. Written by `bkit stats`; workflow closes append the rows.

## Rows

<!-- prettier-ignore -->
| Kind | Rows |
| --- | --- |
| outcome | 1 |

<!-- prettier-ignore -->
| Workflow | Rows |
| --- | --- |
| build | 1 |

## Run durations

No outcome row records a duration.

## Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |

Attempt counters: 0 counted by the shell (trusted), 1 reported by the model (untrusted).

## Agent context peaks

No context data. A close records it from the Claude Code session that ran the workflow.


stderr | .bkit/core/engine/commands/stats.test.ts > bkit stats > writes .bkit/stats.md, and the same ledgers give the same file
[bkit-stats] wrote .bkit/stats.md
[bkit-stats] wrote .bkit/stats.md

 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 11ms
 ✓ .bkit/core/engine/commands/stats.test.ts (9 tests) 45ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 42ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 40ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 39ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 21ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 23ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 44ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 30ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 44ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 13ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 26ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 14ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 12ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 12ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 17ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 7ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (3 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (6 tests) 14ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 11ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (139 tests) 187526ms
   ✓ bkit workflows start (13)
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 629ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 640ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 752ms
       ✓ a new run in the same chat gets its own session row 500ms
       ✓ writes none outside Claude Code 481ms
     ✓ opens the next run after a finished one, and after another workflow's run 549ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 988ms
     ✓ design / plan / build / debug book in the current worktree 788ms
     ✓ refuses when the lock is live, writing no row 558ms
     ✓ --lock-held checks the lock is ours 790ms
     ✓ rejects an unknown workflow 455ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 627ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 811ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 468ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 594ms
     ✓ an OPEN decision of an earlier run never resurfaces 542ms
     ✓ an OPEN decision mid-build prints its header fields 517ms
     ✓ reads Test attempt from a tests pause 529ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 777ms
     ✓ writes no row when status.jsonl does not exist 614ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 720ms
     ✓ aborts a rebase only when one is in progress 1528ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1322ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 631ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 981ms
     ✓ --max-exceeded says a handover is due without any sentinel 695ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 606ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 837ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 701ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 550ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 352ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 388ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 470ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 436ms
     ✓ a debug run in SOAK mode always needs a handover 506ms
   ✓ bkit workflows close (19)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1203ms
       ✓ counts subagents of an earlier chat the run's session rows name 1012ms
       ✓ records no context block, and still closes, outside a Claude Code session 1304ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1127ms
     ✓ records ending held and publish false on the workflow-done row 1412ms
     ✓ defaults the close row to ending done 2050ms
     ✓ refuses an unknown ending 1251ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 3120ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 3464ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 2764ms
     ✓ always writes the telemetry, whatever the runtime 1407ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 886ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1206ms
     ✓ an unwritable stats path is logged and never fails the close 1253ms
     ✓ refuses without status.jsonl and writes nothing 959ms
     ✓ ship: run.pr, size of the squash commit, and coverage 2516ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 2249ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1146ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1022ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1716ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1399ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 2483ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 2051ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1602ms
     ✓ --record-step writes the close step's row before workflow-done 1091ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1231ms
     ✓ --number without --outbox is a usage error 1255ms
     ✓ --flush is ship only 603ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1982ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 2910ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 2226ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 2266ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1389ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 974ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 931ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3697ms
     ✓ --flush with nothing to record commits and pushes nothing 3045ms
     ✓ --flush carries the named worktree's logs into the dev commit 3041ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 5014ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 5139ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 4169ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 3982ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 4578ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3885ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 4132ms
     ✓ --push on dev never carries a row whose references name another feature 4339ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 4100ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 8959ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 4560ms
     ✓ --push commits in the named worktree, not the checkout it runs from 4162ms
     ✓ rejects --push with --flush, and --flush outside ship 1321ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 6774ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3494ms
     ✓ a close that landed releases the lock 4726ms
     ✓ removes the worktree before it releases the lock 3309ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4462ms
       ✓ closePr refuses when the PR base is unknown 3198ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1158ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 484ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 316ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 794ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 411ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 375ms
     ✓ a second run's record does not let this FID's close commit 616ms
     ✓ record is present after workflows close and before the push 1016ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1216ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 331ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 344ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 511ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 382ms
     ✓ puts each --line after the summary, in flag order 346ms
     ✓ --summary prints the file and keeps a copy in --outbox 359ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 365ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (196 tests) 318933ms
   ✓ branches rebase: behaviour (17)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1909ms
     ✓ refuses a code conflict and aborts the rebase on the spot 1120ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1775ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 1308ms
     ✓ produces byte-identical output to merge=union 2851ms
     ✓ restores a trailing newline so the next append starts on its own line 1594ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 1632ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 2387ms
     ✓ refuses a union that leaves a line which is not JSON 1496ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1730ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 2033ms
     ✓ refuses a lockfile whose regenerate command fails 1565ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 979ms
     ✓ removes a stale sentinel when the rebase succeeds 1536ms
     ✓ exits 4 when no rebase is in progress 339ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1772ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1729ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 1199ms
       ✓ skips (12) with no anchor 1993ms
       ✓ skips (12) when the base is unreachable in this clone 3186ms
       ✓ skips (12) when nothing landed since the base 3998ms
       ✓ runs (0) with the landed path count once dev moved 3742ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 1373ms
   ✓ branches push (17)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 2300ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 2168ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 2723ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 2287ms
     ✓ runs exactly one git push 2210ms
     ✓ --set-upstream records the upstream 1470ms
     ✓ refuses with no branch checked out 1078ms
     ✓ --mode=dev refuses a feature checkout 1682ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 3444ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 1169ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1881ms
     ✓ --mode=abort pushes when the branch has no open PR 1964ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1632ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 1995ms
     ✓ --open-pr carries the MCP answer and skips gh 1876ms
     ✓ --mode=abort on dev pushes plainly without probing 1713ms
     ✓ rejects an unknown mode 1434ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3620ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 3003ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 3742ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 5262ms
     ✓ skip-ci HEAD on the replay is refused 3803ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 4772ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 5135ms
     ✓ a level local dev is a plain push, recording nothing extra 2895ms
     ✓ a record with no commits pushes nothing 1901ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 1149ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 2666ms
     ✓ a rewritten branch is refused, never forced 1746ms
     ✓ refuses dev and main with exit 21 and pushes nothing 1018ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 3235ms
     ✓ refuses a detached HEAD (exit 5) 2118ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 2323ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 2328ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 2557ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 4098ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 1686ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 3556ms
     ✓ an up-to-date branch is a no-op 2137ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 4353ms
     ✓ a fetch that fails exits 10 2724ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 2102ms
     ✓ --paths with no match exits 1 2808ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 1737ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 2415ms
     ✓ --marker reads a diff over 1 MiB 2031ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 2064ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1926ms
     ✓ scan-diff finds an added skip 1477ms
     ✓ scan-diff ignores a skip predating the base 1148ms
     ✓ scan-diff reports a disabled test with its line 1390ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1244ms
     ✓ scan-diff ignores a removed comment in a test file 1615ms
     ✓ scan-diff ignores an assertion moved within the file 1106ms
     ✓ scan-diff still reports a removed assertion 1234ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1016ms
     ✓ scan-diff finds an added pytest mark skip 611ms
     ✓ scan-diff finds an added unittest skip 577ms
     ✓ scan-diff finds an added bare skip call 519ms
     ✓ scan-diff ignores a quoted skip in a documentation file 451ms
     ✓ scan-diff ignores a marker literal in a non-test source file 441ms
     ✓ scan-diff ignores an assertion whose expectation changed 445ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 448ms
     ✓ scan-diff reports a deleted test file 554ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 393ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 966ms
     ✓ a title that already carries the marker is left alone 775ms
     ✓ with no open PR: pushes the marker commit and edits no title 1093ms
     ✓ a re-run is deduped: no second marker commit 984ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1031ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 428ms
     ✓ --title-set skips gh entirely 580ms
   ✓ branches sync (11)
     ✓ Path A when origin/dev is an ancestor of HEAD 487ms
     ✓ Path B once dev moved; --head checks a given commit 658ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 676ms
     ✓ --merge-docs merges dev when docs/ is behind 751ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 633ms
     ✓ --merge-docs never merges on dev itself 499ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 673ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 669ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 644ms
     ✓ exits 10 when the fetch fails 319ms
     ✓ refuses --merge-docs with --head, and an unknown --head 301ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 583ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 811ms
     ✓ a failed install stops ship (16) 984ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 841ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 607ms
     ✓ exits 10 when the fetch fails 484ms
   ✓ branches land (27)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 388ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 3102ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 4123ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 3936ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 3706ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 6811ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 16495ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 7342ms
     ✓ local: names unpushed dev as the cause when the branch carries it 8725ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 8821ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 4452ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 4169ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 2876ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 3258ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 4135ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 3179ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1443ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 5855ms
     ✓ land removes the worktree when only the copied .env is untracked 4116ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 4633ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 4863ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 6413ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 4507ms
     ✓ landPr refuses a main-based PR without retrying 1575ms
     ✓ landPr refuses when the PR base is unknown 1397ms
     ✓ PR not open (closed): stops (17) at once, no retry 2161ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/tools/instructions.test.ts > the corpus matches the instructions store > has no findings
Error: Test timed out in 60000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/tools/instructions.test.ts:206:3
    204|   });
    205|
    206|   it("has no findings", { timeout: 60_000 }, () => {
       |   ^
    207|     const findings = checkClauses(CLAUSES, CORPUS).map(formatFinding);
    208|     expect(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts > every phase workflow grades itself at close through bkit workflows close > bkit-build.md closes through exactly one workflows close call
AssertionError: expected [ …(2) ] to have a length of 1 but got 2

- Expected
+ Received

- 1
+ 2

 ❯ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts:48:26
     46|
     47|     it(`bkit-${phase}.md closes through exactly one workflows close ca…
     48|       expect(closeLines).toHaveLength(1);
       |                          ^
     49|     });
     50|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  2 failed | 157 passed (159)
      Tests  2 failed | 6628 passed | 1 skipped (6631)
   Start at  14:08:54
   Duration  326.40s (tests 95%, transform 2%, setup 1%, import 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/715-retire-lite-workflows/build-group-gate-6-2.log.reports/vitest-63876.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.74 |    82.59 |   95.38 |   91.04 |                   
 engine            |   75.47 |    79.27 |    87.5 |   75.86 |                   
  cli.ts           |   75.47 |    79.27 |    87.5 |   75.86 | ...13,923,928-930 
 ...e/checks/after |   90.68 |    85.57 |    94.5 |   94.43 |                   
  auth.ts          |   98.46 |    98.11 |     100 |   97.95 | 69                
  ci-yml.ts        |   90.09 |    82.06 |     100 |   92.49 | ...09,422-424,435 
  github.ts        |   96.42 |    90.42 |     100 |   96.84 | 333-335           
  index.ts         |   86.25 |    72.72 |     100 |   97.09 | ...97,317,412-413 
  managed.ts       |   82.92 |    89.39 |   58.33 |   83.87 | 216-237           
  suppression.ts   |     100 |      100 |     100 |     100 |                   
  tools.ts         |   97.14 |    94.23 |     100 |   98.27 | 304               
 .../checks/before |   94.55 |    88.63 |   95.55 |   97.81 |                   
  context-fetch.ts |    98.8 |    91.95 |     100 |     100 | ...17,539,553,600 
  env.ts           |   90.16 |    79.62 |     100 |   91.83 | 176-181,188-196   
  files.ts         |   92.64 |    89.74 |   93.75 |   98.11 | 129               
  index.ts         |      84 |    73.33 |     100 |     100 | ...39,147,155-174 
  mcp.ts           |     100 |    96.96 |     100 |     100 | 81                
  repo.ts          |   93.38 |    93.75 |    87.5 |   93.61 | 194-202           
  version.ts       |   96.87 |    82.35 |     100 |     100 | 18-20,34,61-62    
 engine/commands   |   90.27 |    84.97 |   91.11 |   90.21 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...67,376,444,492 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   97.46 |    91.11 |     100 |     100 | 87-91,156,162     
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   97.88 |    92.52 |   94.11 |   98.75 | 283-284           
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   77.14 |    59.09 |   66.66 |   77.27 | ...58-171,201-202 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   98.59 |    86.17 |   97.14 |   99.59 |                   
  ci.ts            |   98.59 |    86.17 |   97.14 |   99.59 | 252               
 ...mmands/install |    47.9 |    45.74 |   59.49 |   48.26 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |      20 |     26.5 |      50 |   17.77 | ...42-146,217-613 
  uninstall.ts     |   67.79 |    64.46 |      70 |   68.92 | ...1101,1124-1291 
  upgrade.ts       |   32.45 |    30.88 |   35.71 |   33.57 | 350-378,560-1064  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   92.76 |    84.17 |   96.98 |   94.28 |                   
  branches.ts      |    89.7 |    82.01 |   97.43 |   91.35 | ...2078,2083,2108 
  challenge.ts     |   96.24 |    82.63 |     100 |    97.6 | ...66-368,616,640 
  context.ts       |   96.52 |    86.88 |   98.57 |   97.37 | ...1570,1735,1824 
  counters.ts      |   99.15 |     95.1 |     100 |   99.08 | 142               
  decisions.ts     |   95.26 |    80.52 |   97.72 |   98.34 | 193,296,364       
  disk.ts          |   92.88 |    84.69 |   95.55 |   95.54 | ...29,412-420,536 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,924-925   
  issues.ts        |   97.87 |    91.54 |   98.24 |   98.79 | 195,436-437,765   
  ledgers.ts       |   91.37 |    80.32 |   97.03 |    95.2 | ...1663-1664,1692 
  locks.ts         |   93.75 |    85.91 |   95.45 |   95.49 | ...09-210,377-378 
  plan-blocks.ts   |    90.9 |    83.57 |     100 |   91.04 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1153,1169-1170 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,223         
  roadmap.ts       |   96.68 |    91.66 |     100 |    97.2 | ...71,491-493,497 
  run-facts.ts     |    96.9 |    90.34 |     100 |   98.92 | 498-499           
  runs.ts          |   93.17 |    84.35 |     100 |   94.46 | ...1876,1908-1912 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...53,301,321-326 
  skills.ts        |     100 |     92.3 |     100 |     100 | 97,102            
  status.ts        |   97.47 |    95.48 |     100 |   98.55 | 103,212,450       
  step-table.ts    |     100 |    98.48 |     100 |     100 | 319               
  steps.ts         |   87.35 |    81.55 |   89.55 |   88.46 | ...1449,1454,1456 
  summary.ts       |   95.02 |     86.8 |    91.3 |   93.71 | ...76-377,385-391 
  tasks.ts         |   83.58 |    66.11 |   85.71 |   87.82 | ...36,353,384,388 
  test-blocks.ts   |   95.39 |    88.23 |   96.55 |   96.61 | 23-24,235-236     
  tests.ts         |   96.15 |     87.2 |   96.93 |   97.69 | ...1801,1806-1807 
  tracker.ts       |   92.89 |    73.23 |     100 |   96.73 | ...36,848,931,979 
  workflows.ts     |   93.13 |    82.46 |   97.03 |    94.9 | ...1643,1817,2524 
  worktrees.ts     |   65.61 |    62.82 |   76.74 |   65.99 | ...57-960,963-964 
 engine/install    |   93.15 |    84.64 |   94.15 |   95.95 |                   
  cloud-env.ts     |    96.9 |     91.3 |     100 |   99.64 | 223               
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 579-586           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,293            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   96.86 |    92.91 |   98.87 |   97.23 |                   
  status.ts        |     100 |    98.64 |     100 |     100 | 122               
  telemetry.ts     |    96.4 |     92.3 |   98.59 |   96.84 | ...1766,1809,2255 
 engine/render     |   90.65 |    82.42 |    98.3 |    92.7 |                   
  hosts.ts         |   89.62 |     81.2 |   96.15 |   90.74 | ...45-255,587-588 
  models.ts        |      90 |    81.11 |     100 |   94.26 | ...80,266,288,322 
  trackers.ts      |     100 |      100 |     100 |     100 |                   
 engine/shared     |   99.42 |    97.09 |     100 |     100 |                   
  package-json.ts  |     100 |    96.77 |     100 |     100 | 65                
  ...ge-manager.ts |     100 |      100 |     100 |     100 |                   
  package-roots.ts |     100 |       75 |     100 |     100 | 42,105            
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |   99.01 |    98.47 |     100 |     100 | 237,288           
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |    90.8 |     85.8 |   95.48 |    91.5 |                   
  instructions.ts  |    90.8 |     85.8 |   95.48 |    91.5 | ...1671-1753,1758 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.74% ( 16152/17997 )
Branches     : 82.59% ( 11399/13801 )
Functions    : 95.38% ( 2623/2750 )
Lines        : 91.04% ( 14131/15521 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1846 of 3572 lines (131 KB of 273 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
