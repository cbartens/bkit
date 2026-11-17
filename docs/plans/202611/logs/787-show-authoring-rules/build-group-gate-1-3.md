
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 787-show-authoring-rules build-group-gate-1 is waiting for tests (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping (pid 47865, since 20:01:04), last run took 7m34s

> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/166 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'

[bkit-ci] .vale/styles/write-good absent (fresh checkout or worktree) - restoring

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

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> bkit ci slop

[bkit-ci] base da97be3876cf42450f57b335b7aac09629f33a59 (da97be3876cf42450f57b335b7aac09629f33a59) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: da97be3876cf42450f57b335b7aac09629f33a59
base: da97be3876cf42450f57b335b7aac09629f33a59
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 11.3 on 10 cores: unit limits 10150ms per test, 20300ms per hook (x2.03)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
      Coverage enabled with v8

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing
[bkit-install] Wrote .bkit/advisories.md (1 item).

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > overwrites an existing artifact on each call
[bkit-install] Wrote .bkit/advisories.md (0 items).

 ✓ .bkit/core/engine/checks/after/index.test.ts (53 tests) 371ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (257 tests) 1858ms
   ✓ issue-less runs (68)
     ✓ build: fids resolve and steps gate carry --issue in every workflow 438ms
     ✓ debug: fids resolve and steps gate carry --issue in every workflow 370ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 41687ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1084ms
     ✓ names each net-new and worsened finding in the log and the JSON 890ms
     ✓ fails on a net score rise with no net count change 1095ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1126ms
     ✓ treats a net score at or below 0.001 as float noise 843ms
     ✓ passes when the change only resolves findings 1147ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1069ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1176ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 523ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 349ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 870ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1333ms
     ✓ exits 4 on a dropped net field instead of silently passing 1026ms
     ✓ exits 4 on no summary instead of silently passing 1216ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1028ms
     ✓ exits 5 when the base worktree cannot be created 343ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1477ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 915ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 968ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1373ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1882ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1632ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 659ms
     ✓ explicit globs can select ignored prose and nested checkout files 701ms
     ✓ fails closed when a selected prose source cannot be read 305ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 805ms
     ✓ fails (exit 1) when vale reports alerts 685ms
     ✓ exits 6 on a vale runtime error 922ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 978ms
     ✓ falls back to vale sync when the main worktree has none 911ms
     ✓ fails when vale sync cannot restore the required styles 845ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 521ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 326ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 396ms
     ✓ exits 1 naming the code file, whatever the commit message says 384ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 432ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 336ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 939ms
     ✓ exits 7 when a commit cannot be read 378ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 438ms
     ✓ exits 1 naming the files outside, whatever the commit message says 372ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 894ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 580ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 541ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 1040ms
     ✓ a top-level glob in the setting does not reach into folders 512ms
     ✓ a push that changes no files is not proven a min push 507ms
     ✓ exits 7 when a commit or its base cannot be read 467ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 43505ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 499ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1096ms
     ✓ always writes the marker, even with no plan 484ms
     ✓ writes the linear marker shape, taking the tracker from package.json 483ms
     ✓ writes the jira marker shape, taking the tracker from package.json 464ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 1129ms
     ✓ refuses a PR from dev, main, or the base itself 554ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 630ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1155ms
     ✓ exits 5 when the open-PR probe errors 1287ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 910ms
     ✓ prs open still opens against any other base 463ms
     ✓ exits 6 when the created PR's base is not --base 1105ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 1068ms
     ✓ exits 1 with found=false when there is none 970ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1097ms
     ✓ --number reads one PR, mergeable included 965ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 865ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1470ms
   ✓ bkit prs scan-body (10)
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 311ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 488ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 807ms
     ✓ drops the force-build marker from the title subject 621ms
     ✓ takes an explicit --subject 435ms
     ✓ runs no merge when the PR is already MERGED 489ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 705ms
     ✓ prs merge refuses a PR whose base is main 417ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 421ms
     ✓ prs merge refuses when the PR base is unknown 394ms
     ✓ prs merge reads the base from the one pr view it already makes 706ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 825ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 538ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 700ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 676ms
     ✓ never reads dev's required checks without --only-if-required 804ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 750ms
     ✓ updates when a dev ruleset requires status checks 880ms
     ✓ updates when dev's branch protection requires status checks 456ms
     ✓ ignores dev rulesets that require no checks 880ms
     ✓ updates when the repo cannot be resolved 396ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 694ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 1096ms
     ✓ is not green when a check failed, naming it (exit 1) 871ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 471ms
     ✓ is not green on an empty rollup (total 0) 521ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 888ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 964ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 393ms
     ✓ is a no-op when the title already says so 479ms
     ✓ strips the marker, with or without its bkit prefix 636ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 826ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 40248ms
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 314ms
     ✓ continues after friction and diagnostic writes fail without recursion 329ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 418ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 3302ms
   ✓ routine publication policy (8)
     ✓ classifies attention and terminal reports from structured purpose 310ms
   ✓ bounded nonfatal publication (10)
     ✓ reserves new comment opportunity within total delivery budget 921ms
     ✓ attempts independent attention after routine uncertainty 325ms
   ✓ trackerTarget (3)
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 388ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 1105ms
     ✓ seals unavailable or unstable representation evidence 1153ms
     ✓ uses accepted final preflight eligibility without provider atomicity 973ms
     ✓ rejects marker preserving external edits 785ms
     ✓ preserves generated first line and extracts versioned h6 section markers 1397ms
     ✓ returns owned comment identity and stable representation evidence 990ms
     ✓ selects newest created comment across complete pages 728ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 431ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 435ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 494ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 453ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 468ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 462ms
     ✓ fetches the issue and its comments as GitHub returns them 515ms
     ✓ github fetch marks a closed issue terminal and an open one not 739ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 770ms
     ✓ caches exact engine source with available progress identity 617ms
     ✓ keeps original body identity separate from time and changed output 539ms
     ✓ reuses matching invocation state without adopting foreign ownership 771ms
     ✓ invalidates missing corrupt and unsupported progress cache 1734ms
     ✓ contains cache read and write failures as standalone degradation 825ms
     ✓ uses legacy receipts and contains receipt failures 785ms
     ✓ records an engine-action row and skips the same key + body on a re-run 616ms
     ✓ a recent identical comment counts as done (the final close comment) 811ms
     ✓ a failed post reports done false with the reason and never leaks a token 656ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1210ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 1031ms
     ✓ a board the token cannot see is scope 416ms
     ✓ an HTTP 403 from gh is scope 897ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 533ms
     ✓ github: no block, no blockers and no further reads 656ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 715ms
     ✓ a different marker hash posts 827ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 667ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (116 tests) 49986ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 776ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 624ms
     ✓ done --group writes group on the row 464ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 740ms
     ✓ carries extra fields, parsed as JSON when they are JSON 449ms
     ✓ reports a failed commit with exit 8 without writing the row 1187ms
     ✓ a failed commit leaves no row staged in the index 1241ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1094ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 840ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1362ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1102ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1031ms
   ✓ bkit steps gate (8)
     ✓ --ref exits 3 when the ref does not carry the status file 388ms
     ✓ fails on a placeholder left in the artifact 311ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 459ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 553ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 777ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 405ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 709ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1008ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 717ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 956ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1411ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 658ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 418ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 889ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 468ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 373ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 952ms
     ✓ writeStepRow refuses when a recorded path changed 1077ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 478ms
     ✓ writeStepRow appends its commit sha to the record 985ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1625ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 410ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 776ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 849ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 534ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1400ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 995ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 800ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 644ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1399ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 537ms
     ✓ does not count an artifact the run found committed when it started 806ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 453ms
     ✓ commits a package.json change outside bkit.workflows 720ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1220ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests) 52798ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 817ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 528ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1084ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 672ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 675ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 672ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 407ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 828ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 874ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1213ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 851ms
     ✓ PASS is 0 failures with or without reports 773ms
     ✓ clears a previous attempt's reports before the gate runs 608ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 893ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1148ms
     ✓ a log under the outbox is named main-checkout relative in the record 1005ms
     ✓ a log small enough is copied whole: not clamped, raw null 969ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1205ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1554ms
     ✓ numbers runs within the workflow's active run and per step 908ms
     ✓ without --file no row is written and the output carries row null 472ms
   ✓ bkit tests plan-check (28)
     ✓ plan-check refuses DEPENDS ON a later group 374ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 863ms
     ✓ a planned test that passes is a vacuous gap, exit 1 1001ms
     ✓ a planned test absent from a loaded report is a missing gap 951ms
     ✓ a file that fails to load is a red of kind red-not-loaded 935ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 789ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 343ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1140ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 773ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1099ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1786ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 780ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1198ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 910ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1386ms
     ✓ green: a passed-accepted test is already landed, not a gap 711ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 750ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 979ms
     ✓ green: --group audits only that group's tasks 786ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 854ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1077ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 803ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 981ms
     ✓ green: lists each gap kind, with the runner output 701ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1390ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 630ms
       ✓ green clears an exception-only task from a human commit 475ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/tools/instructions.test.ts (101 tests) 62134ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 35474ms
     ✓ every prompt, workflow and utility agent has the three header blocks 455ms
     ✓ sync has nothing left to rewrite 23386ms
     ✓ every clause reaches the cut-off of one surface it applies to 1937ms
   ✓ the Template Instructions tables match the prompts (2)
     ✓ every row's bullet is byte-identical across its carriers 421ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (57 tests) 9996ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 770ms
     ✓ patch (v1 driver): checks every Add / Update / Move-to / Delete target 476ms
     ✓ apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target 583ms
     ✓ apply_patch (v1 driver): checks every Add / Update / Move-to / Delete target 539ms
     ✓ deny mode blocks when any patch target is a first touch, and records all of them 454ms
   ✓ gateguard shared advice — general authoring reminder and identity (3)
     ✓ prepares complete advice without acknowledging it 1256ms
     ✓ shares normalized warning identity across edit channels 502ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.
