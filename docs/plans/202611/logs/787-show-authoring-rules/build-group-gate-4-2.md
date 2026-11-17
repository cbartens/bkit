
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 787-show-authoring-rules build-group-gate-4 is waiting for tests (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 95007, since 17:21:59), no earlier run
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 787-show-authoring-rules build-group-gate-4 is waiting for tests (still, 1 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 95007, since 17:21:59), no earlier run
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 787-show-authoring-rules build-group-gate-4 is waiting for tests (still, 2 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 95007, since 17:21:59), no earlier run
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 787-show-authoring-rules build-group-gate-4 is waiting for tests (still, 3 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 95007, since 17:21:59), no earlier run

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


 .bkit/core/.bkit/README.md
 342:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/cloud.md
 467:178  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/install.md
 19:1     warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 135:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 355:290  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 363:1    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 495:97   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 871:80   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


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

[test-timeout-budget] load average 27.0 on 10 cores: unit limits 18000ms per test, 36000ms per hook (x3.60)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 40262ms
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 338ms
     ✓ continues after friction and diagnostic writes fail without recursion 305ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 403ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 2135ms
   ✓ routine publication policy (8)
     ✓ classifies attention and terminal reports from structured purpose 335ms
     ✓ rolls over after intervening comments external edits and deletion 415ms
   ✓ bounded nonfatal publication (10)
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 326ms
     ✓ reserves new comment opportunity within total delivery budget 693ms
     ✓ attempts independent attention after routine uncertainty 300ms
     ✓ seals an acknowledged segment after a postflight intervening comment 419ms
   ✓ trackerTarget (3)
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 508ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 1111ms
     ✓ seals unavailable or unstable representation evidence 1046ms
     ✓ uses accepted final preflight eligibility without provider atomicity 899ms
     ✓ rejects marker preserving external edits 1309ms
     ✓ preserves generated first line and extracts versioned h6 section markers 891ms
     ✓ returns owned comment identity and stable representation evidence 1096ms
     ✓ selects newest created comment across complete pages 891ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 724ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 1180ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 864ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 659ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 656ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 439ms
     ✓ fetches the issue and its comments as GitHub returns them 466ms
     ✓ github fetch marks a closed issue terminal and an open one not 651ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 679ms
     ✓ caches exact engine source with available progress identity 455ms
     ✓ keeps original body identity separate from time and changed output 483ms
     ✓ reuses matching invocation state without adopting foreign ownership 917ms
     ✓ invalidates missing corrupt and unsupported progress cache 1131ms
     ✓ contains cache read and write failures as standalone degradation 685ms
     ✓ uses legacy receipts and contains receipt failures 800ms
     ✓ records an engine-action row and skips the same key + body on a re-run 657ms
     ✓ a recent identical comment counts as done (the final close comment) 860ms
     ✓ a failed post reports done false with the reason and never leaks a token 774ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 719ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 880ms
     ✓ a board the token cannot see is scope 973ms
     ✓ an HTTP 403 from gh is scope 824ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 903ms
     ✓ github: no block, no blockers and no further reads 422ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 704ms
     ✓ a different marker hash posts 476ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1046ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 40938ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 910ms
     ✓ names each net-new and worsened finding in the log and the JSON 1273ms
     ✓ fails on a net score rise with no net count change 979ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1305ms
     ✓ treats a net score at or below 0.001 as float noise 1126ms
     ✓ passes when the change only resolves findings 1020ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1735ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 312ms
     ✓ skips (exit 0) when the base resolves to HEAD 433ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 942ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 488ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1360ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1106ms
     ✓ exits 4 on a dropped net field instead of silently passing 1309ms
     ✓ exits 4 on no summary instead of silently passing 1131ms
     ✓ exits 4 on output that is not JSON instead of silently passing 970ms
     ✓ exits 5 when the base worktree cannot be created 321ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1273ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 856ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1463ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1167ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1083ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1680ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 876ms
     ✓ explicit globs can select ignored prose and nested checkout files 606ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 490ms
     ✓ fails (exit 1) when vale reports alerts 826ms
     ✓ exits 6 on a vale runtime error 833ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 915ms
     ✓ falls back to vale sync when the main worktree has none 870ms
     ✓ fails when vale sync cannot restore the required styles 614ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 453ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 398ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 357ms
     ✓ exits 1 naming the code file, whatever the commit message says 366ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 377ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 712ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 355ms
     ✓ exits 1 naming the files outside, whatever the commit message says 429ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 962ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 789ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 492ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 838ms
     ✓ a top-level glob in the setting does not reach into folders 522ms
     ✓ a push that changes no files is not proven a min push 565ms
     ✓ exits 7 when a commit or its base cannot be read 419ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 44371ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 629ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1437ms
     ✓ always writes the marker, even with no plan 762ms
     ✓ writes the linear marker shape, taking the tracker from package.json 992ms
     ✓ writes the jira marker shape, taking the tracker from package.json 822ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 1008ms
     ✓ refuses a PR from dev, main, or the base itself 331ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 855ms
     ✓ retries a failed create once, and exits 5 when it fails twice 943ms
     ✓ exits 5 when the open-PR probe errors 704ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1429ms
     ✓ prs open still opens against any other base 1015ms
     ✓ exits 6 when the created PR's base is not --base 1308ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 939ms
     ✓ exits 1 with found=false when there is none 937ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1043ms
     ✓ --number reads one PR, mergeable included 1084ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 896ms
     ✓ exits 4 when gh errors and 80 when it needs auth 958ms
   ✓ bkit prs scan-body (10)
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 305ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 373ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 580ms
     ✓ drops the force-build marker from the title subject 703ms
     ✓ takes an explicit --subject 398ms
     ✓ runs no merge when the PR is already MERGED 460ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 583ms
     ✓ prs merge refuses a PR whose base is main 641ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 449ms
     ✓ prs merge refuses when the PR base is unknown 659ms
     ✓ prs merge reads the base from the one pr view it already makes 409ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 890ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 750ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 641ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 663ms
     ✓ never reads dev's required checks without --only-if-required 745ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 692ms
     ✓ updates when a dev ruleset requires status checks 400ms
     ✓ updates when dev's branch protection requires status checks 838ms
     ✓ ignores dev rulesets that require no checks 1020ms
     ✓ updates when the repo cannot be resolved 811ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 859ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 454ms
     ✓ is not green when a check failed, naming it (exit 1) 636ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 504ms
     ✓ is not green on an empty rollup (total 0) 366ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 641ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1199ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 867ms
     ✓ is a no-op when the title already says so 411ms
     ✓ strips the marker, with or without its bkit prefix 934ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 799ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (116 tests) 46872ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 671ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 485ms
     ✓ done --group writes group on the row 375ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 524ms
     ✓ carries extra fields, parsed as JSON when they are JSON 337ms
     ✓ reports a failed commit with exit 8 without writing the row 1118ms
     ✓ a failed commit leaves no row staged in the index 1029ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1372ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 995ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1588ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1130ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1345ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 316ms
     ✓ --ref reads the status file as committed on that ref, not from disk 331ms
     ✓ --ref exits 3 when the ref does not carry the status file 318ms
     ✓ fails on a placeholder left in the artifact 334ms
     ✓ fails when the row does not list the artifact, or carries another attempt 317ms
     ✓ fails on a missing artifact 327ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 409ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 557ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 551ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 345ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 699ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 827ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 591ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 765ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1022ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 716ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 599ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 538ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 329ms
     ✓ --attempt-of checks the row carries the derived counter 468ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 967ms
     ✓ writeStepRow refuses when a recorded path changed 1124ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 468ms
     ✓ writeStepRow appends its commit sha to the record 818ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1662ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 349ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 854ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 1045ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 478ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1263ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 974ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 686ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 413ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1349ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 488ms
     ✓ does not count an artifact the run found committed when it started 610ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 394ms
     ✓ commits a package.json change outside bkit.workflows 709ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1347ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests) 52429ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 1086ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 559ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 935ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 821ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 799ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 606ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 420ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1308ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 759ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 605ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 854ms
     ✓ PASS is 0 failures with or without reports 1455ms
     ✓ clears a previous attempt's reports before the gate runs 861ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1312ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 998ms
     ✓ a log under the outbox is named main-checkout relative in the record 948ms
     ✓ a log small enough is copied whole: not clamped, raw null 912ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 767ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1323ms
     ✓ numbers runs within the workflow's active run and per step 911ms
     ✓ without --file no row is written and the output carries row null 832ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 785ms
     ✓ a planned test that passes is a vacuous gap, exit 1 915ms
     ✓ a planned test absent from a loaded report is a missing gap 866ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1110ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 946ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 315ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1346ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 892ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1009ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1460ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1245ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1234ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1382ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1241ms
     ✓ green: a passed-accepted test is already landed, not a gap 829ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 760ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 657ms
     ✓ green: --group audits only that group's tasks 623ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1090ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 854ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 871ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 951ms
     ✓ green: lists each gap kind, with the runner output 740ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1526ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 520ms
       ✓ green clears an exception-only task from a human commit 429ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 58304ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1895ms
     ✓ runs code.ts through its declared gate in the built checkout 1639ms
     ✓ runs code.ts through its declared gate in the built checkout 1823ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1517ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1591ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1684ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 789ms
     ✓ runs the full gate for replayed debug code 1205ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1342ms
     ✓ installs local dependencies against the built target tree 1594ms
     ✓ runs the configured frozen install even without root dependencies 1497ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1415ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1641ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 2300ms
     ✓ never pushes local dev commits missing from origin/dev 2105ms
     ✓ dev moved: rebuilds on the new dev and pushes again 3527ms
     ✓ dev moved before every push: exhausted, nothing landed 5238ms
     ✓ any other refusal is returned, not retried 2469ms
     ✓ pushToDev replays a commit range onto origin/dev 2350ms
     ✓ a replay retries on the new dev when dev moved 3871ms
     ✓ pushToDev log line names what it lands 2035ms
     ✓ runs no git hooks in the throwaway checkout, and says so 2075ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2322ms
     ✓ a push that fails without a server answer is returned once, never retried 1981ms
     ✓ a failed fetch is returned before anything is built 648ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2787ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1889ms
     ✓ lands from a clone whose fetch refspec omits dev 2320ms
     ✓ build throwing stops the landing and removes the throwaway checkout 736ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 20764ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 779ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 800ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 460ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 997ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 602ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 703ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 470ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 598ms
     ✓ an unpinned repo reports nulls and asks no registry 480ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 326ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 342ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 419ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 338ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 435ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 401ms
     ✓ staging failure: exit 4 and no commit is created, no false success 394ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 467ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 319ms
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 27774ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 3204ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2923ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 378ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 491ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 373ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 3024ms
     ✓ does not fall back through a malformed later success receipt 1547ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1225ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1038ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1879ms
     ✓ requires proof even when the pushed increment changes no files 1160ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 650ms
     ✓ does not record a committed tree 658ms
     ✓ records no proof for a failed gate or lighter gate 1141ms
     ✓ requires integration proof when integration is declared 1444ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2422ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ locates CI evidence using prompt saved issue and local precedence 3046ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1472ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1118ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1883ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 3193ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 703ms
       ✓ a source change past the validated head refuses (17) and names the path 652ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 593ms
       ✓ --validated without --month / --fid is a usage error (2) 408ms
       ✓ a validated sha that is not an ancestor refuses (17) 522ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 615ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1261ms
     ✓ a failed re-trigger push names the cause in the log 1533ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1440ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1761ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1134ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 557ms
     ✓ gh-error: every poll errored 530ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1085ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1008ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1093ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1085ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2808ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3012ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 803ms
     ✓ re-trigger on dev only uses the record of its own FID 883ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1080ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 408ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 533ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 379ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 465ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 599ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 678ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 627ms
     ✓ --file and --step go together 567ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (65 tests) 28634ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 342ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 398ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 314ms
