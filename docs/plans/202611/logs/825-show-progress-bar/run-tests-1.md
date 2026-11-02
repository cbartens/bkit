
> @cbartens/bkit@6.0.0 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/825-show-progress-bar
> pnpm bkit:gate:static-unit && pnpm test:integration


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
 841:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1010:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1112:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1273:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1331:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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

[test-timeout-budget] load average 11.7 on 10 cores: unit limits 5844ms per test, 11688ms per hook (x1.17)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/825-show-progress-bar
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (56 tests) 32948ms
   ✓ trackerTarget (3)
     ✓ linear and jira: the uppercased key from the FID, plus team / site 311ms
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 558ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 1315ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 1272ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1233ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 934ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1418ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 1003ms
     ✓ fetches the issue and its comments as GitHub returns them 1436ms
   ✓ postCommentOnce (4)
     ✓ records an engine-action row and skips the same key + body on a re-run 1199ms
     ✓ a recent identical comment counts as done (the final close comment) 1575ms
     ✓ a failed post reports done false with the reason and never leaks a token 1649ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1606ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 1703ms
     ✓ a board the token cannot see is scope 1479ms
     ✓ an HTTP 403 from gh is scope 1515ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 1771ms
     ✓ github: no block, no blockers and no further reads 2160ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 1641ms
     ✓ a different marker hash posts 2402ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1926ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 65430ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 1039ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 1200ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 926ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 1126ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 1151ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 1238ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 1377ms
     ✓ counts commits behind origin/dev and the divergence age 1729ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 1170ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1745ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1497ms
     ✓ from a worktree, still names the main checkout and its outbox 1543ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 1539ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 1477ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 1525ms
     ✓ prints the Jira site and project under jira 1695ms
     ✓ prints the board under github 2252ms
     ✓ prints the github progress and review states, defaults for a key left unset 1841ms
     ✓ prints the linear progress and review states, defaults for a key left unset 1791ms
     ✓ prints the jira progress and review states, defaults for a key left unset 1960ms
     ✓ prints the linear progress and review states, defaults for a key left unset 2510ms
     ✓ prints null progress and review states under none 1136ms
     ✓ prints buildPublishRemote and buildPublishLocal 1436ms
     ✓ prints the publish defaults when package.json omits them 1407ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 2644ms
     ✓ prints nulls under github without a board, and for keys left unset 3350ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 2335ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 2872ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 2728ms
     ✓ an unpinned repo reports nulls and asks no registry 3234ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 3029ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 2481ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 2621ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 2466ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (60 tests) 79949ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1012ms
     ✓ names each net-new and worsened finding in the log and the JSON 2126ms
     ✓ fails on a net score rise with no net count change 1777ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1385ms
     ✓ treats a net score at or below 0.001 as float noise 1450ms
     ✓ passes when the change only resolves findings 1685ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1826ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1659ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 371ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1707ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1752ms
     ✓ exits 4 on a dropped net field instead of silently passing 1482ms
     ✓ exits 4 on no summary instead of silently passing 1570ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1751ms
     ✓ exits 5 when the base worktree cannot be created 424ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 2659ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 2984ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 4706ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 4788ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1430ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 5146ms
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 2796ms
     ✓ fails (exit 1) when vale reports alerts 2603ms
     ✓ exits 6 on a vale runtime error 3207ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 2844ms
     ✓ falls back to vale sync when the main worktree has none 3223ms
     ✓ fails when vale sync cannot restore the required styles 2502ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 712ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 535ms
     ✓ is a usage error when the commit cannot be read 363ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 2172ms
     ✓ exits 1 naming the code file, whatever the commit message says 1430ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 1001ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 539ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 1730ms
     ✓ exits 7 when a commit cannot be read 502ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 765ms
     ✓ exits 1 naming the files outside, whatever the commit message says 848ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1464ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 821ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 753ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 1904ms
     ✓ a top-level glob in the setting does not reach into folders 753ms
     ✓ a push that changes no files is not proven a min push 480ms
     ✓ exits 7 when a commit or its base cannot be read 585ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 54322ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 836ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 2050ms
     ✓ CI=true -> GITHUB_ACTION 2782ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 2751ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 2474ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 3372ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 2600ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 2754ms
     ✓ classifyAt reads the marker from the main checkout inside a linked worktree 352ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 3565ms
     ✓ LOCAL -> runtimeHeadless=false 2163ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 2625ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 2519ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 697ms
     ✓ UNKNOWN -> runtimeHeadless=false 517ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 1452ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1388ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 1845ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 1408ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 1311ms
     ✓ re-derives per call: one run's answer does not leak into the next 1533ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 1580ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 2170ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 2393ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1916ms
     ✓ --file into a missing directory is refused, not created 2268ms
   ✓ bkit runtime assert (8)
     ✓ reads the LATEST row, optionally for one workflow 316ms
     ✓ an empty runtime -> exit 5, naming the unresolved field 424ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 100931ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 569ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1199ms
     ✓ always writes the marker, even with no plan 1243ms
     ✓ writes the linear marker shape, taking the tracker from package.json 1007ms
     ✓ writes the jira marker shape, taking the tracker from package.json 1198ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 1450ms
     ✓ refuses a PR from dev, main, or the base itself 645ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1016ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1524ms
     ✓ exits 5 when the open-PR probe errors 1228ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1603ms
     ✓ prs open refuses --base=heads/main, the same branch as main 401ms
     ✓ prs open still opens against any other base 1373ms
     ✓ exits 6 when the created PR's base is not --base 1691ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 1548ms
     ✓ exits 1 with found=false when there is none 1490ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1726ms
     ✓ --number reads one PR, mergeable included 1696ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 2374ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1649ms
     ✓ refuses a bad --state or --number 344ms
   ✓ bkit prs scan-body (10)
     ✓ passes a token-free body 305ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 2029ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 1831ms
     ✓ drops the force-build marker from the title subject 823ms
     ✓ takes an explicit --subject 1818ms
     ✓ runs no merge when the PR is already MERGED 2994ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 2788ms
     ✓ prs merge refuses a PR whose base is main 2416ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 3306ms
     ✓ prs merge refuses when the PR base is unknown 2684ms
     ✓ prs merge reads the base from the one pr view it already makes 2784ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 3522ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 2555ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 2091ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 2384ms
     ✓ exits 2 on a bad --number 581ms
     ✓ never reads dev's required checks without --only-if-required 810ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 1018ms
     ✓ updates when a dev ruleset requires status checks 1558ms
     ✓ updates when dev's branch protection requires status checks 2512ms
     ✓ ignores dev rulesets that require no checks 1040ms
     ✓ updates when the repo cannot be resolved 1779ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 1461ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 1960ms
     ✓ is not green when a check failed, naming it (exit 1) 1961ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 2669ms
     ✓ is not green on an empty rollup (total 0) 1922ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 2261ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 3359ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 1102ms
     ✓ is a no-op when the title already says so 1223ms
     ✓ strips the marker, with or without its bkit prefix 2410ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 2013ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ scans a clean landed body and records the close-transport row 643ms
     ✓ records a skip token found in the body, then exits 1 909ms
     ✓ exits 8 on an unreadable commit, writing nothing 421ms
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 1018ms
     ✓ needs --scan or --scan-result 507ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (135 tests) 102986ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 971ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 1279ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 978ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1207ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 1170ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1025ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1318ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1134ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 967ms
     ✓ PASS is 0 failures with or without reports 1417ms
     ✓ clears a previous attempt's reports before the gate runs 1515ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1678ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1392ms
     ✓ a log under the outbox is named main-checkout relative in the record 1537ms
     ✓ a log small enough is copied whole: not clamped, raw null 1448ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1283ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1657ms
     ✓ numbers runs within the workflow's active run and per step 2283ms
     ✓ without --file no row is written and the output carries row null 1464ms
   ✓ bkit tests plan-check (28)
     ✓ plan-check refuses an UPDATE symbol missing from its file 304ms
     ✓ plan-check matches a Markdown heading symbol 368ms
     ✓ plan-check refuses a delete with no supersession row 376ms
     ✓ plan-check refuses a matrix row mapped to two tasks 320ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 338ms
     ✓ plan-check follows bkit.workflows.tasks 354ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 368ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 2806ms
     ✓ a planned test that passes is a vacuous gap, exit 1 2570ms
     ✓ a planned test absent from a loaded report is a missing gap 2249ms
     ✓ a file that fails to load is a red of kind red-not-loaded 3128ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 2967ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 422ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 3413ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 3376ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 2854ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 3348ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 3178ms
       ✓ a later unproven result never replaces a proven red of the same lines 433ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 2291ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 2238ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 2247ms
     ✓ green: a passed-accepted test is already landed, not a gap 1435ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1748ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 504ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 2469ms
     ✓ green: --group audits only that group's tasks 2800ms
     ✓ green: --group naming a group with no tasks is refused 314ms
     ✓ green: a code fence never closed is the reason, not missing task markers 388ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 2997ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 3936ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 2571ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1678ms
     ✓ green: lists each gap kind, with the runner output 1943ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 2881ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 1451ms
       ✓ green clears an exception-only task from a human commit 1065ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 57353ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 32708ms
     ✓ every fence parses under zsh -n 24219ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 27740ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 1900ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 2116ms
     ✓ resolves config from the repo root when run from a subdirectory 1495ms
     ✓ exits 6 when the PUT fails 1179ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1764ms
   ✓ bkit setup protect-main — pre-flight (6)
     ✓ exits 4 when the CI workflow file is missing, before any write 1757ms
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 3261ms
     ✓ asks a human to log in when gh is not authenticated 1978ms
     ✓ exits 3 when gh repo view names no repository 2198ms
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 2527ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 2540ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 2508ms
     ✓ exits 6 when the api answer is not JSON 2410ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 55833ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 1001ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 595ms
     ✓ brand-new untracked ledger is staged and committed 1216ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 764ms
     ✓ path containing a space is staged and committed 520ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 631ms
     ✓ staging failure: exit 4 and no commit is created, no false success 634ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 2216ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 478ms
     ✓ --mode=stage stages the sweep but creates no commit 1610ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 5704ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 619ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 364ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 1224ms
