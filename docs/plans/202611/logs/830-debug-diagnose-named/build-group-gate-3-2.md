
> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/165 files need formatting

> @cbartens/bkit@6.0.0 lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


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
 997:108   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1101:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1262:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1320:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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

> @cbartens/bkit@6.0.0 slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> bkit ci slop

[bkit-ci] base a015745a20e10e656fea4befa25274614060df94 (a015745a20e10e656fea4befa25274614060df94) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: a015745a20e10e656fea4befa25274614060df94
base: a015745a20e10e656fea4befa25274614060df94
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (111 tests) 17099ms
   ✓ bkit steps done (24)
     ✓ reports a failed commit with exit 8 without writing the row 2599ms
     ✓ a failed commit leaves no row staged in the index 1017ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 995ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 769ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1011ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 690ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 795ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 970ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (9)
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 309ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 336ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 22510ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 1045ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 1842ms
     ✓ CI=true -> GITHUB_ACTION 1634ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 986ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 673ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 697ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 912ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 689ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 815ms
     ✓ LOCAL -> runtimeHeadless=false 790ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 902ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 894ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 602ms
     ✓ UNKNOWN -> runtimeHeadless=false 610ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 520ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 702ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 812ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 494ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 415ms
     ✓ re-derives per call: one run's answer does not leak into the next 661ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 593ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 899ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1178ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1200ms
     ✓ --file into a missing directory is refused, not created 1520ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (60 tests) 26148ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1543ms
     ✓ names each net-new and worsened finding in the log and the JSON 2302ms
     ✓ fails on a net score rise with no net count change 1005ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 991ms
     ✓ treats a net score at or below 0.001 as float noise 778ms
     ✓ passes when the change only resolves findings 1015ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 693ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 919ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 901ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 896ms
     ✓ exits 4 on a dropped net field instead of silently passing 891ms
     ✓ exits 4 on no summary instead of silently passing 600ms
     ✓ exits 4 on output that is not JSON instead of silently passing 623ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 713ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 329ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 325ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 369ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 358ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1260ms
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 719ms
     ✓ fails (exit 1) when vale reports alerts 1097ms
     ✓ exits 6 on a vale runtime error 1191ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1187ms
     ✓ falls back to vale sync when the main worktree has none 1193ms
     ✓ fails when vale sync cannot restore the required styles 1530ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 30843ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 1963ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 1726ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 1008ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 987ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 784ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 944ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 730ms
     ✓ counts commits behind origin/dev and the divergence age 868ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 782ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 966ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 533ms
     ✓ from a worktree, still names the main checkout and its outbox 905ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 638ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 583ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 703ms
     ✓ prints the Jira site and project under jira 823ms
     ✓ prints the board under github 408ms
     ✓ prints the github progress and review states, defaults for a key left unset 517ms
     ✓ prints the linear progress and review states, defaults for a key left unset 723ms
     ✓ prints the jira progress and review states, defaults for a key left unset 601ms
     ✓ prints the linear progress and review states, defaults for a key left unset 891ms
     ✓ prints null progress and review states under none 1198ms
     ✓ prints buildPublishRemote and buildPublishLocal 1191ms
     ✓ prints the publish defaults when package.json omits them 1529ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 1613ms
     ✓ prints nulls under github without a board, and for keys left unset 941ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 909ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 613ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 713ms
     ✓ an unpinned repo reports nulls and asks no registry 943ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 497ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 797ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 635ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 841ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (152 tests) 31261ms
   ✓ bkit workflows handover (23)
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 383ms
     ✓ --flush carries the named worktree's logs into the dev commit 382ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 1186ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 485ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 616ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 500ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 618ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 452ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 468ms
     ✓ --push on dev never carries a row whose references name another feature 533ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 526ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 1000ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1386ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 407ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 317ms
     ✓ a close that landed releases the lock 373ms
     ✓ removes the worktree before it releases the lock 404ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3456ms
       ✓ closePr refuses when the PR base is unknown 2251ms
     ✓ leaves a worktree no workflow created, and its branch, in place 515ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 358ms
     ✓ record is present after workflows close and before the push 324ms
     ✓ failed handover from dev removes the record and keeps recorded paths 508ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (56 tests) 19513ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 1259ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 1190ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 888ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1523ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1529ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 815ms
     ✓ fetches the issue and its comments as GitHub returns them 845ms
   ✓ postCommentOnce (4)
     ✓ records an engine-action row and skips the same key + body on a re-run 490ms
     ✓ a recent identical comment counts as done (the final close comment) 696ms
     ✓ a failed post reports done false with the reason and never leaks a token 941ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 567ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 700ms
     ✓ a board the token cannot see is scope 696ms
     ✓ an HTTP 403 from gh is scope 850ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 1298ms
     ✓ github: no block, no blockers and no further reads 1422ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 956ms
     ✓ a different marker hash posts 1159ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 807ms
