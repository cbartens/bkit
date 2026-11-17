
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


 .bkit/core/.bkit/README.md
 342:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/cloud.md
 467:178  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/install.md
 19:1     warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 135:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 358:290  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 366:1    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 448:97   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 824:80   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/templates.md
 515:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 637:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 720:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 203:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 277:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 104:383   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 109:488   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 146:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 172:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 631:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 870:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1049:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1161:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1253:74   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1495:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1555:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 385:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 456:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 docs/deployments.md
 122:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 251:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 380:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 420:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 491:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 47 warnings and 0 suggestions in 152 files.
passed: true
skipped: null
files: 152

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> bkit ci slop

[bkit-ci] base 263f04b7c30c06833042d1dbb5031941bfb77b3d (263f04b7c30c06833042d1dbb5031941bfb77b3d) vs working tree
[bkit-ci] added 3, resolved 3, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 263f04b7c30c06833042d1dbb5031941bfb77b3d
base: 263f04b7c30c06833042d1dbb5031941bfb77b3d
added: 3
resolved: 3
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 2.7 on 10 cores: unit limits 5850ms per test, 11700ms per hook (x1.17)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 18749ms
   ✓ best effort comment friction (4)
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 1100ms
   ✓ bounded nonfatal publication (10)
     ✓ reserves new comment opportunity within total delivery budget 502ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 513ms
     ✓ seals unavailable or unstable representation evidence 402ms
     ✓ uses accepted final preflight eligibility without provider atomicity 432ms
     ✓ preserves generated first line and extracts versioned h6 section markers 335ms
     ✓ returns owned comment identity and stable representation evidence 326ms
     ✓ selects newest created comment across complete pages 347ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 311ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 832ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 471ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 360ms
     ✓ fetches the issue and its comments as GitHub returns them 366ms
     ✓ github fetch marks a closed issue terminal and an open one not 469ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 453ms
     ✓ reuses matching invocation state without adopting foreign ownership 329ms
     ✓ invalidates missing corrupt and unsupported progress cache 718ms
     ✓ uses legacy receipts and contains receipt failures 317ms
     ✓ records an engine-action row and skips the same key + body on a re-run 368ms
     ✓ a recent identical comment counts as done (the final close comment) 322ms
     ✓ a failed post reports done false with the reason and never leaks a token 363ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 401ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 365ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ a different marker hash posts 332ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 20751ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 893ms
     ✓ names each net-new and worsened finding in the log and the JSON 530ms
     ✓ fails on a net score rise with no net count change 380ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 553ms
     ✓ treats a net score at or below 0.001 as float noise 643ms
     ✓ passes when the change only resolves findings 385ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 429ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 501ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 327ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 480ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 567ms
     ✓ exits 4 on a dropped net field instead of silently passing 458ms
     ✓ exits 4 on no summary instead of silently passing 389ms
     ✓ exits 4 on output that is not JSON instead of silently passing 373ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1028ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 555ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 565ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 550ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 620ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1122ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 576ms
     ✓ explicit globs can select ignored prose and nested checkout files 351ms
     ✓ fails (exit 1) when vale reports alerts 361ms
     ✓ exits 6 on a vale runtime error 357ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ falls back to vale sync when the main worktree has none 362ms
     ✓ fails when vale sync cannot restore the required styles 352ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 487ms
   ✓ bkit ci min-push (9)
     ✓ checks every --ref: one code ref among min-push refs fails the push 498ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 309ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 500ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (114 tests) 22396ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 473ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 885ms
     ✓ writes the linear marker shape, taking the tracker from package.json 527ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 433ms
     ✓ retries a failed create once, and exits 5 when it fails twice 383ms
     ✓ prs open still opens against any other base 366ms
     ✓ exits 6 when the created PR's base is not --base 342ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 1114ms
     ✓ refuses merged entry when current feature evidence cannot be read 496ms
     ✓ qualifies MCP merged PR facts against newer feature work without gh 385ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 754ms
     ✓ exits 1 with found=false when there is none 451ms
     ✓ --number reads one PR, mergeable included 317ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 408ms
     ✓ exits 4 when gh errors and 80 when it needs auth 371ms
   ✓ bkit prs merge ship retry (4)
     ✓ returns an explicit terminal reason for other merge refusals 393ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 397ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 462ms
     ✓ takes an explicit --subject 352ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 464ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 380ms
     ✓ prs merge refuses when the PR base is unknown 343ms
   ✓ bkit prs checks (6)
     ✓ counts an unfinished check run and a PENDING commit status as pending 470ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 315ms
   ✓ bkit prs verbose-ci (4)
     ✓ is a no-op when the title already says so 499ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 512ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 22616ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 568ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 624ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 512ms
     ✓ a new run of the same FID rewrites startSha 879ms
     ✓ a resume of the same FID reuses the record 769ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 507ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 527ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 632ms
     ✓ a stale record without a lock is replaced 624ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 517ms
     ✓ refuses inherited unpublished dev commits in every ship mode 2024ms
     ✓ names inherited commits and ship recovery in the refusal 486ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 648ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 581ms
   ✓ bkit worktrees remove (18)
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 610ms
       ✓ preserves staged-only mode during landed cleanup 618ms
       ✓ preserves staged-only type during landed cleanup 652ms
       ✓ preserves staged-only deletion during landed cleanup 669ms
       ✓ removes landed staged content when both index and working contents are on dev 754ms
       ✓ deletes the proved local and remote branch at their landed tips 781ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1166ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 336ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 463ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 31540ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 780ms
     ✓ runs code.ts through its declared gate in the built checkout 899ms
     ✓ runs code.ts through its declared gate in the built checkout 880ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 774ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 856ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 887ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 474ms
     ✓ runs the full gate for replayed debug code 773ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1024ms
     ✓ installs local dependencies against the built target tree 1010ms
     ✓ runs the configured frozen install even without root dependencies 937ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 945ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1074ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1035ms
     ✓ never pushes local dev commits missing from origin/dev 1030ms
     ✓ dev moved: rebuilds on the new dev and pushes again 1850ms
     ✓ dev moved before every push: exhausted, nothing landed 2933ms
     ✓ any other refusal is returned, not retried 1434ms
     ✓ pushToDev replays a commit range onto origin/dev 1189ms
     ✓ a replay retries on the new dev when dev moved 1935ms
     ✓ pushToDev log line names what it lands 896ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1002ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1095ms
     ✓ a push that fails without a server answer is returned once, never retried 973ms
     ✓ a failed fetch is returned before anything is built 316ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1546ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1245ms
     ✓ lands from a clone whose fetch refspec omits dev 1287ms
     ✓ build throwing stops the landing and removes the throwaway checkout 448ms