> [bkit] TRUNCATED HERE — 48 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 467ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 442ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 394ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 810ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 640ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1209ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 994ms
     ✓ --file into a missing directory is refused, not created 948ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/audits/templates/context-vercel-block.test.ts (22 tests) 14996ms
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 454ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 579ms
     ✓ follows summary cursors even when the first page is shorter than the limit 759ms
     ✓ reports excluded intervals as unread even when pagination finishes 441ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 492ms
     ✓ reports an unread remainder at the page cap 511ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 441ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 332ms
     ✓ rejects missing summaries instead of treating them as empty results 530ms
     ✓ reports a failed first page as unavailable 463ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 373ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 980ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 895ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1058ms
     ✓ reports excluded intervals as unread even when pagination finishes 935ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 1172ms
     ✓ reports an unread remainder at the page cap 781ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 898ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 529ms
     ✓ rejects missing summaries instead of treating them as empty results 949ms
     ✓ reports a failed first page as unavailable 644ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 775ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 12202ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 521ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1887ms
     ✓ a refused dev push is logged, never fails the close 2351ms
     ✓ an unreachable remote is logged, never fails the close 660ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (101 tests) 54115ms
   ✓ the corpus matches the instructions store (8)
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 1035ms
     ✓ resolves config from the repo root when run from a subdirectory 936ms
     ✓ exits 6 when the PUT fails 1012ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 854ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 856ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 655ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 314ms
     ✓ exits 6 when the api answer is not JSON 323ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 6602ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 948ms
     ✓ counts files committed since --base 817ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 557ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1038ms
     ✓ runs the --fallback gate even when no file changed, as it did before 506ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (70 tests) 4631ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1337ms
     ✓ runGit names ENOBUFS when output passes the limit 996ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1060ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 636ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1112ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 348ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 3644ms
   ✓ selected CI context evidence (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 672ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 633ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 427ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (20 tests) 2602ms
   ✓ bkit tasks currency (6)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ answers for the cwd, not an inherited GIT_DIR 445ms
   ✓ guardRepoConfig (6)
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 395ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 428ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 355ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (42 tests) 2788ms
   ✓ runLines (5)
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
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 56 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 910 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 181 lines omitted. Dropped content was NOT read.
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


 ✓ .bkit/core/engine/checks/after/index.test.ts (53 tests) 409ms
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 339ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (285 tests) 138ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 208ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 312ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 299ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 233ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 130ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-xhGXCo/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 136ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-qV29s4/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 190ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 162ms
 ✓ .bkit/core/engine/install/write.test.ts (79 tests) 155ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (57 tests) 290ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 201ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 157ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 111ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 106ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 133ms
(node:63463) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:63463) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 122ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (69 tests) 140ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (252 tests) 105ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (41 tests) 50ms
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

 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 64ms
 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 30ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 85ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 39ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 76ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 78ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (57 tests) 108ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 153ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 82ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 117ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 58ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 78ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 66ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (54 tests) 64ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 73ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 90ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 86ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 83ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 70ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 70ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 80ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 48ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 25ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 48ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 84ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 72ms