(node:12554) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:12554) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:12554) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:12554) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:12554) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:12554) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:12554) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (29 tests) 13021ms
   ✓ shipped copy-and-own test files (5)
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 12445ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (96 tests) 18404ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 10599ms
     ✓ sync has nothing left to rewrite 5968ms
     ✓ every clause reaches the cut-off of one surface it applies to 615ms
   ✓ fully retired clauses (6)
     ✓ output-cap's sentence stays inline in the abort handover prompt 968ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (138 tests) 43609ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 663ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1655ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 1950ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 984ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 670ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 603ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 922ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 672ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 685ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 796ms
     ✓ PASS is 0 failures with or without reports 617ms
     ✓ clears a previous attempt's reports before the gate runs 678ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 898ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 636ms
     ✓ a log under the outbox is named main-checkout relative in the record 611ms
     ✓ a log small enough is copied whole: not clamped, raw null 486ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 702ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 820ms
     ✓ numbers runs within the workflow's active run and per step 518ms
     ✓ without --file no row is written and the output carries row null 393ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1095ms
     ✓ a planned test that passes is a vacuous gap, exit 1 1182ms
     ✓ a planned test absent from a loaded report is a missing gap 1222ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1215ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1545ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 743ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 1094ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 714ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 976ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 473ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 880ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 801ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 878ms
     ✓ green: a passed-accepted test is already landed, not a gap 1238ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1439ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 928ms
     ✓ green: --group audits only that group's tasks 839ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1125ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1290ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1547ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1398ms
     ✓ green: lists each gap kind, with the runner output 1004ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1483ms
 ✓ .bkit/core/engine/audits/repo/resolve-push-base.test.ts (17 tests) 14481ms
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 2297ms
       ✓ falls back to event.before when gh prints unparseable output 1355ms
       ✓ reports last-green-run as the source when the green head is an ancestor 2031ms
       ✓ CI mode: falls back to event.before and says so when the run list is unreadable 1296ms
       ✓ local mode (3)
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 2849ms
         ✓ tests ancestry against --head, not HEAD 2497ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 2152ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 6213ms
 ✓ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests) 9534ms
   ✓ bkit skills prune (10)
     ✓ uninstalls unlisted skills from the union of folders and lock keys, never bkit-* 1357ms
     ✓ matches whole names only: a listed name inside a longer one does not keep it 1522ms
     ✓ treats regex characters in a skill name literally 1380ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 1131ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 1260ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 915ms
     ✓ runs from the checkout top even when called from a subfolder 1139ms
     ✓ keeps bkit-* skills, from folders or the lock, even when .agents/skills.md does not list them 809ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 15678ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 1639ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 1144ms
     ✓ resolves config from the repo root when run from a subdirectory 839ms
     ✓ exits 6 when the PUT fails 1401ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1019ms
   ✓ bkit setup protect-main — pre-flight (6)
     ✓ exits 4 when the CI workflow file is missing, before any write 1832ms
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 1058ms
     ✓ asks a human to log in when gh is not authenticated 1333ms
     ✓ exits 3 when gh repo view names no repository 1165ms
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 1224ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 929ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 1121ms
     ✓ exits 6 when the api answer is not JSON 943ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (65 tests) 7066ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ a new run of the same FID rewrites startSha 333ms
     ✓ a resume of the same FID reuses the record 330ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 314ms
     ✓ a stale record without a lock is replaced 312ms
   ✓ bkit worktrees remove (12)
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 301ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 309ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 48924ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 445ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1881ms
     ✓ always writes the marker, even with no plan 2103ms
     ✓ writes the linear marker shape, taking the tracker from package.json 564ms
     ✓ writes the jira marker shape, taking the tracker from package.json 985ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 788ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 854ms
     ✓ retries a failed create once, and exits 5 when it fails twice 611ms
     ✓ exits 5 when the open-PR probe errors 854ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 853ms
     ✓ prs open still opens against any other base 879ms
     ✓ exits 6 when the created PR's base is not --base 904ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 599ms
     ✓ exits 1 with found=false when there is none 608ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 425ms
     ✓ --number reads one PR, mergeable included 791ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 747ms
     ✓ exits 4 when gh errors and 80 when it needs auth 530ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 520ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 940ms
     ✓ drops the force-build marker from the title subject 1154ms
     ✓ takes an explicit --subject 1189ms
     ✓ runs no merge when the PR is already MERGED 1522ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1659ms
     ✓ prs merge refuses a PR whose base is main 763ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 942ms
     ✓ prs merge refuses when the PR base is unknown 700ms
     ✓ prs merge reads the base from the one pr view it already makes 723ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 962ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 490ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 697ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 731ms
     ✓ never reads dev's required checks without --only-if-required 808ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 755ms
     ✓ updates when a dev ruleset requires status checks 1361ms
     ✓ updates when dev's branch protection requires status checks 1356ms
     ✓ ignores dev rulesets that require no checks 840ms
     ✓ updates when the repo cannot be resolved 1399ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 1026ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 1732ms
     ✓ is not green when a check failed, naming it (exit 1) 1158ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 1338ms
     ✓ is not green on an empty rollup (total 0) 1177ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 1216ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1001ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 1078ms
     ✓ is a no-op when the title already says so 907ms
     ✓ strips the marker, with or without its bkit prefix 691ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 841ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 2104ms
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 659ms
     ✓ is null when pnpm fails or prints something that is not a version 1420ms
 ✓ .bkit/core/engine/commands/land.test.ts (30 tests) 7791ms
   ✓ pushToDev (16)
     ✓ lands the commit on origin/dev and leaves the main checkout alone 300ms
     ✓ dev moved: rebuilds on the new dev and pushes again 446ms
     ✓ dev moved before every push: exhausted, nothing landed 798ms
     ✓ any other refusal is returned, not retried 1004ms
     ✓ pushToDev replays a commit range onto origin/dev 429ms
     ✓ a replay retries on the new dev when dev moved 568ms
     ✓ pushToDev log line names what it lands 332ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 388ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 743ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 934ms
     ✓ lands from a clone whose fetch refspec omits dev 524ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 3361ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 572ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 3600ms
   ✓ bkit roadmap mirror (8)
     ✓ writes the row in the worktree, then commits and pushes the same row on dev 430ms
     ✓ lands the same docs/roadmap.md bytes on dev as it writes on the branch, a second apart 491ms
     ✓ appends the branch's row byte for byte on dev when dev lacks the feature's earlier rows 437ms
     ✓ never touches the main checkout and never pushes its local dev commits 496ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 431ms
     ✓ a refused dev push is logged, never fails the close 733ms
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (11 tests) 3775ms
   ✓ tests changed (9)
     ✓ runs bkit:gate:changed with the changed files as its arguments 621ms
     ✓ counts files committed since --base 428ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 412ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 804ms
     ✓ runs the --fallback gate even when no file changed, as it did before 542ms
     ✓ exits 4 when the gate could not run 323ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 7882ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 426ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 6935ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 477ms
     ✓ patch (v1 driver): checks every Add / Update / Move-to / Delete target 432ms
     ✓ apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target 468ms
     ✓ apply_patch (v1 driver): checks every Add / Update / Move-to / Delete target 492ms
     ✓ deny mode blocks when any patch target is a first touch, and records all of them 385ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (38 tests) 2496ms
   ✓ bkit disk prune — lock (9)
     ✓ renews its lock while a long step runs, so a waiter never takes it over 453ms
 ✓ .bkit/core/engine/audits/repo/vitest-repo-config-guard.test.ts (12 tests) 849ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 9005ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 4382ms
     ✓ every fence parses under zsh -n 4576ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (37 tests) 1677ms
   ✓ bkit challenge gate (5)
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 482ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (20 tests) 996ms
 ❯ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests | 1 failed) 3173ms
   ❯ JSON.parse inside a try statement belongs to shared/json.ts (4)
     × no engine source parses JSON inside its own try 3166ms
     ✓ CONTROL — the owner's own parse is found, so the scan is not vacuous 4ms
     ✓ CONTROL — a parse in the try block, the catch block or a closure inside the try is found 1ms
     ✓ CONTROL — an unguarded parse and a parseJson inside a try are not found 0ms
 ✓ .bkit/core/engine/commands/lib.test.ts (69 tests) 1521ms
   ✓ runGit / runTool output limit (5)
     ✓ runGit names ENOBUFS when output passes the limit 552ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 461ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (19 tests) 1336ms
 ✓ .bkit/core/engine/audits/templates/context-github-ci-block.test.ts (4 tests) 2980ms
   ✓ GitHub selected-evidence context blocks (4)
     ✓ fetches pinned attempts without branch discovery and filters unpinned discovery 1035ms
     ✓ emits complete receipts only after all selected job logs succeed 1333ms
     ✓ ends pinned diffs at selected commits with ancestral same-workflow baselines 609ms
 ✓ .bkit/core/engine/audits/templates/context-templates.test.ts (74 tests) 689ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 1181ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 5190ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 322ms
     ✓ keeps each context's own section banner and drops every other context's 869ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (42 tests) 959ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (70 tests) 998ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (75 tests) 745ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (31 tests) 932ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (58 tests) 833ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 1474ms
   ✓ selected CI context evidence (3)
     ✓ accepts only matching complete CI receipts with nonempty logs 556ms
 ✓ .bkit/core/engine/checks/tips/index.test.ts (28 tests) 514ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (24 tests) 633ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > repeat harvest of same rows does not duplicate (idempotent)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/consumer-app/.bkit/stats.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/consumer-app/.bkit/friction.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/consumer-app/.bkit/friction.jsonl — pruned 1 harvested row(s)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 1, kept in repos: 0
