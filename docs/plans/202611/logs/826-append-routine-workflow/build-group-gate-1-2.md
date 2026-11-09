
> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/165 files need formatting

> @cbartens/bkit@6.0.0 lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
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
 483:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 603:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 676:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 182:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 256:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 96:488    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 133:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 159:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 600:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 822:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 997:108   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1105:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1266:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1324:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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

> @cbartens/bkit@6.0.0 slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> bkit ci slop

[bkit-ci] base 01fdb3215d7b834eb120b5474c6946ae80947c82 (01fdb3215d7b834eb120b5474c6946ae80947c82) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 01fdb3215d7b834eb120b5474c6946ae80947c82
base: 01fdb3215d7b834eb120b5474c6946ae80947c82
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
      Coverage enabled with v8

 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 2557ms
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 1180ms
     ✓ is null when pnpm fails or prints something that is not a version 1233ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 37564ms
   ✓ normFlag (11)
     ✓ "YES" -> true 928ms
     ✓ "False" -> false 372ms
     ✓ "0" -> false 618ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 752ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 1203ms
     ✓ CI=true -> GITHUB_ACTION 1334ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 726ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 882ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 914ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 1288ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 1630ms
     ✓ classifyAt reads the marker from the main checkout inside a linked worktree 340ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 1024ms
     ✓ LOCAL -> runtimeHeadless=false 442ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 1502ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 1048ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 1837ms
     ✓ UNKNOWN -> runtimeHeadless=false 1380ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 1219ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1461ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 1360ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 1885ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 1514ms
     ✓ re-derives per call: one run's answer does not leak into the next 1483ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 1228ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1269ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1750ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1595ms
     ✓ --file into a missing directory is refused, not created 2039ms
   ✓ bkit runtime assert (8)
     ✓ an explicit false (least-capable) resolution passes and reads back 601ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 53325ms
   ✓ splitSlug (6)
     ✓ "cbartens/bkit" -> {"owner":"cbartens","repo":"bkit"} 321ms
     ✓ " o/r\n" -> {"owner":"o","repo":"r"} 1076ms
     ✓ "o/" -> null 649ms
     ✓ "/r" -> null 665ms
     ✓ "o/r/x" -> null 451ms
     ✓ "" -> null 389ms
   ✓ resolveBkitBinary (3)
     ✓ prefers the repo-pinned binary over anything on PATH 566ms
     ✓ names the pinned location when neither exists 381ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 1911ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 1572ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 1562ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 1475ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 1850ms
     ✓ gh not on PATH at all also falls back to the remote 367ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 602ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 1647ms
     ✓ counts commits behind origin/dev and the divergence age 2202ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 1542ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 2159ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1078ms
     ✓ from a worktree, still names the main checkout and its outbox 2151ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 1759ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 1403ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 1299ms
     ✓ prints the Jira site and project under jira 1477ms
     ✓ prints the board under github 1735ms
     ✓ prints the github progress and review states, defaults for a key left unset 1554ms
     ✓ prints the linear progress and review states, defaults for a key left unset 2427ms
     ✓ prints the jira progress and review states, defaults for a key left unset 1106ms
     ✓ prints the linear progress and review states, defaults for a key left unset 1364ms
     ✓ prints null progress and review states under none 727ms
     ✓ prints buildPublishRemote and buildPublishLocal 709ms
     ✓ prints the publish defaults when package.json omits them 558ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 1625ms
     ✓ prints nulls under github without a board, and for keys left unset 1062ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 1130ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 1154ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1280ms
     ✓ an unpinned repo reports nulls and asks no registry 1187ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 1135ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 940ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 1453ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1391ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (60 tests) 52520ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 2363ms
     ✓ names each net-new and worsened finding in the log and the JSON 2498ms
     ✓ fails on a net score rise with no net count change 2153ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1433ms
     ✓ treats a net score at or below 0.001 as float noise 1367ms
     ✓ passes when the change only resolves findings 1607ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 2294ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1458ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 506ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 547ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1557ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1935ms
     ✓ exits 4 on a dropped net field instead of silently passing 1713ms
     ✓ exits 4 on no summary instead of silently passing 1464ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1329ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1933ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1043ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1100ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 3595ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 2167ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 2947ms
   ✓ bkit ci prose — gate (5)
     ✓ fails when vale is not installed 319ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 945ms
     ✓ fails (exit 1) when vale reports alerts 1115ms
     ✓ exits 6 on a vale runtime error 968ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1073ms
     ✓ falls back to vale sync when the main worktree has none 1201ms
     ✓ fails when vale sync cannot restore the required styles 1216ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 351ms
     ✓ is a usage error when the commit cannot be read 329ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 313ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 374ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 606ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 490ms
     ✓ exits 1 naming the files outside, whatever the commit message says 583ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 575ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 357ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 472ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 555ms
     ✓ a top-level glob in the setting does not reach into folders 335ms
     ✓ a push that changes no files is not proven a min push 319ms
     ✓ exits 7 when a commit or its base cannot be read 476ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (65 tests) 24174ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 342ms
     ✓ adopts the main checkout even when called from a linked worktree 317ms
     ✓ design and plan in place on main are refused 459ms
     ✓ refuses a detached HEAD 366ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1017ms
     ✓ may debug in place on dev 322ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 804ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 804ms
     ✓ a new run of the same FID rewrites startSha 1285ms
     ✓ a resume of the same FID reuses the record 1203ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 799ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 878ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 860ms
     ✓ a stale record without a lock is replaced 1018ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1052ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 628ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 392ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 318ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 326ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 470ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 350ms
   ✓ bkit worktrees remove (12)
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 937ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 416ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 574ms
       ✓ a branch already gone everywhere is reported deleted 420ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 526ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 670ms