> [bkit] TRUNCATED HERE — 76 lines omitted. Dropped content was NOT read.
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 342ms
     ✓ fails with a fetch error when there is no origin to rebase onto 741ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 828ms
> [bkit] TRUNCATED HERE — 62 lines omitted. Dropped content was NOT read.
     ✓ a bare number with no issue prints a hint to write #N 1297ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 2575ms
     ✓ a missing prompt file exits 7; --prompt-file with --branch is a usage error 337ms
   ✓ bkit fids resolve (12)
     ✓ 1. a FID the prompt names wins 707ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ refuses (exit 9) to mint from the workflow name when the prompt holds only a bare number 497ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 1657ms
     ✓ 6. a FID that fails the format check exits 1 421ms
   ✓ bkit fids design --description-file --prompt-file (5)
     ✓ a plan issue's Workstreams line lists the workstreams the plan covers 370ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 554ms
       ✓ a source change past the validated head refuses (17) and names the path 435ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 499ms
       ✓ --validated without --month / --fid is a usage error (2) 333ms
       ✓ a validated sha that is not an ancestor refuses (17) 359ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 3209ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 1534ms
     ✓ CLI: a failed gh workflow run exits 5 1618ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 2821ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 608ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1085ms
     ✓ a failed re-trigger push names the cause in the log 2913ms
     ✓ a failed re-trigger push leaves no orphan commit behind 2982ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2354ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1300ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 642ms
     ✓ gh-error: every poll errored 661ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 992ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 783ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1785ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1281ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2512ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 5710ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1680ms
     ✓ re-trigger on dev only uses the record of its own FID 1192ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1940ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
   ✓ scanBody (8)
     ✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 769ms
     ✓ an empty or unreadable sha is an error, not a clean result 351ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 1636ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 2480ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 2382ms
     ✓ a refused capstone records FAIL with its reason 1438ms
     ✓ an unreadable PR is an API error (20) with no head 1655ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 1590ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 3819ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1864ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 2363ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 2567ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 3638ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 2468ms
     ✓ --file and --step go together 3235ms
 ✓ .bkit/core/engine/commands/land.test.ts (30 tests) 32446ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 1097ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1778ms
     ✓ a push that fails without a server answer is returned once, never retried 921ms
     ✓ a failed fetch is returned before anything is built 602ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1700ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2435ms
     ✓ lands from a clone whose fetch refspec omits dev 1654ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1314ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests) 23175ms
   ✓ bkit skills prune (10)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ treats regex characters in a skill name literally 2433ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 2745ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 3164ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 2896ms
     ✓ runs from the checkout top even when called from a subfolder 4038ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ a resumed run prints its last DONE step; a closed decision is not open 454ms
     ✓ an OPEN decision of an earlier run never resurfaces 441ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 335ms
     ✓ aborts a rebase only when one is in progress 629ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 481ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 522ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 302ms
     ✓ a debug run in SOAK mode always needs a handover 573ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 306ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 421ms
     ✓ an unwritable stats path is logged and never fails the close 413ms
     ✓ appends the completeness row before the workflow-done row 445ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 543ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 1061ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1511ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1178ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 925ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 581ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1757ms
     ✓ --number without --outbox is a usage error 1182ms
     ✓ --flush is ship only 674ms
   ✓ bkit workflows handover (23)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 479ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 835ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2415ms
     ✓ --flush with nothing to record commits and pushes nothing 2252ms
     ✓ --flush carries the named worktree's logs into the dev commit 2598ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3191ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1821ms
     ✓ a close that landed releases the lock 2881ms
     ✓ removes the worktree before it releases the lock 2492ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 610ms
     ✓ names the branch, not the remote-tracking ref, in each URL 535ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 340ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 703ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1769ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 984ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a second run's record does not let this FID's close commit 880ms
     ✓ record is present after workflows close and before the push 1392ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2685ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 320ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 1225ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 392ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 644ms
     ✓ a folder outside the outbox sessions folder is kept 477ms
   ✓ bkit workflows summary (8)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