[bkit-harvest] 1 row(s) now exist ONLY in harvest/ (gitignored, not backed up by bkit).
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/consumer-app/.bkit/stats.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/consumer-app/.bkit/friction.jsonl — copied 0 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-W3d6RO/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 1, entities after fold: 2, pruned from repos: 0, kept in repos: 0

stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > rows with different identity keys are preserved (not over-deduped)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qqNp5f/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qqNp5f/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qqNp5f/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qqNp5f/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qqNp5f/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qqNp5f/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qqNp5f/consumer-app/.bkit/stats.jsonl — copied 2 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qqNp5f/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qqNp5f/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qqNp5f/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 0, kept in repos: 0

stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > store keeps both same-key rows; the fold reads the later one (higher ts)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yniobz/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yniobz/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yniobz/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yniobz/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yniobz/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yniobz/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yniobz/consumer-app/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yniobz/consumer-app/.bkit/friction.jsonl — copied 2 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yniobz/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yniobz/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yniobz/consumer-app/.bkit/friction.jsonl — pruned 2 harvested row(s)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 1, pruned from repos: 2, kept in repos: 0
[bkit-harvest] 2 row(s) now exist ONLY in harvest/ (gitignored, not backed up by bkit).

 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (50 tests) 534ms
stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > skips a half-written trailing line without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-m5ebxK/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-m5ebxK/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-m5ebxK/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-m5ebxK/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-m5ebxK/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-m5ebxK/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-m5ebxK/consumer-app/.bkit/stats.jsonl — copied 2 rows (malformed: 1)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-m5ebxK/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-m5ebxK/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-m5ebxK/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-m5ebxK/consumer-app/.bkit/stats.jsonl — kept 1 line(s) not in the store (malformed, or appended after the copy)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 0, kept in repos: 1

stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles entirely empty .jsonl file without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-maGdAu/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-maGdAu/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-maGdAu/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-maGdAu/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-maGdAu/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-maGdAu/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-maGdAu/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-maGdAu/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-maGdAu/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-maGdAu/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles a file with only malformed lines without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RuP7jn/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (25 tests) 540ms
   ✓ retired lite labels (2)
     ✓ the clause store holds no lite text 486ms
 ✓ scripts/harvest/ledgers.test.ts (7 tests) 358ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (5 tests) 412ms
   ✓ catalog parity — retired plan agents (1)
     ✓ removed plan agents absent 407ms
 ✓ .bkit/core/engine/tools/instructions-coverage.test.ts (24 tests) 638ms
   ✓ the repo (7)
     ✓ has no coverage findings 468ms
 ✓ .bkit/core/engine/audits/templates/template-ci-yml.test.ts (16 tests) 374ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 114ms
 ✓ .bkit/core/engine/commands/workflow/test-blocks.test.ts (14 tests) 179ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (292 tests) 304ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 626ms
   ✓ shipped hook templates (5)
     ✓ every generated hook parses: node --check for JS, bash -n for shell 605ms
 ✓ .bkit/core/engine/ledgers/journal.test.ts (15 tests) 221ms
stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing
[bkit-install] Wrote .bkit/advisories.md (1 item).

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > overwrites an existing artifact on each call
[bkit-install] Wrote .bkit/advisories.md (0 items).

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

 ✓ .bkit/core/engine/audits/workflows/question-option-format.test.ts (22 tests) 193ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (60 tests) 235ms
 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 181ms
 ✓ .bkit/core/engine/checks/after/index.test.ts (53 tests) 183ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 55ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (258 tests) 175ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 309ms
stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > strips only the managed blocks of .agents/context.md and .agents/skills.md, marker included
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
[bkit-uninstall-test] strip-block: .agents/context.md
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] strip-block: .agents/skills.md
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

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > strips a managed lite.md block and keeps the consumer section
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
[bkit-uninstall-test] strip-block: .bkit/lite.md
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

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > docs/ > strips bkit's block, managed marker included, from docs/*.md and keeps the consumer's content
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
[bkit-uninstall-test] delete (empty after strip): docs/security.md
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] strip-block: docs/testing.md

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > docs/ > deletes the owned docs/templates/bkit-*.md and keeps the consumer's own templates
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
[bkit-uninstall-test] delete: docs/templates/bkit-audit-security.md
[bkit-uninstall-test] delete: docs/templates/bkit-plan.md

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > docs/ > prunes docs/templates when only bkit's files were in it
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
[bkit-uninstall-test] delete: docs/templates/bkit-plan.md
[bkit-uninstall-test] prune empty dir: docs/templates

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > docs/ > leaves docs/ alone on a targeted (non-core) uninstall, and on a dry run
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
AGENTS.md                                        | skip-absent            | file not found — nothing to do
.gitignore                                       | skip-absent            | file not found — nothing to do
.gitattributes                                   | skip-absent            | file not found — nothing to do
.bkit/version                                    | skip-absent            | file not found — nothing to do
.bkit/allowlist.json                             | skip-absent            | file not found — nothing to do
.bkit/authoring.md                               | skip-absent            | file not found — nothing to do
.bkit/cloud.md                                   | skip-absent            | file not found — nothing to do
.bkit/cli.md                                     | skip-absent            | file not found — nothing to do
.bkit/comparison.md                              | skip-absent            | file not found — nothing to do
.bkit/install.md                                 | skip-absent            | file not found — nothing to do
.bkit/jsonl.md                                   | skip-absent            | file not found — nothing to do
.bkit/LICENSE.md                                 | skip-absent            | file not found — nothing to do
.bkit/pipeline.md                                | skip-absent            | file not found — nothing to do
.bkit/providers.md                               | skip-absent            | file not found — nothing to do
.bkit/prompts.md                                 | skip-absent            | file not found — nothing to do
.bkit/router.md                                  | skip-absent            | file not found — nothing to do
.bkit/templates.md                               | skip-absent            | file not found — nothing to do
.bkit/trackers.md                                | skip-absent            | file not found — nothing to do
.bkit/workflows.md                               | skip-absent            | file not found — nothing to do
.bkit/README.md                                  | skip-absent            | file not found — nothing to do
.agents/context.md                               | skip-absent            | file not found — nothing to do
.agents/docs.md                                  | skip-absent            | file not found — nothing to do
.agents/rules.md                                 | skip-absent            | file not found — nothing to do
.agents/skills.md                                | skip-absent            | file not found — nothing to do
.agents/shortcuts.md                             | skip-absent            | file not found — nothing to do
.bkit/lite.md                                    | skip-absent            | file not found — nothing to do
docs/architecture.md                             | skip-absent            | file not found — nothing to do
docs/data-schema.md                              | skip-absent            | file not found — nothing to do
docs/deployments.md                              | skip-absent            | file not found — nothing to do
docs/design.md                                   | skip-absent            | file not found — nothing to do
docs/noise.md                                    | skip-absent            | file not found — nothing to do
docs/observability.md                            | skip-absent            | file not found — nothing to do
docs/security.md                                 | skip-absent            | file not found — nothing to do
docs/setup.md                                    | skip-absent            | file not found — nothing to do
docs/technology.md                               | skip-absent            | file not found — nothing to do
docs/testing.md                                  | strip-block            | markered-text — strip bkit block, preserve consumer content
docs/templates/bkit-plan.md                      | delete                 | bkit-owned docs template — removed on full/core uninstall


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > formatDecisionTable — P2.T7 > dry-run snapshot: decision table is printed, nothing deleted
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
CLAUDE.md                                        | skip-absent            | file not found — nothing to do
.claude/settings.json                            | strip-block            | json (deep-containment) — strip bkit-owned scope, preserve consumer keys
.claude/hooks/bkit-preflight.sh                  | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-gateguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-readguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-guardrails.cjs                | skip-absent            | file not found — nothing to do
.mcp.json                                        | skip-absent            | file not found — nothing to do
.bkit/.env.example                               | skip-absent            | file not found — nothing to do
AGENTS.md                                        | strip-block            | markered-text — strip bkit block, preserve consumer content
.gitignore                                       | skip-absent            | file not found — nothing to do
.gitattributes                                   | skip-absent            | file not found — nothing to do
.bkit/version                                    | skip-absent            | file not found — nothing to do
.bkit/allowlist.json                             | skip-absent            | file not found — nothing to do
.bkit/authoring.md                               | skip-absent            | file not found — nothing to do
.bkit/cloud.md                                   | skip-absent            | file not found — nothing to do
.bkit/cli.md                                     | skip-absent            | file not found — nothing to do
.bkit/comparison.md                              | skip-absent            | file not found — nothing to do
.bkit/install.md                                 | skip-absent            | file not found — nothing to do
.bkit/jsonl.md                                   | skip-absent            | file not found — nothing to do
.bkit/LICENSE.md                                 | skip-absent            | file not found — nothing to do
.bkit/pipeline.md                                | skip-absent            | file not found — nothing to do
.bkit/providers.md                               | skip-absent            | file not found — nothing to do
.bkit/prompts.md                                 | skip-absent            | file not found — nothing to do
.bkit/router.md                                  | skip-absent            | file not found — nothing to do
.bkit/templates.md                               | skip-absent            | file not found — nothing to do
.bkit/trackers.md                                | skip-absent            | file not found — nothing to do
.bkit/workflows.md                               | skip-absent            | file not found — nothing to do
.bkit/README.md                                  | skip-absent            | file not found — nothing to do
.agents/context.md                               | skip-absent            | file not found — nothing to do
.agents/docs.md                                  | skip-absent            | file not found — nothing to do
.agents/rules.md                                 | skip-absent            | file not found — nothing to do
.agents/skills.md                                | skip-absent            | file not found — nothing to do
.agents/shortcuts.md                             | skip-absent            | file not found — nothing to do
.bkit/lite.md                                    | skip-absent            | file not found — nothing to do
docs/architecture.md                             | skip-absent            | file not found — nothing to do
docs/data-schema.md                              | skip-absent            | file not found — nothing to do
docs/deployments.md                              | skip-absent            | file not found — nothing to do
docs/design.md                                   | skip-absent            | file not found — nothing to do
docs/noise.md                                    | skip-absent            | file not found — nothing to do
docs/observability.md                            | skip-absent            | file not found — nothing to do
docs/security.md                                 | skip-absent            | file not found — nothing to do
docs/setup.md                                    | skip-absent            | file not found — nothing to do
docs/technology.md                               | skip-absent            | file not found — nothing to do
docs/testing.md                                  | skip-absent            | file not found — nothing to do


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > strips bkit block from markered-text file, preserving consumer content
[bkit-uninstall-test] strip-block: AGENTS.md
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

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > deletes markered-text file when stripping leaves only whitespace
[bkit-uninstall-test] delete (empty after strip): AGENTS.md
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

 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 92ms
stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > preserves markered-text file when no bkit markers present (100% consumer)
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

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > preserves byte-equal-text file when hash unknown
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] preserve: .bkit/.env.example (byte-equal-text: no recorded install-time hash — preserve (consumer may have modified it))

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > reclaims an unedited owned byte-equal file via canonicalHashes
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/.env.example
[bkit-uninstall-test] update version pin: .bkit/version (pruned 1)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > preserves byte-equal-text file when hash mismatches (consumer modified)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] preserve: .bkit/.env.example (byte-equal-text: content differs from install-time hash — consumer modified, preserve)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > removes bkit's github entry and keeps a consumer server and top-level key
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .mcp.json
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > removes bkit's linear entry and keeps a consumer server and top-level key
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .mcp.json
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > removes bkit's jira entry and keeps a consumer server and top-level key
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .mcp.json
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > deletes the file when bkit's github entry was all it held
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .cursor/mcp.json
[bkit-uninstall-test] prune empty dir: .cursor

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > deletes the file when bkit's linear entry was all it held
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .cursor/mcp.json
[bkit-uninstall-test] prune empty dir: .cursor

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > deletes the file when bkit's jira entry was all it held
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .cursor/mcp.json
[bkit-uninstall-test] prune empty dir: .cursor

 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 127ms
stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > deletes a 100%-bkit markered-text file (residual == shipped scaffold, not a dead husk)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after strip): .claude/hooks/bkit-preflight.sh
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude/hooks
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > preserves a markered-text file when the consumer added content outside the block
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] strip-block: .claude/hooks/bkit-preflight.sh
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > deletes opencode.json on full uninstall (renders @@sentinel@@ keys before strip-scope)
[bkit-uninstall-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > deletes opencode.json holding every provider block and tracker entry earlier installs left
[bkit-uninstall-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > keeps a provider block and a github tracker entry the consumer edited, whole, and their own entries
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > keeps a provider block and a linear tracker entry the consumer edited, whole, and their own entries
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > keeps a provider block and a jira tracker entry the consumer edited, whole, and their own entries
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > preserves opencode.json when the consumer added their own key
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > deletes .bkit/version on a full/core uninstall (bkit install-state, zero-footprint)
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
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
[bkit-uninstall-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps .bkit/version on a targeted (non-core) uninstall
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > prunes deleted paths from .bkit/version on a targeted (non-core) uninstall
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] delete mirror: .claude/agents/bkit-foo.md
[bkit-uninstall-test] prune empty dir: .claude/agents
[bkit-uninstall-test] update version pin: .bkit/version (pruned 1)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > leaves .bkit/version byte-identical on a targeted uninstall that prunes nothing
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > does not rewrite .bkit/version on a targeted dry-run (no writes)
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

[bkit-uninstall-test] [dry-run] update version pin: .bkit/version (pruned 1)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > strips package.json bkit install-state block on full/core uninstall (github)
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
[bkit-uninstall-test] package.json: removed bkit install-state block

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > strips package.json bkit install-state block on full/core uninstall (linear)
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
[bkit-uninstall-test] package.json: removed bkit install-state block

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > strips package.json bkit install-state block on full/core uninstall (jira)
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

 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 156ms
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

 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 82ms
 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 147ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (100 tests) 107ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 138ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 72ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 60ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (183 tests) 59493ms
   ✓ requires selected other-workflow success at the exact pushed head 2202ms
   ✓ bkit runs locate (11)
     ✓ locates CI evidence using prompt saved issue and local precedence 3256ms
     ✓ filters branch and PR discovery by configured workflow and exact head 926ms
     ✓ freezes explicit workflow run attempt and all failed job pages 621ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1216ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1848ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 900ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 588ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 904ms
     ✓ rejects a workflow result count smaller than its returned records 608ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 678ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 898ms
   ✓ bkit runs wait (10)
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 2311ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 1220ms
     ✓ CLI: a failed gh workflow run exits 5 1203ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 2530ms
   ✓ bkit runs dispatch (16)
     ✓ a failed re-trigger push names the cause in the log 852ms
     ✓ a failed re-trigger push leaves no orphan commit behind 944ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 474ms
     ✓ CLI: verdict JSON, body scan, exit codes 895ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 1081ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 1737ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 515ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 473ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 479ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 1026ms
     ✓ --pr refuses a title carrying a skip token (18) and --record writes the refusal row 1592ms
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 1553ms
     ✓ --snapshot scopes its run list and dev lookups to --repo 1311ms
     ✓ --snapshot without --repo leaves its run list unscoped 1155ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 1216ms
     ✓ a refused capstone records FAIL with its reason 934ms
     ✓ an unreadable PR is an API error (20) with no head 1088ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 998ms
       ✓ without --repo no call gains a --repo flag 649ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 774ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 1293ms
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 434ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 1039ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 792ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 618ms
     ✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 423ms
     ✓ CI_DEV refuses the slug "a/b" (exit 9) 434ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 502ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 558ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 908ms
     ✓ an unknown phase exits 3; gh needing auth exits 80 539ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 936ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 613ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 733ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 596ms
     ✓ --file and --step go together 595ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 46ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 76ms
 ✓ .bkit/core/engine/render/trackers.test.ts (102 tests) 85ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 67ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 48ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-bnKJQw/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 43ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (283 tests) 68ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 73ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 34ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 46ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 49ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > upgrades a file with no consumer drift (update action)
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > reports conflict when consumer drift detected (does NOT overwrite)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting

 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 47ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > creates new files that do not yet exist on disk
[bkit-upgrade] upgrade: .claude/agents/bkit-new.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > dry-run does not write files but reports what would change
[bkit-upgrade] [dry-run] upgrade: .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] upgrade: .claude/agents/bkit-update.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] conflict: .claude/agents/bkit-conflict.md — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > skips missing template files without throwing
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-6EWd7r/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 59ms
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

 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 71ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 52ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 98ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 39ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 50ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 52ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 45ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 40ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 45ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 47ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 37ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 65ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (41 tests) 42ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

 ✓ .bkit/core/engine/install/manifest.test.ts (48 tests) 32ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 54ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (23 tests) 35ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (49 tests) 31ms
 ✓ .bkit/core/engine/render/hosts.test.ts (125 tests) 53ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793629474095.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793629474096.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793629474097.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793629474103.js — skipping

 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 20ms
 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 16ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 22ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 17ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 9ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 35ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 36ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 30ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 22ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 22ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (28 tests | 2 skipped) 17ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 18ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (66 tests) 22ms
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

 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 16ms
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

 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 18ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 14ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 23ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 12ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 15ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 23ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 16ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 13ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 15ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 13ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 11ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (27 tests) 10ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 11ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (13 tests) 12ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 18ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 4ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 15ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 3ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 12ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 5ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 12ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 4ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 3ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 4ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 5ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (7 tests) 3ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 7ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 3ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 7ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 3ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 5ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 4ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 3ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 4ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 3ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (226 tests) 80704ms
   ✓ branches rebase: behaviour (19)
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1912ms
     ✓ produces byte-identical output to merge=union 316ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1048ms
     ✓ refuses a lockfile whose regenerate command fails 739ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 304ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1193ms
     ✓ runs exactly one git push 955ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 361ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 594ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 473ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 767ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1009ms
     ✓ --mode=abort pushes when the branch has no open PR 674ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 686ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 443ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 326ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2843ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 344ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 1621ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1266ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 474ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 356ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 443ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 459ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 459ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1392ms
     ✓ a title that already carries the marker is left alone 1308ms
     ✓ with no open PR: pushes the marker commit and edits no title 2068ms
     ✓ a re-run is deduped: no second marker commit 1647ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1260ms
   ✓ branches sync (24)
     ✓ Path B once dev moved; --head checks a given commit 310ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 329ms
     ✓ --merge-docs merges dev when docs/ is behind 411ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 399ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 770ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 719ms
     ✓ --merge-docs skips an empty bkit:generate script 466ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 427ms
     ✓ --merge-docs never merges on dev itself 415ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 578ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 571ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 614ms
     ✓ --merge merges dev into the feature branch with a skip-ci merge commit, never a rebase 578ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 385ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 812ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1387ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1095ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 979ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output with skip ci 1205ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 661ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 473ms
     ✓ refuses --merge-docs with --head, and an unknown --head 351ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 645ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 785ms
     ✓ a failed install stops ship (16) 960ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 741ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 730ms
     ✓ exits 10 when the fetch fails 504ms
   ✓ branches land (27)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 530ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 514ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 502ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 505ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 1235ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 1349ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 315ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 930ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 729ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 734ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 475ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 822ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 763ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 583ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 659ms
     ✓ land removes the worktree when only the copied .env is untracked 540ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 469ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 496ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1093ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 507ms
     ✓ landPr refuses a main-based PR without retrying 480ms
     ✓ landPr refuses when the PR base is unknown 482ms
     ✓ PR not open (closed): stops (17) at once, no retry 607ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 436ms
     ✓ --attempt names the merge round in a fix commit 396ms
     ✓ commits a rewritten and a deleted tracked file 408ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 366ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 362ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 384ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/json-parse-owner.test.ts > JSON.parse inside a try statement belongs to shared/json.ts > no engine source parses JSON inside its own try
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   ".bkit/core/engine/commands/workflow/runs.ts:1966",
+ ]

 ❯ .bkit/core/engine/audits/repo/json-parse-owner.test.ts:101:22
     99|       }
    100|     }
    101|     expect(findings).toEqual([]);
       |                      ^
    102|   });
    103|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 165 passed (166)
      Tests  1 failed | 7005 passed | 2 skipped (7008)
   Start at  00:23:33
   Duration  81.31s (tests 97%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/830-debug-diagnose-named/build-group-gate-3-2.log.reports/vitest-38247.xml
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |    89.8 |    83.02 |   95.08 |    91.1 |                   
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
 engine/commands   |   89.97 |    83.96 |   92.25 |   90.71 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   97.46 |    91.11 |     100 |     100 | 87-91,156,162     
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   93.79 |    87.74 |   95.31 |   97.08 | ...03,439,490-493 
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
 ...mands/workflow |   92.54 |    84.41 |    96.5 |      94 |                   
  branches.ts      |   89.68 |    83.25 |   97.76 |   91.06 | ...2555,2580,2723 
  challenge.ts     |   96.59 |    83.03 |     100 |      98 | 178,368-370,652   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.01 |   98.07 |   97.05 | ...1975,1999,2002 
  counters.ts      |   98.26 |    94.38 |     100 |    98.7 | 203,502           
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
  runs.ts          |   91.44 |    84.19 |   99.11 |    92.6 | ...2402,2434-2438 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...55,304,324-329 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   97.25 |    95.25 |     100 |   98.41 | 119,230,502,630   
  step-table.ts    |     100 |    98.48 |     100 |     100 | 321               
  steps.ts         |   90.19 |     83.2 |   91.66 |   91.19 | ...1770,1775,1777 
  summary.ts       |   95.06 |    86.69 |   91.66 |   93.82 | ...99,407-413,441 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.39 |    88.23 |   96.55 |   96.61 | 23-24,235-236     
  tests-changed.ts |    93.1 |       75 |     100 |   94.23 | 64-65,68          
  tests.ts         |   96.99 |    89.44 |   97.26 |   98.24 | ...2294,2390-2392 
  tracker.ts       |   92.89 |    73.23 |     100 |   96.73 | ...36,848,931,979 
  workflows.ts     |   93.38 |    82.47 |   97.29 |   95.03 | ...1747,1921,2642 
  worktrees.ts     |   61.87 |    59.85 |   66.66 |   62.87 | ...1107,1110-1111 
 engine/install    |   93.17 |    84.64 |   94.15 |   95.96 |                   
  cloud-env.ts     |    96.9 |     91.3 |     100 |   99.64 | 223               
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,293            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   96.76 |    93.52 |   98.93 |   97.35 |                   
  status.ts        |   98.52 |    98.31 |     100 |     100 | 122,153,266       
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
Statements   : 89.8% ( 17738/19752 )
Branches     : 83.02% ( 12850/15478 )
Functions    : 95.08% ( 2884/3033 )
Lines        : 91.1% ( 15519/17034 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
