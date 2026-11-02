
> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/825-show-progress-bar
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/825-show-progress-bar
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/825-show-progress-bar
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/825-show-progress-bar
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/825-show-progress-bar
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/825-show-progress-bar
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/825-show-progress-bar
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/165 files need formatting

> @cbartens/bkit@6.0.0 lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/825-show-progress-bar
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'

[bkit-ci] .vale/styles/write-good absent (fresh checkout or worktree) - restoring

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
 601:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 824:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 993:108   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1095:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1256:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1314:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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

> @cbartens/bkit@6.0.0 slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/825-show-progress-bar
> bkit ci slop

[bkit-ci] base b0e1b6284bb59e4da31ab1887a8bde74b22e96fd (b0e1b6284bb59e4da31ab1887a8bde74b22e96fd) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: b0e1b6284bb59e4da31ab1887a8bde74b22e96fd
base: b0e1b6284bb59e4da31ab1887a8bde74b22e96fd
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/825-show-progress-bar
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/825-show-progress-bar
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (56 tests) 22838ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 1051ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 1084ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 911ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 570ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 453ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 966ms
     ✓ fetches the issue and its comments as GitHub returns them 1086ms
   ✓ postCommentOnce (4)
     ✓ records an engine-action row and skips the same key + body on a re-run 1068ms
     ✓ a recent identical comment counts as done (the final close comment) 905ms
     ✓ a failed post reports done false with the reason and never leaks a token 931ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1029ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 804ms
     ✓ a board the token cannot see is scope 544ms
     ✓ an HTTP 403 from gh is scope 1032ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 792ms
     ✓ github: no block, no blockers and no further reads 2730ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 1996ms
     ✓ a different marker hash posts 1581ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1918ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (96 tests) 28939ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 15204ms
     ✓ sync has nothing left to rewrite 10629ms
     ✓ every clause reaches the cut-off of one surface it applies to 962ms
   ✓ fully retired clauses (6)
     ✓ output-cap's sentence stays inline in the abort handover prompt 1701ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 31082ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 627ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 1179ms
     ✓ CI=true -> GITHUB_ACTION 1113ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 569ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 575ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 471ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 781ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 1455ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 1049ms
     ✓ LOCAL -> runtimeHeadless=false 929ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 948ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 1018ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 926ms
     ✓ UNKNOWN -> runtimeHeadless=false 463ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 1054ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1060ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 2447ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 1839ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 1489ms
     ✓ re-derives per call: one run's answer does not leak into the next 1773ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 2245ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1821ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1881ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1420ms
     ✓ --file into a missing directory is refused, not created 1263ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (60 tests) 36133ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1147ms
     ✓ names each net-new and worsened finding in the log and the JSON 1291ms
     ✓ fails on a net score rise with no net count change 898ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 592ms
     ✓ treats a net score at or below 0.001 as float noise 663ms
     ✓ passes when the change only resolves findings 1056ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1534ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 979ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 977ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1192ms
     ✓ exits 4 on a dropped net field instead of silently passing 1019ms
     ✓ exits 4 on no summary instead of silently passing 691ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1050ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 2845ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 509ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 475ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 502ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 570ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 2533ms
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 2002ms
     ✓ fails (exit 1) when vale reports alerts 2030ms
     ✓ exits 6 on a vale runtime error 1669ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1714ms
     ✓ falls back to vale sync when the main worktree has none 1348ms
     ✓ fails when vale sync cannot restore the required styles 1664ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 338ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 339ms
   ✓ bkit ci min-push (9)
     ✓ checks every --ref: one code ref among min-push refs fails the push 309ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 306ms
 ✓ .bkit/core/engine/commands/land.test.ts (30 tests) 12454ms
   ✓ pushToDev (16)
     ✓ lands the commit on origin/dev and leaves the main checkout alone 484ms
     ✓ never pushes local dev commits missing from origin/dev 374ms
     ✓ dev moved: rebuilds on the new dev and pushes again 835ms
     ✓ dev moved before every push: exhausted, nothing landed 1662ms
     ✓ any other refusal is returned, not retried 3278ms
     ✓ pushToDev replays a commit range onto origin/dev 516ms
     ✓ a replay retries on the new dev when dev moved 607ms
     ✓ pushToDev log line names what it lands 315ms
     ✓ runs no git hooks in the throwaway checkout, and says so 591ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 509ms
     ✓ a push that fails without a server answer is returned once, never retried 326ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 726ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1048ms
     ✓ lands from a clone whose fetch refspec omits dev 600ms
     ✓ build throwing stops the landing and removes the throwaway checkout 333ms