> [bkit] TRUNCATED HERE — 63 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 505ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 460ms
     ✓ staging failure: exit 4 and no commit is created, no false success 426ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 587ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 373ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 362ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 322ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 884ms
> [bkit] TRUNCATED HERE — 51 lines omitted. Dropped content was NOT read.
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 301ms
     ✓ fails with a fetch error when there is no origin to rebase onto 431ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 484ms
> [bkit] TRUNCATED HERE — 49 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 315ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 327ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 305ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 374ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 687ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 723ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 687ms
     ✓ --file into a missing directory is refused, not created 324ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 705ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1571ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 384ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (75 tests) 2384ms
   ✓ debug evidence state (5)
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 1101ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2646ms
     ✓ a refused dev push is logged, never fails the close 2842ms
     ✓ an unreachable remote is logged, never fails the close 973ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 28ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 294ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ locates CI evidence using prompt saved issue and local precedence 2794ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1350ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1082ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1906ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2828ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs gate (68)
     ✓ --fetch refreshes origin/<branch> before gating 998ms
     ✓ tells an API error (20) from no run (10) 331ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 388ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 665ms
       ✓ a source change past the validated head refuses (17) and names the path 560ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 514ms
       ✓ --validated without --month / --fid is a usage error (2) 455ms
       ✓ a validated sha that is not an ancestor refuses (17) 475ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 558ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1050ms
     ✓ a failed re-trigger push names the cause in the log 1341ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1500ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2122ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1109ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 670ms
     ✓ gh-error: every poll errored 733ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1039ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 899ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1082ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1133ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 3700ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3363ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 875ms
     ✓ re-trigger on dev only uses the record of its own FID 1178ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 927ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 511ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 630ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 477ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 304ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 848ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1070ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 825ms
     ✓ --file and --step go together 890ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 125ms