(node:1214) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:1214) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:1214) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:1214) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:1214) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:1214) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:1214) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (29 tests) 17396ms
   ✓ shipped copy-and-own test files (5)
     ✓ ci/bkit-check-capstone.test.mjs passes when run on its own 366ms
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 15735ms
   ✓ bkit-check-capstone (10)
     ✓ passes its own copy-and-own test file (bkit's own copy) 475ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (96 tests) 77326ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 49953ms
     ✓ every prompt, workflow and utility agent has the three header blocks 465ms
     ✓ sync has nothing left to rewrite 20772ms
     ✓ every clause reaches the cut-off of one surface it applies to 2029ms
   ✓ fully retired clauses (6)
     ✓ output-cap's sentence stays inline in the abort handover prompt 3735ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 76424ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 1790ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 2168ms
     ✓ --file needs --workflow 658ms
     ✓ always writes the marker, even with no plan 1427ms
     ✓ writes the linear marker shape, taking the tracker from package.json 1120ms
     ✓ writes the jira marker shape, taking the tracker from package.json 1324ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 1301ms
     ✓ refuses a github marker with fid "12-x" issue "abc" (exit 2) 304ms
     ✓ refuses a jira marker with fid "mba-7-x" issue "mba-7" (exit 2) 499ms
     ✓ refuses a PR from dev, main, or the base itself 392ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1286ms
     ✓ retries a failed create once, and exits 5 when it fails twice 2177ms
     ✓ exits 5 when the open-PR probe errors 1667ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1805ms
     ✓ prs open refuses --base=refs/heads/main, the same branch as main 306ms
     ✓ prs open still opens against any other base 1885ms
     ✓ exits 6 when the created PR's base is not --base 1469ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 1495ms
     ✓ exits 1 with found=false when there is none 1518ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1529ms
     ✓ --number reads one PR, mergeable included 1673ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 1291ms
     ✓ exits 4 when gh errors and 80 when it needs auth 3037ms
     ✓ refuses a bad --state or --number 969ms
   ✓ bkit prs scan-body (10)
     ✓ flags [skip actions] in the landed commit body (exit 1) 316ms
     ✓ flags [actions skip] in the landed commit body (exit 1) 561ms
     ✓ passes a token-free body 335ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 444ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 1113ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 1357ms
     ✓ drops the force-build marker from the title subject 478ms
     ✓ takes an explicit --subject 403ms
     ✓ runs no merge when the PR is already MERGED 1091ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1344ms
     ✓ prs merge refuses a PR whose base is main 1068ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 1225ms
     ✓ prs merge refuses when the PR base is unknown 1201ms
     ✓ prs merge reads the base from the one pr view it already makes 1257ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 1444ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 1350ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 1293ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 1374ms
     ✓ never reads dev's required checks without --only-if-required 1080ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 1138ms
     ✓ updates when a dev ruleset requires status checks 2544ms
     ✓ updates when dev's branch protection requires status checks 1024ms
     ✓ ignores dev rulesets that require no checks 1403ms
     ✓ updates when the repo cannot be resolved 1491ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 1806ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 1292ms
     ✓ is not green when a check failed, naming it (exit 1) 1554ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 1134ms
     ✓ is not green on an empty rollup (total 0) 725ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 855ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 997ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 1241ms
     ✓ is a no-op when the title already says so 490ms
     ✓ strips the marker, with or without its bkit prefix 1134ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 625ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (138 tests) 74803ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 1576ms
   ✓ resolveGate (6)
     ✓ falls back to a shallower candidate when the deeper one is undeclared 626ms
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 393ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1268ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 1289ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1093ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1232ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 605ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 581ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 766ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1319ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1360ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1601ms
     ✓ PASS is 0 failures with or without reports 1450ms
     ✓ clears a previous attempt's reports before the gate runs 1661ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 957ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1886ms
     ✓ a log under the outbox is named main-checkout relative in the record 1484ms
     ✓ a log small enough is copied whole: not clamped, raw null 1395ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1539ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1501ms
     ✓ numbers runs within the workflow's active run and per step 1706ms
     ✓ without --file no row is written and the output carries row null 1408ms
   ✓ readTestFirst (5)
     ✓ reads a task's TEST EXCEPTION field apart from its TEST FIRST tests, with its plan lines 783ms
     ✓ narrows to one group's tasks 364ms
   ✓ checkPlanText (4)
     ✓ refuses a task that depends on itself 584ms
   ✓ bkit tests plan-check (28)
     ✓ plan-check refuses DEPENDS ON a later group 497ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 302ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 359ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1157ms
     ✓ a planned test that passes is a vacuous gap, exit 1 1106ms
     ✓ a planned test absent from a loaded report is a missing gap 1215ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1324ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1186ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1264ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 1229ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1514ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1732ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1661ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1660ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 2543ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1264ms
     ✓ green: a passed-accepted test is already landed, not a gap 1327ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1735ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1869ms
     ✓ green: --group audits only that group's tasks 1485ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1397ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1161ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1202ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1424ms
     ✓ green: lists each gap kind, with the runner output 928ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1074ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 520ms
       ✓ green clears an exception-only task from a human commit 311ms
 ✓ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests) 4792ms
   ✓ bkit skills prune (10)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ treats regex characters in a skill name literally 516ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 508ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 487ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 473ms
     ✓ runs from the checkout top even when called from a subfolder 553ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 8826ms
   ✓ bkit issues comment (33)
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 984ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 863ms
     ✓ a push that fails without a server answer is returned once, never retried 638ms
     ✓ a failed fetch is returned before anything is built 363ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1883ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1684ms
     ✓ lands from a clone whose fetch refspec omits dev 1512ms
     ✓ build throwing stops the landing and removes the throwaway checkout 732ms
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 502ms
     ✓ source file is not treated as gate config 422ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 421ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 1590ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ done --group writes group on the row 415ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 369ms
     ✓ reports a failed commit with exit 8 without writing the row 1947ms
     ✓ a failed commit leaves no row staged in the index 1776ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1699ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1990ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1960ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1546ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1371ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 411ms
     ✓ --ref reads the status file as committed on that ref, not from disk 310ms
     ✓ fails on a missing artifact 409ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 336ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 401ms
     ✓ fails a run-tests row missing its scope, and an empty scope 532ms
   ✓ bkit steps finish (15)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 533ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 591ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 927ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 534ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 323ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 677ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 536ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 333ms
     ✓ --attempt-of checks the row carries the derived counter 366ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 672ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1186ms
     ✓ a refused dev push is logged, never fails the close 1836ms
     ✓ an unreachable remote is logged, never fails the close 619ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 9712ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 1011ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 811ms
     ✓ resolves config from the repo root when run from a subdirectory 318ms
     ✓ exits 6 when the PUT fails 709ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 325ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 706ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 765ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 1172ms
     ✓ exits 6 when the api answer is not JSON 1223ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 27670ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 427ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 365ms
     ✓ staging failure: exit 4 and no commit is created, no false success 312ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 305ms
     ✓ --mode=stage stages the sweep but creates no commit 356ms
