
> @cbartens/bkit@6.0.0 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> pnpm bkit:gate:static-unit && pnpm test:integration


> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/166 files need formatting

> @cbartens/bkit@6.0.0 lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'

✔ 0 errors, 0 warnings and 0 suggestions in 149 files.
passed: true
skipped: null
files: 149

> @cbartens/bkit@6.0.0 slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> bkit ci slop

[bkit-ci] base 91c6d3c6e1a46421747a1f66df3ac54a34bfbacd (91c6d3c6e1a46421747a1f66df3ac54a34bfbacd) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 91c6d3c6e1a46421747a1f66df3ac54a34bfbacd
base: 91c6d3c6e1a46421747a1f66df3ac54a34bfbacd
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 20.8 on 10 cores: unit limits 10401ms per test, 20801ms per hook (x2.08)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (64 tests) 42928ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 454ms
     ✓ adopts the main checkout even when called from a linked worktree 482ms
     ✓ plan refuses to work in place on dev 312ms
     ✓ build refuses to work in place on dev 345ms
     ✓ design and plan in place on main are refused 489ms
     ✓ still adopts a cloud session branch whose upstream is main 427ms
     ✓ refuses a detached HEAD 406ms
   ✓ bkit worktrees setup — debug (4)
     ✓ may debug in place on dev 746ms
     ✓ adopts in place when the session is already on feat/{fid} 506ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 2294ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1884ms
     ✓ a new run of the same FID rewrites startSha 2781ms
     ✓ a resume of the same FID reuses the record 1767ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1107ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1563ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1468ms
     ✓ a stale record without a lock is replaced 1848ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1578ms
     ✓ ship names a missing feat branch 571ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1577ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 468ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 378ms
     ✓ fails with a fetch error when there is no origin to rebase onto 554ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 323ms
       ✓ checks no disk when there are no cleanup step files 669ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 519ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 617ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 744ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 465ms
     ✓ never commits an entry only the main checkout's copy list names 768ms
   ✓ paths (2)
     ✓ resolves the same marker from inside the worktree 508ms
   ✓ bkit worktrees remove (12)
     ✓ removes a marked worktree with uncommitted changes and clears the marker 572ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 479ms
     ✓ tells a caller inside the removed worktree where to cd 400ms
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 1270ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 939ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 832ms
       ✓ a branch already gone everywhere is reported deleted 1105ms
   ✓ bkit worktrees setup --detect (3)
     ✓ refuses --detect with --worktrees 346ms
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 1267ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 2213ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (93 tests) 60996ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 817ms
     ✓ done --group writes group on the row 618ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 899ms
     ✓ carries extra fields, parsed as JSON when they are JSON 587ms
     ✓ reports a failed commit with exit 8 without writing the row 2607ms
     ✓ a failed commit leaves no row staged in the index 1991ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1384ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1974ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 3104ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 2502ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 3068ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 753ms
     ✓ --ref reads the status file as committed on that ref, not from disk 624ms
     ✓ --ref exits 3 when the ref does not carry the status file 592ms
     ✓ fails on a placeholder left in the artifact 540ms
     ✓ fails when the row's verdict differs from the artifact's 497ms
     ✓ fails when the row does not list the artifact, or carries another attempt 598ms
     ✓ fails on a missing artifact 488ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 524ms
     ✓ refuses a negative or non-integer attempt (2) 387ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 318ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 384ms
     ✓ fails a diagnose row missing its strategy, passes with it 606ms
     ✓ fails a run-tests row missing its scope, and an empty scope 1021ms
     ✓ asks nothing of a step that writes none of them 314ms
   ✓ bkit steps finish (14)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 766ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 463ms
     ✓ records the header's Strategy on the row 360ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 788ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 560ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 1355ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1382ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 1018ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 1462ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1799ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 976ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks the FID's shape for the wired tracker 391ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 477ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 954ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 860ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 697ms
     ✓ --attempt-of checks the row carries the derived counter 517ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1269ms
     ✓ writeStepRow refuses when a recorded path changed 1584ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 678ms
     ✓ writeStepRow appends its commit sha to the record 1178ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 4670ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (53 tests) 80640ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 2311ms
     ✓ names each net-new and worsened finding in the log and the JSON 2344ms
     ✓ fails on a net score rise with no net count change 2474ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 2329ms
     ✓ treats a net score at or below 0.001 as float noise 2103ms
     ✓ passes when the change only resolves findings 1508ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1746ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 433ms
     ✓ skips (exit 0) when the base resolves to HEAD 661ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 3095ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 844ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 391ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 2699ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 2351ms
     ✓ exits 4 on a dropped net field instead of silently passing 2315ms
     ✓ exits 4 on no summary instead of silently passing 2363ms
     ✓ exits 4 on output that is not JSON instead of silently passing 2954ms
     ✓ exits 5 when the base worktree cannot be created 637ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 2020ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 3537ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 6566ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1946ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 3075ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 4577ms
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 2578ms
     ✓ fails (exit 1) when vale reports alerts 3295ms
     ✓ exits 6 on a vale runtime error 3221ms
     ✓ skips with exit 0 when no file matches 333ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 2014ms
     ✓ falls back to vale sync when the main worktree has none 1996ms
     ✓ skips loudly with exit 0 when vale sync cannot restore it either 2301ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 681ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 495ms
     ✓ is a usage error when the commit cannot be read 883ms
   ✓ bkit ci min-push (8)
     ✓ exits 0 when every changed file is a plan log or a ledger 672ms
     ✓ exits 1 naming the files outside, whatever the commit message says 695ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1277ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 957ms
     ✓ reads bkit.testing.minPushPaths from package.json; an explicit [] turns it off 1283ms
     ✓ a top-level glob does not reach into folders 672ms
     ✓ a push that changes no files is not proven a min push 604ms
     ✓ exits 7 when a commit or its base cannot be read 628ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (94 tests) 36260ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (23)
     ✓ modified ledger under the FID logdir is staged and committed 545ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 609ms
     ✓ brand-new untracked ledger is staged and committed 606ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 721ms
     ✓ path containing a space is staged and committed 544ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 634ms
     ✓ staging failure: exit 4 and no commit is created, no false success 847ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 373ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 314ms
     ✓ --mode=stage stages the sweep but creates no commit 448ms
     ✓ top-level docs/*.md is committed under scope=pr, not under scope=core or scope=full 1267ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 697ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 427ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 480ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 455ms
     ✓ --root defaults to the working directory 997ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 795ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 884ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 705ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 655ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 647ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 389ms
     ✓ a path outside the checkout exits 6 with nothing committed 320ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 440ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 306ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 1071ms
     ✓ --path records its commit on the run's record, like every other commit mode 995ms
     ✓ a recorded ledger commits only the rows the run appended 1188ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 1719ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 1434ms
     ✓ commitBookkeeping refuses when a recorded path changed 855ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 915ms
     ✓ under --mode=commit counts the squashed paths as something to commit 961ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 426ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 357ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 474ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 415ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 325ms
     ✓ keeps rows on separate lines when the destination has no final newline 361ms
   ✓ bkit ledgers only-bookkeeping (5)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 614ms
     ✓ a source file in the range: exit 7, path listed 612ms
     ✓ another FID's plan file in the range: exit 7 614ms
     ✓ from not an ancestor of to: exit 7 578ms
     ✓ unknown commit exits 3; a missing flag exits 2 397ms
   ✓ bkit ledgers triage (11)
     ✓ triage refuses a plan with no task blocks 361ms
     ✓ triage refuses a plan whose task blocks do not parse 324ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 112069ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 1283ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1626ms
     ✓ always writes the marker, even with no plan 1568ms
     ✓ writes the linear marker shape, taking the tracker from package.json 2067ms
     ✓ writes the jira marker shape, taking the tracker from package.json 1646ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 1850ms
     ✓ refuses a PR from dev, main, or the base itself 541ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1722ms
     ✓ retries a failed create once, and exits 5 when it fails twice 2042ms
     ✓ exits 5 when the open-PR probe errors 3084ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 2736ms
     ✓ prs open still opens against any other base 1924ms
     ✓ exits 6 when the created PR's base is not --base 1742ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 2103ms
     ✓ exits 1 with found=false when there is none 2300ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1775ms
     ✓ --number reads one PR, mergeable included 1372ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 1649ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1104ms
     ✓ refuses a bad --state or --number 365ms
   ✓ bkit prs scan-body (10)
     ✓ flags [skip ci] in the landed commit body (exit 1) 359ms
     ✓ flags [ci skip] in the landed commit body (exit 1) 475ms
     ✓ flags [no ci] in the landed commit body (exit 1) 455ms
     ✓ flags [skip actions] in the landed commit body (exit 1) 664ms
     ✓ flags [actions skip] in the landed commit body (exit 1) 404ms
     ✓ flags [SKIP CI] in the landed commit body (exit 1) 367ms
     ✓ passes a token-free body 490ms
     ✓ exits 2 on an empty or option-like sha, 3 on an unreadable one 330ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 508ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 1236ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 1251ms
     ✓ drops the force-build marker from the title subject 1630ms
     ✓ takes an explicit --subject 995ms
     ✓ runs no merge when the PR is already MERGED 1269ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1694ms
     ✓ prs merge refuses a PR whose base is main 1052ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 1740ms
     ✓ prs merge refuses when the PR base is unknown 2295ms
     ✓ prs merge reads the base from the one pr view it already makes 3291ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 3238ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 2453ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 1377ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 2101ms
     ✓ never reads dev's required checks without --only-if-required 2351ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 2007ms
     ✓ updates when a dev ruleset requires status checks 1816ms
     ✓ updates when dev's branch protection requires status checks 1947ms
     ✓ ignores dev rulesets that require no checks 2321ms
     ✓ updates when the repo cannot be resolved 2673ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 2964ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 2081ms
     ✓ is not green when a check failed, naming it (exit 1) 3062ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 2355ms
     ✓ is not green on an empty rollup (total 0) 2417ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 2617ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 3506ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 2167ms
     ✓ is a no-op when the title already says so 1602ms
     ✓ strips the marker, with or without its bkit prefix 2990ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 2201ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ scans a clean landed body and records the close-transport row 493ms
     ✓ records a skip token found in the body, then exits 1 442ms
     ✓ exits 8 on an unreadable commit, writing nothing 316ms
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 394ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (125 tests) 120330ms
   ✓ resolveGate (6)
     ✓ no package.json, no scripts, or unparseable -> null 429ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 2012ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 1516ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 2087ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1403ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 355ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 478ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 1336ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1802ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1137ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1154ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1731ms
     ✓ PASS is 0 failures with or without reports 2924ms
     ✓ clears a previous attempt's reports before the gate runs 2182ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 2299ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1777ms
     ✓ a log under the outbox is named main-checkout relative in the record 1871ms
     ✓ a log small enough is copied whole: not clamped, raw null 1723ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 2089ms
   ✓ bkit tests plan-check (27)
     ✓ plan-check refuses a delete with no supersession row 388ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 405ms
     ✓ plan-check refuses a task over the per-task caps, naming the task and the cap 303ms
     ✓ plan-check follows bkit.workflows.tasks 556ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 463ms
   ✓ bkit tests red / green (38)
     ✓ records a red: the named test failed; row, log and test snapshot written, path passed whole 1041ms
     ✓ refuses a run that is not a red: exit 1, reason printed, no red row 1272ms
     ✓ a red refused as passed notes HEAD and the uncommitted files for green 1684ms
     ✓ lints the test before its red when bkit:lint:file is declared; a lint failure records nothing 1131ms
     ✓ an undeclared bkit:lint:file is skipped with a note, and the red still runs 1929ms
     ✓ a red already recorded for the unchanged test stands on resume; a changed test runs again 1464ms
     ✓ refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2) 2059ms
     ✓ a script that cannot run is exit 4, not a rejected red 877ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 2381ms
     ✓ green: --group audits only that group's tasks 2223ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 3304ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 3491ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1552ms
     ✓ green prints a verdict and a fixable per gap 2815ms
     ✓ green verdict is FAIL when a gap is unfixable 2501ms
     ✓ green leaves a diff-reading kind fixable null 1886ms
     ✓ green prints verdict null when a gap needs a diff read 2301ms
     ✓ green: lists each gap kind, with the diff for a test changed since its red 2056ms
     ✓ green: a red recorded for a different test than the plan names is a red-mismatch 2536ms
     ✓ green: a planned test that moved is a red-mismatch saying whether the recorded test passes now 3242ms
     ✓ green: every test a task names needs its own red and its own pass 2027ms
     ✓ test order (13)
       ✓ green finds the code commit for DONE — TASK N 3691ms
       ✓ a red recorded before the task's code commit stands, across a resumed execute 2876ms
       ✓ a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked 3344ms
       ✓ a test found by name in its file is judged on its own lines and the code it runs (3)
         ✓ another test's edit 2243ms
         ✓ its own body's edit 3372ms
         ✓ its helper's edit 2302ms
       ✓ a red run refused as passed (3)
         ✓ on another task's committed code that shares its file is already landed, not no-red 3641ms
         ✓ with the task's own files uncommitted then stays no-red, naming them 2989ms
         ✓ with no other task's code sharing a file stays no-red, saying so 3780ms
       ✓ green emits a test-changed gap for a red whose test gained added lines only 2377ms
       ✓ green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green 2498ms
       ✓ green refuses an exception-only task from a workflow step commit 1150ms
       ✓ green clears an exception-only task from a human commit 665ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (42 tests) 76604ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 1384ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 1332ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 1785ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 1143ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 2552ms
     ✓ gh not on PATH at all also falls back to the remote 319ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 2677ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 3521ms
     ✓ counts commits behind origin/dev and the divergence age 3288ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 1810ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 3985ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1377ms
     ✓ from a worktree, still names the main checkout and its outbox 2208ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 2494ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 2457ms
   ✓ bkit repo info — where the wired tracker's issues live (10)
     ✓ prints the Linear team and project under linear 2882ms
     ✓ prints the Jira site and project under jira 2743ms
     ✓ prints the board under github 2356ms
     ✓ prints the github progress and review states, defaults for a key left unset 3727ms
     ✓ prints the linear progress and review states, defaults for a key left unset 2895ms
     ✓ prints the jira progress and review states, defaults for a key left unset 2322ms
     ✓ prints the linear progress and review states, defaults for a key left unset 3602ms
     ✓ prints null progress and review states under none 2412ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 1822ms
     ✓ prints nulls under github without a board, and for keys left unset 3614ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 2213ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 2461ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1673ms
     ✓ an unpinned repo reports nulls and asks no registry 2369ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 1284ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 1282ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 1514ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1484ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 56789ms
   ✓ gateguard opencode plugin — advisory mode (default) (7)
     ✓ emits reuse checklist on first write to a NEW (nonexistent) file 598ms
     ✓ keeps the reuse checklist when the write CREATES the file (pre-write snapshot) 694ms
     ✓ (V1) keeps the reuse checklist when the write CREATES the file (pre-write snapshot) 698ms
     ✓ emits investigation checklist on a write to an EXISTING file 627ms
     ✓ emits investigation checklist on first edit to a file 754ms
     ✓ dedups: second write to the same file in the same session emits nothing 788ms
     ✓ warns again for a different file in the same session 1492ms
   ✓ gateguard opencode plugin — deny mode (2)
     ✓ throws with advisory text on first write (blocks edit) 648ms
     ✓ allows retry (second call is a no-op after dedup marked) 582ms
   ✓ gateguard opencode plugin — subagents are NOT exempt (3)
     ✓ a subagent session editing a file DOES get the advisory (exemption removed) 561ms
     ✓ orchestrator session gets the advisory too — same treatment either way 660ms
   ✓ gateguard opencode plugin — gate-config advisory (9)
     ✓ tsconfig.json triggers config advisory 642ms
     ✓ flags vitest.config.ts as gate config 892ms
     ✓ flags eslint.config.mjs as gate config 951ms
     ✓ flags .prettierrc as gate config 600ms
     ✓ flags slop-scan.config.json as gate config 909ms
     ✓ flags .vale.ini as gate config 876ms
     ✓ flags .lintstagedrc.json as gate config 894ms
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 651ms
     ✓ source file is not treated as gate config 870ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 525ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 2230ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ matches a nested docs/ tree via segment match (.bkit/shared/docs/architecture.md) 1835ms
     ✓ twin parity: isDocsPath + docAuthoringAdvisory are byte-identical between the two hooks 362ms
 ❯ .bkit/core/engine/tools/instructions.test.ts (96 tests | 1 failed) 142793ms
   ❯ the corpus matches the instructions store (8)
     ✓ finds prompts, workflows, both rules files, and every audit template with its adopted copy 5ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ loads every shipped doc master with a bkit block as a doc, never an installed copy 1ms
     ✓ checks a doc inside its bkit block only and pools it with the plan template and AGENTS.md 0ms
     × has no findings 82355ms
     ✓ every prompt, workflow and utility agent has the three header blocks 455ms
     ✓ sync has nothing left to rewrite 45756ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ the retired scoped policy is not restated as current 0ms
   ✓ the checker rejects what it should (22)
     ✓ a missing required clause fails 2ms
     ✓ a duplicated clause fails 1ms
     ✓ a weakened rewrite is a near-copy, not a match 1ms
     ✓ an unrelated sentence is not a near-copy 0ms
     ✓ a clause inside a fenced block does not count 0ms
     ✓ a forbidden clause fails where present 2ms
     ✓ if-verdict is required with a verdict header and forbidden without 1ms
     ✓ an excepted file is not checked 0ms
     ✓ retired wording fails 1ms
     ✓ an anchored template fails on a line that starts it but does not match 1ms
     ✓ position: first fails when another bullet opens the block 2ms
     ✓ rules files are checked inside the managed block only 0ms
     ✓ a sentence shared by 2 prompts but not listed fails 1ms
     ✓ a sentence shared by 2 docs inside their bkit blocks but not listed fails 0ms
     ✓ a sentence a doc holds below bkit:end never counts toward the doc cut-off 0ms
     ✓ AGENTS.md and the plan template count toward the doc cut-off and take doc modes 1ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ one drifted copy does not hide a sentence the other prompts share 1ms
     ✓ a fragment after ; is its own sentence for the cut-off 0ms
     ✓ a sentence shared by 2 workflows but not listed fails; one workflow fewer passes 0ms
     ✓ each surface keeps its own cut-off: prompts and workflows never pool 0ms
     ✓ headings, HTML comments, and table rows never count toward the cut-off 0ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ a required clause is checked inside the managed block only 0ms
     ✓ a near-copy in an audit template is flagged and sync rewrites the template and its adopted copy alike 1ms
     ✓ a sentence shared by 5 audit templates but not listed fails 0ms
     ✓ an adopted copy never counts twice toward the cut-off 0ms
     ✓ text below `bkit:end` never counts toward the cut-off 0ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
   ✓ templates (3)
     ✓ an anchored line may match any one of several templates 0ms
     ✓ a drifted anchored line fails 0ms
     ✓ a line two overlapping templates both fit counts once 0ms
   ✓ header blocks (7)
     ✓ each clause in its block, in wording-file order, passes; local lines in between allowed 4ms
     ✓ two swapped lines in one block fail 1ms
     ✓ a clause in the wrong block fails 1ms
     ✓ a placed clause in the body fails 1ms
     ✓ a CAUTION box, a missing block and blocks out of order fail 0ms
     ✓ files outside prompts, workflows and repo agents need no blocks 0ms
     ✓ the wording file takes block and position: first, and rejects anything else 1ms
   ✓ rule copies outside the Rules block (2)
     ✓ a rule's copy in Protocol or Contract fails, a cut-short copy included 9ms
     ✓ a line sharing only the rule's label, and the Rules block copy, pass 4ms
   ✓ fully retired clauses (6)
> [bkit] TRUNCATED HERE — 89 lines omitted. Dropped content was NOT read.
     ✓ a bare number with no issue prints a hint to write #N 307ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 1913ms
     ✓ a missing prompt file exits 7; --prompt-file with --branch is a usage error 316ms
   ✓ bkit fids resolve (12)
     ✓ 2. the current feat/ branch, when it embeds the issue 547ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses (exit 9) to mint from the workflow name when the prompt holds only a bare number 459ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 906ms
     ✓ 6. a FID that fails the format check exits 1 366ms
   ✓ bkit fids design --description-file --prompt-file (5)
     ✓ a plan issue's Workstreams line lists the workstreams the plan covers 650ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ --fetch refreshes origin/<branch> before gating 1043ms
     ✓ --event (5)
       ✓ without --event the newer green pull_request run masks the failed push run 500ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 330ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 414ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 412ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 1118ms
       ✓ a source change past the validated head refuses (17) and names the path 1011ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 1004ms
       ✓ --validated without --month / --fid is a usage error (2) 549ms
       ✓ a validated sha that is not an ancestor refuses (17) 904ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 4535ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 1758ms
     ✓ CLI: a failed gh workflow run exits 5 1699ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 3056ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 890ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1543ms
     ✓ a failed re-trigger push names the cause in the log 2089ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1993ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 3433ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1557ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 960ms
     ✓ gh-error: every poll errored 1224ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1348ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1314ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1350ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1335ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 3126ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2795ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1127ms
     ✓ re-trigger on dev only uses the record of its own FID 1840ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1471ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 3040ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 2873ms
     ✓ a refused capstone records FAIL with its reason 2356ms
     ✓ an unreadable PR is an API error (20) with no head 3460ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 2012ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 3852ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1791ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 1658ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 2509ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 2773ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 3402ms
     ✓ --file and --step go together 2429ms
 ✓ .bkit/core/engine/commands/land.test.ts (30 tests) 38670ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 1390ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 3154ms
     ✓ a push that fails without a server answer is returned once, never retried 2267ms
     ✓ a failed fetch is returned before anything is built 1012ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2761ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 3479ms
     ✓ lands from a clone whose fetch refspec omits dev 2393ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1235ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 42449ms
   ✓ workflow shell fences (4)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 2051ms
     ✓ resolves config from the repo root when run from a subdirectory 1329ms
     ✓ exits 6 when the PUT fails 1153ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1904ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 1550ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 1945ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 2526ms
     ✓ exits 6 when the api answer is not JSON 2190ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (56 tests) 43794ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1756ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1498ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1704ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 1454ms
     ✓ fetches the issue and its comments as GitHub returns them 2542ms
   ✓ linear client (4)
     ✓ posts through GraphQL commentCreate with the API key as Authorization 772ms
     ✓ no key -> auth, and fetch is never called 347ms
     ✓ GraphQL errors map by code; DNS failure is network 320ms
     ✓ fetches title, url, state, labels, description and comments 368ms
   ✓ jira client (MCP over HTTP) (5)
     ✓ initialize -> session id -> tools/call addOrEditJiraIssueComment, Bearer key, non-default UA 400ms
     ✓ splits a body over 32,767 characters into consecutive comments 325ms
     ✓ a tool error maps to a reason; HTTP 401 on initialize is auth 544ms
   ✓ postCommentOnce (4)
     ✓ skips issue-less runs and tracker none 597ms
     ✓ records an engine-action row and skips the same key + body on a re-run 1279ms
     ✓ a recent identical comment counts as done (the final close comment) 1787ms
     ✓ a failed post reports done false with the reason and never leaks a token 2132ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 2160ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 1599ms
     ✓ a different marker hash posts 2331ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 2886ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (102 tests) 26793ms
   ✓ bkit context clamp (#427 T1) (22)
     ✓ leaves a file exactly at its cap byte-identical, with no footer 432ms
     ✓ keeps both ends of a long failing run under debug-evidence 339ms
     ✓ shortens an over-long line in place instead of evicting readable ones 393ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 2585ms
     ✓ keeps each context's own section banner and drops every other context's 5358ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 664ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 515ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 3558ms
       ✓ falls back to event.before when gh prints unparseable output 1079ms
       ✓ reports last-green-run as the source when the green head is an ancestor 3925ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 4910ms
         ✓ tests ancestry against --head, not HEAD 4395ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 4783ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (143 tests) 179315ms
   ✓ bkit workflows start (15)
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ an OPEN decision mid-build prints its header fields 456ms
     ✓ reads Test attempt from a tests pause 482ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 569ms
     ✓ writes no row when status.jsonl does not exist 642ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 502ms
     ✓ aborts a rebase only when one is in progress 815ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 596ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 417ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 512ms
     ✓ --max-exceeded says a handover is due without any sentinel 557ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 482ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 534ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 608ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 318ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 315ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 358ms
     ✓ a debug run in SOAK mode always needs a handover 364ms
   ✓ bkit workflows close (22)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 1261ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1386ms
     ✓ an unwritable stats path is logged and never fails the close 1268ms
     ✓ appends the completeness row before the workflow-done row 1493ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1383ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 1572ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1792ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1375ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 990ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 461ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 699ms
     ✓ --number without --outbox is a usage error 633ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1044ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 815ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 392ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2186ms
     ✓ --flush with nothing to record commits and pushes nothing 1801ms
     ✓ --flush carries the named worktree's logs into the dev commit 3090ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 4475ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3467ms
     ✓ a close that landed releases the lock 3375ms
     ✓ removes the worktree before it releases the lock 3541ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 637ms
     ✓ names the branch, not the remote-tracking ref, in each URL 528ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 625ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 818ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1329ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 988ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a second run's record does not let this FID's close commit 1458ms
     ✓ record is present after workflows close and before the push 1997ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2877ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 365ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 469ms
     ✓ a missing summary file exits 13 before anything is written 463ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 434ms
     ✓ a folder outside the outbox sessions folder is kept 420ms
     ✓ without --session-dir prints no sessionRemoved 592ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 1338ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2618ms
     ✓ a refused dev push is logged, never fails the close 3574ms
     ✓ an unreachable remote is logged, never fails the close 1373ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (26 tests) 6716ms
   ✓ bkit disk prune — step files (9)
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
     ✓ treats regex characters in a skill name literally 2352ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 1961ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 2053ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 1699ms
     ✓ runs from the checkout top even when called from a subfolder 2179ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 1060ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1578ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 479ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 17721ms
   ✓ bkit issues labels (25)
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 432ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 681ms
     ✓ refuses an unknown phase or on/off value 370ms
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 2025ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 2347ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 2145ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 1898ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1465ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1201ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1961ms
     ✓ --file into a missing directory is refused, not created 837ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 4688ms
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 1367ms
     ✓ is null when pnpm fails or prints something that is not a version 3210ms
 ✓ .bkit/core/engine/audits/repo/vitest-repo-config-guard.test.ts (12 tests) 3676ms
   ✓ repoConfigFile (3)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ passes when nothing changed 373ms
     ✓ passes when only another key changed, such as a branch's upstream 459ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 469ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 581ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 519ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 4759ms
   ✓ gradeCompliance — the grade bkit workflows close runs before its report (7)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 1050ms
     ✓ passes every rule on a clean head 463ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 625ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (19 tests) 5220ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 327ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 523ms
   ✓ bkit locks acquire --kind=workflow — ship (1)
> [bkit] TRUNCATED HERE — 229 lines omitted. Dropped content was NOT read.
     ✓ .bkit/core/workflows/bkit-build.md names no template path 351ms
     ✓ .bkit/core/workflows/bkit-design.md names no template path 349ms
     ✓ .bkit/core/prompts/bkit-debug-failure-s… names no template path 376ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > writes plugin prompts + workflow skills, and stamps the managed version
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 739 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-test] package.json: removed bkit install-state block

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps package.json bkit block on targeted (non-core) uninstall (github)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps package.json bkit block on targeted (non-core) uninstall (linear)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps package.json bkit block on targeted (non-core) uninstall (jira)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > strip-block is idempotent: running on already-stripped file no-ops
[bkit-uninstall-test] preserve: AGENTS.md (markered-text but no bkit markers found — 100% consumer content)
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
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
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

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > strip-block is idempotent: running on already-stripped file no-ops
[bkit-uninstall-test] preserve: AGENTS.md (markered-text but no bkit markers found — 100% consumer content)
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
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
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
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
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

 ✓ .bkit/core/engine/checks/after/index.test.ts (53 tests) 1396ms
   ✓ readChangelogVersionDelta (5)
     ✓ resolves CHANGELOG.md from the built dist/ layout 463ms
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
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
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
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
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
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 1149ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 1837ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 1524ms
 ✓ .bkit/core/engine/audits/workflows/question-option-format.test.ts (22 tests) 1163ms
   ✓ question option format: one layout across the corpus (12)
     ✓ counts the option lines found per directory 753ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (73 tests) 510ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (15 tests) 676ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 376ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (243 tests) 1265ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (52 tests) 859ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (5 tests) 588ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (100 tests) 732ms
 ✓ .bkit/core/engine/shared/settings.test.ts (26 tests) 163ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 478ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 206ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > upgrades a file with no consumer drift (update action)
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

 ✓ .bkit/core/engine/checks/after/tools.test.ts (30 tests) 270ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-SdH3f8/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 477ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 125ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (98 tests) 694ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-I5h7W7/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/render/trackers.test.ts (102 tests) 661ms
 ✓ .bkit/core/engine/install/manifest.test.ts (47 tests) 118ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 1102ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 489ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 289ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 554ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 622ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (65 tests) 736ms
   ✓ 3. commit cadence — every counted step commits in-block or is explicitly exempted (5)
     ✓ real corpus: every counted step commits in-block or is exempted 306ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 404ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (250 tests) 693ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 403ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 470ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (22 tests) 130ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (35 tests) 426ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 332ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 336ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/install/modules/core.test.ts (23 tests) 360ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 326ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 67ms
 ✓ .bkit/core/engine/render/hosts.test.ts (125 tests) 431ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 198ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 376ms
   ✓ floor (1)
     ✓ canonical clause and rule text stays at or above the floor 318ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 297ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 162ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 59ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 33ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 283ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 199ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 282ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 367ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (8 tests) 100ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 219ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 384ms
   ✓ textOmit audit (12)
     ✓ no workflow or prompt code span reads an omitted key 364ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 473ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (48 tests) 242ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (6 tests) 306ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (33 tests) 158ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (64 tests) 151ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 63ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 107ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (23 tests | 1 skipped) 166ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 131ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 120ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (32 tests) 33ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 165ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 66ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 278ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 51ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793276367540.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793276367544.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793276367546.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793276367622.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 106ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (60 tests) 128ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 160ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 26ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 180ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 34ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 168ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 73ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 33ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 126ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (21 tests) 184ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 27ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 59ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 70ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 167ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 24ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 47ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (8 tests) 29ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 62ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 117ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 18ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 27ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 12ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (20 tests) 10ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 78ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 42ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 30ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (3 tests) 14ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 7ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 9ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 18ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 16ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 41148ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 41127ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (196 tests) 280901ms
   ✓ branches rebase: behaviour (17)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1445ms
     ✓ refuses a code conflict and aborts the rebase on the spot 1014ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 2217ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 751ms
     ✓ produces byte-identical output to merge=union 1898ms
     ✓ restores a trailing newline so the next append starts on its own line 1511ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 1340ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 2025ms
     ✓ refuses a union that leaves a line which is not JSON 1146ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1321ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 3556ms
     ✓ refuses a lockfile whose regenerate command fails 3273ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 742ms
     ✓ removes a stale sentinel when the rebase succeeds 1123ms
     ✓ exits 4 when no rebase is in progress 322ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1914ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1512ms
   ✓ branches anchor-stamp (19)
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 557ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 777ms
       ✓ skips (12) with no anchor 730ms
       ✓ skips (12) when the base is unreachable in this clone 1198ms
       ✓ skips (12) when nothing landed since the base 1056ms
       ✓ runs (0) with the landed path count once dev moved 1888ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 857ms
   ✓ branches push (17)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1782ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 1282ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 2153ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 3335ms
     ✓ runs exactly one git push 2622ms
     ✓ --set-upstream records the upstream 1409ms
     ✓ refuses with no branch checked out 959ms
     ✓ --mode=dev refuses a feature checkout 929ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2109ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 915ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 2917ms
     ✓ --mode=abort pushes when the branch has no open PR 3913ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 3384ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 695ms
     ✓ --open-pr carries the MCP answer and skips gh 1399ms
     ✓ --mode=abort on dev pushes plainly without probing 1344ms
     ✓ rejects an unknown mode 1045ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 2193ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1869ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 3165ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 6891ms
     ✓ skip-ci HEAD on the replay is refused 1445ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2501ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 5371ms
     ✓ a level local dev is a plain push, recording nothing extra 1842ms
     ✓ a record with no commits pushes nothing 1530ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 812ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 4073ms
     ✓ a rewritten branch is refused, never forced 1491ms
     ✓ refuses dev and main with exit 21 and pushes nothing 996ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 2895ms
     ✓ refuses a detached HEAD (exit 5) 981ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 2120ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1521ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 2157ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1869ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 1121ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 3160ms
     ✓ an up-to-date branch is a no-op 2002ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2600ms
     ✓ a fetch that fails exits 10 1108ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1225ms
     ✓ --paths with no match exits 1 1384ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 1001ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1779ms
     ✓ --marker reads a diff over 1 MiB 1520ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1522ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1246ms
     ✓ scan-diff finds an added skip 1341ms
     ✓ scan-diff ignores a skip predating the base 1566ms
     ✓ scan-diff reports a disabled test with its line 2922ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 2015ms
     ✓ scan-diff ignores a removed comment in a test file 1371ms
     ✓ scan-diff ignores an assertion moved within the file 1641ms
     ✓ scan-diff still reports a removed assertion 1923ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1756ms
     ✓ scan-diff finds an added pytest mark skip 1902ms
     ✓ scan-diff finds an added unittest skip 1326ms
     ✓ scan-diff finds an added bare skip call 1411ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1341ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1204ms
     ✓ scan-diff ignores an assertion whose expectation changed 1308ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 1492ms
     ✓ scan-diff reports a deleted test file 1335ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 1036ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 4405ms
     ✓ a title that already carries the marker is left alone 3265ms
     ✓ with no open PR: pushes the marker commit and edits no title 4426ms
     ✓ a re-run is deduped: no second marker commit 4515ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 3824ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 1019ms
     ✓ --title-set skips gh entirely 1233ms
     ✓ refuses dev and main (exit 21) 679ms
   ✓ branches sync (11)
     ✓ Path A when origin/dev is an ancestor of HEAD 1211ms
     ✓ Path B once dev moved; --head checks a given commit 2017ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 1764ms
     ✓ --merge-docs merges dev when docs/ is behind 2718ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 2830ms
     ✓ --merge-docs never merges on dev itself 1709ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 2559ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 2182ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 2174ms
     ✓ exits 10 when the fetch fails 970ms
     ✓ refuses --merge-docs with --head, and an unknown --head 908ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1710ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 2437ms
     ✓ a failed install stops ship (16) 2012ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1953ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1808ms
     ✓ exits 10 when the fetch fails 1349ms
   ✓ branches land (27)
     ✓ refuses a workflow other than design or plan 688ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 1081ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 3335ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 5741ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 3514ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 3152ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 6070ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 6838ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 1838ms
     ✓ local: names unpushed dev as the cause when the branch carries it 1779ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 1930ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 4035ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 5907ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 3459ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2422ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2448ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1046ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 589ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1126ms
     ✓ land removes the worktree when only the copied .env is untracked 953ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1513ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1648ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1435ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 854ms
     ✓ landPr refuses a main-based PR without retrying 545ms
     ✓ landPr refuses when the PR base is unknown 564ms
     ✓ PR not open (closed): stops (17) at once, no retry 671ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

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

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 162 passed (163)
      Tests  1 failed | 6668 passed | 1 skipped (6670)
   Start at  22:15:44
   Duration  283.65s (tests 94%, setup 2%, transform 2%, import 1%, worker 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/699-engine-run-completeness/run-tests-1.log.reports/vitest-33299.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.61 |    82.36 |    95.2 |   90.92 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   90.68 |    85.57 |    94.5 |   94.43 |                   
  auth.ts          |   98.46 |    98.11 |     100 |   97.95 | 69                
  ci-yml.ts        |   90.09 |    82.06 |     100 |   92.49 | ...09,422-424,435 
  github.ts        |   96.42 |    90.42 |     100 |   96.84 | 333-335           
  index.ts         |   86.25 |    72.72 |     100 |   97.09 | ...97,317,412-413 
  managed.ts       |   82.92 |    89.39 |   58.33 |   83.87 | 216-237           
  suppression.ts   |     100 |      100 |     100 |     100 |                   
  tools.ts         |   97.14 |    94.23 |     100 |   98.27 | 304               
 .../checks/before |   94.44 |    88.31 |   95.45 |   97.76 |                   
  context-fetch.ts |    98.8 |    91.95 |     100 |     100 | ...17,539,553,600 
  env.ts           |   90.16 |    79.62 |     100 |   91.83 | 176-181,188-196   
  files.ts         |   92.64 |    89.74 |   93.75 |   98.11 | 129               
  index.ts         |   83.78 |    73.33 |     100 |     100 | ...38,144,152-171 
  mcp.ts           |     100 |    96.96 |     100 |     100 | 81                
  repo.ts          |   92.66 |    92.77 |   86.36 |   92.77 | 154-162           
  version.ts       |   96.87 |    82.35 |     100 |     100 | 18-20,34,61-62    
 engine/commands   |   87.66 |    81.07 |   91.21 |   88.56 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...67,376,444,492 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   97.46 |    91.11 |     100 |     100 | 87-91,156,162     
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   88.19 |    81.78 |   93.75 |   91.21 | ...76-482,486-489 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   77.14 |    59.09 |   66.66 |   77.27 | ...58-171,201-202 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   96.81 |    86.87 |   86.79 |   97.56 |                   
  ci.ts            |   98.24 |    86.17 |   94.44 |   99.19 | 256,712           
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
 ...mmands/install |    47.9 |    45.63 |   59.49 |   48.26 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |      20 |     26.5 |      50 |   17.77 | ...42-146,217-613 
  uninstall.ts     |   67.79 |    64.18 |      70 |   68.92 | ...1099,1122-1289 
  upgrade.ts       |   32.45 |    30.88 |   35.71 |   33.57 | 350-378,560-1064  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |    92.8 |    84.08 |   97.01 |   94.31 |                   
  branches.ts      |    89.7 |    82.01 |   97.43 |   91.35 | ...2078,2083,2108 
  challenge.ts     |   96.24 |    82.63 |     100 |    97.6 | ...66-368,618,642 
  completeness.ts  |   98.33 |    83.33 |     100 |   98.14 | 108               
  context.ts       |   96.52 |    86.88 |   98.57 |   97.37 | ...1575,1745,1834 
  counters.ts      |   99.15 |     95.1 |     100 |   99.08 | 142               
  decisions.ts     |   95.26 |    80.52 |   97.72 |   98.34 | 193,296,365       
  disk.ts          |   92.88 |    84.69 |   95.55 |   95.54 | ...29,412-420,537 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   97.87 |    91.54 |   98.24 |   98.79 | 195,436-437,765   
  ledgers.ts       |   91.37 |    80.32 |   97.03 |    95.2 | ...1670-1671,1699 
  locks.ts         |   93.75 |    85.91 |   95.45 |   95.49 | ...09-210,379-380 
  plan-blocks.ts   |    90.9 |    83.57 |     100 |   91.04 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1159,1175-1176 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,220         
  roadmap.ts       |   96.68 |    91.66 |     100 |    97.2 | ...71,491-493,497 
  run-facts.ts     |    96.9 |    90.34 |     100 |   98.92 | 504-505           
  runs.ts          |   93.17 |    84.35 |     100 |   94.46 | ...1876,1908-1912 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...55,304,324-329 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   97.29 |    95.54 |     100 |   98.45 | 103,203,409       
  step-table.ts    |     100 |    98.48 |     100 |     100 | 319               
  steps.ts         |   87.35 |    81.55 |   89.55 |   88.46 | ...1453,1458,1460 
  summary.ts       |   95.02 |    86.52 |    91.3 |   93.71 | ...71-372,380-386 
  tasks.ts         |   83.58 |    66.11 |   85.71 |   87.82 | ...39,356,387,391 
  test-blocks.ts   |   95.39 |    88.23 |   96.55 |   96.61 | 23-24,235-236     
  tests.ts         |   96.15 |     87.2 |   96.93 |   97.69 | ...1804,1809-1810 
  tracker.ts       |   92.89 |    73.23 |     100 |   96.73 | ...36,848,931,979 
  workflows.ts     |   93.32 |    81.88 |   97.22 |   95.01 | ...1710,1884,2589 
  worktrees.ts     |   65.61 |    62.82 |   76.74 |   65.99 | ...58-961,964-965 
 engine/install    |   93.15 |    84.64 |   94.15 |   95.95 |                   
  cloud-env.ts     |    96.9 |     91.3 |     100 |   99.64 | 223               
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 581-588           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,293            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |    96.6 |    92.59 |   98.87 |   97.08 |                   
  status.ts        |     100 |    98.64 |     100 |     100 | 114               
  telemetry.ts     |    96.1 |    91.95 |   98.59 |   96.67 | ...1754,1797,2243 
 engine/render     |   90.65 |    82.42 |    98.3 |    92.7 |                   
  hosts.ts         |   89.62 |     81.2 |   96.15 |   90.74 | ...45-255,587-588 
  models.ts        |      90 |    81.11 |     100 |   94.26 | ...80,266,288,322 
  trackers.ts      |     100 |      100 |     100 |     100 |                   
 engine/shared     |   99.37 |    97.36 |     100 |   99.27 |                   
  package-json.ts  |     100 |    96.77 |     100 |     100 | 65                
  ...ge-manager.ts |     100 |      100 |     100 |     100 |                   
  package-roots.ts |      96 |       75 |     100 |   95.45 | 119               
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |     100 |    99.09 |     100 |     100 | 251               
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   90.06 |     85.3 |   95.33 |   90.61 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
  instructions.ts  |    90.8 |     85.8 |   95.48 |    91.5 | ...1671-1753,1758 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.61% ( 16386/18284 )
Branches     : 82.36% ( 11472/13929 )
Functions    : 95.2% ( 2679/2814 )
Lines        : 90.92% ( 14330/15760 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1882 of 3484 lines (135 KB of 267 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