(node:63100) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:63100) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ❯ .bkit/core/engine/audits/templates/ci-scripts.test.ts (29 tests | 1 failed) 38316ms
   ✓ bkit-check-accepted-divergences (6)
     ✓ collects event-keyed sites with their job and step 164ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ flags an expired, over-long or stale acceptance 1ms
     ✓ exits 1 on a missing acceptance, 0 when clean, and 1 on a report with no advisories 785ms
     ✓ rejects an --unreachable value that is neither fail nor warn 315ms
   ❯ shipped copy-and-own test files (5)
     ✓ finds the shipped .test.mjs files 0ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ ci/bkit-check-capstone.test.mjs passes when run on its own 1975ms
     ✓ ci/bkit-check-dependency-audit.test.mjs passes when run on its own 98ms
     × ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 33130ms
   ✓ capstone env wiring checks (3)
     ✓ flag a lane whose result is not wired to its job 1ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 2094ms
     ✓ keeps each context's own section banner and drops every other context's 7953ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 1117ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 708ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 4821ms
       ✓ falls back to event.before when gh prints unparseable output 3352ms
       ✓ reports last-green-run as the source when the green head is an ancestor 5991ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 4998ms
         ✓ tests ancestry against --head, not HEAD 4673ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 4690ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 21366ms
   ✓ bkit roadmap mirror (8)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 2237ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2496ms
     ✓ a refused dev push is logged, never fails the close 4254ms
     ✓ an unreachable remote is logged, never fails the close 2186ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (38 tests) 19074ms
   ✓ bkit disk prune — step files (10)
     ✓ min runs only min steps; max runs both 1420ms
     ✓ runs repo steps from the checkout top, then machine steps from the home folder 445ms
     ✓ --scope runs only that file's steps 840ms
     ✓ a failing or throwing step is reported and the next step still runs 921ms
     ✓ a broken file is reported and the other file's steps still run 388ms
     ✓ drops an invalid step and runs the valid ones 668ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 2323ms
     ✓ counts files committed since --base 2214ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1804ms
     ✓ runs nothing and exits 0 when no file changed 527ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 2223ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 27963ms
   ✓ bkit issues labels (25)
     ✓ merged drops every phase label and bkit:failed; refuses --failed=on with it 469ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 684ms
     ✓ refuses an unknown phase or on/off value 534ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ skips tracker none and an issue-less FID 509ms
     ✓ posts the printed body; an identical recent comment is not posted twice 941ms
     ✓ a failed post exits 0 with done false and the reason 303ms
     ✓ --file: an engine-action row per run dedups a re-run without reading the issue 773ms
   ✓ bkit issues fetch (4)
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 1778ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1717ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 497ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (19 tests) 6407ms
   ✓ bkit locks acquire --kind=workflow — month bucket (5)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims an IN_PROGRESS run idle 30+ minutes 351ms
     ✓ reclaims a finished (DONE or FAILED) run's old lock 435ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 389ms
   ✓ bkit locks release (5)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 783ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 829ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 489ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (42 tests) 3337ms
   ✓ runLines (5)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
   ✓ repo facts on a real repository (4)
     ✓ repoRoot resolves the main checkout from inside a linked worktree 917ms
     ✓ repoRoot outside a repository is a usage error 370ms
     ✓ design / plan / build / debug: worktree copy when it exists, else the main checkout 827ms
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 564ms
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
     ✓ answers for the cwd, not an inherited GIT_DIR 339ms
   ✓ guardRepoConfig (6)
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 327ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 418ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (20 tests) 2896ms
   ✓ bkit tasks currency (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 1065ms
     ✓ is null when pnpm fails or prints something that is not a version 2008ms
 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (50 tests) 5522ms
   ✓ no workflow or prompt names a template path (50)
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 1905ms
     ✓ source file is not treated as gate config 1686ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 1749ms
     ✓ non-edit tool (bash) is ignored 423ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
> [bkit] TRUNCATED HERE — 101 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 71 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 837 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 275 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 1093ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 1152ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 1116ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 1335ms
   ✓ bkit completeness check (6)
     ✓ always exits 0 on a holey run 405ms
     ✓ exits 0 with no verdict when the file or the workflow markdown is unreadable 303ms
     ✓ a file holding two runs of one workflow is checked per run 385ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (40 tests) 4766ms
   ✓ bkit status resume (31)
     ✓ the challenge round comes from status.jsonl, not the plan files 320ms
     ✓ design: a completed step resumes at the next one 556ms
     ✓ build: a completed step resumes at the next one 560ms
     ✓ debug: a completed step resumes at the next one 488ms
     ✓ ship: a completed step resumes at the next one 398ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 517ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 407ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 504ms
   ✓ disk prune step-file templates (7)
     ✓ both copy into place and load as valid steps of both modes 465ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-wFAeMJ/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 1278ms
   ✓ runPreflight (9)
     ✓ reads the installing version from the package root when run from dist/ (no false downgrade) 650ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 673ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (113 tests) 75217ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 490ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 1237ms
     ✓ done --group writes group on the row 472ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 661ms
     ✓ --commit=none writes the row and leaves it uncommitted 456ms
     ✓ build-group-start records parentSha and group 443ms
     ✓ carries extra fields, parsed as JSON when they are JSON 943ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 322ms
     ✓ reports a failed commit with exit 8 without writing the row 2797ms
     ✓ a failed commit leaves no row staged in the index 2855ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 3310ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 2201ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 2212ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1428ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 2674ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 405ms
     ✓ a missing artifact exits 4 566ms
     ✓ empty artifact exits 0 504ms
     ✓ pending artifact exits 1 551ms
     ✓ no marker artifact exits 2 430ms
     ✓ disallowed artifact exits 3 365ms
     ✓ bad failures artifact exits 4 467ms
     ✓ a required field that is absent is invalid (re-prompt) 540ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 318ms
     ✓ only reads above the marker 363ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 1555ms
     ✓ fails when no row was written for the step 803ms
     ✓ --ref reads the status file as committed on that ref, not from disk 885ms
     ✓ --ref exits 3 when the ref does not carry the status file 830ms
     ✓ fails on a placeholder left in the artifact 1589ms
     ✓ fails when the row's verdict differs from the artifact's 850ms
     ✓ fails when the row does not list the artifact, or carries another attempt 1147ms
     ✓ fails on a missing artifact 660ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 571ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ passes attempt 0, and gate --attempt=0 matches it 417ms
     ✓ fails a diagnose row missing its strategy, passes with it 1093ms
     ✓ fails a run-tests row missing its scope, and an empty scope 1050ms
     ✓ names every missing field at once 347ms
     ✓ asks nothing of a step that writes none of them 322ms
   ✓ bkit steps finish (15)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 810ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 691ms
     ✓ a true | false header field is true when any agent sets it true 323ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 672ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 438ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 653ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 771ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 607ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 620ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 949ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 676ms
     ✓ --post needs --number; without --post there is no tracker key 314ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 310ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 573ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 653ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 653ms
     ✓ --attempt-of checks the row carries the derived counter 364ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1108ms
     ✓ writeStepRow refuses when a recorded path changed 1380ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 731ms
     ✓ writeStepRow appends its commit sha to the record 1724ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1958ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (9)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 541ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 1102ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 770ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 517ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1609ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 857ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 459ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1009ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 354ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 583ms
     ✓ does not count an artifact the run found committed when it started 1202ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 570ms
     ✓ commits a package.json change outside bkit.workflows 1175ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 2017ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 965ms
   ✓ main (5)
     ✓ runs as a script 410ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 349ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 1218ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (58 tests) 5294ms
   ✓ bkit counters route --point (7)
     ✓ takes each point's default limit and asks when nothing is set 1744ms
   ✓ bkit counters grant (4)
     ✓ grants one more full allowance at the used-up limit, and route counts it 417ms
     ✓ grants nothing below the limit, and nothing when nobody can agree 325ms
     ✓ a grant raises only the loop it was given for 311ms
     ✓ counts grants of the active run only, unless --all-runs 317ms
   ✓ bkit counters progress (5)
     ✓ judges codeChanged on source only, from the rounds' parent commits 766ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 302ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 1201ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-mXbd4o/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 474ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 512ms
   ✓ floor (1)
     ✓ canonical clause and rule text stays at or above the floor 477ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 386ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 294ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 658ms
   ✓ template shape (7)
     ✓ audit templates are shape only 330ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 594ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 802ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 726ms
   ✓ fetchAsset (2)
     ✓ returns the body of a 200 317ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 532ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 483ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 131ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 304ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 231ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (283 tests) 1140ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 768ms
   ✓ buildDepUpdaterSetupAdvisory (13)
     ✓ blocks (dep-updater-mismatch) when the updater names a config that is not present 359ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (23 tests) 169ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 123ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (27 tests) 338ms
 ✓ .bkit/core/engine/install/manifest.test.ts (48 tests) 363ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 394ms
   ✓ cli-doc (7)
     ✓ the generated region of .bkit/cli.md is current (run pnpm cli:sync) 362ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 461ms
   ✓ compactLedgerText (14)
     ✓ is reader-invisible: the fold is unchanged apart from firstTs / updates 307ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (32 tests) 412ms
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

 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 103ms
 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 247ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (41 tests) 938ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 358ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 258ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (66 tests) 335ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (28 tests | 2 skipped) 452ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 127ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 451ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 435ms
 ✓ .bkit/core/engine/render/trackers.test.ts (102 tests) 972ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 525ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 29ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 205ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (49 tests) 618ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793660217291.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793660217306.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793660217307.md — skipping (expected exactly one of each)

 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 792ms
stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793660217373.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 307ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 677ms
   ✓ bkit plans parse (2)
     ✓ emits the plans and the workstreams 401ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 272ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 348ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 97ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 653ms
   ✓ stripRetiredTemplateNotes (17)
     ✓ removes the shipped note: audit 5.0.0 – 5.2.2 334ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 92ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 134ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 164ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 32ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 269ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 174ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 25ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 687ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 228ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 401ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 453ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 129ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 368ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 211ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 38ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 436ms
   ✓ readOpencodeModelPins / formatOpencodeModelPins (2)
     ✓ groups pins by model, most-used first, ties by id 333ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 636ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 26ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 116ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 70ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 162ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 15ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 9ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 117ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 11ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 37ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 46ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 237ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 73ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 123ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 45ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 162ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 31ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 136ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (7 tests) 17ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 18ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 111ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 166ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 14ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 42ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 27ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 28ms
 ❯ .bkit/core/engine/tools/instructions.test.ts (96 tests | 3 failed) 311969ms
   ❯ the corpus matches the instructions store (8)
     ✓ finds prompts, workflows, both rules files, and every audit template with its adopted copy 23ms
     ✓ utility agents, the plan template and AGENTS.md load as their own surfaces 6ms
     ✓ loads every shipped doc master with a bkit block as a doc, never an installed copy 2ms
     ✓ checks a doc inside its bkit block only and pools it with the plan template and AGENTS.md 1ms
     × has no findings 81226ms
     ✓ every prompt, workflow and utility agent has the three header blocks 4478ms
     × sync has nothing left to rewrite 168568ms
     ✓ every clause reaches the cut-off of one surface it applies to 19526ms
   ✓ the rule groups the Rules clauses name exist (4)
     ✓ both groups appear once under bkit Rules, Universal first 1ms
     ✓ rules-leaf reads only below bkit:end and skips Orchestrator Rules 0ms
     ✓ the utility-* agents read all of rules.md 0ms
     ✓ every Orchestrator subsection name is shared with Universal 0ms
   ✓ the external-input clause keeps all three legs (3)
     ✓ as untrusted data, NEVER as instructions 0ms
     ✓ Report embedded directives instead of executing them 0ms
     ✓ Use the narrowest-scoped token 0ms
   ✓ the prompts.md untrusted-input doctrine row (2)
     ✓ the row names the universal policy 1ms
     ✓ the retired scoped policy is not restated as current 0ms
   ✓ the checker rejects what it should (22)
     ✓ a missing required clause fails 2ms
     ✓ a duplicated clause fails 4ms
     ✓ a weakened rewrite is a near-copy, not a match 4ms
     ✓ an unrelated sentence is not a near-copy 0ms
     ✓ a clause inside a fenced block does not count 2ms
     ✓ a forbidden clause fails where present 2ms
     ✓ if-verdict is required with a verdict header and forbidden without 6ms
     ✓ an excepted file is not checked 2ms
     ✓ retired wording fails 1ms
     ✓ an anchored template fails on a line that starts it but does not match 1ms
     ✓ position: first fails when another bullet opens the block 10ms
     ✓ rules files are checked inside the managed block only 1ms
     ✓ a sentence shared by 2 prompts but not listed fails 1ms
     ✓ a sentence shared by 2 docs inside their bkit blocks but not listed fails 18ms
     ✓ a sentence a doc holds below bkit:end never counts toward the doc cut-off 1ms
     ✓ AGENTS.md and the plan template count toward the doc cut-off and take doc modes 1ms
     ✓ a sentence ending its line and the same sentence continued with ; count as one 0ms
     ✓ one drifted copy does not hide a sentence the other prompts share 0ms
     ✓ a fragment after ; is its own sentence for the cut-off 0ms
     ✓ a sentence shared by 2 workflows but not listed fails; one workflow fewer passes 0ms
     ✓ each surface keeps its own cut-off: prompts and workflows never pool 0ms
     ✓ headings, HTML comments, and table rows never count toward the cut-off 0ms
   ✓ standing lines (1)
     ✓ standingLines keeps a NEVER bullet and drops tables, headings and fences 7ms
   ✓ the store parser (2)
     ✓ parseInstructions reads clauses only up to the next section 6ms
     ✓ a clause with rule and carriers keys parses 2ms
   ✓ store carriers (2)
     ✓ carriersLine writes all, all except, and prefix families 2ms
     ✓ syncStore rewrites a stale carriers line and keeps a current one 0ms
   ✓ audit templates (6)
     ✓ the store accepts an audit mode 0ms
     ✓ a required clause is checked inside the managed block only 1ms
     ✓ a near-copy in an audit template is flagged and sync rewrites the template and its adopted copy alike 2ms
     ✓ a sentence shared by 2 audit templates but not listed fails 1ms
     ✓ an adopted copy never counts twice toward the cut-off 0ms
     ✓ text below `bkit:end` never counts toward the cut-off 4ms
   ✓ checkboxes and sibling clauses (3)
     ✓ a gate checkbox is a line prefix, like a list marker 4ms
     ✓ a drifted gate item behind a checkbox is a near-copy 6ms
     ✓ a line carrying one clause verbatim is not a near-copy of its sibling 1ms
   ✓ sentence splitting (3)
     ✓ splits after . and ;, keeps the punctuation, and never splits after e.g. 12ms
     ✓ a clause ending in . matches a line that continues it with ; 7ms
     ✓ a drift that turns the clause's ; into , is still a near-copy 1ms
   ✓ modes (6)
     ✓ reads the tools list in block and inline form, skipping comment lines 6ms
     ✓ if-bash is required with Bash in the tools list and forbidden without 1ms
     ✓ if-search is required with Grep or Bash in the tools list and forbidden without 0ms
     ✓ if-no-search is required without Grep and Bash in the tools list and forbidden with either 0ms
     ✓ lines in a prompt's Rules block are rule copies, never clause carriers 0ms
     ✓ repeatable allows any number of copies but still flags near-copies 0ms
   ✓ templates (3)
     ✓ an anchored line may match any one of several templates 97ms
     ✓ a drifted anchored line fails 198ms
     ✓ a line two overlapping templates both fit counts once 2ms
   ✓ header blocks (7)
     ✓ each clause in its block, in wording-file order, passes; local lines in between allowed 3ms
     ✓ two swapped lines in one block fail 2ms
     ✓ a clause in the wrong block fails 41ms
     ✓ a placed clause in the body fails 5ms
     ✓ a CAUTION box, a missing block and blocks out of order fail 6ms
     ✓ files outside prompts, workflows and repo agents need no blocks 2ms
     ✓ the wording file takes block and position: first, and rejects anything else 21ms
   ✓ rule copies outside the Rules block (2)
     ✓ a rule's copy in Protocol or Contract fails, a cut-short copy included 7ms
     ✓ a line sharing only the rule's label, and the Rules block copy, pass 3ms
   ❯ fully retired clauses (6)
     ✓ parse with no text block and no surface 0ms
     ✓ reject a text block or a surface 0ms
     ✓ are a record only: their wording in a file is neither flagged nor rewritten 1ms
     ✓ never cover a sentence for the cut-off 0ms
     ✓ the removed prompt clauses stay on record, and the cut-off skips them 0ms
     × output-cap's sentence stays inline in the abort handover prompt 35074ms
   ✓ sync (7)
     ✓ rewrites a near-copy and keeps the list marker 3ms
     ✓ rewrites the text behind a different label when the clause is unlabelled 0ms
     ✓ rewrites retired wording, carrying slot values across 1ms
     ✓ rewrites a near-copy that closes a sentence opened by local text 0ms
     ✓ rewrites retired wording continued with ; and keeps the ; 0ms
     ✓ rewrites a near-copy continued with ; and keeps the ; 0ms
     ✓ is idempotent and leaves fenced examples alone 0ms
   ✓ issue-less workflow clauses (7)
     ✓ workflow-issue-id-missing leads into the branch recovery without a STOP 2ms
     ✓ the fids parse routes: hit, no issue, non-slug STOP 1ms
     ✓ Step 1 reads the issue and FID from the prompt file, and resolves FID in the engine 0ms
     ✓ changed issue clauses keep their old text in retired 0ms
     ✓ the issue-less gate clauses read as the issue-less behaviour 1ms
     ✓ the warning, the final-message line and the skip line are clauses 0ms
     ✓ the diff reaches each reader as a file written just before its step, not a guard rule 0ms
   ✓ the Template Instructions tables match the prompts (2)
     ✓ every row's bullet is byte-identical across its carriers 1250ms
     ✓ every label's rows list exactly the prompts that carry it 1228ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (224 tests) 409025ms
   ✓ branches rebase: behaviour (19)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1175ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1184ms
     ✓ --file records nothing for a refused rebase 1460ms
     ✓ refuses a code conflict and aborts the rebase on the spot 925ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1718ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 578ms
     ✓ produces byte-identical output to merge=union 1502ms
     ✓ restores a trailing newline so the next append starts on its own line 934ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 617ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 955ms
     ✓ refuses a union that leaves a line which is not JSON 548ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 709ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 2604ms
     ✓ refuses a lockfile whose regenerate command fails 1962ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 404ms
     ✓ removes a stale sentinel when the rebase succeeds 485ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 749ms
     ✓ resolves a conflict in each of two replayed commits across rounds 583ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 377ms
       ✓ skips (12) with no anchor 376ms
       ✓ skips (12) when the base is unreachable in this clone 362ms
       ✓ skips (12) when nothing landed since the base 377ms
       ✓ runs (0) with the landed path count once dev moved 976ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 795ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1322ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 819ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1248ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 2942ms
     ✓ runs exactly one git push 2309ms
     ✓ --set-upstream records the upstream 1060ms
     ✓ refuses with no branch checked out 1310ms
     ✓ --mode=dev refuses a feature checkout 732ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2183ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2950ms
     ✓ --require-ci pushes as-is when dev has not moved 2144ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2627ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2802ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 776ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 3849ms
     ✓ --mode=abort pushes when the branch has no open PR 3578ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 3687ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 849ms
     ✓ --open-pr carries the MCP answer and skips gh 1057ms
     ✓ --mode=abort on dev pushes plainly without probing 989ms
     ✓ rejects an unknown mode 773ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 5355ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 2650ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2797ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 6343ms
     ✓ skip-ci HEAD on the replay is refused 2037ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2959ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 6439ms
     ✓ a level local dev is a plain push, recording nothing extra 6134ms
     ✓ a record with no commits pushes nothing 3354ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 2041ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 2222ms
     ✓ a rewritten branch is refused, never forced 1149ms
     ✓ refuses dev and main with exit 21 and pushes nothing 828ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1857ms
     ✓ refuses a detached HEAD (exit 5) 944ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1718ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1473ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1159ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1723ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 1094ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1731ms
     ✓ an up-to-date branch is a no-op 913ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1353ms
     ✓ a fetch that fails exits 10 936ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 906ms
     ✓ --paths with no match exits 1 836ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 1396ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1045ms
     ✓ --marker reads a diff over 1 MiB 1435ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1718ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 2544ms
     ✓ scan-diff finds an added skip 1489ms
     ✓ scan-diff ignores a skip predating the base 2264ms
     ✓ scan-diff reports a disabled test with its line 1129ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1288ms
     ✓ scan-diff ignores a removed comment in a test file 2108ms
     ✓ scan-diff ignores an assertion moved within the file 2155ms
     ✓ scan-diff still reports a removed assertion 1046ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1282ms
     ✓ scan-diff finds an added pytest mark skip 1660ms
     ✓ scan-diff finds an added unittest skip 1227ms
     ✓ scan-diff finds an added bare skip call 1122ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1499ms
     ✓ scan-diff ignores a marker literal in a non-test source file 985ms
     ✓ scan-diff ignores an assertion whose expectation changed 988ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 876ms
     ✓ scan-diff reports a deleted test file 994ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 1330ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 6346ms
     ✓ a title that already carries the marker is left alone 4492ms
     ✓ with no open PR: pushes the marker commit and edits no title 4459ms
     ✓ a re-run is deduped: no second marker commit 4937ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 4539ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 2417ms
     ✓ --title-set skips gh entirely 3578ms
     ✓ refuses dev and main (exit 21) 1176ms
   ✓ branches sync (24)
     ✓ Path A when origin/dev is an ancestor of HEAD 2222ms
     ✓ Path B once dev moved; --head checks a given commit 3390ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 3852ms
     ✓ --merge-docs merges dev when docs/ is behind 4870ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 3390ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 8893ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 5943ms
     ✓ --merge-docs skips an empty bkit:generate script 1556ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1396ms
     ✓ --merge-docs never merges on dev itself 1273ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 2090ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 2027ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 2365ms
     ✓ --merge merges dev into the feature branch with a skip-ci merge commit, never a rebase 1928ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 1433ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 2400ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 2063ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 3740ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 3718ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output with skip ci 10457ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 2773ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 1341ms
     ✓ exits 10 when the fetch fails 1231ms
     ✓ refuses --merge-docs with --head, and an unknown --head 1719ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 3463ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 2662ms
     ✓ a failed install stops ship (16) 3027ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 2856ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 2893ms
     ✓ exits 10 when the fetch fails 1408ms
   ✓ branches land (27)
     ✓ refuses a workflow other than design or plan 1212ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 1951ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 4080ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 4539ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 4645ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 4406ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 7834ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 8570ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 3313ms
     ✓ local: names unpushed dev as the cause when the branch carries it 2892ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 3961ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 5012ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 4548ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 3339ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 3271ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 3390ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 3544ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 2293ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3744ms
     ✓ land removes the worktree when only the copied .env is untracked 3554ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 2885ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 2953ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 5696ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 2634ms
     ✓ landPr refuses a main-based PR without retrying 3638ms
     ✓ landPr refuses when the PR base is unknown 3474ms
     ✓ PR not open (closed): stops (17) at once, no retry 3426ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 3646ms
     ✓ --attempt names the merge round in a fix commit 2647ms
     ✓ commits a rewritten and a deleted tracked file 4772ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 2655ms
     ✓ reports undeclared and runs nothing with no scripts 1007ms
     ✓ reports undeclared and runs nothing with an empty script 817ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 3892ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 3496ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 1295ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/tools/instructions.test.ts > the corpus matches the instructions store > has no findings
Error: Test timed out in 70128ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/tools/instructions.test.ts:213:3
    211|   });
    212|
    213|   it("has no findings", CORPUS_CASE, () => {
       |   ^
    214|     const findings = checkClauses(CLAUSES, CORPUS).map(formatFinding);
    215|     expect(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/tools/instructions.test.ts > the corpus matches the instructions store > sync has nothing left to rewrite
Error: Test timed out in 70128ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/tools/instructions.test.ts:228:3
    226|   });
    227|
    228|   it("sync has nothing left to rewrite", CORPUS_CASE, () => {
       |   ^
    229|     expect([...syncClauses(CLAUSES, CORPUS).keys()]).toEqual([]);
    230|     expect(syncStore(STORE, CORPUS) === STORE, "run pnpm instructions:…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/tools/instructions.test.ts > fully retired clauses > output-cap's sentence stays inline in the abort handover prompt
Error: Test timed out in 5844ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/tools/instructions.test.ts:1029:3
    1027|   });
    1028|
    1029|   it("output-cap's sentence stays inline in the abort handover prompt"…
       |   ^
    1030|     const handover = CORPUS.find(
    1031|       (f) => f.id === ".bkit/core/prompts/bkit-debug-abort-handover.md…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/audits/templates/ci-scripts.test.ts > shipped copy-and-own test files > ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own
Error: Test timed out in 30000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/templates/ci-scripts.test.ts:260:29
    258|   });
    259|
    260|   it.each(SHIPPED_TEST_FILES)("%s passes when run on its own", { timeo…
       |                             ^
    261|     const res = spawnSync(process.execPath, [path.join(SHIPPED_SCRIPTS…
    262|       encoding: "utf-8",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  2 failed | 163 passed (165)
      Tests  4 failed | 6983 passed | 2 skipped (6989)
   Start at  08:52:32
   Duration  415.68s (tests 94%, import 2%, setup 2%, worker 1%, transform 1%)

    Isolate  165 workers spawned · ~889ms startup each (spawn + environment, per file)
             at least ~15.41s faster with isolate: false — reuses workers across files instead of one per file

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/825-show-progress-bar/run-tests-1.log.reports/vitest-30696.xml
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.75 |    82.74 |   94.98 |   91.06 |                   
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
 ...mands/workflow |   92.52 |    84.17 |   96.33 |   94.03 |                   
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
  steps.ts         |   89.19 |    82.39 |   90.19 |   90.34 | ...1873,1878,1880 
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
Statements   : 89.75% ( 17463/19457 )
Branches     : 82.74% ( 12440/15034 )
Functions    : 94.98% ( 2842/2992 )
Lines        : 91.06% ( 15265/16763 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1824 of 3836 lines (122 KB of 288 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