(node:84991) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:84991) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:84991) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:84991) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:84991) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:84991) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:84991) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (29 tests) 25220ms
   ✓ shipped copy-and-own test files (5)
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 24024ms
   ✓ bkit-check-capstone (10)
     ✓ passes its own copy-and-own test file (bkit's own copy) 334ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (152 tests) 60831ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 436ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 371ms
     ✓ writes one completeness row per close 348ms
     ✓ ship: run.pr, size of the squash commit, and coverage 458ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 375ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 328ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 338ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 614ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 543ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 474ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 376ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 430ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 383ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 648ms
     ✓ --flush with nothing to record commits and pushes nothing 510ms
     ✓ --flush carries the named worktree's logs into the dev commit 764ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2905ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 994ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 922ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 573ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 784ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 691ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 637ms
     ✓ --push on dev never carries a row whose references name another feature 794ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 601ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 1598ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2412ms
     ✓ --push commits in the named worktree, not the checkout it runs from 756ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1263ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 716ms
     ✓ a close that landed releases the lock 835ms
     ✓ removes the worktree before it releases the lock 699ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 6417ms
       ✓ closePr refuses when the PR base is unknown 5606ms
     ✓ leaves a worktree no workflow created, and its branch, in place 909ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 398ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 741ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 411ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 402ms
     ✓ a second run's record does not let this FID's close commit 445ms
     ✓ record is present after workflows close and before the push 870ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1557ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 441ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 518ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 535ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 439ms
     ✓ puts each --line after the summary, in flag order 452ms
     ✓ --summary prints the file and keeps a copy in --outbox 418ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 495ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 14876ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ linear with no key configured: a bare key names no issue, with a hint naming bkit.tracker.linear.team 352ms
     ✓ jira with no key configured: a bare key names no issue, with a hint naming bkit.tracker.jira.project 345ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 894ms
   ✓ bkit fids resolve (12)
     ✓ 4. mints from the title file; a JSON file with a title key also works 320ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (135 tests) 67788ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1301ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 1224ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 570ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 572ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 566ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 941ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1282ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 940ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 926ms
     ✓ PASS is 0 failures with or without reports 949ms
     ✓ clears a previous attempt's reports before the gate runs 1018ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 702ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 626ms
     ✓ a log under the outbox is named main-checkout relative in the record 625ms
     ✓ a log small enough is copied whole: not clamped, raw null 1001ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1992ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 2071ms
     ✓ numbers runs within the workflow's active run and per step 1600ms
     ✓ without --file no row is written and the output carries row null 1789ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1935ms
     ✓ a planned test that passes is a vacuous gap, exit 1 1660ms
     ✓ a planned test absent from a loaded report is a missing gap 1796ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1503ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1865ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1550ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 2120ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1823ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 3371ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 2313ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 2925ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1965ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 2049ms
     ✓ green: a passed-accepted test is already landed, not a gap 1502ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1494ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1267ms
     ✓ green: --group audits only that group's tasks 1092ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1627ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1653ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1615ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1616ms
     ✓ green: lists each gap kind, with the runner output 1839ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 2029ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 14997ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 344ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 452ms
     ✓ brand-new untracked ledger is staged and committed 400ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 303ms
     ✓ path containing a space is staged and committed 342ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 357ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 633ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 413ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 374ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 320ms
   ✓ bkit ledgers commit --path (5)
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 306ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 384ms
     ✓ --path records its commit on the run's record, like every other commit mode 405ms
     ✓ a recorded ledger commits only the rows the run appended 699ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 566ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 477ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ under --mode=commit counts the squashed paths as something to commit 354ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (113 tests) 39241ms
   ✓ bkit steps done (24)
     ✓ --attempt=next advances with each row, so the next parentSha differs 378ms
     ✓ reports a failed commit with exit 8 without writing the row 1894ms
     ✓ a failed commit leaves no row staged in the index 2151ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 3204ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 2584ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 2681ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 2108ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 2064ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 372ms
   ✓ bkit steps finish (15)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 505ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 365ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 342ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 385ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 450ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 373ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 396ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 492ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 371ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 417ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 560ms
     ✓ writeStepRow refuses when a recorded path changed 695ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 335ms
     ✓ writeStepRow appends its commit sha to the record 435ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 2462ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (9)
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 563ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 352ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 494ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ commits a package.json change outside bkit.workflows 357ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 480ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 6134ms
   ✓ bkit roadmap mirror (8)
     ✓ writes the row in the worktree, then commits and pushes the same row on dev 552ms
     ✓ lands the same docs/roadmap.md bytes on dev as it writes on the branch, a second apart 532ms
     ✓ appends the branch's row byte for byte on dev when dev lacks the feature's earlier rows 632ms
     ✓ never touches the main checkout and never pushes its local dev commits 689ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 557ms
     ✓ a refused dev push is logged, never fails the close 2403ms
     ✓ an unreachable remote is logged, never fails the close 349ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (64 tests) 12818ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 527ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 408ms
     ✓ a new run of the same FID rewrites startSha 683ms
     ✓ a resume of the same FID reuses the record 509ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 400ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 324ms
> [bkit] TRUNCATED HERE — 45 lines omitted. Dropped content was NOT read.
     ✓ treats regex characters in a skill name literally 2588ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 2145ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 2219ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 2167ms
     ✓ runs from the checkout top even when called from a subfolder 2279ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ prMarker writes a FID-only marker with github wired and no issue 903ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1274ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1000ms
     ✓ exits 5 when the open-PR probe errors 870ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 971ms
     ✓ prs open still opens against any other base 766ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 2078ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 2147ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1853ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 2110ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 1102ms
     ✓ runs no merge when the PR is already MERGED 1638ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1692ms
     ✓ prs merge refuses a PR whose base is main 1518ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 2210ms
     ✓ prs merge refuses when the PR base is unknown 1947ms
     ✓ prs merge reads the base from the one pr view it already makes 3173ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 2655ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 1998ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 1791ms
     ✓ never reads dev's required checks without --only-if-required 1801ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 1580ms
     ✓ is not green when a check failed, naming it (exit 1) 1624ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 2201ms
     ✓ is not green on an empty rollup (total 0) 2214ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 2176ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 2275ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 2088ms
> [bkit] TRUNCATED HERE — 805 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 353 lines omitted. Dropped content was NOT read.
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 2286ms
     ✓ is null when pnpm fails or prints something that is not a version 5282ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 64ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (258 tests) 252ms
> [bkit] TRUNCATED HERE — 44 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 136 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 2141ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 2451ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 3317ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 2195ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 1933ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 2246ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 2312ms
     ✓ an unpinned repo reports nulls and asks no registry 3021ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 2414ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 2236ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 1957ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1919ms
> [bkit] TRUNCATED HERE — 62 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 2608ms
     ✓ counts files committed since --base 2816ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 2266ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 2123ms
     ✓ runs the --fallback gate even when no file changed, as it did before 1591ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xbETNy/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xbETNy/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xbETNy/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles a file with only malformed lines without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-cmSHu5/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

 ✓ scripts/harvest/ledgers.test.ts (7 tests) 616ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 26ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 69ms
 ✓ .bkit/core/engine/tools/instructions-coverage.test.ts (24 tests) 1054ms
   ✓ the repo (7)
     ✓ has no coverage findings 707ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (283 tests) 156ms
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

 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 372ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 209ms
 ✓ .bkit/core/engine/audits/templates/context-templates.test.ts (74 tests) 2041ms
   ✓ .bkit/templates/context/ (74)
     ✓ bkit-github.md: github self-skips with no credentials 446ms
     ✓ install copies them into .bkit/templates/context/ 529ms
 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (50 tests) 1066ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 104ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 63ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (41 tests) 69ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 67ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (28 tests | 2 skipped) 34ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (27 tests) 25ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 18ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 79ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 81ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 285ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 16ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 29ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 15ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 76ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 146ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 60ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 58ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 42ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 52ms
 ✓ .bkit/core/engine/commands/workflow/test-blocks.test.ts (14 tests) 345ms
 ✓ .bkit/core/engine/audits/repo/vitest-repo-config-guard.test.ts (12 tests) 1979ms
   ✓ repoConfigFile (3)
     ✓ answers for the cwd, not an inherited GIT_DIR 371ms
   ✓ guardRepoConfig (6)
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 324ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 321ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 43ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 37ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 18ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 52ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 21ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 30ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 31ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 26ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 16ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 18ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 9ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 27ms
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts (171 tests | 1 failed) 98857ms
   ✓ fixture gh stub (10)
     ✓ runs?head_sha=green-capstone returns the captured workflow_runs list 27ms
     ✓ runs/<id>/jobs returns the captured jobs list, --paginate is accepted 26ms
     ✓ runs?head_sha=<unknown> returns total_count 0 (no-run shape) 16ms
     ✓ BKIT_FAKE_GH_API_ERROR=1: every api call exits 1 with stderr 19ms
     ✓ rate_limit returns the requested fixture state 18ms
     ✓ non-api argv exits non-zero (loud on an unmocked boundary) 15ms
     ✓ BKIT_FAKE_RATELIMITED=1: the run list fails rate-limit-shaped, rate_limit still answers 37ms
     ✓ --paginate emits one document per page; --slurp collapses them into an array 59ms
     ✓ rejects a '../'-laden SHA (no path traversal out of the runs dir) 16ms
     ✓ pr view is keyed by --repo; without it the checkout fixture is read 107ms
   ✓ bkit runs gate (68)
     ✓ accepts a green capstone at the head (exit 0) and says so 70ms
     ✓ rejects a failed run (12) 39ms
     ✓ rejects no run at the head (10) 28ms
     ✓ rejects runs that have not completed (11) 29ms
     ✓ rejects a green run at a superseded head (14), given --branch 36ms
     ✓ --fetch refreshes origin/<branch> before gating 231ms
     ✓ --fetch needs --branch (2) 1ms
     ✓ without --branch a superseded head is 10, not 14 (no invented attribution) 21ms
     ✓ rejects a run without the capstone job (13) 43ms
     ✓ rejects a cancelled run (15) 23ms
     ✓ rejects a green run whose capstone concluded 'cancelled' (12) 57ms
     ✓ rejects a green run whose capstone concluded 'skipped' (12) 41ms
     ✓ rejects a green run whose capstone concluded 'timed_out' (12) 40ms
     ✓ rejects a green run whose capstone concluded 'neutral' (12) 41ms
     ✓ rejects a green run whose capstone concluded 'action_required' (12) 37ms
     ✓ rejects a green run whose capstone concluded 'stale' (12) 40ms
     ✓ rejects a green run whose capstone concluded 'startup_failure' (12) 62ms
     ✓ exit 12 failed steps (10)
       ✓ a stale register alone is regenerable; the capstone is left out 42ms
       ✓ both floor steps failing is regenerable 45ms
       ✓ any failed step off the list makes the whole result unregenerable 37ms
       ✓ a job that concluded 'failure' with no failed step is {job}/ and unregenerable 34ms
       ✓ a job that concluded 'timed_out' with no failed step is {job}/ and unregenerable 44ms
       ✓ a job that concluded 'cancelled' with no failed step is {job}/ and unregenerable 33ms
       ✓ a timed-out step counts as failed 33ms
       ✓ bkit.testing.ciGenerated adds steps to the floor 60ms
       ✓ a step name alone does not match a {job}/{step} entry in another job 35ms
       ✓ refusals other than a failed run carry no failed steps 17ms
     ✓ --repo scopes --pr resolution (2)
       ✓ reads the head from the named repo, not the checkout's own PR 47ms
       ✓ logs the disagreement when the resolved repo differs from --repo 31ms
     ✓ skipped lanes (16 is opt-in) (5)
       ✓ a skipped lane alone does not refuse — the capstone's green settles it — but is reported 33ms
       ✓ refuses a skipped lane named in bkit.testing.ciRequired (16) 39ms
       ✓ a required lane naming a different lane does not refuse 45ms
       ✓ refuses when any of several required lanes was skipped 39ms
       ✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 32ms
     ✓ a newer in-flight re-dispatch does not mask a completed green at the head 30ms
     ✓ tells an API error (20) from no run (10) 59ms
     ✓ shapes a rate-limit refusal from rate_limit (20) 26ms
     ✓ stderr noise on a successful gh call does not corrupt the JSON read 37ms
     ✓ an unparseable jobs response is an API error (20), not a missing capstone (13) 34ms
     ✓ gh missing from PATH exits 80 (use the MCP fallback), not an API error 2ms
     ✓ BKIT_SHIP_GATE_OVERRIDE (4)
       ✓ pinned to the refused head turns the refusal into 0 and appends the audit row 35ms
       ✓ a different SHA is ignored — the refusal stands 33ms
       ✓ honoured with no status file (no crash), the row goes to stderr 37ms
       ✓ an unwritable status file still exits 0 and emits the row to stderr (never invisible) 44ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 92ms
       ✓ bkit.testing.ciRequired resolves from package.json 46ms
       ✓ absent ciRequired means no refusal 43ms
       ✓ a malformed ciRequired falls back to none, never crashes 37ms
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 71ms
     ✓ missing --head is a usage error (2) 1ms
     ✓ an empty --head= is a usage error (2), not a gate refusal 6ms
     ✓ --event (5)
       ✓ --event push ignores a pull_request run: no push run is 10, not 11 20ms
       ✓ without --event the in-flight pull_request run reads as in progress (11) 19ms
       ✓ --event push selects the green push run beside an in-flight pull_request run 40ms
       ✓ --event push reds on a failed push run even when a newer pull_request run is green 37ms
       ✓ without --event the newer green pull_request run masks the failed push run 40ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 76ms
       ✓ a run still in progress whose capstone already passed passes 67ms
       ✓ a capstone still running is in progress (11) 46ms
       ✓ a failed capstone fails (12) even when every other job passed 47ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 84ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 82ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 241ms
       ✓ a source change past the validated head refuses (17) and names the path 182ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 225ms
       ✓ --validated equal to --head is the plain head check 53ms
       ✓ --validated without --month / --fid is a usage error (2) 163ms
       ✓ a validated sha that is not an ancestor refuses (17) 182ms
   ✓ bkit runs mirror (18)
     ✓ green push run capstone -> 0 1ms
     ✓ waits through in-progress polls, then mirrors green 0ms
     ✓ waits through in-progress polls, then mirrors red (1) 0ms
     ✓ gate 12 (red) -> 1 with the gate's reason 0ms
     ✓ gate 15 (cancelled) -> 1 with the gate's reason 0ms
     ✓ gate 13 (capstone absent) -> 1 with the gate's reason 0ms
     ✓ gate 16 (required lane skipped) -> 1 with the gate's reason 0ms
     ✓ gate 7 (unknown gate exit (never a pass)) -> 1 with the gate's reason 0ms
     ✓ no push run past the absent window -> 3 naming [skip ci]; a superseded answer (14) counts as absent 0ms
     ✓ no push run yet inside the absent window keeps waiting 0ms
     ✓ still in progress at --max-minutes -> 4 0ms
     ✓ two API errors are retried; the third in a row -> 20 0ms
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 900ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 913ms
     ✓ e2e: green push run beside the PR's own in-flight run -> 0 38ms
     ✓ e2e: a red push run is not masked by a newer green PR run -> 1 27ms
     ✓ e2e: only the PR's own run exists -> absent, not in progress (3) 24ms
     ✓ usage: missing --head or a non-numeric minute value exits 2 1ms
   ✓ bkit runs wait (10)
     ✓ the dispatch probe matches the capstone's lane namespace, case-insensitive, by name or context 0ms
     ✓ is bounded: ceil(budget / interval) attempts, no sleep after the last 1ms
     ✓ found stops polling; every poll erroring is err with allErrored 0ms
     ✓ a sleep that overruns its window is blocked: hand the poll to the agent 0ms
     ✓ PR completed = no open checks; run targets are head-anchored 0ms
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 2511ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 832ms
     ✓ CLI: a failed gh workflow run exits 5 954ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 2021ms
     ✓ CLI: usage errors exit 2 7ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 196ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 676ms
     ✓ a failed re-trigger push names the cause in the log 2035ms
     ✓ a failed re-trigger push leaves no orphan commit behind 2403ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 647ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 489ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 361ms
     ✓ gh-error: every poll errored 215ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 408ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 378ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 455ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 370ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 258ms
     ✓ CLI: verdict JSON, body scan, exit codes 2041ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 2128ms
     ✓ CLI: --poll-result is validated, --attempts needs it 150ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 2176ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 1023ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 1072ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 914ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 305ms
     ✓ re-trigger on dev only uses the record of its own FID 420ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 614ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 564ms
   ✓ bkit runs declared (2)
     ✓ exit 0 when .github/workflows/<bkit.testing.ciWorkflow> exists, 1 when not 54ms
     ✓ the default bkit-ci.yml counts when no bkit.testing.ciWorkflow is configured 26ms
   ✓ scanBody (8)
     ✓ flags [skip ci] inherited into the landed commit body 99ms
     ✓ flags [ci skip] inherited into the landed commit body 82ms
     ✓ flags [no ci] inherited into the landed commit body 75ms
     ✓ flags [skip actions] inherited into the landed commit body 67ms
     ✓ flags [actions skip] inherited into the landed commit body 80ms
     ✓ flags [SKIP CI] inherited into the landed commit body 65ms
     ✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 119ms
     ✓ an empty or unreadable sha is an error, not a clean result 159ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 1711ms
     ✓ --pr refuses a title carrying a skip token (18) and --record writes the refusal row 2259ms
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 2413ms
     ✓ --snapshot scopes its run list and dev lookups to --repo 3312ms
     ✓ --snapshot without --repo leaves its run list unscoped 2184ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 2452ms
     ✓ a refused capstone records FAIL with its reason 1908ms
     ✓ an unreadable PR is an API error (20) with no head 1796ms
     ✓ takes exactly one of --head, --pr, --squash-of 9ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 1747ms
       ✓ without --repo no call gains a --repo flag 1721ms
       ✓ repoScopedGh appends --repo to workflow run, leaves gh api alone, and is a no-op without a repo 0ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 1154ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 3237ms
     ✓ refuses an unknown --reason 384ms
   ❯ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 1712ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 3210ms
     ✓ ref uppercases a Linear or Jira key 0ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 2305ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 2912ms
     ✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 2009ms
     ✓ CI_DEV refuses the slug "a/b" (exit 9) 2213ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 2522ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 2394ms
     × CI refuses a PR that is not open (7) and a head with no CI run (8) 5499ms
     ✓ an unknown phase exits 3; gh needing auth exits 80 2024ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 4213ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1932ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 2169ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 2230ms
     ✓ --file and --step go together 1800ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 22ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (7 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 31ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (5 tests) 762ms
   ✓ catalog parity — retired plan agents (1)
     ✓ removed plan agents absent 756ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 14ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 6ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 6ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 9ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 84ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 21ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 5566ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 5555ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 6ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 20ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 79ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 12ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 5ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 29ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 9ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 14922ms
   ✓ gateguard opencode plugin — advisory mode (default) (7)
     ✓ emits reuse checklist on first write to a NEW (nonexistent) file 578ms
     ✓ keeps the reuse checklist when the write CREATES the file (pre-write snapshot) 368ms
     ✓ warns again for a different file in the same session 472ms
   ✓ gateguard opencode plugin — deny mode (2)
     ✓ allows retry (second call is a no-op after dedup marked) 311ms
   ✓ gateguard opencode plugin — gate-config advisory (9)
     ✓ flags eslint.config.mjs as gate config 316ms
     ✓ flags .vale.ini as gate config 414ms
     ✓ flags .lintstagedrc.json as gate config 310ms
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 385ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 873ms
     ✓ patch (v1 driver): checks every Add / Update / Move-to / Delete target 1003ms
     ✓ apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target 972ms
     ✓ apply_patch (v1 driver): checks every Add / Update / Move-to / Delete target 960ms
     ✓ deny mode blocks when any patch target is a first touch, and records all of them 877ms
     ✓ deny mode still blocks when only one of several patch targets is new to the session 455ms
   ✓ dual driver shape (OpenCode 1.x server() + 2.0 setup()) (6)
     ✓ both drivers emit the same advisory for the same edit 489ms
     ✓ V1 driver reads the real 1.x arg key `filePath` 301ms
     ✓ deny mode blocks the first touch on BOTH drivers 611ms
 ✓ .bkit/core/engine/audits/repo/resolve-push-base.test.ts (17 tests) 16287ms
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 3334ms
       ✓ falls back to event.before when gh prints unparseable output 1427ms
       ✓ reports last-green-run as the source when the green head is an ancestor 3150ms
       ✓ CI mode: falls back to event.before and says so when the run list is unreadable 1426ms
       ✓ local mode (3)
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 2132ms
         ✓ tests ancestry against --head, not HEAD 2438ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 2370ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 18034ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 2202ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 1819ms
     ✓ resolves config from the repo root when run from a subdirectory 1548ms
     ✓ exits 6 when the PUT fails 1484ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1550ms
   ✓ bkit setup protect-main — pre-flight (6)
     ✓ exits 4 when the CI workflow file is missing, before any write 1360ms
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 1214ms
     ✓ asks a human to log in when gh is not authenticated 1049ms
     ✓ exits 3 when gh repo view names no repository 1072ms
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 1035ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 1364ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 1048ms
     ✓ exits 6 when the api answer is not JSON 1194ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 15866ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 8169ms
     ✓ every fence parses under zsh -n 7605ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (224 tests) 155230ms
   ✓ branches rebase: behaviour (19)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 452ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1576ms
     ✓ produces byte-identical output to merge=union 490ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 311ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 377ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 319ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1293ms
     ✓ refuses a lockfile whose regenerate command fails 1328ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 382ms
     ✓ resolves a conflict in each of two replayed commits across rounds 344ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ runs (0) with the landed path count once dev moved 551ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 417ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 372ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1322ms
     ✓ runs exactly one git push 2389ms
     ✓ --set-upstream records the upstream 344ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 654ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 972ms
     ✓ --require-ci pushes as-is when dev has not moved 522ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1047ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1232ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 381ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 2615ms
     ✓ --mode=abort pushes when the branch has no open PR 2118ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 2077ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 327ms
     ✓ --open-pr carries the MCP answer and skips gh 466ms
     ✓ --mode=abort on dev pushes plainly without probing 554ms
     ✓ rejects an unknown mode 303ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 828ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 613ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 841ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4219ms
     ✓ skip-ci HEAD on the replay is refused 458ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 762ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 4228ms
     ✓ a level local dev is a plain push, recording nothing extra 738ms
     ✓ a record with no commits pushes nothing 430ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 2854ms
     ✓ a rewritten branch is refused, never forced 346ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 686ms
     ✓ refuses a detached HEAD (exit 5) 311ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 616ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 634ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 642ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 739ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 328ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 833ms
     ✓ an up-to-date branch is a no-op 565ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 995ms
     ✓ a fetch that fails exits 10 414ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 593ms
     ✓ --paths with no match exits 1 594ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 487ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 942ms
     ✓ --marker reads a diff over 1 MiB 793ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 839ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 569ms
     ✓ scan-diff finds an added skip 665ms
     ✓ scan-diff ignores a skip predating the base 464ms
     ✓ scan-diff reports a disabled test with its line 679ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 588ms
     ✓ scan-diff ignores a removed comment in a test file 544ms
     ✓ scan-diff ignores an assertion moved within the file 535ms
     ✓ scan-diff still reports a removed assertion 598ms
     ✓ scan-diff reports an assertion re-added only outside the test file 527ms
     ✓ scan-diff finds an added pytest mark skip 612ms
     ✓ scan-diff finds an added unittest skip 497ms
     ✓ scan-diff finds an added bare skip call 436ms
     ✓ scan-diff ignores a quoted skip in a documentation file 415ms
     ✓ scan-diff ignores a marker literal in a non-test source file 374ms
     ✓ scan-diff ignores an assertion whose expectation changed 423ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 343ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 3454ms
     ✓ a title that already carries the marker is left alone 2497ms
     ✓ with no open PR: pushes the marker commit and edits no title 2434ms
     ✓ a re-run is deduped: no second marker commit 3458ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 3748ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 306ms
     ✓ --title-set skips gh entirely 460ms
   ✓ branches sync (24)
     ✓ Path A when origin/dev is an ancestor of HEAD 522ms
     ✓ Path B once dev moved; --head checks a given commit 799ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 841ms
     ✓ --merge-docs merges dev when docs/ is behind 944ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 1097ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 2340ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1915ms
     ✓ --merge-docs skips an empty bkit:generate script 1513ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1335ms
     ✓ --merge-docs never merges on dev itself 1004ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1489ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1321ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 1172ms
     ✓ --merge merges dev into the feature branch with a skip-ci merge commit, never a rebase 1443ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 751ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1261ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 2422ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1435ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1727ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output with skip ci 1914ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 871ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 644ms
     ✓ exits 10 when the fetch fails 395ms
     ✓ refuses --merge-docs with --head, and an unknown --head 455ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 793ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1709ms
     ✓ a failed install stops ship (16) 1311ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 739ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 762ms
     ✓ exits 10 when the fetch fails 589ms
   ✓ branches land (27)
     ✓ refuses a workflow other than design or plan 336ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 408ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1399ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1393ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1398ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1417ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2994ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 3182ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 742ms
     ✓ local: names unpushed dev as the cause when the branch carries it 881ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 1083ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1883ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1754ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1476ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1459ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1781ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1568ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 787ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 787ms
     ✓ land removes the worktree when only the copied .env is untracked 631ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 656ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 616ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1242ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 627ms
     ✓ landPr refuses a main-based PR without retrying 575ms
     ✓ landPr refuses when the PR base is unknown 495ms
     ✓ PR not open (closed): stops (17) at once, no retry 587ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 534ms
     ✓ --attempt names the merge round in a fix commit 485ms
     ✓ commits a rewritten and a deleted tracked file 672ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 852ms
     ✓ reports undeclared and runs nothing with no scripts 300ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 560ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 546ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs context > CI refuses a PR that is not open (7) and a head with no CI run (8)
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:2229:3
    2227|   });
    2228|
    2229|   it("CI refuses a PR that is not open (7) and a head with no CI run (…
       |   ^
    2230|     const cwd = autoRepo();
    2231|     fakeGhBin({ "pr-view": prJson({ state: "MERGED" }) });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 164 passed (165)
      Tests  1 failed | 6974 passed | 2 skipped (6977)
   Start at  08:01:10
   Duration  156.51s (tests 97%, transform 1%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/825-show-progress-bar/build-group-gate-1-3.log.reports/vitest-9434.xml
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.75 |    82.73 |   94.98 |   91.06 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   90.78 |     85.8 |      95 |   94.61 |                   
  auth.ts          |   98.46 |    98.11 |     100 |   97.95 | 69                
  ci-yml.ts        |   90.54 |    82.68 |     100 |   92.83 | ...09,422-424,435 
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
 engine/commands   |    90.1 |    84.32 |    92.9 |   90.71 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   97.46 |    91.11 |     100 |     100 | 87-91,156,162     
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   94.13 |    88.53 |   96.87 |   97.08 | ...03,439,490-493 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   80.95 |    68.75 |   71.42 |      80 | ...18-231,257-258 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   96.49 |    86.95 |   87.27 |   97.42 |                   
  ci.ts            |   97.71 |    86.32 |   94.73 |   98.88 | 268,686,835       
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
 ...mmands/install |    47.9 |    45.74 |   59.49 |   48.26 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |      20 |     26.5 |      50 |   17.77 | ...42-146,217-613 
  uninstall.ts     |   67.79 |    64.46 |      70 |   68.92 | ...1101,1124-1291 
  upgrade.ts       |   32.45 |    30.88 |   35.71 |   33.57 | 350-378,560-1064  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   92.52 |    84.16 |   96.33 |   94.03 |                   
  branches.ts      |   89.58 |     82.9 |   97.74 |   90.97 | ...2550,2555,2580 
  challenge.ts     |   96.59 |    83.03 |     100 |      98 | 178,368-370,652   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.44 |    87.14 |   98.03 |   97.34 | ...1661,1834,1924 
  counters.ts      |   98.28 |    93.96 |     100 |   98.72 | 217,516           
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
  runs.ts          |   92.99 |    84.18 |     100 |   94.42 | ...1943,1975-1979 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...55,304,324-329 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   97.39 |    95.19 |     100 |    98.7 | 117,228,468       
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 245,356           
  steps.ts         |   89.18 |    82.21 |   90.19 |   90.32 | ...1860,1865,1867 
  summary.ts       |   95.06 |    86.69 |   91.66 |   93.82 | ...99,407-413,441 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.39 |    88.23 |   96.55 |   96.61 | 23-24,235-236     
  tests-changed.ts |    93.1 |       75 |     100 |   94.23 | 64-65,68          
  tests.ts         |   97.03 |    88.99 |   97.25 |   98.21 | ...2176,2272-2274 
  tracker.ts       |   92.89 |    73.23 |     100 |   96.73 | ...36,848,931,979 
  workflows.ts     |   93.39 |    82.52 |   97.29 |   95.04 | ...1750,1924,2647 
  worktrees.ts     |   59.49 |     56.7 |   64.81 |   60.25 | ...1074,1077-1078 
 engine/install    |   93.17 |    84.64 |   94.15 |   95.96 |                   
  cloud-env.ts     |    96.9 |     91.3 |     100 |   99.64 | 223               
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,293            
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
Statements   : 89.75% ( 17462/19456 )
Branches     : 82.73% ( 12428/15021 )
Functions    : 94.98% ( 2842/2992 )
Lines        : 91.06% ( 15264/16762 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1591 of 3155 lines (112 KB of 241 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