> [bkit] TRUNCATED HERE — 51 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 699ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1374ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 328ms
 ✓ .bkit/core/engine/audits/templates/context-github-ci-block.test.ts (4 tests) 8411ms
   ✓ GitHub selected-evidence context blocks (4)
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ --lock-held checks the lock is ours 354ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 558ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 344ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 319ms
     ✓ aborts a rebase only when one is in progress 659ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 581ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 639ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 700ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 580ms
     ✓ --max-exceeded says a handover is due without any sentinel 373ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 376ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 382ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ always writes the telemetry, whatever the runtime 403ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 480ms
     ✓ an unwritable stats path is logged and never fails the close 390ms
     ✓ appends the completeness row before the workflow-done row 450ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 553ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 1534ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1558ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 729ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 618ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 485ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 527ms
     ✓ --number without --outbox is a usage error 518ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 798ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 663ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 365ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1684ms
     ✓ --flush with nothing to record commits and pushes nothing 1072ms
     ✓ --flush carries the named worktree's logs into the dev commit 1247ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2598ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1493ms
     ✓ a close that landed releases the lock 2096ms
     ✓ removes the worktree before it releases the lock 2054ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 429ms
     ✓ names the branch, not the remote-tracking ref, in each URL 386ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 320ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 555ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 752ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 466ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a second run's record does not let this FID's close commit 613ms
     ✓ record is present after workflows close and before the push 2470ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2073ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 637ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1746ms
     ✓ counts files committed since --base 1370ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1497ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1445ms
     ✓ runs the --fallback gate even when no file changed, as it did before 1653ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 2321ms
       ✓ falls back to event.before when gh prints unparseable output 993ms
       ✓ reports last-green-run as the source when the green head is an ancestor 2851ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 2350ms
         ✓ tests ancestry against --head, not HEAD 2422ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 1393ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (38 tests) 7635ms
   ✓ bkit disk prune — step files (10)
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
   ✓ bkit counters progress (5)
     ✓ judges codeChanged on source only, from the rounds' parent commits 362ms
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts (185 tests | 1 failed) 120974ms
   × rejects fork verification runs that shadow a red selected workflow at the same head 5408ms
   ✓ preserves the requested event for selected-workflow verification 2172ms
   ✓ requires selected other-workflow success at the exact pushed head 3977ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ rejects ambiguous cross-repository and malformed attempt references 265ms
     ✓ filters branch and PR discovery by configured workflow and exact head 2411ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1335ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2855ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 3959ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ runs/<id>/jobs returns the captured jobs list, --paginate is accepted 225ms
     ✓ runs?head_sha=<unknown> returns total_count 0 (no-run shape) 82ms
     ✓ BKIT_FAKE_GH_API_ERROR=1: every api call exits 1 with stderr 84ms
     ✓ rate_limit returns the requested fixture state 90ms
     ✓ non-api argv exits non-zero (loud on an unmocked boundary) 45ms
     ✓ BKIT_FAKE_RATELIMITED=1: the run list fails rate-limit-shaped, rate_limit still answers 89ms
     ✓ --paginate emits one document per page; --slurp collapses them into an array 275ms
     ✓ rejects a '../'-laden SHA (no path traversal out of the runs dir) 31ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
   ✓ bkit runs gate (68)
     ✓ accepts a green capstone at the head (exit 0) and says so 150ms
     ✓ rejects a failed run (12) 189ms
     ✓ rejects no run at the head (10) 88ms
     ✓ rejects runs that have not completed (11) 96ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ rejects a green run whose capstone concluded 'action_required' (12) 143ms
     ✓ rejects a green run whose capstone concluded 'stale' (12) 101ms
     ✓ rejects a green run whose capstone concluded 'startup_failure' (12) 94ms
     ✓ exit 12 failed steps (10)
       ✓ a stale register alone is regenerable; the capstone is left out 191ms
       ✓ both floor steps failing is regenerable 182ms
       ✓ any failed step off the list makes the whole result unregenerable 144ms
       ✓ a job that concluded 'failure' with no failed step is {job}/ and unregenerable 133ms
       ✓ a job that concluded 'timed_out' with no failed step is {job}/ and unregenerable 201ms
       ✓ a job that concluded 'cancelled' with no failed step is {job}/ and unregenerable 238ms
       ✓ a timed-out step counts as failed 152ms
       ✓ bkit.testing.ciGenerated adds steps to the floor 215ms
       ✓ a step name alone does not match a {job}/{step} entry in another job 106ms
       ✓ refusals other than a failed run carry no failed steps 45ms
     ✓ --repo scopes --pr resolution (2)
       ✓ reads the head from the named repo, not the checkout's own PR 130ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 80ms
     ✓ a newer in-flight re-dispatch does not mask a completed green at the head 78ms
     ✓ tells an API error (20) from no run (10) 138ms
     ✓ shapes a rate-limit refusal from rate_limit (20) 71ms
     ✓ stderr noise on a successful gh call does not corrupt the JSON read 79ms
     ✓ an unparseable jobs response is an API error (20), not a missing capstone (13) 95ms
     ✓ gh missing from PATH exits 80 (use the MCP fallback), not an API error 4ms
     ✓ BKIT_SHIP_GATE_OVERRIDE (4)
       ✓ pinned to the refused head turns the refusal into 0 and appends the audit row 86ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
       ✓ a malformed ciRequired falls back to none, never crashes 119ms
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 165ms
     ✓ missing --head is a usage error (2) 1ms
     ✓ an empty --head= is a usage error (2), not a gate refusal 16ms
     ✓ --event (5)
       ✓ --event push ignores a pull_request run: no push run is 10, not 11 41ms
       ✓ without --event the in-flight pull_request run reads as in progress (11) 67ms
       ✓ --event push selects the green push run beside an in-flight pull_request run 98ms
       ✓ --event push reds on a failed push run even when a newer pull_request run is green 98ms
       ✓ without --event the newer green pull_request run masks the failed push run 106ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 169ms
       ✓ a run still in progress whose capstone already passed passes 147ms
       ✓ a capstone still running is in progress (11) 104ms
       ✓ a failed capstone fails (12) even when every other job passed 131ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 222ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 242ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 516ms
       ✓ a source change past the validated head refuses (17) and names the path 469ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 546ms
       ✓ --validated equal to --head is the plain head check 109ms
       ✓ --validated without --month / --fid is a usage error (2) 359ms
       ✓ a validated sha that is not an ancestor refuses (17) 372ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ no push run yet inside the absent window keeps waiting 0ms
     ✓ still in progress at --max-minutes -> 4 1ms
     ✓ two API errors are retried; the third in a row -> 20 0ms
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 1430ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 1413ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ the dispatch probe matches the capstone's lane namespace, case-insensitive, by name or context 2ms
     ✓ is bounded: ceil(budget / interval) attempts, no sleep after the last 1ms
     ✓ found stops polling; every poll erroring is err with allErrored 0ms
     ✓ a sleep that overruns its window is blocked: hand the poll to the agent 0ms
     ✓ PR completed = no open checks; run targets are head-anchored 1ms
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 2631ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 1335ms
     ✓ CLI: a failed gh workflow run exits 5 1215ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 3078ms
     ✓ CLI: usage errors exit 2 26ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 488ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 867ms
     ✓ a failed re-trigger push names the cause in the log 1823ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1827ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1161ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 790ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 297ms
     ✓ gh-error: every poll errored 286ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 657ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 607ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 937ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1065ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2046ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2127ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 697ms
     ✓ re-trigger on dev only uses the record of its own FID 850ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1015ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ flags [SKIP CI] inherited into the landed commit body 142ms
     ✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 209ms
     ✓ an empty or unreadable sha is an error, not a clean result 101ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 887ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 829ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 1576ms
     ✓ a refused capstone records FAIL with its reason 632ms
     ✓ an unreadable PR is an API error (20) with no head 485ms
     ✓ takes exactly one of --head, --pr, --squash-of 20ms
   ✓ bkit runs revalidate (6)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 919ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 1922ms
     ✓ ref uppercases a Linear or Jira key 0ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1534ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 2488ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1319ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1802ms
     ✓ --file and --step go together 1037ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 4422ms
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 956ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 732ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 395ms
 ✓ .bkit/core/engine/audits/templates/template-ci-yml.test.ts (16 tests) 1007ms
   ✓ template bkit-ci.yml, filled in (2)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ answers for the cwd, not an inherited GIT_DIR 387ms
   ✓ guardRepoConfig (6)
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 344ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 305ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (258 tests) 570ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 32033ms
> [bkit] TRUNCATED HERE — 146 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 804 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/workflow/test-blocks.test.ts (14 tests) 513ms
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 431ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 358ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (283 tests) 236ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 16948ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 16927ms
stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing
[bkit-install] Wrote .bkit/advisories.md (1 item).

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > overwrites an existing artifact on each call
[bkit-install] Wrote .bkit/advisories.md (0 items).

 ✓ .bkit/core/engine/audits/workflows/question-option-format.test.ts (22 tests) 614ms
   ✓ question option format: one layout across the corpus (12)
     ✓ counts the option lines found per directory 401ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (41 tests) 107ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 129ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 133ms
 ✓ .bkit/core/engine/checks/after/index.test.ts (53 tests) 557ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (78 tests) 34512ms
   ✓ trackerTarget (3)
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 313ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 1001ms
     ✓ seals unavailable or unstable representation evidence 1934ms
     ✓ uses accepted final preflight eligibility without provider atomicity 612ms
     ✓ rejects marker preserving external edits 996ms
     ✓ preserves generated first line and extracts versioned h6 section markers 803ms
     ✓ returns owned comment identity and stable representation evidence 1229ms
     ✓ selects newest created comment across complete pages 1351ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 1434ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 1416ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1529ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1103ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1202ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 1423ms
     ✓ fetches the issue and its comments as GitHub returns them 1759ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 1180ms
     ✓ caches exact engine source with available progress identity 692ms
     ✓ keeps original body identity separate from time and changed output 1011ms
     ✓ reuses matching invocation state without adopting foreign ownership 963ms
     ✓ invalidates missing corrupt and unsupported progress cache 1379ms
     ✓ contains cache read and write failures as standalone degradation 596ms
     ✓ uses legacy receipts and contains receipt failures 655ms
     ✓ records an engine-action row and skips the same key + body on a re-run 453ms
     ✓ a recent identical comment counts as done (the final close comment) 416ms
     ✓ a failed post reports done false with the reason and never leaks a token 665ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 586ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 557ms
     ✓ a board the token cannot see is scope 415ms
     ✓ an HTTP 403 from gh is scope 474ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 508ms
     ✓ github: no block, no blockers and no further reads 462ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 447ms
     ✓ a different marker hash posts 533ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 466ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 377ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 354ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 134ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 234ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 566ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 117ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 641ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 573ms
   ✓ resolveTokens — PROJECT_NAME (3)
     ✓ reads name from package.json 350ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 168ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 175ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 151ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 78ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (66 tests) 45ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 56ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (49 tests) 117ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 146ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 259ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (100 tests) 326ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (28 tests | 2 skipped) 80ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 135ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-t7qwNq/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 159ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (23 tests) 115ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 212ms
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

 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 271ms
 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 39ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-wwLSTA/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 209ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 33ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 217ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 131ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 112ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 24ms
 ✓ .bkit/core/engine/render/trackers.test.ts (102 tests) 319ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 93ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 32ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 65ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 81ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 97ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 107ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 83ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 150ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 34ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 70ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 54ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 74ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 50ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 277ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 42ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 27ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 70ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 43ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 86ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/install/manifest.test.ts (48 tests) 72ms
 ✓ .bkit/core/engine/render/hosts.test.ts (125 tests) 86ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 55ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 109ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 34ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 28ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 25ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 34ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 20ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793672443035.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793672443039.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793672443040.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793672443048.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 26ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 32ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 24ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (13 tests) 27ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 79ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 26ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 40ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (27 tests) 75ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 31ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 47ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 37ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 45ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 21ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 22ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 12ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 11ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 24ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 16ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 15ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 7ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 28ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 52ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 40ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 6ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 8ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (226 tests) 190317ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 2305ms
     ✓ rejects missing explicit and ambiguous existing branch selections 1800ms
   ✓ branches rebase: behaviour (19)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 2567ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1487ms
     ✓ --file records nothing for a refused rebase 726ms
     ✓ refuses a code conflict and aborts the rebase on the spot 1460ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1953ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 884ms
     ✓ produces byte-identical output to merge=union 1318ms
     ✓ restores a trailing newline so the next append starts on its own line 786ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 652ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1062ms
     ✓ refuses a union that leaves a line which is not JSON 702ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1192ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 2594ms
     ✓ refuses a lockfile whose regenerate command fails 2047ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 378ms
     ✓ removes a stale sentinel when the rebase succeeds 519ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 600ms
     ✓ resolves a conflict in each of two replayed commits across rounds 793ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 345ms
       ✓ skips (12) with no anchor 317ms
       ✓ skips (12) when the base is unreachable in this clone 397ms
       ✓ skips (12) when nothing landed since the base 415ms
       ✓ runs (0) with the landed path count once dev moved 694ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 432ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 953ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 634ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1129ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 5124ms
     ✓ runs exactly one git push 1937ms
     ✓ --set-upstream records the upstream 837ms
     ✓ refuses with no branch checked out 796ms
     ✓ --mode=dev refuses a feature checkout 695ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1262ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1935ms
     ✓ --require-ci pushes as-is when dev has not moved 877ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1584ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2182ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 646ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1902ms
     ✓ --mode=abort pushes when the branch has no open PR 1903ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1743ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 458ms
     ✓ --open-pr carries the MCP answer and skips gh 588ms
     ✓ --mode=abort on dev pushes plainly without probing 716ms
     ✓ rejects an unknown mode 751ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1787ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1140ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1276ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4251ms
     ✓ skip-ci HEAD on the replay is refused 884ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1710ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2647ms
     ✓ a level local dev is a plain push, recording nothing extra 1247ms
     ✓ a record with no commits pushes nothing 1069ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 747ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1984ms
     ✓ a rewritten branch is refused, never forced 1399ms
     ✓ refuses dev and main with exit 21 and pushes nothing 708ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1495ms
     ✓ refuses a detached HEAD (exit 5) 640ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1450ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1272ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1341ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1599ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 666ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1509ms
     ✓ an up-to-date branch is a no-op 814ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1252ms
     ✓ a fetch that fails exits 10 620ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1160ms
     ✓ --paths with no match exits 1 766ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 607ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1243ms
     ✓ --marker reads a diff over 1 MiB 974ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1282ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 894ms
     ✓ scan-diff finds an added skip 1023ms
     ✓ scan-diff ignores a skip predating the base 739ms
     ✓ scan-diff reports a disabled test with its line 774ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1737ms
     ✓ scan-diff ignores a removed comment in a test file 1444ms
     ✓ scan-diff ignores an assertion moved within the file 843ms
     ✓ scan-diff still reports a removed assertion 755ms
     ✓ scan-diff reports an assertion re-added only outside the test file 896ms
     ✓ scan-diff finds an added pytest mark skip 1234ms
     ✓ scan-diff finds an added unittest skip 1029ms
     ✓ scan-diff finds an added bare skip call 903ms
     ✓ scan-diff ignores a quoted skip in a documentation file 699ms
     ✓ scan-diff ignores a marker literal in a non-test source file 765ms
     ✓ scan-diff ignores an assertion whose expectation changed 925ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 774ms
     ✓ scan-diff reports a deleted test file 896ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 590ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 2678ms
     ✓ a title that already carries the marker is left alone 2093ms
     ✓ with no open PR: pushes the marker commit and edits no title 2369ms
     ✓ a re-run is deduped: no second marker commit 2279ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1837ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 981ms
     ✓ --title-set skips gh entirely 1205ms
     ✓ refuses dev and main (exit 21) 450ms
   ✓ branches sync (24)
     ✓ Path A when origin/dev is an ancestor of HEAD 850ms
     ✓ Path B once dev moved; --head checks a given commit 1314ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 1457ms
     ✓ --merge-docs merges dev when docs/ is behind 1792ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 1350ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 3188ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1576ms
     ✓ --merge-docs skips an empty bkit:generate script 571ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 460ms
     ✓ --merge-docs never merges on dev itself 442ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 568ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 583ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 725ms
     ✓ --merge merges dev into the feature branch with a skip-ci merge commit, never a rebase 739ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 591ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1193ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 870ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1230ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 989ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output with skip ci 933ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 605ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 367ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 429ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 684ms
     ✓ a failed install stops ship (16) 552ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 368ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 401ms
   ✓ branches land (27)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 944ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1248ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 885ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 961ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2992ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2227ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 501ms
     ✓ local: names unpushed dev as the cause when the branch carries it 603ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 686ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1364ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1257ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1107ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1242ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1155ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1070ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 689ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1426ms
     ✓ land removes the worktree when only the copied .env is untracked 2801ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 2270ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 948ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1628ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1164ms
     ✓ landPr refuses a main-based PR without retrying 574ms
     ✓ landPr refuses when the PR base is unknown 512ms
     ✓ PR not open (closed): stops (17) at once, no retry 601ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 622ms
     ✓ --attempt names the merge round in a fix commit 842ms
     ✓ commits a rewritten and a deleted tracked file 925ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 756ms
     ✓ reports undeclared and runs nothing with no scripts 307ms
     ✓ reports undeclared and runs nothing with an empty script 311ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 654ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 705ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 308ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > rejects fork verification runs that shadow a red selected workflow at the same head
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:178:1
    176| }
    177|
    178| it("rejects fork verification runs that shadow a red selected workflow…
       | ^
    179|   const f = verificationProvenanceFixture();
    180|   const implicit = await f.gate();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 165 passed (166)
      Tests  1 failed | 7033 passed | 2 skipped (7036)
   Start at  12:18:22
   Duration  195.08s (tests 95%, transform 2%, import 2%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/826-append-routine-workflow/build-group-gate-1-2.log.reports/vitest-41592.xml
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.77 |    83.12 |   95.07 |   91.05 |                   
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
 ...mands/workflow |   92.45 |    84.55 |   96.48 |   93.88 |                   
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
  runs.ts          |   91.52 |    84.29 |   99.11 |   92.59 | ...2406,2438-2442 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...55,304,324-329 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   97.25 |    95.25 |     100 |   98.41 | 119,230,502,630   
  step-table.ts    |     100 |    98.48 |     100 |     100 | 321               
  steps.ts         |   90.07 |    83.03 |   91.66 |   91.05 | ...1772,1777,1779 
  summary.ts       |   95.06 |    86.69 |   91.66 |   93.82 | ...99,407-413,441 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.39 |    88.23 |   96.55 |   96.61 | 23-24,235-236     
  tests-changed.ts |    93.1 |       75 |     100 |   94.23 | 64-65,68          
  tests.ts         |   96.99 |    89.26 |   97.26 |   98.24 | ...2294,2390-2392 
  tracker.ts       |   91.21 |    79.87 |   99.06 |   93.96 | ...1504,1543-1545 
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
Statements   : 89.77% ( 17900/19939 )
Branches     : 83.12% ( 13077/15731 )
Functions    : 95.07% ( 2898/3048 )
Lines        : 91.05% ( 15665/17203 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1888 of 3493 lines (131 KB of 265 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