> [bkit] TRUNCATED HERE — 796 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 447 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1037ms
     ✓ counts files committed since --base 1357ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 950ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 692ms
     ✓ runs the --fallback gate even when no file changed, as it did before 677ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 748ms
     ✓ passes every rule on a clean head 307ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 384ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 332ms
 ✓ .bkit/core/engine/commands/lib.test.ts (70 tests) 7097ms
   ✓ repo facts on a real repository (4)
     ✓ repoRoot resolves the main checkout from inside a linked worktree 340ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1379ms
     ✓ runGit names ENOBUFS when output passes the limit 2254ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1819ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/ledgers/journal.test.ts (18 tests) 710ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 151ms
 ❯ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests | 1 failed) 205ms
   ✓ rules and Project Rules (10)
     ✓ ruleBullets reads the bkit block and the Project Rules section, in file order 3ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ rule entries match rules.md bullets one to one 1ms
     ✓ a rule inserted mid-list needs no edit to any other entry 0ms
     ✓ two rules with one name fail, since names are rule IDs 1ms
     ✓ a reworded rules.md bullet fails until sync retires the old text 2ms
     ✓ a refs section that does not exist fails 3ms
     ✓ refExists finds files, globs and headings in the repo 7ms
     ✓ the repo store matches rules.md 16ms
   ❯ Hook Text (4)
     ✓ hookMessages joins concatenated literals and keeps ${…} holes 1ms
     ✓ the fixture passes 1ms
     ✓ a message without an entry and an entry no longer emitted both fail 0ms
     × every hook message has an entry and every entry is still emitted 139ms
   ✓ Permissions (4)
     ✓ the fixture passes 2ms
     ✓ a pattern missing, extra, doubled or miscounted fails 1ms
     ✓ an opencode permission block that differs fails 0ms
     ✓ shipped permission patterns and store groups match exactly 2ms
   ✓ Special Behaviors and Authoring Rules (5)
     ✓ catalogSection runs to the next heading of the same or a higher level, fences skipped 1ms
     ✓ the fixture passes 1ms
     ✓ an edited row or section fails until sync copies it 1ms
     ✓ a row with no entry fails 0ms
     ✓ each Special Behaviors row and authoring section has one equal entry 13ms
 ✓ .bkit/core/engine/checks/tips/index.test.ts (28 tests) 1451ms