[feat/test febc4ef] gate
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (107 tests) 18190ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 618ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 341ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 386ms
     ✓ --path records its commit on the run's record, like every other commit mode 426ms
     ✓ a recorded ledger commits only the rows the run appended 597ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 696ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 526ms
     ✓ commitBookkeeping refuses when a recorded path changed 346ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 425ms
     ✓ under --mode=commit counts the squashed paths as something to commit 459ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 332ms
   ✓ bkit ledgers append --invocation (5)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 472ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 321ms
   ✓ bkit ledgers append --operation (3)
     ✓ keeps ledger operation intents and receipts out of committed book paths 312ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 14870ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 1457ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 1504ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 1652ms
     ✓ does not fall back through a malformed later success receipt 939ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 577ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 565ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1058ms
     ✓ requires proof even when the pushed increment changes no files 608ms
     ✓ ignores malformed receipts 646ms
     ✓ does not record a untracked tree 315ms
     ✓ does not record a mutated tree 348ms
     ✓ does not record a committed tree 437ms
     ✓ records no proof for a failed gate or lighter gate 638ms
     ✓ requires integration proof when integration is declared 785ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 1260ms
     ✓ invalidates proof when the gate definition changes 597ms
     ✓ keeps whole-branch docs-only classification and rejects mixed argument modes 326ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (103 tests) 39764ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 16280ms
     ✓ every prompt, workflow and utility agent has the three header blocks 333ms
     ✓ sync has nothing left to rewrite 10291ms
     ✓ every clause reaches the cut-off of one surface it applies to 1253ms
   ✓ the recovery precedence contract (1)
     ✓ renders one recovery precedence contract for all hosts and tracker adapters 11290ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (154 tests) 24549ms
   ✓ CI evidence test rounds (4)
     ✓ runs local gates only after current-generation remediation or soak 548ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 524ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 431ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 765ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 320ms
     ✓ a log under the outbox is named main-checkout relative in the record 364ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 350ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 387ms
     ✓ numbers runs within the workflow's active run and per step 381ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 393ms
     ✓ a planned test that passes is a vacuous gap, exit 1 305ms
     ✓ a planned test absent from a loaded report is a missing gap 571ms
     ✓ a file that fails to load is a red of kind red-not-loaded 401ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 406ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 543ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 304ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 313ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 628ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 443ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 585ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 470ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 739ms
     ✓ green: a passed-accepted test is already landed, not a gap 366ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 487ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 381ms
     ✓ green: --group audits only that group's tasks 358ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 459ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 547ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 487ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 734ms
     ✓ green: lists each gap kind, with the runner output 571ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1060ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 412ms
       ✓ green clears an exception-only task from a human commit 441ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 14675ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 9439ms
     ✓ every fence parses under zsh -n 5173ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (129 tests) 25319ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 311ms
   ✓ bkit steps done (24)
     ✓ --attempt=next advances with each row, so the next parentSha differs 345ms
     ✓ reports a failed commit with exit 8 without writing the row 361ms
     ✓ a failed commit leaves no row staged in the index 390ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 538ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 385ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 372ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 335ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 426ms
   ✓ bkit steps finish (16)
     ✓ --commit=auto never stages a copied-in worktree.copy file 319ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 441ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 316ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 385ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 601ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 381ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 317ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 500ms
     ✓ writeStepRow refuses when a recorded path changed 689ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 308ms
     ✓ writeStepRow appends its commit sha to the record 567ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 809ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 395ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 364ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 644ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 416ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 338ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 758ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ does not count an artifact the run found committed when it started 304ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 534ms
