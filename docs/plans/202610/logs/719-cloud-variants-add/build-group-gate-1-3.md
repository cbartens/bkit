
> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/165 files need formatting

> @cbartens/bkit@6.0.0 lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


 .bkit/core/.bkit/README.md
 303:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


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

> @cbartens/bkit@6.0.0 slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> bkit ci slop

[bkit-ci] base db424ac7af6c361b882bd063c74a527a304573a7 (db424ac7af6c361b882bd063c74a527a304573a7) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: db424ac7af6c361b882bd063c74a527a304573a7
base: db424ac7af6c361b882bd063c74a527a304573a7
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 24332ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 933ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 801ms
     ✓ CI=true -> GITHUB_ACTION 796ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 781ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 1168ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 1133ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 626ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 624ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 722ms
     ✓ LOCAL -> runtimeHeadless=false 930ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 995ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 1110ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 1689ms
     ✓ UNKNOWN -> runtimeHeadless=false 1302ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 1307ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1132ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 1157ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 1335ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 636ms
     ✓ re-derives per call: one run's answer does not leak into the next 591ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 675ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 515ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 525ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 962ms
     ✓ --file into a missing directory is refused, not created 439ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 36919ms
   ✓ resolveBkitBinary (3)
     ✓ prefers the repo-pinned binary over anything on PATH 368ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 930ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 826ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 761ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 1133ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 1181ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 665ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 1004ms
     ✓ counts commits behind origin/dev and the divergence age 1328ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 1289ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1906ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1432ms
     ✓ from a worktree, still names the main checkout and its outbox 1303ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 1278ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 1022ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 967ms
     ✓ prints the Jira site and project under jira 1468ms
     ✓ prints the board under github 647ms
     ✓ prints the github progress and review states, defaults for a key left unset 715ms
     ✓ prints the linear progress and review states, defaults for a key left unset 529ms
     ✓ prints the jira progress and review states, defaults for a key left unset 582ms
     ✓ prints the linear progress and review states, defaults for a key left unset 895ms
     ✓ prints null progress and review states under none 487ms
     ✓ prints buildPublishRemote and buildPublishLocal 1284ms
     ✓ prints the publish defaults when package.json omits them 1233ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 1449ms
     ✓ prints nulls under github without a board, and for keys left unset 1303ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 866ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 930ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1164ms
     ✓ an unpinned repo reports nulls and asks no registry 1377ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 631ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 1195ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 818ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 739ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (108 tests) 39904ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 718ms
     ✓ done --group writes group on the row 391ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 522ms
     ✓ carries extra fields, parsed as JSON when they are JSON 328ms
     ✓ reports a failed commit with exit 8 without writing the row 1416ms
     ✓ a failed commit leaves no row staged in the index 1033ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 858ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 992ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1717ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1152ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1898ms
   ✓ bkit steps gate (8)
     ✓ --ref reads the status file as committed on that ref, not from disk 357ms
     ✓ --ref exits 3 when the ref does not carry the status file 536ms
     ✓ fails on a placeholder left in the artifact 316ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 301ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 367ms
   ✓ bkit steps finish (15)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 388ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 361ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 315ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 581ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 754ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 700ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 617ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 913ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 439ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 519ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 411ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 729ms
     ✓ writeStepRow refuses when a recorded path changed 924ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 537ms
     ✓ writeStepRow appends its commit sha to the record 925ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1556ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (8)
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 544ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 387ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1135ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 663ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 509ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1295ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 392ms
     ✓ does not count an artifact the run found committed when it started 518ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 409ms
     ✓ commits a package.json change outside bkit.workflows 674ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1280ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (60 tests) 41110ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1216ms
     ✓ names each net-new and worsened finding in the log and the JSON 1390ms
     ✓ fails on a net score rise with no net count change 960ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1170ms
     ✓ treats a net score at or below 0.001 as float noise 1110ms
     ✓ passes when the change only resolves findings 851ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1018ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base resolves to HEAD 324ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1423ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 485ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1683ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1471ms
     ✓ exits 4 on a dropped net field instead of silently passing 1424ms
     ✓ exits 4 on no summary instead of silently passing 1197ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1149ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1306ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 844ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 973ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 977ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1106ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 2022ms
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 1366ms
     ✓ fails (exit 1) when vale reports alerts 1271ms
     ✓ exits 6 on a vale runtime error 924ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1129ms
     ✓ falls back to vale sync when the main worktree has none 880ms
     ✓ fails when vale sync cannot restore the required styles 1122ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 375ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 463ms
     ✓ exits 1 naming the code file, whatever the commit message says 364ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 415ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 864ms
     ✓ exits 7 when a commit cannot be read 370ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 462ms
     ✓ exits 1 naming the files outside, whatever the commit message says 445ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 719ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 592ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 523ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 1007ms
     ✓ a top-level glob in the setting does not reach into folders 552ms
     ✓ a push that changes no files is not proven a min push 510ms
     ✓ exits 7 when a commit or its base cannot be read 378ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 58901ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 760ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1098ms
     ✓ always writes the marker, even with no plan 805ms
     ✓ writes the linear marker shape, taking the tracker from package.json 586ms
     ✓ writes the jira marker shape, taking the tracker from package.json 769ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 1512ms
     ✓ refuses a PR from dev, main, or the base itself 313ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 684ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1013ms
     ✓ exits 5 when the open-PR probe errors 1077ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1174ms
     ✓ prs open still opens against any other base 1604ms
     ✓ exits 6 when the created PR's base is not --base 1437ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 1181ms
     ✓ exits 1 with found=false when there is none 1121ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1221ms
     ✓ --number reads one PR, mergeable included 1352ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 757ms
     ✓ exits 4 when gh errors and 80 when it needs auth 694ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 683ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 1595ms
     ✓ drops the force-build marker from the title subject 1101ms
     ✓ takes an explicit --subject 1259ms
     ✓ runs no merge when the PR is already MERGED 961ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 674ms
     ✓ prs merge refuses a PR whose base is main 783ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 958ms
     ✓ prs merge refuses when the PR base is unknown 1548ms
     ✓ prs merge reads the base from the one pr view it already makes 768ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 1262ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 675ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 771ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 1218ms
     ✓ never reads dev's required checks without --only-if-required 405ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 583ms
     ✓ updates when a dev ruleset requires status checks 545ms
     ✓ updates when dev's branch protection requires status checks 539ms
     ✓ ignores dev rulesets that require no checks 506ms
     ✓ updates when the repo cannot be resolved 982ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 548ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 596ms
     ✓ is not green when a check failed, naming it (exit 1) 947ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 779ms
     ✓ is not green on an empty rollup (total 0) 1248ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 2180ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1862ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 1196ms
     ✓ is a no-op when the title already says so 2146ms
     ✓ strips the marker, with or without its bkit prefix 2155ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1788ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ scans a clean landed body and records the close-transport row 371ms
     ✓ records a skip token found in the body, then exits 1 366ms
     ✓ exits 8 on an unreadable commit, writing nothing 389ms
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 498ms
     ✓ needs --scan or --scan-result 302ms