(node:65995) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:65995) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:65995) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:65995) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 70ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 55ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 63ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 20ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 47ms
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

 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 28ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 38ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 44ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 32ms
 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 49ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 44ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 29ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 37ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 39ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 39ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 17ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 28ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794382294281.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794382294284.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794382294285.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794382294295.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 28ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 32ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 22ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 27ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 20ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 19ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 29ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 24ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 15ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 28ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 22ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (13 tests) 24ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 14ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 10ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 17ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 12ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 10ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 15ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (6 tests) 51ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 10ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 7ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (154 tests) 124256ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 492ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1524ms
     ✓ writes no limits for a workflow with no ask point 328ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 328ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 496ms
       ✓ a new run in the same chat gets its own session row 429ms
     ✓ opens the next run after a finished one, and after another workflow's run 358ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 370ms
     ✓ design / plan / build / debug book in the current worktree 384ms
     ✓ --lock-held checks the lock is ours 514ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 497ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a resumed run prints its last DONE step; a closed decision is not open 429ms
     ✓ an OPEN decision of an earlier run never resurfaces 420ms
     ✓ an OPEN decision mid-build prints its header fields 337ms
     ✓ reads Test attempt from a tests pause 383ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 452ms
     ✓ writes no row when status.jsonl does not exist 318ms
     ✓ aborts a rebase only when one is in progress 610ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 440ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 563ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 308ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 311ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 303ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 315ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 582ms
       ✓ counts subagents of an earlier chat the run's session rows name 608ms
       ✓ records no context block, and still closes, outside a Claude Code session 626ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 606ms
     ✓ records ending held and publish false on the workflow-done row 556ms
     ✓ defaults the close row to ending done 608ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 915ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 893ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 960ms
     ✓ always writes the telemetry, whatever the runtime 841ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 714ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 761ms
     ✓ an unwritable stats path is logged and never fails the close 806ms
     ✓ appends the completeness row before the workflow-done row 808ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 735ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 807ms
     ✓ writes one completeness row per close 1105ms
     ✓ leaves out the previous run's rows that share a second with this run's start 635ms
     ✓ still closes when the completeness check throws 809ms
     ✓ still closes when the completeness row write throws 913ms
     ✓ ship: run.pr, size of the squash commit, and coverage 844ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1175ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 652ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 569ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 785ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 787ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1119ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1563ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 922ms
     ✓ --record-step writes the close step's row before workflow-done 681ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 870ms
     ✓ --number without --outbox is a usage error 676ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1221ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1151ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1297ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1405ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 902ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 510ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 494ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2993ms
     ✓ --flush with nothing to record commits and pushes nothing 1414ms
     ✓ --flush carries the named worktree's logs into the dev commit 2470ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2806ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2789ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 3286ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2921ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3167ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2751ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2652ms
     ✓ --push on dev never carries a row whose references name another feature 2643ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2517ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 4330ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2812ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1014ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2737ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2094ms
     ✓ a close that landed releases the lock 2743ms
     ✓ removes the worktree before it releases the lock 2643ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4032ms
       ✓ closePr refuses when the PR base is unknown 3717ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2846ms
   ✓ bkit workflows promote (7)
     ✓ stamps the anchor from the runtime-resolved base commit 459ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 465ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 557ms
     ✓ names the branch, not the remote-tracking ref, in each URL 505ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 440ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 441ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1195ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 714ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1769ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 558ms
     ✓ a second run's record does not let this FID's close commit 303ms
     ✓ record is present after workflows close and before the push 522ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1103ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 445ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 310ms
     ✓ --summary prints the file and keeps a copy in --outbox 311ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 301ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (261 tests) 175868ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 752ms
     ✓ rejects missing explicit and ambiguous existing branch selections 547ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 933ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 845ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 619ms
     ✓ a refused --continue carries git's own reason 894ms
     ✓ --file records nothing for a refused rebase 600ms
     ✓ refuses a code conflict and aborts the rebase on the spot 619ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1186ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 566ms
     ✓ produces byte-identical output to merge=union 1767ms
     ✓ restores a trailing newline so the next append starts on its own line 809ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 690ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 896ms
     ✓ refuses a union that leaves a line which is not JSON 532ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 665ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1669ms
     ✓ refuses a lockfile whose regenerate command fails 1583ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1091ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 959ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1108ms
     ✓ refuses and aborts when both sides changed the hand-written region 945ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1024ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1218ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1401ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 803ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 944ms
     ✓ refuses and aborts when a side deleted the install record 787ms
     ✓ refuses a conflicted doc the repo's script does not list 709ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 619ms
     ✓ removes a stale sentinel when the rebase succeeds 809ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1258ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1116ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 602ms
       ✓ skips (12) with no anchor 511ms
       ✓ skips (12) when the base is unreachable in this clone 533ms
       ✓ skips (12) when nothing landed since the base 497ms
       ✓ runs (0) with the landed path count once dev moved 970ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 487ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1332ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 1064ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 962ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1831ms
     ✓ runs exactly one git push 1334ms
     ✓ --set-upstream records the upstream 1030ms
     ✓ refuses with no branch checked out 713ms
     ✓ --mode=dev refuses a feature checkout 680ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2045ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2921ms
     ✓ --require-ci pushes as-is when dev has not moved 1183ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2005ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2698ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 706ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1319ms
     ✓ --mode=abort pushes when the branch has no open PR 1291ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 838ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 668ms
     ✓ --open-pr carries the MCP answer and skips gh 882ms
     ✓ --mode=abort on dev pushes plainly without probing 931ms
     ✓ rejects an unknown mode 607ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 2820ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1625ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1716ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3707ms
     ✓ skip-ci HEAD on the replay is refused 1132ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2636ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3587ms
     ✓ a level local dev is a plain push, recording nothing extra 1305ms
     ✓ a record with no commits pushes nothing 1000ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 651ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1390ms
     ✓ a rewritten branch is refused, never forced 888ms
     ✓ refuses dev and main with exit 21 and pushes nothing 601ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1266ms
     ✓ refuses a detached HEAD (exit 5) 495ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 933ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1050ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1310ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1478ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 573ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1270ms
     ✓ an up-to-date branch is a no-op 936ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1487ms
     ✓ a fetch that fails exits 10 698ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 731ms
     ✓ scan-diff still reports a new skip when its test … 732ms
     ✓ scan-diff reports a skip moved onto a different t… 750ms
     ✓ scan-diff does not cancel a skip moved between am… 1062ms
     ✓ scan-diff does not spend an unchanged duplicate t… 824ms
     ✓ scan-diff recognizes a renamed test file 818ms
     ✓ scan-diff recognizes a suite moved into a differe… 982ms
     ✓ scan-diff does not let unrelated additions hide a… 874ms
     ✓ scan-diff attributes deletion to its old test ins… 829ms
     ✓ scan-diff consumes each moved assertion once and … 953ms
     ✓ scan-diff does not match identical assertions fro… 1042ms
     ✓ scan-diff does not match the same leaf test name … 1008ms
     ✓ scan-diff does not match a same-named test with d… 923ms
     ✓ scan-diff does not match a same-named test with c… 874ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 945ms
     ✓ --paths with no match exits 1 1029ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 756ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1456ms
     ✓ --marker reads a diff over 1 MiB 1013ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1191ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1135ms
     ✓ scan-diff finds an added skip 1093ms
     ✓ scan-diff ignores a skip predating the base 589ms
     ✓ scan-diff reports a disabled test with its line 400ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 322ms
     ✓ scan-diff ignores a removed comment in a test file 338ms
     ✓ scan-diff ignores an assertion moved within the file 370ms
     ✓ scan-diff still reports a removed assertion 334ms
     ✓ scan-diff reports an assertion re-added only outside the test file 340ms
     ✓ scan-diff finds an added pytest mark skip 379ms
     ✓ scan-diff finds an added unittest skip 325ms
     ✓ scan-diff finds an added bare skip call 347ms
     ✓ scan-diff ignores a quoted skip in a documentation file 382ms
     ✓ scan-diff ignores a marker literal in a non-test source file 349ms
     ✓ scan-diff ignores an assertion whose expectation changed 344ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 314ms
     ✓ scan-diff reports a deleted test file 337ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 945ms
     ✓ a title that already carries the marker is left alone 485ms
     ✓ with no open PR: pushes the marker commit and edits no title 483ms
     ✓ a re-run is deduped: no second marker commit 636ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 622ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 361ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 387ms
     ✓ --merge-docs merges dev when docs/ is behind 460ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 469ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 692ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 671ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 531ms
     ✓ --merge-docs skips an empty bkit:generate script 529ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 460ms
     ✓ --merge-docs never merges on dev itself 378ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 548ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 539ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 487ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 507ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 670ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 895ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 741ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 672ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 688ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 906ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 714ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 943ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 487ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 362ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 431ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 590ms
     ✓ a failed install stops ship (16) 563ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 431ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 424ms
     ✓ exits 10 when the fetch fails 326ms
   ✓ branches land (27)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1039ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1028ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1069ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1133ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2296ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2529ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 385ms
     ✓ local: names unpushed dev as the cause when the branch carries it 458ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 529ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1553ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1180ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 955ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 925ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1035ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 957ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 677ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1186ms
     ✓ land removes the worktree when only the copied .env is untracked 1110ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1051ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1438ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1627ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 981ms
     ✓ landPr refuses a main-based PR without retrying 545ms
     ✓ landPr refuses when the PR base is unknown 522ms
     ✓ PR not open (closed): stops (17) at once, no retry 667ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 394ms
     ✓ --attempt names the merge round in a fix commit 358ms
     ✓ commits a rewritten and a deleted tracked file 372ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 315ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 334ms

 Test Files  173 passed (173)
      Tests  7372 passed | 2 skipped (7374)
   Start at  17:29:36
   Duration  176.58s (tests 97%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/787-show-authoring-rules/build-group-gate-4-2.log.reports/vitest-56156.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |    89.8 |    83.35 |   95.12 |   91.18 |                   
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
 engine/commands   |   89.65 |    84.15 |   93.25 |    90.4 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...82,195,197,204 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   94.55 |    89.53 |   97.05 |   97.28 | ...51,487,539-542 
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
 ...mands/workflow |   92.29 |    84.66 |   96.35 |   93.77 |                   
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
  locks.ts         |   93.22 |    88.13 |   96.29 |   95.36 | ...09-211,474-475 
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
 engine/install    |   93.14 |    84.39 |   94.54 |   96.05 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,294            
  write.ts         |   88.53 |    80.53 |   85.29 |   92.43 | ...01-321,345,564 
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
Statements   : 89.8% ( 18974/21127 )
Branches     : 83.35% ( 14186/17019 )
Functions    : 95.12% ( 3065/3222 )
Lines        : 91.18% ( 16634/18242 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 463 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 191 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 205 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 277 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 190 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 193 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 73 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 221 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 194 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 190 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 191 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 197 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 199 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 200 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 848 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 488 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 16 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 16 ms
ok 19 stub: the response selector is cleared before running its body # in 15 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 19 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 21 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 17 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 15 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 21 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 13 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 34 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 51 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 594 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 340 ms
ok 30 refresh drops a file deleted in the index from the build # in 319 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 421 ms
ok 32 a key removed from the env file is unset on the next run # in 202 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 147 ms
ok 34 non-BKIT_ keys are skipped # in 136 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 150 ms
ok 36 a failed unsetenv is retried on the next run # in 175 ms
ok 37 logs key names only, never values # in 134 ms
ok 38 missing env file exits 0 without calling launchctl # in 24 ms
ok 39 the sweep prints the summary line the lane greps for # in 258 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 9 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (86.97925ms)
✔ shell cancellation waits for SIGTERM cleanup (138.410708ms)
✔ direct cancellation waits for SIGINT cleanup (83.939958ms)
✔ shell cancellation waits for SIGINT cleanup (159.68825ms)
✔ direct cancellation waits for SIGHUP cleanup (85.720334ms)
✔ shell cancellation waits for SIGHUP cleanup (138.771375ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (379.79575ms)
✔ shell cancellation follows a worker orphaned by a nested shell (225.789875ms)
✔ direct cancellation preserves a nested machine-lock owner (415.943541ms)
✔ shell cancellation preserves a nested machine-lock owner (456.180166ms)
✔ nested shell cancellation preserves a nested machine-lock owner (459.2815ms)
✔ a hard process-group timeout reaches a shell command during cleanup (65.706708ms)
✔ ships a command-scoped sleep prevention wrapper (0.070083ms)
✔ preserves arguments, output and nonzero exit status (43.591916ms)
✔ runs an entire shell chain and retains its failure (26.668875ms)
✔ reports a missing command as 127 (26.134375ms)
✔ requires a command (22.516084ms)
✔ non-macOS platform selection runs commands without sleep prevention (37.649458ms)
✔ hard timeout escalation reaches a command that ignores TERM (142.339209ms)
✔ forwards POSIX cancellation to the command and releases the assertion (43.709709ms)
✔ holds a real macOS assertion only while the command runs (62.625875ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3135.083375
> [bkit] TRUNCATED — kept 1752 of 3441 lines (125 KB of 266 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