(node:14287) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:14287) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:14287) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:14287) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:14287) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:14287) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:14287) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (24 tests) 11452ms
   ✓ shipped copy-and-own test files (6)
     ✓ ci/bkit-test-awake.test.mjs passes when run on its own 4684ms
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 5829ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 13239ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 654ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (202 tests) 51516ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1467ms
   ✓ preserves the requested event for selected-workflow verification 683ms
   ✓ requires selected other-workflow success at the exact pushed head 1187ms
   ✓ bkit runs locate (15)
     ✓ locates CI evidence using prompt saved issue and local precedence 1048ms
     ✓ saves the failed job count without the capstone job 432ms
     ✓ counts the capstone job when it is the only failed job 580ms
     ✓ saves no failed job count when no job failed 444ms
     ✓ filters branch and PR discovery by configured workflow and exact head 630ms
     ✓ freezes explicit workflow run attempt and all failed job pages 355ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 953ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1499ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 891ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1153ms
     ✓ checks the named repository base and fails closed on missing evidence 605ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 499ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 593ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 336ms
       ✓ a source change past the validated head refuses (17) and names the path 334ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 348ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 775ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 323ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 629ms
     ✓ a failed re-trigger push names the cause in the log 575ms
     ✓ a failed re-trigger push leaves no orphan commit behind 779ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1178ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 586ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 314ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 574ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 534ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 656ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 609ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 1647ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1558ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 442ms
     ✓ re-trigger on dev only uses the record of its own FID 550ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 488ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 1264ms
   ✓ bkit runs context (12)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 322ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 341ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 398ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 461ms
     ✓ --file and --step go together 333ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 384ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 406ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees not allowed (cloud) -> adopts the repo root 423ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 394ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 400ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 373ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 396ms
     ✓ --file into a missing directory is refused, not created 831ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 711ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 546ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 953ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ from a worktree, still names the main checkout and its outbox 842ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 454ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 396ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 428ms
     ✓ an unpinned repo reports nulls and asks no registry 382ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 326ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 388ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 860ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 401ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 432ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1148ms
     ✓ a refused dev push is logged, never fails the close 1685ms
     ✓ an unreachable remote is logged, never fails the close 472ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 5770ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 665ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 386ms
     ✓ follows summary cursors even when the first page is shorter than the limit 454ms
     ✓ reports excluded intervals as unread even when pagination finishes 331ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 432ms
     ✓ reports an unread remainder at the page cap 393ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 316ms
     ✓ rejects missing summaries instead of treating them as empty results 455ms
     ✓ reports a failed first page as unavailable 399ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 358ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 458ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 714ms
     ✓ follows summary cursors even when the first page is shorter than the limit 609ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 587ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 655ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 644ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (73 tests) 3426ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1313ms
     ✓ runGit names ENOBUFS when output passes the limit 570ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 550ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 759ms
     ✓ counts files committed since --base 747ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 404ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 548ms
     ✓ runs the --fallback gate even when no file changed, as it did before 465ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 426ms
     ✓ exits 6 when the PUT fails 644ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 735ms
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 845 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 132 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 149ms
 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 212ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 233ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 214ms
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

 ✓ .bkit/core/engine/install/project-docs.test.ts (14 tests) 133ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 137ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 123ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 135ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 131ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 87ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-PGH8jr/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