(node:8977) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:8977) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:8977) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:8977) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:8977) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:8977) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:8977) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (29 tests) 21709ms
   ✓ shipped copy-and-own test files (5)
     ✓ ci/bkit-check-capstone.test.mjs passes when run on its own 659ms
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 18436ms
   ✓ bkit-check-capstone (10)
     ✓ passes its own copy-and-own test file (bkit's own copy) 799ms
     ✓ the template capstone fetches the script with an ungated checkout before it runs 334ms
 ❯ .bkit/core/engine/tools/instructions.test.ts (96 tests | 1 failed) 76837ms
   ✓ the corpus matches the instructions store (8)
     ✓ finds prompts, workflows, both rules files, and every audit template with its adopted copy 17ms
     ✓ utility agents, the plan template and AGENTS.md load as their own surfaces 5ms
     ✓ loads every shipped doc master with a bkit block as a doc, never an installed copy 10ms
     ✓ checks a doc inside its bkit block only and pools it with the plan template and AGENTS.md 4ms
     ✓ has no findings 27609ms
     ✓ every prompt, workflow and utility agent has the three header blocks 415ms
     ✓ sync has nothing left to rewrite 29643ms
     ✓ every clause reaches the cut-off of one surface it applies to 6504ms
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
     ✓ the row names the universal policy 0ms
     ✓ the retired scoped policy is not restated as current 0ms
   ✓ the checker rejects what it should (22)
     ✓ a missing required clause fails 2ms
     ✓ a duplicated clause fails 1ms
     ✓ a weakened rewrite is a near-copy, not a match 1ms
     ✓ an unrelated sentence is not a near-copy 0ms
     ✓ a clause inside a fenced block does not count 1ms
     ✓ a forbidden clause fails where present 0ms
     ✓ if-verdict is required with a verdict header and forbidden without 2ms
     ✓ an excepted file is not checked 0ms
     ✓ retired wording fails 3ms
     ✓ an anchored template fails on a line that starts it but does not match 4ms
     ✓ position: first fails when another bullet opens the block 1ms
     ✓ rules files are checked inside the managed block only 1ms
     ✓ a sentence shared by 2 prompts but not listed fails 1ms
     ✓ a sentence shared by 2 docs inside their bkit blocks but not listed fails 0ms
     ✓ a sentence a doc holds below bkit:end never counts toward the doc cut-off 0ms
     ✓ AGENTS.md and the plan template count toward the doc cut-off and take doc modes 1ms
     ✓ a sentence ending its line and the same sentence continued with ; count as one 0ms
     ✓ one drifted copy does not hide a sentence the other prompts share 1ms
     ✓ a fragment after ; is its own sentence for the cut-off 1ms
     ✓ a sentence shared by 2 workflows but not listed fails; one workflow fewer passes 0ms
     ✓ each surface keeps its own cut-off: prompts and workflows never pool 0ms
     ✓ headings, HTML comments, and table rows never count toward the cut-off 0ms
   ✓ standing lines (1)
     ✓ standingLines keeps a NEVER bullet and drops tables, headings and fences 1ms
   ✓ the store parser (2)
     ✓ parseInstructions reads clauses only up to the next section 0ms
     ✓ a clause with rule and carriers keys parses 0ms
   ✓ store carriers (2)
     ✓ carriersLine writes all, all except, and prefix families 1ms
     ✓ syncStore rewrites a stale carriers line and keeps a current one 1ms
   ✓ audit templates (6)
     ✓ the store accepts an audit mode 0ms
     ✓ a required clause is checked inside the managed block only 1ms
     ✓ a near-copy in an audit template is flagged and sync rewrites the template and its adopted copy alike 1ms
     ✓ a sentence shared by 2 audit templates but not listed fails 1ms
     ✓ an adopted copy never counts twice toward the cut-off 0ms
     ✓ text below `bkit:end` never counts toward the cut-off 0ms
   ✓ checkboxes and sibling clauses (3)
     ✓ a gate checkbox is a line prefix, like a list marker 0ms
     ✓ a drifted gate item behind a checkbox is a near-copy 0ms
     ✓ a line carrying one clause verbatim is not a near-copy of its sibling 4ms
   ✓ sentence splitting (3)
     ✓ splits after . and ;, keeps the punctuation, and never splits after e.g. 1ms
     ✓ a clause ending in . matches a line that continues it with ; 1ms
     ✓ a drift that turns the clause's ; into , is still a near-copy 1ms
   ✓ modes (6)
     ✓ reads the tools list in block and inline form, skipping comment lines 0ms
     ✓ if-bash is required with Bash in the tools list and forbidden without 1ms
     ✓ if-search is required with Grep or Bash in the tools list and forbidden without 1ms
     ✓ if-no-search is required without Grep and Bash in the tools list and forbidden with either 1ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ templates (3)
     ✓ an anchored line may match any one of several templates 0ms
     ✓ a drifted anchored line fails 0ms
     ✓ a line two overlapping templates both fit counts once 0ms
   ✓ header blocks (7)
     ✓ each clause in its block, in wording-file order, passes; local lines in between allowed 1ms
     ✓ two swapped lines in one block fail 7ms
     ✓ a clause in the wrong block fails 1ms
     ✓ a placed clause in the body fails 1ms
     ✓ a CAUTION box, a missing block and blocks out of order fail 0ms
     ✓ files outside prompts, workflows and repo agents need no blocks 0ms
     ✓ the wording file takes block and position: first, and rejects anything else 2ms
   ✓ rule copies outside the Rules block (2)
     ✓ a rule's copy in Protocol or Contract fails, a cut-short copy included 33ms
     ✓ a line sharing only the rule's label, and the Rules block copy, pass 71ms
   ❯ fully retired clauses (6)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ never cover a sentence for the cut-off 15ms
     ✓ the removed prompt clauses stay on record, and the cut-off skips them 2ms
     × output-cap's sentence stays inline in the abort handover prompt 12081ms
   ✓ sync (7)
     ✓ rewrites a near-copy and keeps the list marker 1ms
> [bkit] TRUNCATED HERE — 88 lines omitted. Dropped content was NOT read.
     ✓ refuses (exit 9) to mint from the workflow name when the prompt holds only a bare number 412ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 719ms
     ✓ 6. a FID that fails the format check exits 1 314ms
   ✓ bkit fids plans (2)
     ✓ none: no plan file at all 340ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 3340ms
       ✓ falls back to event.before when gh prints unparseable output 2618ms
       ✓ reports last-green-run as the source when the green head is an ancestor 4705ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 3869ms
         ✓ tests ancestry against --head, not HEAD 4168ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 3626ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 52487ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 717ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 705ms
     ✓ staging failure: exit 4 and no commit is created, no false success 605ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 829ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 511ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 668ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 395ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 1290ms
> [bkit] TRUNCATED HERE — 51 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 1733ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1953ms
     ✓ a push that fails without a server answer is returned once, never retried 1510ms
     ✓ a failed fetch is returned before anything is built 976ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2854ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2876ms
     ✓ lands from a clone whose fetch refspec omits dev 2236ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1168ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 2767ms
     ✓ counts files committed since --base 3075ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 2487ms
     ✓ runs nothing and exits 0 when no file changed 551ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 2795ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 900ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 1031ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1298ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 978ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 656ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 938ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1075ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1193ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 725ms
     ✓ PASS is 0 failures with or without reports 1256ms
     ✓ clears a previous attempt's reports before the gate runs 740ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 752ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 501ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 536ms
     ✓ numbers runs within the workflow's active run and per step 501ms
     ✓ without --file no row is written and the output carries row null 914ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 2444ms
     ✓ a planned test absent from a loaded report is a missing gap 2263ms
     ✓ a file that fails to load is a red of kind red-not-loaded 3002ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1927ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 692ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1762ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 2818ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 2245ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 2296ms
     ✓ green: lists each gap kind, with the runner output 2277ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 3060ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 895ms
       ✓ green clears an exception-only task from a human commit 714ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 26106ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 2793ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 2504ms
     ✓ resolves config from the repo root when run from a subdirectory 2002ms
     ✓ exits 6 when the PUT fails 2610ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 2260ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 1959ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 1664ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 894ms
     ✓ exits 6 when the api answer is not JSON 1002ms
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts (171 tests | 1 failed) 128116ms
   ✓ fixture gh stub (10)
     ✓ runs?head_sha=green-capstone returns the captured workflow_runs list 69ms
     ✓ runs/<id>/jobs returns the captured jobs list, --paginate is accepted 42ms
     ✓ runs?head_sha=<unknown> returns total_count 0 (no-run shape) 36ms
     ✓ BKIT_FAKE_GH_API_ERROR=1: every api call exits 1 with stderr 40ms
     ✓ rate_limit returns the requested fixture state 53ms
     ✓ non-api argv exits non-zero (loud on an unmocked boundary) 47ms
     ✓ BKIT_FAKE_RATELIMITED=1: the run list fails rate-limit-shaped, rate_limit still answers 121ms
     ✓ --paginate emits one document per page; --slurp collapses them into an array 117ms
     ✓ rejects a '../'-laden SHA (no path traversal out of the runs dir) 42ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
   ✓ bkit runs gate (68)
     ✓ accepts a green capstone at the head (exit 0) and says so 110ms
     ✓ rejects a failed run (12) 106ms
     ✓ rejects no run at the head (10) 84ms
     ✓ rejects runs that have not completed (11) 54ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ rejects a green run whose capstone concluded 'action_required' (12) 134ms
     ✓ rejects a green run whose capstone concluded 'stale' (12) 109ms
     ✓ rejects a green run whose capstone concluded 'startup_failure' (12) 107ms
     ✓ exit 12 failed steps (10)
       ✓ a stale register alone is regenerable; the capstone is left out 106ms
       ✓ both floor steps failing is regenerable 88ms
       ✓ any failed step off the list makes the whole result unregenerable 97ms
       ✓ a job that concluded 'failure' with no failed step is {job}/ and unregenerable 93ms
       ✓ a job that concluded 'timed_out' with no failed step is {job}/ and unregenerable 104ms
       ✓ a job that concluded 'cancelled' with no failed step is {job}/ and unregenerable 97ms
       ✓ a timed-out step counts as failed 94ms
       ✓ bkit.testing.ciGenerated adds steps to the floor 176ms
       ✓ a step name alone does not match a {job}/{step} entry in another job 84ms
       ✓ refusals other than a failed run carry no failed steps 42ms
     ✓ --repo scopes --pr resolution (2)
       ✓ reads the head from the named repo, not the checkout's own PR 117ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 86ms
     ✓ a newer in-flight re-dispatch does not mask a completed green at the head 83ms
     ✓ tells an API error (20) from no run (10) 179ms
     ✓ shapes a rate-limit refusal from rate_limit (20) 89ms
     ✓ stderr noise on a successful gh call does not corrupt the JSON read 92ms
     ✓ an unparseable jobs response is an API error (20), not a missing capstone (13) 84ms
     ✓ gh missing from PATH exits 80 (use the MCP fallback), not an API error 4ms
     ✓ BKIT_SHIP_GATE_OVERRIDE (4)
       ✓ pinned to the refused head turns the refusal into 0 and appends the audit row 82ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
       ✓ a malformed ciRequired falls back to none, never crashes 96ms
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 251ms
     ✓ missing --head is a usage error (2) 1ms
     ✓ an empty --head= is a usage error (2), not a gate refusal 25ms
     ✓ --event (5)
       ✓ --event push ignores a pull_request run: no push run is 10, not 11 51ms
       ✓ without --event the in-flight pull_request run reads as in progress (11) 55ms
       ✓ --event push selects the green push run beside an in-flight pull_request run 115ms
       ✓ --event push reds on a failed push run even when a newer pull_request run is green 91ms
       ✓ without --event the newer green pull_request run masks the failed push run 115ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 220ms
       ✓ a run still in progress whose capstone already passed passes 165ms
       ✓ a capstone still running is in progress (11) 110ms
       ✓ a failed capstone fails (12) even when every other job passed 98ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 240ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 207ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 580ms
       ✓ a source change past the validated head refuses (17) and names the path 400ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 459ms
       ✓ --validated equal to --head is the plain head check 110ms
       ✓ --validated without --month / --fid is a usage error (2) 348ms
       ✓ a validated sha that is not an ancestor refuses (17) 431ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ no push run yet inside the absent window keeps waiting 0ms
     ✓ still in progress at --max-minutes -> 4 0ms
     ✓ two API errors are retried; the third in a row -> 20 0ms
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 939ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 1680ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ the dispatch probe matches the capstone's lane namespace, case-insensitive, by name or context 1ms
     ✓ is bounded: ceil(budget / interval) attempts, no sleep after the last 1ms
     ✓ found stops polling; every poll erroring is err with allErrored 0ms
     ✓ a sleep that overruns its window is blocked: hand the poll to the agent 0ms
     ✓ PR completed = no open checks; run targets are head-anchored 0ms
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 2697ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 1171ms
     ✓ CLI: a failed gh workflow run exits 5 1169ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 2376ms
     ✓ CLI: usage errors exit 2 18ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 511ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 970ms
     ✓ a failed re-trigger push names the cause in the log 1263ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1847ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1387ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 691ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 359ms
     ✓ gh-error: every poll errored 337ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 699ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 750ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 913ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 815ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 3139ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3596ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1355ms
     ✓ re-trigger on dev only uses the record of its own FID 1902ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1374ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ flags [SKIP CI] inherited into the landed commit body 256ms
     ✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 484ms
     ✓ an empty or unreadable sha is an error, not a clean result 224ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 1967ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 2492ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 2304ms
     ✓ a refused capstone records FAIL with its reason 2198ms
     ✓ an unreadable PR is an API error (20) with no head 2259ms
     ✓ takes exactly one of --head, --pr, --squash-of 32ms
   ✓ bkit runs revalidate (6)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
   ❯ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 2380ms
     × prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 5331ms
     ✓ ref uppercases a Linear or Jira key 4ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 3022ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 2719ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1971ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1767ms
     ✓ --file and --step go together 1423ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 51153ms
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 429ms
     ✓ fails with a fetch error when there is no origin to rebase onto 608ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 474ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 745ms
     ✓ tells a caller inside the removed worktree where to cd 801ms
     ✓ fails with its own exit code when git cannot remove a marked path 335ms
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 1448ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ treats regex characters in a skill name literally 551ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 668ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 1015ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 519ms
     ✓ runs from the checkout top even when called from a subfolder 584ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 2466ms
     ✓ keeps each context's own section banner and drops every other context's 5973ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 1103ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 1559ms
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 1025ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2908ms
     ✓ a refused dev push is logged, never fails the close 3051ms
     ✓ an unreachable remote is logged, never fails the close 1874ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 6819ms
   ✓ gradeCompliance — the grade bkit workflows close runs before its report (7)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 1552ms
     ✓ passes every rule on a clean head 607ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 678ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (37 tests) 10647ms
   ✓ bkit challenge merge (32)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ deferred counts the rows written 320ms
     ✓ 7 findings give three new groups of 3, 3 and 1 455ms
     ✓ a failed LOW deferral append leaves the plan unchanged; the re-run writes both 378ms
     ✓ writes LOW deferrals at the checkout root when run from a subfolder 338ms
   ✓ bkit challenge gate (5)
     ✓ challenge gate writes a challenge-gate row 1411ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 2182ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 709ms
 ✓ .bkit/core/engine/audits/repo/vitest-repo-config-guard.test.ts (12 tests) 4234ms
   ✓ repoConfigFile (3)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ passes when nothing changed 347ms
     ✓ passes when only another key changed, such as a branch's upstream 447ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 496ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 691ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 634ms
 ❯ .bkit/core/engine/commands/workflow/disk.test.ts (38 tests | 1 failed) 12205ms
   ✓ bkit disk prune — usage (3)
     ✓ refuses a mode other than min or max 99ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ runs repo steps from the checkout top, then machine steps from the home folder 198ms
     ✓ --scope runs only that file's steps 561ms
     ✓ a failing or throwing step is reported and the next step still runs 310ms
     ✓ a broken file is reported and the other file's steps still run 205ms
     ✓ drops an invalid step and runs the valid ones 291ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ does not run while a live sweep holds the lock 266ms
     ✓ with --wait, waits for the running sweep to end, then runs 300ms
     × renews its lock while a long step runs, so a waiter never takes it over 1150ms
     ✓ the sweep --auto starts waits its turn, for only the due scopes 3ms
     ✓ worktree setup's low-disk sweep waits for a running sweep 470ms
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
     ✓ ignores other features' buckets, even one sharing the issue digits 324ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 412ms
     ✓ reclaims a fresh lock over a finished run: the lock file's age is not checked 326ms
     ✓ reclaims a fresh lock over an IN_PROGRESS run idle 30+ minutes 304ms
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 640ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 605ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 742ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 860ms
     ✓ fetches the issue and its comments as GitHub returns them 836ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ records an engine-action row and skips the same key + body on a re-run 679ms
     ✓ a recent identical comment counts as done (the final close comment) 710ms
     ✓ a failed post reports done false with the reason and never leaks a token 561ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1129ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 1078ms
     ✓ a different marker hash posts 909ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 678ms
 ✓ .bkit/core/engine/commands/lib.test.ts (69 tests) 11591ms
   ✓ repo facts on a real repository (4)
> [bkit] TRUNCATED HERE — 104 lines omitted. Dropped content was NOT read.
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 484ms
     ✓ is null when pnpm fails or prints something that is not a version 1891ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > store keeps both same-key rows; the fold reads the later one (higher ts)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows start — resume facts (5)
     ✓ an OPEN decision of an earlier run never resurfaces 305ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 424ms
     ✓ writes no row when status.jsonl does not exist 302ms
     ✓ aborts a rebase only when one is in progress 525ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 555ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 596ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 329ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 313ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 382ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 505ms
     ✓ an unwritable stats path is logged and never fails the close 653ms
     ✓ appends the completeness row before the workflow-done row 713ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 726ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 658ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 843ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 482ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 550ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 467ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 616ms
     ✓ --number without --outbox is a usage error 615ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 872ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 555ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 518ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2275ms
     ✓ --flush with nothing to record commits and pushes nothing 2356ms
     ✓ --flush carries the named worktree's logs into the dev commit 2952ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3696ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2944ms
     ✓ a close that landed releases the lock 3289ms
     ✓ removes the worktree before it releases the lock 3524ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 610ms
     ✓ names the branch, not the remote-tracking ref, in each URL 1281ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 696ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 776ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1907ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 1517ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a second run's record does not let this FID's close commit 1493ms
     ✓ record is present after workflows close and before the push 2481ms
     ✓ failed handover from dev removes the record and keeps recorded paths 3142ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 464ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 365ms
     ✓ a missing summary file exits 13 before anything is written 313ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 347ms
     ✓ a folder outside the outbox sessions folder is kept 320ms
stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles entirely empty .jsonl file without throwing
> [bkit] TRUNCATED HERE — 220 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 325 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 252 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 149 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 63 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 944ms
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

 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 1324ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 1049ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 763ms
 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 1324ms
   ✓ renderAntigravityAgentsSkills (3)
     ✓ is idempotent — a second render writes nothing 309ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 544ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (258 tests) 1128ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 559ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 453ms
 ✓ .bkit/core/engine/audits/workflows/question-option-format.test.ts (22 tests) 1172ms
   ✓ question option format: one layout across the corpus (12)
     ✓ counts the option lines found per directory 765ms
 ✓ .bkit/core/engine/render/trackers.test.ts (102 tests) 525ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (100 tests) 961ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 409ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 760ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 415ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 1705ms
   ✓ shipped hook templates (5)
     ✓ every generated hook parses: node --check for JS, bash -n for shell 1606ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-1iw1XE/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (283 tests) 434ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 312ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 380ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 330ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (53 tests) 734ms
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

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > skips missing template files without throwing
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-Izihd8/nonexistent.md — skipping .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > block-merge skip is seedable even though disk carries consumer prose outside the block
[bkit-upgrade] upgrade (merge): docs/foo.md

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 240ms
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

 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 244ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 412ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 433ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 485ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (40 tests) 462ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 385ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 217ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 190ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 432ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 240ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 455ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 220ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 149ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 403ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 343ms
 ✓ .bkit/core/engine/install/manifest.test.ts (48 tests) 226ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 206ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 265ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 57ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 435ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (65 tests) 159ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (23 tests) 144ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 226ms
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

 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 397ms
 ✓ .bkit/core/engine/render/hosts.test.ts (125 tests) 733ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 75ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 223ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 257ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 418ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 282ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (49 tests) 332ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 620ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 143ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 249ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 56ms
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

 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (27 tests) 311ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > leaves a .cursor/allowlist.json bkit never recorded alone
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > is idempotent — a second run finds nothing to migrate
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 62ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (32 tests) 115ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 306ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 126ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 136ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 68ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 13ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 115ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 290ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793588823390.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793588823396.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793588823398.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793588823415.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 74ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 41ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 69ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 84ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 111ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 47ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (28 tests | 2 skipped) 184ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 58ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 184ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 78169ms
   ✓ gateguard opencode plugin — advisory mode (default) (7)
     ✓ emits reuse checklist on first write to a NEW (nonexistent) file 988ms
     ✓ keeps the reuse checklist when the write CREATES the file (pre-write snapshot) 1663ms
     ✓ (V1) keeps the reuse checklist when the write CREATES the file (pre-write snapshot) 1054ms
     ✓ emits investigation checklist on a write to an EXISTING file 1520ms
     ✓ emits investigation checklist on first edit to a file 1162ms
     ✓ dedups: second write to the same file in the same session emits nothing 1746ms
     ✓ warns again for a different file in the same session 3623ms
   ✓ gateguard opencode plugin — deny mode (2)
     ✓ throws with advisory text on first write (blocks edit) 1631ms
     ✓ allows retry (second call is a no-op after dedup marked) 1466ms
   ✓ gateguard opencode plugin — off mode (1)
     ✓ BKIT_GATEGUARD=off: no advice, no throw, no dedup state written 521ms
   ✓ gateguard opencode plugin — subagents are NOT exempt (3)
     ✓ a subagent session editing a file DOES get the advisory (exemption removed) 1350ms
     ✓ orchestrator session gets the advisory too — same treatment either way 1543ms
   ✓ gateguard opencode plugin — gate-config advisory (9)
     ✓ tsconfig.json triggers config advisory 1610ms
     ✓ flags vitest.config.ts as gate config 1144ms
     ✓ flags eslint.config.mjs as gate config 1776ms
     ✓ flags .prettierrc as gate config 1410ms
     ✓ flags slop-scan.config.json as gate config 1310ms
     ✓ flags .vale.ini as gate config 1400ms
     ✓ flags .lintstagedrc.json as gate config 1810ms
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 1468ms
     ✓ source file is not treated as gate config 1656ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ null args object is ignored — no throw 337ms
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 1118ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 4880ms
     ✓ patch (v1 driver): checks every Add / Update / Move-to / Delete target 4672ms
     ✓ apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target 5729ms
     ✓ apply_patch (v1 driver): checks every Add / Update / Move-to / Delete target 5632ms
     ✓ deny mode blocks when any patch target is a first touch, and records all of them 5059ms
     ✓ deny mode still blocks when only one of several patch targets is new to the session 2350ms
     ✓ malformed patchText null does not throw and yields no advice 301ms
   ✓ dual driver shape (OpenCode 1.x server() + 2.0 setup()) (6)
     ✓ both drivers emit the same advisory for the same edit 2651ms
     ✓ V1 driver reads the real 1.x arg key `filePath` 1318ms
     ✓ deny mode blocks the first touch on BOTH drivers 2422ms
   ✓ gateguard plugin — docs/*.md density advisory (#422) (6)
     ✓ appends the density advisory for a docs/ markdown file 1336ms
     ✓ does NOT match a Documents/ ancestor (segment match, not substring) 1778ms
     ✓ excludes docs/plans/ (plan template governs those, not the docs register) 1547ms
     ✓ does NOT match docs/knowledge.jsonl (gated on .md) 1417ms
     ✓ matches a nested docs/ tree via segment match (.bkit/shared/docs/architecture.md) 1036ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 27ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 44ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 32ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 107ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 12ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 56ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 31ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 15ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 30ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 142ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 156ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 92ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 65ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 90ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 61ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 13ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 19ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 29ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 25ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 13ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 11ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 15ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 10ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 12ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 16ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 7ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 8ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 9ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 14ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (224 tests) 273189ms
   ✓ branches rebase: behaviour (19)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1096ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 871ms
     ✓ --file records nothing for a refused rebase 527ms
     ✓ refuses a code conflict and aborts the rebase on the spot 646ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1317ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 487ms
     ✓ produces byte-identical output to merge=union 1194ms
     ✓ restores a trailing newline so the next append starts on its own line 847ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 742ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 964ms
     ✓ refuses a union that leaves a line which is not JSON 551ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 793ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1912ms
     ✓ refuses a lockfile whose regenerate command fails 1733ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 418ms
     ✓ removes a stale sentinel when the rebase succeeds 872ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 858ms
     ✓ resolves a conflict in each of two replayed commits across rounds 731ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 444ms
       ✓ skips (12) with no anchor 414ms
       ✓ skips (12) when the base is unreachable in this clone 448ms
       ✓ skips (12) when nothing landed since the base 450ms
       ✓ runs (0) with the landed path count once dev moved 964ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 600ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1253ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 768ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 931ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 2022ms
     ✓ runs exactly one git push 1951ms
     ✓ --set-upstream records the upstream 719ms
     ✓ refuses with no branch checked out 549ms
     ✓ --mode=dev refuses a feature checkout 627ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1443ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2118ms
     ✓ --require-ci pushes as-is when dev has not moved 997ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1880ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2804ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 871ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1487ms
     ✓ --mode=abort pushes when the branch has no open PR 1485ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1477ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 1175ms
     ✓ --open-pr carries the MCP answer and skips gh 1486ms
     ✓ --mode=abort on dev pushes plainly without probing 1481ms
     ✓ rejects an unknown mode 1249ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3479ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 2567ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 3284ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 6768ms
     ✓ skip-ci HEAD on the replay is refused 2052ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3451ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 5591ms
     ✓ a level local dev is a plain push, recording nothing extra 2411ms
     ✓ a record with no commits pushes nothing 2071ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 1468ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 4042ms
     ✓ a rewritten branch is refused, never forced 1933ms
     ✓ refuses dev and main with exit 21 and pushes nothing 1200ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 2770ms
     ✓ refuses a detached HEAD (exit 5) 1101ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 2441ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 2155ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 2188ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 2837ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 938ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 2343ms
     ✓ an up-to-date branch is a no-op 1509ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2789ms
     ✓ a fetch that fails exits 10 1035ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1163ms
     ✓ --paths with no match exits 1 1546ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 885ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 3324ms
     ✓ --marker reads a diff over 1 MiB 3067ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1998ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1770ms
     ✓ scan-diff finds an added skip 2124ms
     ✓ scan-diff ignores a skip predating the base 1456ms
     ✓ scan-diff reports a disabled test with its line 1969ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1754ms
     ✓ scan-diff ignores a removed comment in a test file 1779ms
     ✓ scan-diff ignores an assertion moved within the file 1746ms
     ✓ scan-diff still reports a removed assertion 1742ms
     ✓ scan-diff reports an assertion re-added only outside the test file 2167ms
     ✓ scan-diff finds an added pytest mark skip 2265ms
     ✓ scan-diff finds an added unittest skip 1676ms
     ✓ scan-diff finds an added bare skip call 1595ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1520ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1545ms
     ✓ scan-diff ignores an assertion whose expectation changed 1327ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 1358ms
     ✓ scan-diff reports a deleted test file 1435ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 1108ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 3393ms
     ✓ a title that already carries the marker is left alone 2247ms
     ✓ with no open PR: pushes the marker commit and edits no title 2311ms
     ✓ a re-run is deduped: no second marker commit 3080ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 3224ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 929ms
     ✓ --title-set skips gh entirely 1730ms
     ✓ refuses dev and main (exit 21) 917ms
   ✓ branches sync (24)
     ✓ Path A when origin/dev is an ancestor of HEAD 1362ms
     ✓ Path B once dev moved; --head checks a given commit 2124ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 2032ms
     ✓ --merge-docs merges dev when docs/ is behind 2283ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 2355ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 9618ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 2313ms
     ✓ --merge-docs skips an empty bkit:generate script 1542ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1183ms
     ✓ --merge-docs never merges on dev itself 930ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1356ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1361ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 1554ms
     ✓ --merge merges dev into the feature branch with a skip-ci merge commit, never a rebase 1546ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 868ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1770ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1687ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1579ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1175ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output with skip ci 1145ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 750ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 536ms
     ✓ exits 10 when the fetch fails 339ms
     ✓ refuses --merge-docs with --head, and an unknown --head 366ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 700ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 933ms
     ✓ a failed install stops ship (16) 921ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 728ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 661ms
     ✓ exits 10 when the fetch fails 539ms
   ✓ branches land (27)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 461ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1287ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1278ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1303ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1284ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2566ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2819ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 660ms
     ✓ local: names unpushed dev as the cause when the branch carries it 744ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 831ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1500ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1508ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1325ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1116ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1121ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1009ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 736ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1246ms
     ✓ land removes the worktree when only the copied .env is untracked 1327ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 942ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1331ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 6165ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 4157ms
     ✓ landPr refuses a main-based PR without retrying 1528ms
     ✓ landPr refuses when the PR base is unknown 2186ms
     ✓ PR not open (closed): stops (17) at once, no retry 2282ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 1645ms
     ✓ --attempt names the merge round in a fix commit 1549ms
     ✓ commits a rewritten and a deleted tracked file 1446ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 1619ms
     ✓ reports undeclared and runs nothing with no scripts 909ms
     ✓ reports undeclared and runs nothing with an empty script 862ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 1308ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 1332ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 1196ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/tools/instructions.test.ts > fully retired clauses > output-cap's sentence stays inline in the abort handover prompt
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/tools/instructions.test.ts:1029:3
    1027|   });
    1028|
    1029|   it("output-cap's sentence stays inline in the abort handover prompt"…
       |   ^
    1030|     const handover = CORPUS.find(
    1031|       (f) => f.id === ".bkit/core/prompts/bkit-debug-abort-handover.md…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/disk.test.ts > bkit disk prune — lock > renews its lock while a long step runs, so a waiter never takes it over
AssertionError: expected null to be 'locked' // Object.is equality

- Expected:
"locked"

+ Received:
null

 ❯ .bkit/core/engine/commands/workflow/disk.test.ts:302:58
    300|     await new Promise((resolve) => setTimeout(resolve, 100));
    301|     expect(Date.now() - fs.statSync(lock()).mtimeMs).toBeLessThan(60 *…
    302|     expect((await prune(cwd, "--mode=min")).json.reason).toBe("locked"…
       |                                                          ^
    303|     expect((await running).reason).toBeNull();
    304|     expect(order(cwd)).toEqual(["slow"]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs context > prints ref (#N on GitHub) and the labels the engine reads; a failed read is null
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:2159:3
    2157|   });
    2158|
    2159|   it("prints ref (#N on GitHub) and the labels the engine reads; a fai…
       |   ^
    2160|     const cwd = autoRepo();
    2161|     const unread = await context(cwd, "Design", "12");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  3 failed | 162 passed (165)
      Tests  3 failed | 6948 passed | 2 skipped (6953)
   Start at  13:03:55
   Duration  275.47s (tests 95%, setup 2%, import 2%, worker 1%, transform 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/719-cloud-variants-add/build-group-gate-1-3.log.reports/vitest-19447.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.73 |    82.71 |   94.98 |   91.02 |                   
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
 ...mands/workflow |   92.55 |    84.18 |    96.4 |   94.01 |                   
  branches.ts      |   89.58 |     82.9 |   97.74 |   90.97 | ...2550,2555,2580 
  challenge.ts     |   96.59 |    83.03 |     100 |      98 | 178,368-370,652   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.36 |    86.99 |      98 |   97.28 | ...1622,1793,1882 
  counters.ts      |   98.26 |    94.38 |     100 |    98.7 | 203,502           
  decisions.ts     |   95.32 |    80.72 |   97.72 |   98.36 | 195,300,369       
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   97.87 |    91.54 |   98.24 |   98.79 | 195,436-437,771   
  ledgers.ts       |   91.28 |    80.25 |   97.08 |   95.23 | ...1692-1693,1721 
  locks.ts         |   93.75 |    85.91 |   95.45 |   95.49 | ...09-210,379-380 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1159,1175-1176 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 489-490           
  runs.ts          |   92.97 |    84.37 |     100 |   94.41 | ...1938,1970-1974 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...55,304,324-329 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   97.39 |    95.19 |     100 |    98.7 | 117,228,468       
  step-table.ts    |     100 |    98.48 |     100 |     100 | 321               
  steps.ts         |   89.43 |    82.35 |    91.3 |   90.34 | ...1711,1716,1718 
  summary.ts       |   95.06 |    86.69 |   91.66 |   93.82 | ...99,407-413,441 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.39 |    88.23 |   96.55 |   96.61 | 23-24,235-236     
  tests-changed.ts |    93.1 |       75 |     100 |   94.23 | 64-65,68          
  tests.ts         |   97.36 |    89.36 |   97.15 |   98.22 | ...2069,2165-2167 
  tracker.ts       |   92.96 |    73.63 |     100 |   96.75 | ...53,865,948,996 
  workflows.ts     |   93.38 |    82.47 |   97.29 |   95.03 | ...1747,1921,2642 
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
Statements   : 89.73% ( 17315/19295 )
Branches     : 82.71% ( 12255/14816 )
Functions    : 94.98% ( 2821/2970 )
Lines        : 91.02% ( 15128/16619 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1931 of 3834 lines (132 KB of 289 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
