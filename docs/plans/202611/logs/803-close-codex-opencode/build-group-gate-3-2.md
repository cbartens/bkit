
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 803-close-codex-opencode build-group-gate-3 is waiting for tests (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters (pid 2746, since 18:15:58), last run took 5m54s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 803-close-codex-opencode build-group-gate-3 is waiting for tests (still, 1 min so far) (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters (pid 2746, since 18:15:58), last run took 5m54s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 803-close-codex-opencode build-group-gate-3 is waiting for tests (still, 2 min so far) (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters (pid 2746, since 18:15:58), last run took 5m54s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 803-close-codex-opencode build-group-gate-3 is waiting for tests (still, 3 min so far) (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters (pid 2746, since 18:15:58), last run took 5m54s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 803-close-codex-opencode build-group-gate-3 is waiting for tests (still, 4 min so far) (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters (pid 2746, since 18:15:58), last run took 5m54s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 803-close-codex-opencode build-group-gate-3 is waiting for tests (still, 5 min so far) (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters (pid 2746, since 18:15:58), last run took 5m54s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 803-close-codex-opencode build-group-gate-3 is waiting for tests (still, 6 min so far) (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters (pid 2746, since 18:15:58), last run took 5m54s

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

[test-timeout-budget] load average 10.1 on 10 cores: unit limits 9550ms per test, 19100ms per hook (x1.91)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (115 tests) 55643ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 486ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1309ms
     ✓ always writes the marker, even with no plan 1374ms
     ✓ writes the linear marker shape, taking the tracker from package.json 1833ms
     ✓ writes the jira marker shape, taking the tracker from package.json 550ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 1699ms
     ✓ refuses a PR from dev, main, or the base itself 471ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1582ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1144ms
     ✓ exits 5 when the open-PR probe errors 538ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1200ms
     ✓ prs open still opens against any other base 1683ms
     ✓ exits 6 when the created PR's base is not --base 1282ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 4714ms
     ✓ refuses merged entry when current feature evidence cannot be read 1715ms
     ✓ qualifies MCP merged PR facts against newer feature work without gh 1902ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 950ms
     ✓ exits 1 with found=false when there is none 496ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 595ms
     ✓ --number reads one PR, mergeable included 446ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 774ms
     ✓ exits 4 when gh errors and 80 when it needs auth 689ms
   ✓ bkit prs scan-body (10)
     ✓ flags [no ci] in the landed commit body (exit 1) 305ms
     ✓ flags [SKIP CI] in the landed commit body (exit 1) 319ms
     ✓ passes a token-free body 305ms
     ✓ passes a deliberate token in the SUBJECT with a clean body (docs-only close) 325ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 341ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 487ms
     ✓ classifies a refused merge with a new dev conflict as integration 445ms
     ✓ returns an explicit terminal reason for other merge refusals 925ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 518ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 766ms
     ✓ drops the force-build marker from the title subject 478ms
     ✓ takes an explicit --subject 478ms
     ✓ runs no merge when the PR is already MERGED 659ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 952ms
     ✓ prs merge refuses a PR whose base is main 465ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 664ms
     ✓ prs merge refuses when the PR base is unknown 692ms
     ✓ prs merge reads the base from the one pr view it already makes 851ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 697ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 422ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 776ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 512ms
     ✓ never reads dev's required checks without --only-if-required 399ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 629ms
     ✓ updates when a dev ruleset requires status checks 522ms
     ✓ updates when dev's branch protection requires status checks 731ms
     ✓ ignores dev rulesets that require no checks 501ms
     ✓ updates when the repo cannot be resolved 517ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 482ms
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 463ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 466ms
     ✓ is not green when a check failed, naming it (exit 1) 417ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 415ms
     ✓ is not green on an empty rollup (total 0) 502ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 445ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 718ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 785ms
     ✓ is a no-op when the title already says so 390ms
     ✓ strips the marker, with or without its bkit prefix 587ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 883ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ scans a clean landed body and records the close-transport row 357ms
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 345ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 60786ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ adopts the main checkout even when called from a linked worktree 353ms
     ✓ design and plan in place on main are refused 522ms
     ✓ still adopts a cloud session branch whose upstream is main 334ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1548ms
     ✓ may debug in place on dev 571ms
     ✓ adopts in place when the session is already on feat/{fid} 311ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 1295ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1159ms
     ✓ a new run of the same FID rewrites startSha 2756ms
     ✓ a resume of the same FID reuses the record 1724ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1084ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1375ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 2022ms
     ✓ a stale record without a lock is replaced 1951ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 2424ms
     ✓ refuses inherited unpublished dev commits in every ship mode 6765ms
     ✓ names inherited commits and ship recovery in the refusal 1397ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1727ms
     ✓ ship names a missing feat branch 473ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1465ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 654ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 464ms
     ✓ fails with a fetch error when there is no origin to rebase onto 663ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 443ms
       ✓ checks no disk when there are no cleanup step files 500ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 581ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 588ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 477ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 390ms
     ✓ never commits an entry only the main checkout's copy list names 487ms
   ✓ paths (2)
     ✓ resolves the same marker from inside the worktree 379ms
   ✓ bkit worktrees remove (18)
     ✓ leaves a worktree without the marker in place 347ms
     ✓ preserves a marked worktree with uncommitted changes and its marker 851ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 468ms
     ✓ tells a caller inside the removed worktree where to cd 498ms
     ✓ fails with its own exit code when git cannot remove a marked path 497ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1758ms
       ✓ preserves staged-only mode during landed cleanup 1429ms
       ✓ preserves staged-only type during landed cleanup 1551ms
       ✓ preserves staged-only deletion during landed cleanup 1768ms
       ✓ removes landed staged content when both index and working contents are on dev 1805ms
       ✓ deletes the proved local and remote branch at their landed tips 2039ms
       ✓ retains the remote branch when origin refuses its conditional deletion 2510ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 675ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 634ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 441ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 839ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1492ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 66359ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1026ms
     ✓ names each net-new and worsened finding in the log and the JSON 1906ms
     ✓ fails on a net score rise with no net count change 2000ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1084ms
     ✓ treats a net score at or below 0.001 as float noise 1676ms
     ✓ passes when the change only resolves findings 2636ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1408ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 556ms
     ✓ skips (exit 0) when the base resolves to HEAD 576ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1860ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 573ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 423ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1504ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1482ms
     ✓ exits 4 on a dropped net field instead of silently passing 2143ms
     ✓ exits 4 on no summary instead of silently passing 1522ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1415ms
     ✓ exits 5 when the base worktree cannot be created 543ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1778ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1775ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 2456ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1914ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1251ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1893ms
   ✓ bkit ci prose — file selection (7)
     ✓ keeps tracked ignored prose and unusual filenames, skipping deleted tracked files 336ms
     ✓ does not follow a directory symlink replacing tracked prose 360ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 1148ms
     ✓ explicit globs can select ignored prose and nested checkout files 684ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 586ms
     ✓ fails (exit 1) when vale reports alerts 736ms
     ✓ exits 6 on a vale runtime error 802ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 783ms
     ✓ falls back to vale sync when the main worktree has none 681ms
     ✓ fails when vale sync cannot restore the required styles 749ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 769ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 531ms
     ✓ is a usage error when the commit cannot be read 449ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 618ms
     ✓ exits 1 naming the code file, whatever the commit message says 535ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 634ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 423ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 1392ms
     ✓ exits 7 when a commit cannot be read 497ms
   ✓ bkit ci min-push (22)
     ✓ exits 0 when every changed file is a plan log or a ledger 660ms
     ✓ exits 1 naming the files outside, whatever the commit message says 710ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1137ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 758ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 608ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 1296ms
     ✓ a top-level glob in the setting does not reach into folders 628ms
     ✓ a push that changes no files is not proven a min push 571ms
     ✓ exits 7 when a commit or its base cannot be read 540ms
     ✓ exits 0 when every changed file is an audit report under docs/audits 554ms
     ✓ exits 0 when an audit template changes only below its bkit:end, and says why 583ms
     ✓ refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end 770ms
     ✓ refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end 731ms
     ✓ refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end 770ms
     ✓ refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end 825ms
     ✓ refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end 851ms
     ✓ refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end 914ms
     ✓ refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end 736ms
     ✓ refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below 652ms
     ✓ refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below 708ms
     ✓ --update exits 0 when the update changes only an audit template's project section, and logs the template once 772ms
     ✓ --update exits 1 and lists only the code file when a project-section edit ships beside a code file 796ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (154 tests) 67905ms
   ✓ CI evidence test rounds (4)
     ✓ runs local gates only after current-generation remediation or soak 1050ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 1223ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1614ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 1242ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1263ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1616ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 349ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 1197ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1475ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 911ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1725ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1080ms
     ✓ PASS is 0 failures with or without reports 1548ms
     ✓ clears a previous attempt's reports before the gate runs 1477ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1511ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 972ms
     ✓ a log under the outbox is named main-checkout relative in the record 882ms
     ✓ a log small enough is copied whole: not clamped, raw null 1272ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 698ms
     ✓ --artifact needs --fid and --step 471ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1585ms
     ✓ numbers runs within the workflow's active run and per step 1115ms
     ✓ without --file no row is written and the output carries row null 660ms
   ✓ bkit tests plan-check (35)
     ✓ plan-check refuses a task without DONE WHEN 354ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 349ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 755ms
     ✓ a planned test that passes is a vacuous gap, exit 1 1191ms
     ✓ a planned test absent from a loaded report is a missing gap 791ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1222ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1268ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 540ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1361ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 695ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 962ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 305ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1789ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1131ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1927ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1082ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1579ms
     ✓ green: a passed-accepted test is already landed, not a gap 884ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 847ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 935ms
     ✓ green: --group audits only that group's tasks 816ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 960ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1215ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1061ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1575ms
     ✓ green: lists each gap kind, with the runner output 781ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1458ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 725ms
       ✓ green clears an exception-only task from a human commit 598ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (131 tests) 73039ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 673ms
     ✓ finishes a CI round only with its own failed job count 546ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 533ms
     ✓ done --group writes group on the row 520ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 566ms
     ✓ carries extra fields, parsed as JSON when they are JSON 490ms
     ✓ reports a failed commit with exit 8 without writing the row 1951ms
     ✓ a failed commit leaves no row staged in the index 2128ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1652ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1785ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1673ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1403ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1725ms
   ✓ bkit steps verdict (10)
     ✓ no marker artifact exits 2 376ms
     ✓ disallowed artifact exits 3 690ms
     ✓ a required field that is absent is invalid (re-prompt) 326ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 369ms
     ✓ only reads above the marker 301ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 582ms
     ✓ --ref reads the status file as committed on that ref, not from disk 618ms
     ✓ --ref exits 3 when the ref does not carry the status file 590ms
     ✓ fails on a placeholder left in the artifact 1155ms
     ✓ fails when the row's verdict differs from the artifact's 837ms
     ✓ fails when the row does not list the artifact, or carries another attempt 739ms
     ✓ fails on a missing artifact 627ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 608ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 309ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 317ms
     ✓ fails a diagnose row missing its strategy, passes with it 581ms
     ✓ fails a run-tests row missing its scope, and an empty scope 725ms
   ✓ bkit steps finish (16)
     ✓ preserves challenge findings in the event when a later round overwrites the report 370ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 836ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 670ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 563ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 918ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 972ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 747ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 1039ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1551ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 1166ms
     ✓ --post needs --number; without --post there is no tracker key 328ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks the FID's shape for the wired tracker 310ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 552ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 1109ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 678ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 405ms
     ✓ --attempt-of checks the row carries the derived counter 550ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 1921ms
     ✓ runs an audit template's project-section change through bkit:gate:min 2843ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 2263ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1581ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 2212ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 1447ms
     ✓ runs the full gate for replayed debug code 3528ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 3542ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 2794ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2901ms
     ✓ a push that fails without a server answer is returned once, never retried 2520ms
     ✓ a failed fetch is returned before anything is built 843ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 3277ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2320ms
     ✓ lands from a clone whose fetch refspec omits dev 3522ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1053ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 41637ms
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 510ms
     ✓ continues after friction and diagnostic writes fail without recursion 395ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 548ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 3724ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rolls over after intervening comments external edits and deletion 588ms
     ✓ starts only new source after overflow or missing source 383ms
     ✓ uses exact new comment after a failed eligibility read 389ms
   ✓ bounded nonfatal publication (10)
     ✓ falls back to a new comment after failed or uncertain append 360ms
     ✓ preserves a human correction after lost append recognition and a later report 354ms
     ✓ contains exhausted append and create failures without fabricated success 375ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 396ms
     ✓ keeps positive acknowledgment after receipt cache or postflight failure 324ms
     ✓ reserves new comment opportunity within total delivery budget 1124ms
     ✓ contains preparation state lock and reconciliation exceptions 393ms
     ✓ attempts independent attention after routine uncertainty 565ms
     ✓ seals an acknowledged segment after a postflight intervening comment 508ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 535ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 490ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 462ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 491ms
     ✓ fetches the issue and its comments as GitHub returns them 518ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 836ms
     ✓ invalidates missing corrupt and unsupported progress cache 1790ms
     ✓ contains cache read and write failures as standalone degradation 675ms
     ✓ uses legacy receipts and contains receipt failures 600ms
     ✓ skips issue-less runs and tracker none 342ms
     ✓ records an engine-action row and skips the same key + body on a re-run 613ms
     ✓ a recent identical comment counts as done (the final close comment) 520ms
     ✓ a failed post reports done false with the reason and never leaks a token 490ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 578ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 848ms
     ✓ a different marker hash posts 832ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 522ms
[feat/test 131e0b7] gate
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (23 tests) 40744ms
   ✓ verified incremental push gates (23)
     ✓ keeps the later failure when two full gates overlap on the same commit 4190ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 4024ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 539ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 544ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 498ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 4081ms
     ✓ does not fall back through a malformed later success receipt 2731ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1463ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1395ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2488ms
     ✓ a full-gate receipt carries an audit template's project-section increment to the minimum gate 2693ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 990ms
     ✓ does not record a committed tree 1016ms
     ✓ records no proof for a failed gate or lighter gate 1541ms
     ✓ requires integration proof when integration is declared 1821ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2963ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 871ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 503ms
     ✓ staging failure: exit 4 and no commit is created, no false success 724ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 562ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 405ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 425ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 390ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 1071ms
> [bkit] TRUNCATED HERE — 79 lines omitted. Dropped content was NOT read.
     ✓ refuses (exit 9) to mint from the workflow name when the prompt holds only a bare number 321ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 641ms
     ✓ 6. a FID that fails the format check exits 1 418ms
   ✓ bkit fids design --description-file --prompt-file (5)
     ✓ a plan issue's Workstreams line lists the workstreams the plan covers 376ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 943ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 822ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1117ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 586ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 1500ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 622ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1045ms
     ✓ an unpinned repo reports nulls and asks no registry 693ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 939ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 923ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 1075ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1248ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (15)
     ✓ locates CI evidence using prompt saved issue and local precedence 4660ms
     ✓ saves the failed job count without the capstone job 1203ms
     ✓ counts the capstone job when it is the only failed job 1741ms
     ✓ saves no failed job count when no job failed 1632ms
     ✓ counts fallback evidence jobs without the capstone job 444ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 529ms
     ✓ filters branch and PR discovery by configured workflow and exact head 3041ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1211ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 3849ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 3263ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 2438ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2810ms
     ✓ checks the named repository base and fails closed on missing evidence 1695ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1664ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1858ms
     ✓ rejects MCP capstone jobs belonging to another run 2310ms
     ✓ --fetch refreshes origin/<branch> before gating 976ms
     ✓ tells an API error (20) from no run (10) 331ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 325ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 933ms
       ✓ a source change past the validated head refuses (17) and names the path 807ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 1038ms
       ✓ --validated without --month / --fid is a usage error (2) 730ms
       ✓ a validated sha that is not an ancestor refuses (17) 834ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 777ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1529ms
     ✓ a failed re-trigger push names the cause in the log 1748ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1702ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2656ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1566ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 723ms
     ✓ gh-error: every poll errored 744ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1354ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1173ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1501ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1631ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 3933ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 4316ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1049ms
     ✓ re-trigger on dev only uses the record of its own FID 1122ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1256ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 317ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 301ms
     ✓ a refused capstone records FAIL with its reason 316ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 430ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 796ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 525ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 311ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1008ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 915ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 899ms
     ✓ --file and --step go together 624ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 1121ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 558ms
     ✓ follows summary cursors even when the first page is shorter than the limit 778ms
     ✓ reports excluded intervals as unread even when pagination finishes 578ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 639ms
     ✓ reports an unread remainder at the page cap 569ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 581ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 451ms
     ✓ rejects missing summaries instead of treating them as empty results 1085ms
     ✓ reports a failed first page as unavailable 534ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 601ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 1194ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 689ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1214ms
     ✓ reports excluded intervals as unread even when pagination finishes 835ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 1083ms
     ✓ reports an unread remainder at the page cap 1229ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 757ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 525ms
     ✓ rejects missing summaries instead of treating them as empty results 643ms
     ✓ reports a failed first page as unavailable 865ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 790ms
(node:92468) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 672ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2567ms
     ✓ a refused dev push is logged, never fails the close 3437ms
     ✓ an unreachable remote is logged, never fails the close 954ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (101 tests) 16331ms
   ✓ bkit issues labels (25)
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 323ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 358ms
     ✓ trackerState for {"tracker":{"default":"linear"}}: phase start "started", hand-off "In Review" 303ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 873ms
     ✓ counts files committed since --base 1210ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1049ms
     ✓ runs nothing and exits 0 when no file changed 350ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1168ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 812ms
     ✓ resolves config from the repo root when run from a subdirectory 435ms
     ✓ exits 6 when the PUT fails 1299ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 778ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 798ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 572ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 503ms
     ✓ exits 6 when the api answer is not JSON 996ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (38 tests) 6948ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 1403ms
     ✓ keeps each context's own section banner and drops every other context's 2906ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 592ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 301ms
> [bkit] TRUNCATED HERE — 43 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 918ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 1046ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 413ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 385ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 442ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 336ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 420ms
     ✓ --file into a missing directory is refused, not created 475ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 363ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1710ms
     ✓ runGit names ENOBUFS when output passes the limit 1669ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1480ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ releases only its delivery token on every exit 424ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 361ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 303ms
   ✓ bkit locks release (5)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 685ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1622ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 519ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 5275ms
   ✓ selected CI context evidence (3)
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 967ms
     ✓ passes every rule on a clean head 486ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 488ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (82 tests) 5633ms
   ✓ bkit status invocation (7)
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
   ✓ guardRepoConfig (6)
     ✓ passes when only another key changed, such as a branch's upstream 330ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 427ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 491ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 394ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (47 tests) 3659ms
   ✓ runLines (5)
> [bkit] TRUNCATED HERE — 129 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts (5 tests) 1440ms
   ✓ withChildDeadline (5)
     ✓ stops a spawnSync with no timeout at the remaining time and names it 308ms
     ✓ limits execSync and execFileSync the same way 613ms
     ✓ stops a child that ignores SIGTERM at the remaining time 302ms
> [bkit] TRUNCATED HERE — 43 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 195 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 359 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 145 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 73 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 248 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 498ms
 ✓ .bkit/core/engine/checks/after/index.test.ts (55 tests) 639ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (11 tests) 592ms
 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 674ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 441ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 879ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 749ms
 ✓ .bkit/core/engine/audits/workflows/question-option-format.test.ts (22 tests) 519ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 407ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 269ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 382ms
 ✓ .bkit/core/engine/render/trackers.test.ts (107 tests) 482ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 311ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 177ms
(node:88313) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:88313) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:88313) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:88313) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 107ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (57 tests) 347ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 267ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 480ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 274ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 352ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 215ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 212ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (22 tests) 121ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-wud7Xt/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 300ms
stdout | .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent
[bkit-install] skip: docs/security.md — .agents/docs.md already lists engineering/security.md for this topic, so no row was added. Add a row by hand if both documents matter.

 ✓ .bkit/core/engine/install/write.test.ts (80 tests) 319ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (52 tests) 392ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-DvVDDi/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 151ms
 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 56ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (65 tests) 192ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 179ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 153ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 214ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 212ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 117ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 179ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 186ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 152ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (105 tests) 168ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 181ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 217ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (57 tests) 144ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 134ms
(node:91107) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:91107) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 149ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 67ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 24ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 117ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 94ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 160ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 43ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 81ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (69 tests) 168ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 86ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 163ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 137ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 83ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 21ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 45ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 93ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 113ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 77ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 187ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 294ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 88ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 91ms
stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > migrates the wrapper and registers a row, then repeats as a no-op
[bkit-install] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] register: docs/noise.md in .agents/docs.md (Project Documents)

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > writes nothing on a dry run
[bkit-install] [dry-run] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] [dry-run] register: docs/noise.md in .agents/docs.md (Project Documents)

 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 72ms
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

 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 68ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 130ms
stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > adds no row and reports a problem when the index has a row it cannot read
[bkit-install] .agents/docs.md: not edited — .agents/docs.md has a Project Documents row bkit cannot read (| **docs/noise.md** | Noise |), so it may already list the document. Add a row for the project documents you copied under a `## Project Documents` table below `<!-- bkit:end -->` by hand.

 ✓ .bkit/core/engine/install/project-docs.test.ts (14 tests) 59ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 39ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 30ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 10ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 25ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 53ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 58ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 32ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 47ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 40ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 25ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 36ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 31ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 35ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 29ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794645095421.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794645095424.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794645095425.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794645095439.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (39 tests) 66ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 42ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 20ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 44ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 32ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 47ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 19ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 39ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 92ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (16 tests) 64ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 40ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 28ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 30ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 17ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 60ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 15ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (3 tests) 32ms
 ✓ .bkit/core/engine/commands/workflow/tests-jump.test.ts (3 tests) 53ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 24ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (6 tests) 21ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 11ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 15ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 16ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 12ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 14ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 12ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 49ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 7ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 6ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (171 tests) 194697ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 484ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1450ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 342ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 383ms
     ✓ writes no limits for a workflow with no ask point 442ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 310ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 414ms
       ✓ a new run in the same chat gets its own session row 538ms
       ✓ writes none outside Claude Code 589ms
     ✓ opens the next run after a finished one, and after another workflow's run 391ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 383ms
     ✓ design / plan / build / debug book in the current worktree 383ms
     ✓ refuses when the lock is live, writing no row 314ms
     ✓ --lock-held checks the lock is ours 530ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 431ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 504ms
   ✓ bkit workflows start — resume facts (11)
     ✓ a new run has no last step and no open decision 395ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 377ms
     ✓ an OPEN decision of an earlier run never resurfaces 776ms
     ✓ an OPEN decision mid-build prints its header fields 541ms
     ✓ openDecision carries the Gate header 423ms
     ✓ workflows start reports openDecision for a DECIDED decision file that no build-decision row names 450ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 1078ms
     ✓ workflows start does not report openDecision for a DECIDED decision file that a build-decision row names 308ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 468ms
     ✓ writes no row when status.jsonl does not exist 437ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 325ms
     ✓ aborts a rebase only when one is in progress 1087ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 1022ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1065ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 547ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 729ms
     ✓ --max-exceeded says a handover is due without any sentinel 678ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 1235ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 903ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 694ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 376ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 309ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 370ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 1183ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 503ms
     ✓ bkit workflows fail refuses a multi-line, non-/bkit- or markdown-carrying --next-step before any write 628ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 787ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 513ms
     ✓ bkit workflows fail treats an empty --next-step as absent 401ms
     ✓ a debug run in SOAK mode always needs a handover 541ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1326ms
       ✓ counts subagents of an earlier chat the run's session rows name 1191ms
       ✓ records no context block, and still closes, outside a Claude Code session 1312ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1015ms
     ✓ records ending held and publish false on the workflow-done row 1256ms
     ✓ defaults the close row to ending done 1328ms
     ✓ refuses an unknown ending 480ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1057ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1062ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1105ms
     ✓ always writes the telemetry, whatever the runtime 1223ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 1099ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1110ms
     ✓ an unwritable stats path is logged and never fails the close 1194ms
     ✓ appends the completeness row before the workflow-done row 1277ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1152ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1249ms
     ✓ writes one completeness row per close 2234ms
     ✓ leaves out the previous run's rows that share a second with this run's start 1043ms
     ✓ still closes when the completeness check throws 1464ms
     ✓ still closes when the completeness row write throws 1369ms
     ✓ refuses without status.jsonl and writes nothing 324ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1350ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1618ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1292ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1191ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1585ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1512ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1445ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1169ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1412ms
     ✓ --record-step writes the close step's row before workflow-done 1065ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1117ms
     ✓ --number without --outbox is a usage error 1211ms
     ✓ --flush is ship only 503ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1617ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1372ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1643ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1538ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1186ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 552ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 428ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3516ms
     ✓ --flush with nothing to record commits and pushes nothing 1946ms
     ✓ --flush carries the named worktree's logs into the dev commit 3348ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3780ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3814ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 4826ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 3293ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3922ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3854ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 3688ms
     ✓ --push on dev never carries a row whose references name another feature 3665ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 3313ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 5675ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 4287ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1539ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 4108ms
     ✓ preserves unlanded file deletions and ledger additions on close 9167ms
     ✓ preserves dirty work and uncertain branch evidence during close 9071ms
     ✓ preserves a local feature ref changed after its cleanup proof 8339ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 4441ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3277ms
     ✓ a close that landed releases the lock 1939ms
     ✓ removes the worktree before it releases the lock 1699ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3126ms
       ✓ closePr refuses when the PR base is unknown 2115ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1389ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 501ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 300ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 825ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 459ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 409ms
     ✓ a second run's record does not let this FID's close commit 410ms
     ✓ record is present after workflows close and before the push 781ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1653ms
   ✓ bkit workflows input (7)
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 323ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 579ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 453ms
     ✓ puts each --line after the summary, in flag order 428ms
     ✓ --summary prints the file and keeps a copy in --outbox 466ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 404ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 299932ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 797ms
     ✓ rejects missing explicit and ambiguous existing branch selections 486ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1037ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1132ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 621ms
     ✓ a refused --continue carries git's own reason 1264ms
     ✓ --file records nothing for a refused rebase 679ms
     ✓ refuses a code conflict and aborts the rebase on the spot 665ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 2369ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 1070ms
     ✓ produces byte-identical output to merge=union 2327ms
     ✓ restores a trailing newline so the next append starts on its own line 819ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 860ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1466ms
     ✓ refuses a union that leaves a line which is not JSON 1102ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1438ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 2872ms
     ✓ refuses a lockfile whose regenerate command fails 1934ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 2674ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 2116ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1939ms
     ✓ refuses and aborts when both sides changed the hand-written region 1080ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1257ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1435ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1968ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 1176ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1225ms
     ✓ refuses and aborts when a side deleted the install record 998ms
     ✓ refuses a conflicted doc the repo's script does not list 940ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 920ms
     ✓ removes a stale sentinel when the rebase succeeds 1497ms
     ✓ exits 4 when no rebase is in progress 338ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1822ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1579ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 832ms
       ✓ skips (12) with no anchor 843ms
       ✓ skips (12) when the base is unreachable in this clone 916ms
       ✓ skips (12) when nothing landed since the base 922ms
       ✓ runs (0) with the landed path count once dev moved 1512ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 811ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1861ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 1036ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1193ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1932ms
     ✓ runs exactly one git push 1803ms
     ✓ --set-upstream records the upstream 1320ms
     ✓ refuses with no branch checked out 910ms
     ✓ --mode=dev refuses a feature checkout 785ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2138ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 3416ms
     ✓ --require-ci pushes as-is when dev has not moved 1704ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2625ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 3775ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 952ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1318ms
     ✓ --mode=abort pushes when the branch has no open PR 1317ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1158ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 870ms
     ✓ --open-pr carries the MCP answer and skips gh 1231ms
     ✓ --mode=abort on dev pushes plainly without probing 1189ms
     ✓ rejects an unknown mode 970ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3545ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1934ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2367ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4674ms
     ✓ skip-ci HEAD on the replay is refused 1540ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3401ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 4137ms
     ✓ a level local dev is a plain push, recording nothing extra 1920ms
     ✓ a record with no commits pushes nothing 1240ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 1218ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1945ms
     ✓ a rewritten branch is refused, never forced 1427ms
     ✓ refuses dev and main with exit 21 and pushes nothing 841ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 2198ms
     ✓ refuses a detached HEAD (exit 5) 714ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1768ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1805ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1533ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1814ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 875ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1997ms
     ✓ an up-to-date branch is a no-op 1889ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2077ms
     ✓ a fetch that fails exits 10 799ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 1222ms
     ✓ scan-diff still reports a new skip when its test … 1210ms
     ✓ scan-diff reports a skip moved onto a different t… 983ms
     ✓ scan-diff does not cancel a skip moved between am… 1173ms
     ✓ scan-diff does not spend an unchanged duplicate t… 1194ms
     ✓ scan-diff recognizes a renamed test file 1595ms
     ✓ scan-diff recognizes a suite moved into a differe… 1122ms
     ✓ scan-diff does not let unrelated additions hide a… 1182ms
     ✓ scan-diff attributes deletion to its old test ins… 891ms
     ✓ scan-diff consumes each moved assertion once and … 1744ms
     ✓ scan-diff does not match identical assertions fro… 1390ms
     ✓ scan-diff does not match the same leaf test name … 1310ms
     ✓ scan-diff does not match a same-named test with d… 1309ms
     ✓ scan-diff does not match a same-named test with c… 1080ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1275ms
     ✓ --paths with no match exits 1 1134ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 929ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1631ms
     ✓ --marker reads a diff over 1 MiB 1255ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1395ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1151ms
     ✓ scan-diff finds an added skip 1455ms
     ✓ scan-diff ignores a skip predating the base 1120ms
     ✓ scan-diff reports a disabled test with its line 1304ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1158ms
     ✓ scan-diff ignores a removed comment in a test file 1200ms
     ✓ scan-diff ignores an assertion moved within the file 1094ms
     ✓ scan-diff still reports a removed assertion 1117ms
     ✓ scan-diff reports an assertion re-added only outside the test file 975ms
     ✓ scan-diff finds an added pytest mark skip 1268ms
     ✓ scan-diff finds an added unittest skip 950ms
     ✓ scan-diff finds an added bare skip call 1062ms
     ✓ scan-diff ignores a quoted skip in a documentation file 476ms
     ✓ scan-diff ignores a marker literal in a non-test source file 480ms
     ✓ scan-diff ignores an assertion whose expectation changed 428ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 506ms
     ✓ scan-diff reports a deleted test file 415ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 358ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1330ms
     ✓ a title that already carries the marker is left alone 1386ms
     ✓ with no open PR: pushes the marker commit and edits no title 1508ms
     ✓ a re-run is deduped: no second marker commit 1100ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1526ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 340ms
     ✓ --title-set skips gh entirely 609ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1300ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 2421ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1239ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2874ms
     ✓ continues only the explicitly recorded target through the public merge command 1811ms
     ✓ fetches the unseen feature head before classifying the base 1155ms
     ✓ fast forwards the feature before either base path is chosen 2367ms
     ✓ merges divergent feature tips without rebasing either side 1370ms
     ✓ continues the feature merge before starting a dev merge 2189ms
     ✓ publishes local code with a CI running head before bookkeeping 2597ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 3346ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 2185ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1612ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 403ms
     ✓ Path B once dev moved; --head checks a given commit 613ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 635ms
     ✓ --merge-docs merges dev when docs/ is behind 775ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 723ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1032ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1168ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 927ms
     ✓ --merge-docs skips an empty bkit:generate script 780ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 659ms
     ✓ --merge-docs never merges on dev itself 615ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 842ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 946ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 846ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 907ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 478ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1174ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1390ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1550ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1049ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1087ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1444ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 1011ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1173ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 827ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 562ms
     ✓ exits 10 when the fetch fails 360ms
     ✓ refuses --merge-docs with --head, and an unknown --head 407ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 856ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1595ms
     ✓ a failed install stops ship (16) 851ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 725ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 747ms
     ✓ exits 10 when the fetch fails 515ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 419ms
     ✓ preserves unlanded file type changes in the shared landed comparison 378ms
   ✓ branches land (28)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 558ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1830ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1784ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1759ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1806ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 4341ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 4519ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 692ms
     ✓ local: names unpushed dev as the cause when the branch carries it 740ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 820ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2376ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2371ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1364ms
     ✓ uses tree entry equivalence for design and plan land cleanup 6187ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1716ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1605ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1486ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1458ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3067ms
     ✓ land removes the worktree when only the copied .env is untracked 1934ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1819ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1776ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 3041ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 2000ms
     ✓ landPr refuses a main-based PR without retrying 820ms
     ✓ landPr refuses when the PR base is unknown 830ms
     ✓ PR not open (closed): stops (17) at once, no retry 901ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 759ms
     ✓ --attempt names the merge round in a fix commit 675ms
     ✓ commits a rewritten and a deleted tracked file 652ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 566ms
     ✓ reports undeclared and runs nothing with no scripts 414ms
     ✓ reports undeclared and runs nothing with an empty script 432ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 603ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 601ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 397ms

 Test Files  178 passed (178)
      Tests  7714 passed | 2 skipped (7716)
   Start at  18:28:43
   Duration  301.36s (tests 97%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/803-close-codex-opencode/build-group-gate-3-2.log.reports/vitest-34417.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   88.58 |    82.34 |   94.53 |   90.06 |                   
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
Branches     : 82.34% ( 16303/19798 )
Functions    : 94.53% ( 3359/3553 )
Lines        : 90.06% ( 18403/20433 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 573 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 334 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 333 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 338 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 328 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 324 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 141 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 328 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 359 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 348 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 332 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 324 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 344 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 340 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 1209 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 898 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 29 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 31 ms
ok 19 stub: the response selector is cleared before running its body # in 29 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 36 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 40 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 35 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 28 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 37 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 31 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 82 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 115 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 2511 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 584 ms
ok 30 refresh drops a file deleted in the index from the build # in 531 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 488 ms
ok 32 a key removed from the env file is unset on the next run # in 291 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 235 ms
ok 34 non-BKIT_ keys are skipped # in 253 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 261 ms
ok 36 a failed unsetenv is retried on the next run # in 300 ms
ok 37 logs key names only, never values # in 233 ms
ok 38 missing env file exits 0 without calling launchctl # in 46 ms
ok 39 the sweep prints the summary line the lane greps for # in 494 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 18 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (151.307542ms)
✔ shell cancellation waits for SIGTERM cleanup (213.104625ms)
✔ direct cancellation waits for SIGINT cleanup (152.83225ms)
✔ shell cancellation waits for SIGINT cleanup (215.573292ms)
✔ direct cancellation waits for SIGHUP cleanup (150.160416ms)
✔ shell cancellation waits for SIGHUP cleanup (213.414708ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (504.210375ms)
✔ shell cancellation follows a worker orphaned by a nested shell (287.856375ms)
✔ direct cancellation preserves a nested machine-lock owner (610.6885ms)
✔ shell cancellation preserves a nested machine-lock owner (642.73ms)
✔ nested shell cancellation preserves a nested machine-lock owner (641.25875ms)
✔ a hard process-group timeout reaches a shell command during cleanup (134.155292ms)
✔ ships a command-scoped sleep prevention wrapper (0.143042ms)
✔ preserves arguments, output and nonzero exit status (97.746625ms)
✔ runs an entire shell chain and retains its failure (49.803375ms)
✔ reports a missing command as 127 (50.032583ms)
✔ requires a command (43.473083ms)
✔ non-macOS platform selection runs commands without sleep prevention (70.865458ms)
✔ hard timeout escalation reaches a command that ignores TERM (182.540167ms)
✔ forwards POSIX cancellation to the command and releases the assertion (83.658667ms)
✔ holds a real macOS assertion only while the command runs (115.9725ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4680.55425
> [bkit] TRUNCATED — kept 1848 of 3582 lines (133 KB of 277 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