(node:56382) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:56382) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 89ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 107ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 124ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 126ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 110ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 131ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-tipJ40/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 109ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 95ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 102ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 47ms
(node:57366) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:57366) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:57366) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:57366) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 62ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 105ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 92ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 65ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (52 tests) 48ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 55ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 62ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (61 tests) 54ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 65ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 55ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 57ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 44ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 74ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 47ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 37ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 59ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 56ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 48ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 50ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 52ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 78ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 53ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 49ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 55ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 40ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 32ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 31ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 26ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 30ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 25ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 33ms
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

 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 21ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 27ms
 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 36ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 21ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > writes the file when absent and records the write
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > is idempotent — a second run changes nothing
[test] core: .bkit/allowlist.json

 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 25ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > dry-run writes nothing but records the same write set (the `bkit check` drift signal)
[test] [dry-run] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > regenerates a hand-edited file whole
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > picks up consumer allowed-domains from .agents/context.md
[test] core: .bkit/allowlist.json

 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 21ms
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

 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 20ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 22ms
 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 24ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 20ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 20ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794524855593.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794524855595.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794524855596.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794524855601.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (34 tests) 20ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 18ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 30ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 33ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 17ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 19ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 17ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 21ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 18ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 16ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 15ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (16 tests) 21ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 23ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 9ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 8ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 10ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 8ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 6ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (6 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 8ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 7ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 5ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 4ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 5ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 4ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (161 tests) 84344ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 664ms
   ✓ bkit workflows fail (19)
     ✓ aborts a rebase only when one is in progress 358ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 327ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 359ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 449ms
       ✓ counts subagents of an earlier chat the run's session rows name 423ms
       ✓ records no context block, and still closes, outside a Claude Code session 420ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 461ms
     ✓ records ending held and publish false on the workflow-done row 482ms
     ✓ defaults the close row to ending done 465ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 470ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 473ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 425ms
     ✓ always writes the telemetry, whatever the runtime 439ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 362ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 411ms
     ✓ an unwritable stats path is logged and never fails the close 387ms
     ✓ appends the completeness row before the workflow-done row 476ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 448ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 465ms
     ✓ writes one completeness row per close 764ms
     ✓ leaves out the previous run's rows that share a second with this run's start 455ms
     ✓ still closes when the completeness check throws 491ms
     ✓ still closes when the completeness row write throws 512ms
     ✓ ship: run.pr, size of the squash commit, and coverage 589ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 716ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 491ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 433ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 612ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 571ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 598ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 519ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 497ms
     ✓ --record-step writes the close step's row before workflow-done 386ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 443ms
     ✓ --number without --outbox is a usage error 387ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 564ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 591ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 623ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 600ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 436ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1503ms
     ✓ --flush with nothing to record commits and pushes nothing 785ms
     ✓ --flush carries the named worktree's logs into the dev commit 1352ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 1776ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1528ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1802ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1479ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1749ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1530ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1458ms
     ✓ --push on dev never carries a row whose references name another feature 1407ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1662ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 2535ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1756ms
     ✓ --push commits in the named worktree, not the checkout it runs from 752ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 1727ms
     ✓ preserves unlanded file deletions and ledger additions on close 3286ms
     ✓ preserves dirty work and uncertain branch evidence during close 3250ms
     ✓ preserves a local feature ref changed after its cleanup proof 3516ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2398ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1726ms
     ✓ a close that landed releases the lock 2452ms
     ✓ removes the worktree before it releases the lock 2846ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2915ms
       ✓ closePr refuses when the PR base is unknown 1391ms
     ✓ leaves a worktree no workflow created, and its branch, in place 754ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 300ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 513ms
     ✓ record is present after workflows close and before the push 465ms
     ✓ failed handover from dev removes the record and keeps recorded paths 891ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 348ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 142711ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 301ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 412ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 500ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 329ms
     ✓ a refused --continue carries git's own reason 408ms
     ✓ refuses a code conflict and aborts the rebase on the spot 339ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 739ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 333ms
     ✓ produces byte-identical output to merge=union 831ms
     ✓ restores a trailing newline so the next append starts on its own line 481ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 412ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 625ms
     ✓ refuses a union that leaves a line which is not JSON 357ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 534ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1059ms
     ✓ refuses a lockfile whose regenerate command fails 685ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 688ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 662ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 674ms
     ✓ refuses and aborts when both sides changed the hand-written region 450ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 445ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 564ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 687ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 447ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 507ms
     ✓ refuses and aborts when a side deleted the install record 392ms
     ✓ refuses a conflicted doc the repo's script does not list 371ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 339ms
     ✓ removes a stale sentinel when the rebase succeeds 473ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 648ms
     ✓ resolves a conflict in each of two replayed commits across rounds 560ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 321ms
       ✓ skips (12) with no anchor 302ms
       ✓ skips (12) when the base is unreachable in this clone 408ms
       ✓ skips (12) when nothing landed since the base 352ms
       ✓ runs (0) with the landed path count once dev moved 603ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 357ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 706ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 394ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 549ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 950ms
     ✓ runs exactly one git push 1035ms
     ✓ --set-upstream records the upstream 487ms
     ✓ refuses with no branch checked out 359ms
     ✓ --mode=dev refuses a feature checkout 332ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 928ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1429ms
     ✓ --require-ci pushes as-is when dev has not moved 554ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1070ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1549ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 429ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 714ms
     ✓ --mode=abort pushes when the branch has no open PR 623ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 512ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 383ms
     ✓ --open-pr carries the MCP answer and skips gh 465ms
     ✓ --mode=abort on dev pushes plainly without probing 533ms
     ✓ rejects an unknown mode 347ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1516ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 813ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 954ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2046ms
     ✓ skip-ci HEAD on the replay is refused 648ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1549ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 1999ms
     ✓ a level local dev is a plain push, recording nothing extra 698ms
     ✓ a record with no commits pushes nothing 585ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 455ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1390ms
     ✓ a rewritten branch is refused, never forced 511ms
     ✓ refuses dev and main with exit 21 and pushes nothing 337ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 865ms
     ✓ refuses a detached HEAD (exit 5) 426ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 866ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 799ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 731ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 932ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 393ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 925ms
     ✓ an up-to-date branch is a no-op 599ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 922ms
     ✓ a fetch that fails exits 10 371ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 425ms
     ✓ scan-diff still reports a new skip when its test … 331ms
     ✓ scan-diff reports a skip moved onto a different t… 433ms
     ✓ scan-diff does not cancel a skip moved between am… 548ms
     ✓ scan-diff does not spend an unchanged duplicate t… 471ms
     ✓ scan-diff recognizes a renamed test file 501ms
     ✓ scan-diff recognizes a suite moved into a differe… 407ms
     ✓ scan-diff does not let unrelated additions hide a… 432ms
     ✓ scan-diff attributes deletion to its old test ins… 381ms
     ✓ scan-diff consumes each moved assertion once and … 469ms
     ✓ scan-diff does not match identical assertions fro… 471ms
     ✓ scan-diff does not match the same leaf test name … 490ms
     ✓ scan-diff does not match a same-named test with d… 464ms
     ✓ scan-diff does not match a same-named test with c… 473ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 548ms
     ✓ --paths with no match exits 1 545ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 465ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 833ms
     ✓ --marker reads a diff over 1 MiB 671ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 746ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 657ms
     ✓ scan-diff finds an added skip 655ms
     ✓ scan-diff ignores a skip predating the base 585ms
     ✓ scan-diff reports a disabled test with its line 635ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 653ms
     ✓ scan-diff ignores a removed comment in a test file 668ms
     ✓ scan-diff ignores an assertion moved within the file 757ms
     ✓ scan-diff still reports a removed assertion 759ms
     ✓ scan-diff reports an assertion re-added only outside the test file 705ms
     ✓ scan-diff finds an added pytest mark skip 768ms
     ✓ scan-diff finds an added unittest skip 703ms
     ✓ scan-diff finds an added bare skip call 680ms
     ✓ scan-diff ignores a quoted skip in a documentation file 528ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 847ms
     ✓ a title that already carries the marker is left alone 583ms
     ✓ with no open PR: pushes the marker commit and edits no title 462ms
     ✓ a re-run is deduped: no second marker commit 581ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 656ms
     ✓ --title-set skips gh entirely 388ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 715ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 1310ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 766ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 1561ms
     ✓ continues only the explicitly recorded target through the public merge command 1017ms
     ✓ fetches the unseen feature head before classifying the base 609ms
     ✓ fast forwards the feature before either base path is chosen 1289ms
     ✓ merges divergent feature tips without rebasing either side 766ms
     ✓ continues the feature merge before starting a dev merge 1214ms
     ✓ publishes local code with a CI running head before bookkeeping 1382ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 1859ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1184ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 854ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 345ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 351ms
     ✓ --merge-docs merges dev when docs/ is behind 428ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 416ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 582ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 580ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 491ms
     ✓ --merge-docs skips an empty bkit:generate script 445ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 395ms
     ✓ --merge-docs never merges on dev itself 340ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 477ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 511ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 458ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 475ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 672ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 667ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 739ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 633ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 599ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 765ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 579ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 852ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 517ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 346ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 436ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 598ms
     ✓ a failed install stops ship (16) 517ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 405ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 388ms
   ✓ branches land (28)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1033ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 991ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1024ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 996ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2056ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2388ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 362ms
     ✓ local: names unpushed dev as the cause when the branch carries it 419ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 441ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1116ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1144ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 894ms
     ✓ uses tree entry equivalence for design and plan land cleanup 4073ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 876ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1102ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 935ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 665ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1265ms
     ✓ land removes the worktree when only the copied .env is untracked 1049ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 875ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 959ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1661ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 969ms
     ✓ landPr refuses a main-based PR without retrying 533ms
     ✓ landPr refuses when the PR base is unknown 513ms
     ✓ PR not open (closed): stops (17) at once, no retry 626ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 374ms
     ✓ --attempt names the merge round in a fix commit 348ms
     ✓ commits a rewritten and a deleted tracked file 364ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 306ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 322ms

 Test Files  176 passed (176)
      Tests  7615 passed | 2 skipped (7617)
   Start at  09:06:22
   Duration  143.37s (tests 97%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/912-debug-loop-question/build-group-gate-2-3.log.reports/vitest-19839.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |    88.5 |    82.28 |   94.39 |   89.94 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   91.03 |    86.68 |   95.57 |   94.48 |                   
  auth.ts          |   98.09 |    93.93 |     100 |   98.85 | 71                
  ci-yml.ts        |   90.74 |    82.83 |     100 |   93.01 | ...09,422-424,435 
  github.ts        |   95.48 |    92.36 |     100 |   97.03 | 264-265,276-277   
  index.ts         |   85.58 |    71.42 |     100 |    97.2 | ...01,321,418-419 
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
 engine/commands   |    88.6 |     83.2 |   93.29 |    90.1 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...82,195,197,204 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |    90.7 |    86.06 |   96.42 |   94.53 | ...18-821,868-883 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   80.95 |    68.75 |   71.42 |      80 | ...18-231,257-258 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   95.78 |    86.92 |   90.41 |   97.88 |                   
  ci.ts            |   97.38 |    88.56 |   95.34 |    98.8 | 271,719,798,973   
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
  push-gate.ts     |   93.22 |    81.74 |     100 |   99.03 | 210               
 ...mmands/install |    47.2 |    44.69 |   57.14 |   47.59 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |   18.35 |    22.15 |      50 |   16.48 | ...30-134,205-616 
  uninstall.ts     |    67.6 |    64.34 |   67.56 |   68.58 | ...1081,1104-1271 
  upgrade.ts       |   32.02 |    30.65 |   33.33 |   33.21 | 355-383,565-1078  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   90.09 |    82.91 |   95.18 |   91.58 |                   
  branches.ts      |    89.6 |     83.5 |   98.82 |   91.24 | ...3265,3290,3433 
  challenge.ts     |   96.28 |    85.36 |     100 |   97.43 | ...80,412-414,700 
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.47 |    95.98 |     100 |   99.11 | 314,735           
  decisions.ts     |   94.38 |    83.15 |      98 |   97.21 | ...63,368,445,633 
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   94.11 |    86.99 |   97.43 |   95.62 | ...1300,1320-1330 
  junit.ts         |   93.75 |    73.84 |     100 |   93.33 | 35-36,39          
  ledgers.ts       |   88.42 |    79.07 |   95.26 |   91.36 | ...2357-2358,2386 
  locks.ts         |   94.01 |    88.59 |   96.15 |    95.1 | ...91-292,461-462 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   91.01 |    88.42 |     100 |   93.01 | ...1444,1460-1461 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 494-495           
  runs.ts          |      82 |    74.49 |   92.64 |   83.42 | ...3088,3120-3124 
  runtime.ts       |   97.84 |    86.66 |   94.44 |     100 | ...55,301,321-326 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   94.73 |    92.96 |     100 |   95.61 | ...87,703,720,861 
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 263,374           
  steps.ts         |   88.97 |    81.89 |    92.3 |   90.78 | ...2359,2361,2405 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   96.03 |    90.27 |    94.2 |   96.33 | ...32-638,661,684 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-base.ts    |   24.39 |    26.61 |   22.22 |    21.8 | 121-130,157-319   
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.82 |    89.93 |   96.53 |    98.2 | ...2240,2336-2338 
  tracker.ts       |   89.49 |    81.22 |   96.77 |   91.56 | ...2159,2185-2190 
  workflows.ts     |   93.49 |    82.65 |    97.4 |    95.1 | ...1773,1947,2679 
  worktrees.ts     |   67.22 |    65.59 |   74.28 |   68.69 | ...1388,1391-1392 
 engine/install    |    91.8 |    83.22 |   93.29 |   94.81 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |    97.4 |    90.14 |     100 |     100 | ...19,324,330-331 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |   58.53 |    38.46 |      40 |   65.62 | ...18-134,147-164 
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,294            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   95.44 |    91.86 |   98.29 |   96.89 |                   
  status.ts        |   94.08 |    92.71 |    97.7 |   97.92 | 855,881-887,921   
  telemetry.ts     |   96.09 |    91.45 |   98.64 |   96.42 | ...1858,2016,2377 
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
  instructions.ts  |   90.65 |    85.99 |   95.62 |   91.41 | ...1717-1799,1804 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 88.5% ( 20658/23341 )
Branches     : 82.28% ( 16056/19513 )
Functions    : 94.39% ( 3284/3479 )
Lines        : 89.94% ( 18132/20159 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 462 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 208 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 201 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 199 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 200 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 192 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 70 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 233 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 191 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 199 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 200 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 201 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 201 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 214 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 792 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 503 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 15 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 17 ms
ok 19 stub: the response selector is cleared before running its body # in 15 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 18 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 21 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 16 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 15 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 19 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 13 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 31 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 47 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 636 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 343 ms
ok 30 refresh drops a file deleted in the index from the build # in 320 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 466 ms
ok 32 a key removed from the env file is unset on the next run # in 170 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 147 ms
ok 34 non-BKIT_ keys are skipped # in 141 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 151 ms
ok 36 a failed unsetenv is retried on the next run # in 166 ms
ok 37 logs key names only, never values # in 140 ms
ok 38 missing env file exits 0 without calling launchctl # in 24 ms
ok 39 the sweep prints the summary line the lane greps for # in 246 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 9 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (108.778458ms)
✔ shell cancellation waits for SIGTERM cleanup (141.168125ms)
✔ direct cancellation waits for SIGINT cleanup (87.739042ms)
✔ shell cancellation waits for SIGINT cleanup (140.184958ms)
✔ direct cancellation waits for SIGHUP cleanup (85.574666ms)
✔ shell cancellation waits for SIGHUP cleanup (153.195458ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (393.131792ms)
✔ shell cancellation follows a worker orphaned by a nested shell (228.097916ms)
✔ direct cancellation preserves a nested machine-lock owner (417.401ms)
✔ shell cancellation preserves a nested machine-lock owner (435.423584ms)
✔ nested shell cancellation preserves a nested machine-lock owner (458.042667ms)
✔ a hard process-group timeout reaches a shell command during cleanup (68.67125ms)
✔ ships a command-scoped sleep prevention wrapper (0.063416ms)
✔ preserves arguments, output and nonzero exit status (42.222542ms)
✔ runs an entire shell chain and retains its failure (26.124375ms)
✔ reports a missing command as 127 (23.868916ms)
✔ requires a command (22.588125ms)
✔ non-macOS platform selection runs commands without sleep prevention (35.650584ms)
✔ hard timeout escalation reaches a command that ignores TERM (143.848042ms)
✔ forwards POSIX cancellation to the command and releases the assertion (48.593667ms)
✔ holds a real macOS assertion only while the command runs (61.713792ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3152.087833
> [bkit] TRUNCATED — kept 1687 of 3010 lines (121 KB of 233 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