> [bkit] TRUNCATED HERE — 53 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 835ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 472ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1578ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 559ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 814ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 983ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 732ms
     ✓ an unpinned repo reports nulls and asks no registry 681ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 1596ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 953ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 776ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1393ms
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
No outcome row records a duration.

### Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
No outcome row records a duration.

### Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 485ms
     ✓ resolves config from the repo root when run from a subdirectory 436ms
     ✓ exits 6 when the PUT fails 960ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 701ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 1246ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 1606ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 1608ms
     ✓ exits 6 when the api answer is not JSON 2281ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 42ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/repo/vitest-repo-config-guard.test.ts (12 tests) 2180ms
   ✓ repoConfigFile (3)
     ✓ answers for the cwd, not an inherited GIT_DIR 367ms
   ✓ guardRepoConfig (6)
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 301ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 423ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 338ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 25ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 1240ms
   ✓ shipped hook templates (5)
     ✓ every generated hook parses: node --check for JS, bash -n for shell 1200ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 69ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 31ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 7ms
(node:30041) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:30041) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:30041) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:30041) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 84ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 57ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > writes plugin prompts + workflow skills, and stamps the managed version
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
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

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > never writes Codex's `.agents/skills/`
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
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

(node:83640) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:83640) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:83640) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:83640) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:83640) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:83640) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:83640) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (24 tests) 26246ms
   ✓ shipped copy-and-own test files (6)
     ✓ ci/bkit-check-capstone.test.mjs passes when run on its own 475ms
     ✓ ci/bkit-test-awake.test.mjs passes when run on its own 8007ms
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 16333ms
   ✓ bkit-check-capstone (10)
     ✓ passes its own copy-and-own test file (bkit's own copy) 447ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > is idempotent — a second render writes nothing
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
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

 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 174ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > writes plugin.json, hooks.json, both hook scripts, and emits the setup advisory
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
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

 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 30ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > warns when Codex is also installed (skill-overlap advisory)
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 95ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > stays silent about the overlap when Codex is absent
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
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

 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 3547ms
   ✓ renderAntigravityAgentsSkills (3)
     ✓ writes plugin prompts + workflow skills, and stamps the managed version 383ms
     ✓ is idempotent — a second render writes nothing 992ms
   ✓ runAntigravityModule (3)
     ✓ writes plugin.json, hooks.json, both hook scripts, and emits the setup advisory 742ms
     ✓ warns when Codex is also installed (skill-overlap advisory) 508ms
     ✓ stays silent about the overlap when Codex is absent 646ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 14ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 12ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 81ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 13ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 29993ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 3663ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 3188ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 381ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 411ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 430ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 437ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 3482ms
     ✓ does not fall back through a malformed later success receipt 1773ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1165ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1075ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1998ms
     ✓ requires proof even when the pushed increment changes no files 1009ms
     ✓ ignores malformed receipts 953ms
     ✓ does not record a tracked tree 475ms
     ✓ does not record a untracked tree 476ms
     ✓ does not record a mutated tree 569ms
     ✓ does not record a committed tree 700ms
     ✓ records no proof for a failed gate or lighter gate 1260ms
     ✓ requires integration proof when integration is declared 1789ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2737ms
     ✓ invalidates proof when the gate definition changes 1363ms
     ✓ keeps whole-branch docs-only classification and rejects mixed argument modes 657ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 23ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 260ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 30ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 73ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 33ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 25ms
 ✓ .bkit/core/engine/audits/templates/context-vercel-block.test.ts (22 tests) 19426ms
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 1731ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 1575ms
     ✓ follows summary cursors even when the first page is shorter than the limit 2405ms
     ✓ reports excluded intervals as unread even when pagination finishes 1175ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 1597ms
     ✓ reports an unread remainder at the page cap 1571ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 921ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 1198ms
     ✓ rejects missing summaries instead of treating them as empty results 576ms
     ✓ reports a failed first page as unavailable 638ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 391ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 842ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 532ms
     ✓ follows summary cursors even when the first page is shorter than the limit 590ms
     ✓ reports excluded intervals as unread even when pagination finishes 524ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 564ms
     ✓ reports an unread remainder at the page cap 473ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 462ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 382ms
     ✓ rejects missing summaries instead of treating them as empty results 460ms
     ✓ reports a failed first page as unavailable 412ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 403ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 40ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 12ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 68ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 45ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 15ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/ledger-read-idiom.test.ts (11 tests) 1349ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 47ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 32ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 205ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 26ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 18ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 139ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (6 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 16ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 36ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 39ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 22ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 16ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 12ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 11ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 12ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 23ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 12569ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 12558ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 24805ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 16953ms
     ✓ every fence parses under zsh -n 7720ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (154 tests) 148903ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 545ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 2123ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 444ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 350ms
     ✓ writes no limits for a workflow with no ask point 353ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 375ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 431ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 624ms
       ✓ a new run in the same chat gets its own session row 633ms
       ✓ writes none outside Claude Code 564ms
     ✓ opens the next run after a finished one, and after another workflow's run 627ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 515ms
     ✓ design / plan / build / debug book in the current worktree 476ms
     ✓ --lock-held checks the lock is ours 363ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 472ms
   ✓ bkit workflows start — resume facts (5)
     ✓ an OPEN decision of an earlier run never resurfaces 315ms
     ✓ an OPEN decision mid-build prints its header fields 320ms
     ✓ reads Test attempt from a tests pause 317ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 527ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 343ms
     ✓ aborts a rebase only when one is in progress 744ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 520ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 513ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 341ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 304ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 340ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 343ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 513ms
       ✓ counts subagents of an earlier chat the run's session rows name 534ms
       ✓ records no context block, and still closes, outside a Claude Code session 643ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 725ms
     ✓ records ending held and publish false on the workflow-done row 796ms
     ✓ defaults the close row to ending done 1062ms
     ✓ refuses an unknown ending 484ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1296ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1083ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1051ms
     ✓ always writes the telemetry, whatever the runtime 885ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 931ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1092ms
     ✓ an unwritable stats path is logged and never fails the close 762ms
     ✓ appends the completeness row before the workflow-done row 915ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1155ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 894ms
     ✓ writes one completeness row per close 1123ms
     ✓ leaves out the previous run's rows that share a second with this run's start 656ms
     ✓ still closes when the completeness check throws 724ms
     ✓ still closes when the completeness row write throws 665ms
     ✓ ship: run.pr, size of the squash commit, and coverage 824ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1299ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 744ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 809ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1062ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1158ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1197ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1149ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1244ms
     ✓ --record-step writes the close step's row before workflow-done 759ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1077ms
     ✓ --number without --outbox is a usage error 1010ms
     ✓ --flush is ship only 424ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1210ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1152ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1310ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1254ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 911ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 425ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 370ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2945ms
     ✓ --flush with nothing to record commits and pushes nothing 1535ms
     ✓ --flush carries the named worktree's logs into the dev commit 2954ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3326ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3402ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 3606ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2892ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 4378ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3652ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 3755ms
     ✓ --push on dev never carries a row whose references name another feature 3145ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2801ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 5221ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2934ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1623ms
     ✓ rejects --push with --flush, and --flush outside ship 350ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3497ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2791ms
     ✓ a close that landed releases the lock 3325ms
     ✓ removes the worktree before it releases the lock 3192ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 5978ms
       ✓ closePr refuses when the PR base is unknown 4106ms
     ✓ leaves a worktree no workflow created, and its branch, in place 3244ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 312ms
     ✓ exits 12 when there is no versioned draft 326ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 302ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 366ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 526ms
     ✓ names the branch, not the remote-tracking ref, in each URL 485ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 433ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 416ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1068ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 561ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1363ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 680ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 617ms
     ✓ a second run's record does not let this FID's close commit 686ms
     ✓ record is present after workflows close and before the push 1191ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2400ms
   ✓ bkit workflows input (7)
     ✓ a run with no issue holds the prompt alone 327ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 497ms
     ✓ --plan is appended when the file exists and skipped when it does not 301ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 491ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 893ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 611ms
     ✓ puts each --line after the summary, in flag order 620ms
     ✓ --summary prints the file and keeps a copy in --outbox 646ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 632ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 59777ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 2292ms
     ✓ runs code.ts through its declared gate in the built checkout 1997ms
     ✓ runs code.ts through its declared gate in the built checkout 2007ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1736ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1692ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1816ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 1308ms
     ✓ runs the full gate for replayed debug code 1807ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 2165ms
     ✓ installs local dependencies against the built target tree 2388ms
     ✓ runs the configured frozen install even without root dependencies 2153ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 2090ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 2017ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 2029ms
     ✓ never pushes local dev commits missing from origin/dev 1755ms
     ✓ dev moved: rebuilds on the new dev and pushes again 3550ms
     ✓ dev moved before every push: exhausted, nothing landed 6211ms
     ✓ any other refusal is returned, not retried 2431ms
     ✓ pushToDev replays a commit range onto origin/dev 2382ms
     ✓ a replay retries on the new dev when dev moved 3330ms
     ✓ pushToDev log line names what it lands 1518ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1665ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1805ms
     ✓ a push that fails without a server answer is returned once, never retried 1526ms
     ✓ a failed fetch is returned before anything is built 482ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2119ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1477ms
     ✓ lands from a clone whose fetch refspec omits dev 1485ms
     ✓ build throwing stops the landing and removes the throwaway checkout 415ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (261 tests) 205049ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 877ms
     ✓ rejects missing explicit and ambiguous existing branch selections 775ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1247ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1096ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 772ms
     ✓ a refused --continue carries git's own reason 1000ms
     ✓ --file records nothing for a refused rebase 884ms
     ✓ refuses a code conflict and aborts the rebase on the spot 942ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1342ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 527ms
     ✓ produces byte-identical output to merge=union 1335ms
     ✓ restores a trailing newline so the next append starts on its own line 943ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 800ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1077ms
     ✓ refuses a union that leaves a line which is not JSON 553ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 754ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1314ms
     ✓ refuses a lockfile whose regenerate command fails 1484ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1016ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1242ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1481ms
     ✓ refuses and aborts when both sides changed the hand-written region 977ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1233ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1241ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1726ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 1136ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1048ms
     ✓ refuses and aborts when a side deleted the install record 880ms
     ✓ refuses a conflicted doc the repo's script does not list 748ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 818ms
     ✓ removes a stale sentinel when the rebase succeeds 985ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 975ms
     ✓ resolves a conflict in each of two replayed commits across rounds 985ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 552ms
       ✓ skips (12) with no anchor 513ms
       ✓ skips (12) when the base is unreachable in this clone 796ms
       ✓ skips (12) when nothing landed since the base 600ms
       ✓ runs (0) with the landed path count once dev moved 1133ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 650ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1415ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 879ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1147ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1711ms
     ✓ runs exactly one git push 1480ms
     ✓ --set-upstream records the upstream 1200ms
     ✓ refuses with no branch checked out 852ms
     ✓ --mode=dev refuses a feature checkout 708ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1782ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2896ms
     ✓ --require-ci pushes as-is when dev has not moved 1033ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2175ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 3071ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 893ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1399ms
     ✓ --mode=abort pushes when the branch has no open PR 1329ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 952ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 704ms
     ✓ --open-pr carries the MCP answer and skips gh 1082ms
     ✓ --mode=abort on dev pushes plainly without probing 1035ms
     ✓ rejects an unknown mode 851ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3094ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1746ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1852ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4754ms
     ✓ skip-ci HEAD on the replay is refused 1703ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3639ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 4823ms
     ✓ a level local dev is a plain push, recording nothing extra 1533ms
     ✓ a record with no commits pushes nothing 1202ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 742ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1802ms
     ✓ a rewritten branch is refused, never forced 1169ms
     ✓ refuses dev and main with exit 21 and pushes nothing 664ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1743ms
     ✓ refuses a detached HEAD (exit 5) 680ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1400ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1508ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1619ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1948ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 831ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1609ms
     ✓ an up-to-date branch is a no-op 1234ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1793ms
     ✓ a fetch that fails exits 10 784ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 1002ms
     ✓ scan-diff still reports a new skip when its test … 1106ms
     ✓ scan-diff reports a skip moved onto a different t… 836ms
     ✓ scan-diff does not cancel a skip moved between am… 880ms
     ✓ scan-diff does not spend an unchanged duplicate t… 947ms
     ✓ scan-diff recognizes a renamed test file 948ms
     ✓ scan-diff recognizes a suite moved into a differe… 840ms
     ✓ scan-diff does not let unrelated additions hide a… 812ms
     ✓ scan-diff attributes deletion to its old test ins… 688ms
     ✓ scan-diff consumes each moved assertion once and … 869ms
     ✓ scan-diff does not match identical assertions fro… 809ms
     ✓ scan-diff does not match the same leaf test name … 1017ms
     ✓ scan-diff does not match a same-named test with d… 1088ms
     ✓ scan-diff does not match a same-named test with c… 1049ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 932ms
     ✓ --paths with no match exits 1 808ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 742ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1313ms
     ✓ --marker reads a diff over 1 MiB 1016ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1177ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 988ms
     ✓ scan-diff finds an added skip 1179ms
     ✓ scan-diff ignores a skip predating the base 878ms
     ✓ scan-diff reports a disabled test with its line 974ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 815ms
     ✓ scan-diff ignores a removed comment in a test file 780ms
     ✓ scan-diff ignores an assertion moved within the file 824ms
     ✓ scan-diff still reports a removed assertion 843ms
     ✓ scan-diff reports an assertion re-added only outside the test file 693ms
     ✓ scan-diff finds an added pytest mark skip 860ms
     ✓ scan-diff finds an added unittest skip 786ms
     ✓ scan-diff finds an added bare skip call 775ms
     ✓ scan-diff ignores a quoted skip in a documentation file 767ms
     ✓ scan-diff ignores a marker literal in a non-test source file 912ms
     ✓ scan-diff ignores an assertion whose expectation changed 746ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 760ms
     ✓ scan-diff reports a deleted test file 773ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 503ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1614ms
     ✓ a title that already carries the marker is left alone 1037ms
     ✓ with no open PR: pushes the marker commit and edits no title 1041ms
     ✓ a re-run is deduped: no second marker commit 1037ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 847ms
     ✓ --title-set skips gh entirely 370ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 423ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 460ms
     ✓ --merge-docs merges dev when docs/ is behind 509ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 492ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 666ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 647ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 560ms
     ✓ --merge-docs skips an empty bkit:generate script 704ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 926ms
     ✓ --merge-docs never merges on dev itself 651ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 788ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 649ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 602ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 635ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 341ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 823ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1134ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1015ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 811ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 801ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1415ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 1188ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1104ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 644ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 434ms
     ✓ refuses --merge-docs with --head, and an unknown --head 303ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 539ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 753ms
     ✓ a failed install stops ship (16) 705ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 580ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 589ms
     ✓ exits 10 when the fetch fails 491ms
   ✓ branches land (27)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1057ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1020ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1012ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1021ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2091ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2548ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 399ms
     ✓ local: names unpushed dev as the cause when the branch carries it 454ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 502ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1529ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1224ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 916ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 906ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1011ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 958ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 662ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1191ms
     ✓ land removes the worktree when only the copied .env is untracked 1017ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 980ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1053ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1690ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1032ms
     ✓ landPr refuses a main-based PR without retrying 849ms
     ✓ landPr refuses when the PR base is unknown 520ms
     ✓ PR not open (closed): stops (17) at once, no retry 644ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 395ms
     ✓ --attempt names the merge round in a fix commit 423ms
     ✓ commits a rewritten and a deleted tracked file 369ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 317ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 345ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/tools/instructions-sources.test.ts > Hook Text > every hook message has an entry and every entry is still emitted
AssertionError: expected [ …(6) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   ".bkit/core/hooks/gateguard-engine.js `authoringReminder`: no `## Hook Text` entry for \"[bkit GateGuard] Agent-read file. Before you edit it:\\n- Find this file in `.bkit/authoring.md` § Which Sections Apply, and read the sections its row lists.\\n- Follow those rules in the edit.\"",
+   ".bkit/core/hooks/gateguard-engine.js `deliverAdvice`: no `## Hook Text` entry for \"[bkit GateGuard] ${omitted.length} target${omitted.length === 1 ? \\\"\\\" : \\\"s\\\"} omitted (output limit); they stay unacknowledged and are advised on a later edit.${reminder}\"",
+   ".bkit/core/hooks/guardrails-shell.js `shellEditAdvisory`: no `## Hook Text` entry for \"bkit guardrails: this command edits files through the shell (targets: ${ev.targets.join(\\\", \\\")}). The command is allowed.\"",
+   ".bkit/core/hooks/guardrails-shell.js `shellEditAdvisory`: no `## Hook Text` entry for \"bkit guardrails: this command may edit files through the shell. The command is allowed.\"",
+   ".bkit/core/hooks/guardrails-shell.js `shellEditAdvisory`: no `## Hook Text` entry for \"Pre-edit gates see only the edit and write tools, so a shell edit gets past every one of them.\"",
+   "`guardrails-shell-edit`: no longer emitted by `.bkit/core/hooks/guardrails-shell.js` `shellEditAdvisory` — \"bkit guardrails: this command edits files through the shell (${hits.join(\\\"; \\\")}). The command is allowed. Pre-edit gates see only the edit and write tools, so a shell edit gets past every one of them.\\nUse the edit or write tool instead.\\nIf this is one of the exceptions in .agents/rules.md (generating files from a script, a bulk mechanical rewrite, or appending a log line to your own step output file with `>>`), proceed.\"",
+ ]

 ❯ .bkit/core/engine/tools/instructions-sources.test.ts:243:40
    241|   it("every hook message has an entry and every entry is still emitted…
    242|     const sources = new Map(HOOK_SOURCES.map((f) => [f, read(f)]));
    243|     expect(checkHooks(STORE, sources)).toEqual([]);
       |                                        ^
    244|   });
    245| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 172 passed (173)
      Tests  1 failed | 7369 passed | 2 skipped (7372)
   Start at  20:12:37
   Duration  207.30s (tests 95%, import 2%, transform 2%, setup 1%, worker 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/787-show-authoring-rules/build-group-gate-1-3.log.reports/vitest-47738.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.79 |    83.35 |   95.07 |   91.15 |                   
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
 engine/commands   |   89.65 |    84.31 |   93.25 |    90.4 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...82,195,197,204 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   94.55 |    89.89 |   97.05 |   97.28 | ...51,487,539-542 
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
 ...mands/workflow |   92.28 |    84.64 |    96.3 |   93.75 |                   
  branches.ts      |   90.41 |    83.62 |   98.22 |   92.29 | ...3028,3053,3196 
  challenge.ts     |   96.95 |    84.84 |     100 |   98.02 | 178,368-370,656   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.38 |    94.69 |     100 |    98.8 | 240,557           
  decisions.ts     |   95.32 |    80.72 |   97.72 |   98.36 | 206,311,380       
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   96.65 |       90 |   96.55 |   97.39 | ...1066,1081-1091 
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
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...55,304,324-329 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   97.25 |    95.25 |     100 |   98.41 | 119,230,502,630   
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 263,374           
  steps.ts         |    89.9 |    83.04 |   90.82 |    91.1 | ...1963,1968,1970 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   96.11 |    88.92 |   93.44 |   95.19 | ...94-500,512,535 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.65 |    88.76 |   96.73 |   97.94 | ...2340,2436-2438 
  tracker.ts       |   89.02 |    80.61 |   96.69 |   91.11 | ...2097,2123-2128 
  workflows.ts     |   93.45 |    82.64 |   97.38 |   95.07 | ...1763,1937,2669 
  worktrees.ts     |   61.38 |     59.2 |   67.85 |   62.53 | ...1124,1127-1128 
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
 engine/shared     |   99.44 |     97.2 |     100 |     100 |                   
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
Statements   : 89.79% ( 18928/21080 )
Branches     : 83.35% ( 14159/16987 )
Functions    : 95.07% ( 3053/3211 )
Lines        : 91.15% ( 16596/18206 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1678 of 3530 lines (119 KB of 272 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
