
> @cbartens/bkit@6.1.1 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static-unit && pnpm test:integration'


> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/165 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


 .bkit/core/.bkit/README.md
 342:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/cloud.md
 449:178  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/install.md
 19:1     warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 135:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 353:290  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 361:1    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


 .bkit/core/.bkit/jsonl.md
 196:3    warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 265:4    warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 419:106  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/pipeline.md
 144:227  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/providers.md
 47:301   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 177:787  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 184:120  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 186:172  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 448:97   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 824:80   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/templates.md
 504:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 626:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 699:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 203:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 277:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 104:383   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 109:488   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 146:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 172:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 628:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 867:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1044:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1152:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1313:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1371:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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

✖ 0 errors, 47 warnings and 0 suggestions in 150 files.
passed: true
skipped: null
files: 150

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> bkit ci slop

[bkit-ci] base 0f425fca22c88b4133182835840e4d7437cc56f0 (0f425fca22c88b4133182835840e4d7437cc56f0) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 0f425fca22c88b4133182835840e4d7437cc56f0
base: 0f425fca22c88b4133182835840e4d7437cc56f0
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 3.8 on 10 cores: unit limits 6400ms per test, 12800ms per hook (x1.28)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 37543ms
   ✓ resolveBkitBinary (3)
     ✓ names the pinned location when neither exists 340ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 1372ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 615ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 1494ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 1689ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 1677ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 1083ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 969ms
     ✓ counts commits behind origin/dev and the divergence age 1326ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 1400ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1995ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1124ms
     ✓ from a worktree, still names the main checkout and its outbox 1592ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 1351ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 961ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 1205ms
     ✓ prints the Jira site and project under jira 1167ms
     ✓ prints the board under github 1101ms
     ✓ prints the github progress and review states, defaults for a key left unset 1315ms
     ✓ prints the linear progress and review states, defaults for a key left unset 616ms
     ✓ prints the jira progress and review states, defaults for a key left unset 633ms
     ✓ prints the linear progress and review states, defaults for a key left unset 857ms
     ✓ prints null progress and review states under none 707ms
     ✓ prints buildPublishRemote and buildPublishLocal 541ms
     ✓ prints the publish defaults when package.json omits them 580ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 813ms
     ✓ prints nulls under github without a board, and for keys left unset 980ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 704ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 637ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1252ms
     ✓ an unpinned repo reports nulls and asks no registry 685ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 766ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 594ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 861ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 860ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (115 tests) 49123ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 1254ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 520ms
     ✓ done --group writes group on the row 339ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 385ms
     ✓ carries extra fields, parsed as JSON when they are JSON 314ms
     ✓ reports a failed commit with exit 8 without writing the row 2177ms
     ✓ a failed commit leaves no row staged in the index 1541ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1732ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1774ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1635ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1647ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1503ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 318ms
     ✓ fails on a placeholder left in the artifact 317ms
     ✓ fails on a missing artifact 389ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 302ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 360ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 406ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 559ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 419ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 649ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 734ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 564ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 689ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 971ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 676ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 510ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 600ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 515ms
     ✓ --attempt-of checks the row carries the derived counter 388ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1236ms
     ✓ writeStepRow refuses when a recorded path changed 1096ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 744ms
     ✓ writeStepRow appends its commit sha to the record 1259ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1664ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (9)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 549ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 1199ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 484ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 960ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 800ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 387ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1052ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 741ms
     ✓ does not count an artifact the run found committed when it started 643ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 308ms
     ✓ commits a package.json change outside bkit.workflows 462ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 826ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 54641ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 1210ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1416ms
     ✓ always writes the marker, even with no plan 558ms
     ✓ writes the linear marker shape, taking the tracker from package.json 1497ms
     ✓ writes the jira marker shape, taking the tracker from package.json 1271ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 2089ms
     ✓ refuses a PR from dev, main, or the base itself 425ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1100ms
     ✓ retries a failed create once, and exits 5 when it fails twice 917ms
     ✓ exits 5 when the open-PR probe errors 1298ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1119ms
     ✓ prs open still opens against any other base 1359ms
     ✓ exits 6 when the created PR's base is not --base 1282ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 1714ms
     ✓ exits 1 with found=false when there is none 845ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1216ms
     ✓ --number reads one PR, mergeable included 1101ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 1221ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1246ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 857ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 839ms
     ✓ drops the force-build marker from the title subject 507ms
     ✓ takes an explicit --subject 581ms
     ✓ runs no merge when the PR is already MERGED 682ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 650ms
     ✓ prs merge refuses a PR whose base is main 413ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 620ms
     ✓ prs merge refuses when the PR base is unknown 1137ms
     ✓ prs merge reads the base from the one pr view it already makes 711ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 1077ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 675ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 865ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 879ms
     ✓ never reads dev's required checks without --only-if-required 565ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 1111ms
     ✓ updates when a dev ruleset requires status checks 2055ms
     ✓ updates when dev's branch protection requires status checks 1398ms
     ✓ ignores dev rulesets that require no checks 1077ms
     ✓ updates when the repo cannot be resolved 569ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 565ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 513ms
     ✓ is not green when a check failed, naming it (exit 1) 706ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 1276ms
     ✓ is not green on an empty rollup (total 0) 839ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 539ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1229ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 482ms
     ✓ is a no-op when the title already says so 421ms
     ✓ strips the marker, with or without its bkit prefix 852ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1330ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 55055ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 2997ms
     ✓ runs code.ts through its declared gate in the built checkout 1413ms
     ✓ runs code.ts through its declared gate in the built checkout 1435ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 984ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1054ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1116ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 870ms
     ✓ runs the full gate for replayed debug code 1383ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1605ms
     ✓ installs local dependencies against the built target tree 1603ms
     ✓ runs the configured frozen install even without root dependencies 1150ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1201ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1530ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1661ms
     ✓ never pushes local dev commits missing from origin/dev 1635ms
     ✓ dev moved: rebuilds on the new dev and pushes again 2949ms
     ✓ dev moved before every push: exhausted, nothing landed 5719ms
     ✓ any other refusal is returned, not retried 2914ms
     ✓ pushToDev replays a commit range onto origin/dev 2778ms
     ✓ a replay retries on the new dev when dev moved 3827ms
     ✓ pushToDev log line names what it lands 1171ms
     ✓ runs no git hooks in the throwaway checkout, and says so 2296ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1812ms
     ✓ a push that fails without a server answer is returned once, never retried 2030ms
     ✓ a failed fetch is returned before anything is built 668ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2533ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1946ms
     ✓ lands from a clone whose fetch refspec omits dev 1785ms
     ✓ build throwing stops the landing and removes the throwaway checkout 931ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests) 63138ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 1204ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 1015ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1300ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 1660ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1696ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1305ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 1058ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1189ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 992ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1876ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1499ms
     ✓ PASS is 0 failures with or without reports 1790ms
     ✓ clears a previous attempt's reports before the gate runs 787ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1121ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1295ms
     ✓ a log under the outbox is named main-checkout relative in the record 1097ms
     ✓ a log small enough is copied whole: not clamped, raw null 1112ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1229ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 893ms
     ✓ numbers runs within the workflow's active run and per step 809ms
     ✓ without --file no row is written and the output carries row null 476ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1457ms
     ✓ a planned test that passes is a vacuous gap, exit 1 1000ms
     ✓ a planned test absent from a loaded report is a missing gap 876ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1259ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1031ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1377ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 1857ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1341ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1600ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 918ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1762ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1248ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1459ms
     ✓ green: a passed-accepted test is already landed, not a gap 1258ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1323ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 977ms
     ✓ green: --group audits only that group's tasks 891ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1086ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1044ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 840ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1651ms
     ✓ green: lists each gap kind, with the runner output 657ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1225ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 386ms
       ✓ green clears an exception-only task from a human commit 338ms
(node:46930) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:46930) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:46930) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:46930) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:46930) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:46930) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:46930) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (24 tests) 18725ms
   ✓ bkit-check-dependency-audit (5)
     ✓ exits 1 on a missing acceptance, 0 when clean, and 1 on a report with no advisories 388ms
   ✓ shipped copy-and-own test files (6)
     ✓ ci/bkit-check-capstone.test.mjs passes when run on its own 470ms
     ✓ ci/bkit-test-awake.test.mjs passes when run on its own 7903ms
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 8794ms
   ✓ bkit-check-capstone (10)
     ✓ passes its own copy-and-own test file (bkit's own copy) 463ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (101 tests) 75486ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 41306ms
     ✓ every prompt, workflow and utility agent has the three header blocks 507ms
     ✓ sync has nothing left to rewrite 26423ms
     ✓ every clause reaches the cut-off of one surface it applies to 2149ms
   ✓ fully retired clauses (6)
     ✓ output-cap's sentence stays inline in the abort handover prompt 4797ms
[feat/test 9e180a2] gate
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 23106ms
   ✓ readIssueTracker (5)
     ✓ reads the main checkout's package.json from inside a linked worktree 367ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ github: "priority #1, then https://github.com/o/r/issues/677" reads as issue 677 381ms
     ✓ linear with key abc configured: "fix ABC-12 (UTF-8 output)" reads as ABC-12 447ms
     ✓ linear with no key configured: a bare key names no issue, with a hint naming bkit.tracker.linear.team 414ms
     ✓ jira with no key configured: a bare key names no issue, with a hint naming bkit.tracker.jira.project 382ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 1722ms
   ✓ bkit fids resolve (12)
     ✓ 2. the current feat/ branch, when it embeds the issue 309ms
     ✓ 3. a FID logged for the issue on origin/dev, even when the working tree lacks it 319ms
     ✓ 4. mints from the title file; a JSON file with a title key also works 390ms
     ✓ 4. a stopword-only title falls back to the prompt; non-ASCII titles fold 394ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 477ms
   ✓ bkit fids design --description-file --prompt-file (5)
     ✓ a plan issue's Workstreams line lists the workstreams the plan covers 334ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 41166ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1277ms
     ✓ names each net-new and worsened finding in the log and the JSON 1487ms
     ✓ fails on a net score rise with no net count change 1936ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1644ms
     ✓ treats a net score at or below 0.001 as float noise 1137ms
     ✓ passes when the change only resolves findings 1484ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1325ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 958ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 753ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 371ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 750ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1325ms
     ✓ exits 4 on a dropped net field instead of silently passing 822ms
     ✓ exits 4 on no summary instead of silently passing 873ms
     ✓ exits 4 on output that is not JSON instead of silently passing 745ms
     ✓ exits 5 when the base worktree cannot be created 563ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1027ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1305ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1082ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 878ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 945ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 2148ms
   ✓ bkit ci prose — file selection (7)
     ✓ defaults to every markdown file outside node_modules 315ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 831ms
     ✓ explicit globs can select ignored prose and nested checkout files 741ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 497ms
     ✓ fails (exit 1) when vale reports alerts 561ms
     ✓ exits 6 on a vale runtime error 803ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 574ms
     ✓ falls back to vale sync when the main worktree has none 536ms
     ✓ fails when vale sync cannot restore the required styles 484ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 520ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 453ms
     ✓ exits 1 naming the files outside, whatever the commit message says 405ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 732ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 583ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 516ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 26923ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 3056ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2428ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 313ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 371ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 392ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 2685ms
     ✓ does not fall back through a malformed later success receipt 1785ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1004ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 993ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1879ms
     ✓ requires proof even when the pushed increment changes no files 1110ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 641ms
     ✓ does not record a committed tree 716ms
     ✓ records no proof for a failed gate or lighter gate 1196ms
     ✓ requires integration proof when integration is declared 1579ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2118ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ locates CI evidence using prompt saved issue and local precedence 2938ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1696ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1428ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2582ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 3599ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --fetch refreshes origin/<branch> before gating 712ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 335ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 410ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 797ms
       ✓ a source change past the validated head refuses (17) and names the path 568ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 744ms
       ✓ --validated without --month / --fid is a usage error (2) 753ms
       ✓ a validated sha that is not an ancestor refuses (17) 677ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 563ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 822ms
     ✓ a failed re-trigger push names the cause in the log 1746ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1353ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1850ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 920ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 493ms
     ✓ gh-error: every poll errored 329ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 616ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 657ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1056ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1042ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2392ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2892ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 632ms
     ✓ re-trigger on dev only uses the record of its own FID 835ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1048ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 469ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 561ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 409ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 439ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 543ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 649ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 702ms
     ✓ --file and --step go together 615ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 25929ms
> [bkit] TRUNCATED HERE — 41 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 12367ms
   ✓ bkit roadmap mirror (8)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 463ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1694ms
     ✓ a refused dev push is logged, never fails the close 2448ms
     ✓ an unreachable remote is logged, never fails the close 517ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (65 tests) 23336ms
   ✓ bkit worktrees setup — adopt in place (10)
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 782ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 319ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 328ms
> [bkit] TRUNCATED HERE — 47 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 835ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 808ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 1003ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 1267ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 799ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 730ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 774ms
     ✓ --file into a missing directory is refused, not created 1408ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 891ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 1279ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1086ms
     ✓ reports excluded intervals as unread even when pagination finishes 839ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 837ms
     ✓ reports an unread remainder at the page cap 719ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 779ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 631ms
     ✓ rejects missing summaries instead of treating them as empty results 677ms
     ✓ reports a failed first page as unavailable 482ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 789ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 990ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 1061ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1347ms
     ✓ reports excluded intervals as unread even when pagination finishes 1178ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 900ms
     ✓ reports an unread remainder at the page cap 707ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 729ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 1309ms
     ✓ rejects missing summaries instead of treating them as empty results 1579ms
     ✓ reports a failed first page as unavailable 1124ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 869ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 5124ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (70 tests) 4070ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1345ms
     ✓ runGit names ENOBUFS when output passes the limit 872ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 916ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1406ms
     ✓ counts files committed since --base 1438ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 756ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 971ms
     ✓ runs the --fallback gate even when no file changed, as it did before 1033ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 1420ms
     ✓ resolves config from the repo root when run from a subdirectory 758ms
     ✓ exits 6 when the PUT fails 1181ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1347ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 540ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 505ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 364ms
     ✓ exits 6 when the api answer is not JSON 524ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (100 tests) 42313ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ rolls over after intervening comments external edits and deletion 327ms
     ✓ starts only new source after overflow or missing source 309ms
     ✓ uses exact new comment after a failed eligibility read 312ms
   ✓ bounded nonfatal publication (10)
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 357ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 473ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 778ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 799ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 774ms
     ✓ fetches the issue and its comments as GitHub returns them 840ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 1134ms
     ✓ invalidates missing corrupt and unsupported progress cache 1697ms
     ✓ contains cache read and write failures as standalone degradation 1076ms
     ✓ uses legacy receipts and contains receipt failures 740ms
     ✓ records an engine-action row and skips the same key + body on a re-run 610ms
     ✓ a recent identical comment counts as done (the final close comment) 1389ms
     ✓ a failed post reports done false with the reason and never leaks a token 1413ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1255ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 727ms
     ✓ a different marker hash posts 642ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 497ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (23 tests) 3924ms
   ✓ publication ownership lock (4)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 531ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1082ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 382ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 2694ms
   ✓ gradeCompliance — the grade bkit workflows close runs before its report (7)
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 638ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 562ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 388ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (20 tests) 2352ms
   ✓ bkit tasks currency (6)
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ answers for the cwd, not an inherited GIT_DIR 389ms
   ✓ guardRepoConfig (6)
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 362ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (75 tests) 2266ms
   ✓ check — hole classes (26)
> [bkit] TRUNCATED HERE — 162 lines omitted. Dropped content was NOT read.
       ✓ a new run in the same chat gets its own session row 319ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 348ms
   ✓ bkit workflows fail (19)
     ✓ aborts a rebase only when one is in progress 578ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 571ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 582ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 405ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 376ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 330ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 315ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 327ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 414ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 535ms
     ✓ an unwritable stats path is logged and never fails the close 564ms
     ✓ appends the completeness row before the workflow-done row 731ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 589ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 848ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1124ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 757ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 742ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 618ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 672ms
     ✓ --number without --outbox is a usage error 806ms
     ✓ --flush is ship only 539ms
   ✓ bkit workflows handover (23)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 556ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 329ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2244ms
     ✓ --flush with nothing to record commits and pushes nothing 1697ms
     ✓ --flush carries the named worktree's logs into the dev commit 2319ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2266ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2224ms
     ✓ a close that landed releases the lock 2236ms
     ✓ removes the worktree before it releases the lock 2451ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 555ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 585ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 359ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a second run's record does not let this FID's close commit 641ms
     ✓ record is present after workflows close and before the push 1167ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2383ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 541ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --summary prints the file and keeps a copy in --outbox 934ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 693ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 342ms
 ✓ .bkit/core/engine/ledgers/journal.test.ts (18 tests) 693ms
 ✓ .bkit/core/engine/audits/workflows/question-option-format.test.ts (22 tests) 391ms
> [bkit] TRUNCATED HERE — 802 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 520 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 85 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 33ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 18ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 9ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 64ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 202ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 546ms
     ✓ refuses a code conflict and aborts the rebase on the spot 552ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 2195ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 415ms
     ✓ produces byte-identical output to merge=union 1009ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 729ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 2411ms
     ✓ refuses a lockfile whose regenerate command fails 1664ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 803ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1160ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 613ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 580ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 927ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 998ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 544ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 778ms
       ✓ runs (0) with the landed path count once dev moved 1578ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 775ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1207ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1580ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2911ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 772ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1109ms
     ✓ --mode=abort pushes when the branch has no open PR 1292ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1805ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 625ms
     ✓ --open-pr carries the MCP answer and skips gh 792ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1391ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1625ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3890ms
     ✓ skip-ci HEAD on the replay is refused 1023ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2851ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 776ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1227ms
     ✓ a fetch that fails exits 10 566ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 757ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 524ms
     ✓ scan-diff attributes deletion to its old test ins… 509ms
     ✓ scan-diff consumes each moved assertion once and … 621ms
     ✓ scan-diff does not match identical assertions fro… 681ms
     ✓ scan-diff does not match the same leaf test name … 894ms
     ✓ scan-diff does not match a same-named test with d… 682ms
     ✓ scan-diff does not match a same-named test with c… 610ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 522ms
     ✓ --paths with no match exits 1 546ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 548ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 986ms
     ✓ --marker reads a diff over 1 MiB 857ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 807ms
     ✓ scan-diff ignores a removed comment in a test file 906ms
     ✓ scan-diff ignores an assertion moved within the file 865ms
     ✓ scan-diff still reports a removed assertion 932ms
     ✓ scan-diff reports an assertion re-added only outside the test file 914ms
     ✓ scan-diff finds an added pytest mark skip 967ms
     ✓ scan-diff finds an added unittest skip 1012ms
     ✓ scan-diff finds an added bare skip call 927ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1000ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1080ms
     ✓ scan-diff ignores an assertion whose expectation changed 944ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 870ms
     ✓ scan-diff reports a deleted test file 934ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 761ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 894ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 860ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 731ms
     ✓ --merge-docs skips an empty bkit:generate script 683ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 533ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 927ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1225ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 990ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1279ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1340ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 668ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 483ms
     ✓ exits 10 when the fetch fails 313ms
     ✓ refuses --merge-docs with --head, and an unknown --head 330ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 667ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1025ms
     ✓ a failed install stops ship (16) 880ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 781ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 759ms
     ✓ exits 10 when the fetch fails 552ms
   ✓ branches land (27)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 500ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1463ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1432ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1710ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 919ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1770ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 346ms
     ✓ reports undeclared and runs nothing with an empty script 337ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 461ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 530ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 328ms
> [bkit] TRUNCATED HERE — 105 lines omitted. Dropped content was NOT read.
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |   99.06 |    98.51 |     100 |     100 | 267,318           
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   89.92 |    85.46 |   95.47 |   90.53 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 377 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 1252 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 853 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 24 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 27 ms
ok 19 stub: the response selector is cleared before running its body # in 24 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 31 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 37 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 27 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 24 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 31 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 20 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 50 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 85 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 743 ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
ok 33 an empty value unsets the key instead of setting an empty string # in 260 ms
ok 34 non-BKIT_ keys are skipped # in 250 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 268 ms
ok 36 a failed unsetenv is retried on the next run # in 319 ms
ok 37 logs key names only, never values # in 256 ms
ok 38 missing env file exits 0 without calling launchctl # in 50 ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
✔ shell cancellation preserves a nested machine-lock owner (599.010417ms)
✔ nested shell cancellation preserves a nested machine-lock owner (698.875958ms)
✔ a hard process-group timeout reaches a shell command during cleanup (110.488ms)
✔ ships a command-scoped sleep prevention wrapper (0.165166ms)
✔ preserves arguments, output and nonzero exit status (89.4215ms)
✔ runs an entire shell chain and retains its failure (52.440125ms)
✔ reports a missing command as 127 (52.243959ms)
✔ requires a command (47.688541ms)
✔ non-macOS platform selection runs commands without sleep prevention (76.587917ms)
✔ hard timeout escalation reaches a command that ignores TERM (183.328208ms)
✔ forwards POSIX cancellation to the command and releases the assertion (88.694625ms)
✔ holds a real macOS assertion only while the command runs (126.616917ms)
ℹ tests 20
ℹ suites 0
ℹ pass 20
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
> node scripts/ci/bkit-test-awake.mjs vitest run integration.test

[test-timeout-budget] load average 6.8 on 10 cores: unit limits 7900ms per test, 15800ms per hook (x1.58)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] opencode: .opencode/plugin/bkit-rules.js

stdout | .bkit/core/engine/install/modules/opencode.integration.test.ts > runOpencodeModule — staging zero-footprint on failure (KN-12, Task 2.2) > after a successful install, .opencode/ exists; uninstalling leaves zero footprint
[bkit-install] write: .opencode/agents/bkit-audit-generate.md
[bkit-install] write: .opencode/agents/bkit-build-challenge-1.md
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 185 lines omitted. Dropped content was NOT read.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

stderr | scripts/harvest/ledgers.integration.test.ts > Harvest boundary: stats copy-only, friction moved (WS4-T1, #343) > count-only aggregates deferrals.jsonl and failures.jsonl without copying prose
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-dLq6KH/bkit
> [bkit] TRUNCATED HERE — 123 lines omitted. Dropped content was NOT read.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-N7tCfj/Documents/GitHub/no-remote-app — falling back to path-derived slug "no-remote-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.

stderr | scripts/harvest/ledgers.integration.test.ts > Harvest: a friction row the dispatch seam wrote > keeps a seam-written tool-failure row through commit and harvest
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-eTG6N8/bkit
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
 ✓ scripts/harvest/ledgers.integration.test.ts (24 tests) 2264ms
   ✓ Harvest: a friction row the dispatch seam wrote (1)
     ✓ keeps a seam-written tool-failure row through commit and harvest 1238ms
 ✓ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts (43 tests) 39741ms
   ✓ machine lock slots, order and wait budgets (11)
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ a stack named by BKIT_LOCAL_STACK never waits on the shared one 507ms
     ✓ every worktree of one repo resolves the main checkout's lock, and waits on it 890ms
     ✓ a holder that stops before it answers fails the take at once instead of hanging 2136ms
     ✓ a named lock is machine-wide: checkouts of two different repos wait on the same named lock 2853ms
     ✓ copied-repository lock helpers execute in the requested caller checkout 639ms
     ✓ one process holds a named lock and the unnamed stack lock side by side 590ms
     ✓ the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other 1456ms
     ✓ run exits 75 when the wait gives up, distinct from the command's own failure 463ms
     ✓ a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy 781ms
     ✓ run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name 531ms
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (37 tests) 63934ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (32)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 3243ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 387ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 2828ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone 1724ms
     ✓ T16: a Jira-shaped commit scope with a digit in the key (ab1-123-slug) no-ops — no dispatch 1888ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 1264ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 2796ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 2377ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 2518ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 524ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 2378ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 2119ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 1675ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 1939ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 2654ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 1513ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 2223ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 2342ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 2371ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 2667ms
       ✓ a branch with no status.jsonl dispatches as before 2621ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 1287ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 3175ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 2726ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 1836ms
> [bkit] TRUNCATED HERE — 49 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 143 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 143 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 143 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 137 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-build-plan-verify.toml
[bkit-install] write: .codex/agents/bkit-debug-abort-handover.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-diagnose.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-remediate.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-reproduce.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-soak.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-1.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-2.toml
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-utility-update-deferrals.toml
[bkit-install] write: .codex/agents/bkit-utility-update-documentation.toml
[bkit-install] write: .codex/agents/bkit-utility-update-failures.toml
[bkit-install] write: .codex/agents/bkit-utility-update-knowledge.toml
[bkit-install] write: .codex/agents/bkit-utility-update-roadmap.toml
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 137 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 143 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 143 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 51 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 143 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 143 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 143 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 160 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 143 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 143 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 160 lines omitted. Dropped content was NOT read.
     ✓ tests run with an unwritable lock dir exits 4 naming the path 1061ms
     ✓ tests run with --lock-wait-s=0 exits 81 at once against a held lock 1063ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 1114ms
     ✓ the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 1355ms
 ✓ .bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts (16 tests) 1063ms
> [bkit] TRUNCATED HERE — 51 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1796ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 2329ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 3132ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1247ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 818ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 1904ms
     ✓ plan installs dependencies like build and debug 1135ms
     ✓ design stops on a failed install (5) 1349ms
     ✓ plan stops on a failed install (5) 1674ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1320ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1989ms
     ✓ fails without minting when origin cannot be reached 346ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1314ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1305ms
   ✓ bkit worktrees setup — mint (resume) (24)
     ✓ rebases onto origin/dev and clears a stale sentinel 3432ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2374ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 2928ms
     ✓ debug: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 4120ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 3516ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 3407ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 3119ms
> [bkit] TRUNCATED HERE — 47 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] write: .claude/agents/bkit-build-plan-verify.md
[bkit-check] [dry-run] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-check] [dry-run] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-check] [dry-run] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-check] [dry-run] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-check] [dry-run] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-check] [dry-run] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-check] [dry-run] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-check] [dry-run] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-check] [dry-run] write: .claude/agents/bkit-utility-update-failures.md
[bkit-check] [dry-run] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-check] [dry-run] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 33 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ consumer-added extra key in opencode.json → check exits 0 (deep-contain, not drift) 4557ms
     ✓ opencode installed but no provider recorded → check exits 1 and names the fix 2898ms
     ✓ a consumer with no opencode host at all is not failed for a missing provider 5688ms
   ✓ bkit check — antigravity detected from any plugin file (1)
     ✓ deleted plugin.json + neutered guardrails command + deleted guardrails hook → check exits 1 naming each 6888ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ bkit check with stale consumer prompts.md does not emit Missing model lookup 760ms
   ✓ Scenario: bkit check stale-marker gate is branch-scoped (#256) (2)
     ✓ on main: hard-fails (exit 1) and names the bkit-managed-stale BLOCKER 947ms
     ✓ on a feature branch: surfaces a non-blocking ADVISORY, no marker-drift hard-fail line 1093ms
 ✓ .bkit/core/engine/audits/templates/auto-route-marker.integration.test.ts (25 tests) 18130ms
   ✓ bkit [auto route] marker comes from the re-read labels (25)
> [bkit] TRUNCATED HERE — 63 lines omitted. Dropped content was NOT read.
     ✓ Codex: the dependency install runs in the repo after a download step leaves it 916ms
     ✓ Claude session hook: context-fetch provisioning (3)
       ✓ runs every recipe through bkit context provision and tells the agent on stdout what failed 1532ms
       ✓ prints nothing to stdout when every recipe succeeds 2303ms
       ✓ logs and carries on when the installed bkit has no provision verb 1126ms
> [bkit] TRUNCATED HERE — 143 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 157 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 153 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 157 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 158 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 157 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 158 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 168 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 200 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 170 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 174 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 374 lines omitted. Dropped content was NOT read.
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 750ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 1126ms
     ✓ stops the step when the command crashed or was misused 1565ms
   ✓ deferred landing of a held build (ship, matrix: held → landed) (2)
> [bkit] TRUNCATED HERE — 99 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 187 lines omitted. Dropped content was NOT read.
   ✓ bkit status — integration (4)
     ✓ exits 0 and prints [bkit-status] prefix 682ms
     ✓ writes zero files (purely read-only — write-set assertion) 760ms
     ✓ reports installed hosts (at minimum claude and cursor on a fresh consumer) 655ms
     ✓ reports opencode as absent when .opencode/ does not exist 619ms
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ .husky/pre-push: empty stdin → gates still run 872ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 845ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 1692ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 952ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 474ms
     ✓ .husky/pre-push: first and last lines name the log 583ms
     ✓ .husky/pre-push: the hook body runs once 1003ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 1043ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 824ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 1281ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 1686ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 957ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 841ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 1144ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 754ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 829ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 1212ms
     ✓ .husky/pre-push: a gate fails → no disk prune 1515ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 730ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 805ms
     ✓ a stale register stops the push before any gate runs 1132ms
     ✓ bkit check fails → the push stops before any gate runs 934ms
     ✓ the dependency audit runs before any gate, when its script is present 1167ms
     ✓ no dependency-audit script → skipped, the gates still run 1125ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 887ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 1103ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1119ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 835ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 954ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 973ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 957ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 804ms
   ✓ graphify register pre-push gate (18)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ branch with no open PR → no check, push goes on 744ms
     ✓ branch push, gh not installed → loud NOT-checked warning, push goes on 306ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 784ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 460ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 879ms
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
[bkit-test] write: .claude/agents/bkit-build-plan-verify.md
[bkit-test] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-test] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-test] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-test] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-test] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-test] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-test] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-test] write: .claude/agents/bkit-utility-update-failures.md
[bkit-test] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-test] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
[bkit-test] write: .claude/agents/bkit-build-plan-verify.md
[bkit-test] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-test] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-test] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-test] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-test] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-test] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-test] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-test] write: .claude/agents/bkit-utility-update-failures.md
[bkit-test] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-test] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-test] write: .claude/agents/bkit-build-plan-verify.md
[bkit-test] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-test] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-test] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-test] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-test] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-test] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-test] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-test] write: .claude/agents/bkit-utility-update-failures.md
[bkit-test] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-test] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 61 lines omitted. Dropped content was NOT read.
     ✓ dedups: second edit of the same file in the same session is a no-op 537ms
     ✓ warns again for a different file in the same session 427ms
   ✓ gateguard hook — no-op / fail-open cases (7)
     ✓ a subagent sharing its parent's session_id gets its own checklist, once 483ms
npm warn Unknown env config "npm-globalconfig". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
> [bkit] TRUNCATED HERE — 52 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-test] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 160 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 471 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 182 lines omitted. Dropped content was NOT read.
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 66 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 265 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 185 lines omitted. Dropped content was NOT read.
docs/templates/bkit-audit-documentation.md       | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-duplication.md         | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-failures.md            | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-flakes.md              | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-gates.md               | delete                 | bkit-owned docs template — removed on full/core uninstall
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 181 lines omitted. Dropped content was NOT read.
[bkit-test] delete: docs/templates/bkit-audit-dependencies.md
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
[bkit-test] delete: docs/templates/bkit-audit-issues.md
[bkit-test] delete: docs/templates/bkit-audit-llm.md
[bkit-test] delete: docs/templates/bkit-audit-logs.md
[bkit-test] delete: docs/templates/bkit-audit-models.md
[bkit-test] delete: docs/templates/bkit-audit-privacy.md
[bkit-test] delete: docs/templates/bkit-audit-prompts.md
[bkit-test] delete: docs/templates/bkit-audit-red-team.md
[bkit-test] delete: docs/templates/bkit-audit-reliability.md
[bkit-test] delete: docs/templates/bkit-audit-repo.md
[bkit-test] delete: docs/templates/bkit-audit-security.md
[bkit-test] delete: docs/templates/bkit-audit-slop.md
[bkit-test] delete: docs/templates/bkit-audit-testing.md
[bkit-test] delete: docs/templates/bkit-audit-usability.md
[bkit-test] delete: docs/templates/bkit-plan.md
[bkit-test] package.json: removed bkit install-state block
[bkit-test] delete: .bkit/templates/
[bkit-test] delete: .bkit/shared (payload view link)
[bkit-test] prune empty dir: docs/templates
[bkit-test] prune empty dir: .agents
[bkit-test] prune empty dir: docs

 ✓ .bkit/core/engine/install/payload-links.integration.test.ts (8 tests) 2206ms
   ✓ install creates the payload view links (5)
     ✓ links .bkit/core + .bkit/shared, relative, into the package payload 339ms
     ✓ never clobbers a real directory — skipped, contents intact, advisory raised 358ms
     ✓ re-points a link that resolves somewhere else 322ms
   ✓ uninstall removes the payload view links (3)
     ✓ dry-run lists the links as deleted without removing them 307ms
     ✓ leaves a real directory at the link path alone — consumer content 358ms
stdout | .bkit/core/engine/install/template-copies.integration.test.ts > install copies the template set into .bkit/templates/ > a second run writes no copy; a stale or stray copy is a write in dry-run and live alike
[bkit-test] Running core payload pass
[bkit-test] core: .agents/context.md
[bkit-test] core: .agents/docs.md
[bkit-test] core: .agents/rules.md
[bkit-test] core: .agents/skills.md
[bkit-test] core: AGENTS.md
[bkit-test] core: docs/templates/bkit-audit-accessibility.md
[bkit-test] core: docs/templates/bkit-audit-adoption.md
[bkit-test] core: docs/templates/bkit-audit-agents.md
[bkit-test] core: docs/templates/bkit-audit-aio-seo.md
[bkit-test] core: docs/templates/bkit-audit-analytics.md
[bkit-test] core: docs/templates/bkit-audit-annotations.md
[bkit-test] core: docs/templates/bkit-audit-app-performance.md
[bkit-test] core: docs/templates/bkit-audit-app-store.md
[bkit-test] core: docs/templates/bkit-audit-architecture.md
[bkit-test] core: docs/templates/bkit-audit-ci-performance.md
[bkit-test] core: docs/templates/bkit-audit-config.md
[bkit-test] core: docs/templates/bkit-audit-cost.md
[bkit-test] core: docs/templates/bkit-audit-coverage.md
[bkit-test] core: docs/templates/bkit-audit-database.md
[bkit-test] core: docs/templates/bkit-audit-dead-code.md
[bkit-test] core: docs/templates/bkit-audit-deferrals.md
[bkit-test] core: docs/templates/bkit-audit-dependencies.md
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
[bkit-test] core: docs/templates/bkit-audit-issues.md
[bkit-test] core: docs/templates/bkit-audit-llm.md
[bkit-test] core: docs/templates/bkit-audit-logs.md
[bkit-test] core: docs/templates/bkit-audit-models.md
[bkit-test] core: docs/templates/bkit-audit-privacy.md
[bkit-test] core: docs/templates/bkit-audit-prompts.md
[bkit-test] core: docs/templates/bkit-audit-red-team.md
[bkit-test] core: docs/templates/bkit-audit-reliability.md
[bkit-test] core: docs/templates/bkit-audit-repo.md
[bkit-test] core: docs/templates/bkit-audit-security.md
[bkit-test] core: docs/templates/bkit-audit-slop.md
[bkit-test] core: docs/templates/bkit-audit-testing.md
[bkit-test] core: docs/templates/bkit-audit-usability.md
[bkit-test] core: docs/templates/bkit-plan.md
[bkit-test] core: .gitignore
[bkit-test] core: .gitattributes
[bkit-test] core: docs/architecture.md
[bkit-test] core: docs/data-schema.md
[bkit-test] core: docs/deployments.md
[bkit-test] core: docs/design.md
[bkit-test] core: docs/noise.md
[bkit-test] core: docs/observability.md
[bkit-test] core: docs/security.md
[bkit-test] core: docs/setup.md
[bkit-test] core: docs/technology.md
[bkit-test] core: docs/testing.md
[bkit-test] Running bkit docs pass
[bkit-test] core: .bkit/authoring.md
[bkit-test] core: .bkit/cloud.md
[bkit-test] core: .bkit/cli.md
[bkit-test] core: .bkit/comparison.md
[bkit-test] core: .bkit/install.md
[bkit-test] core: .bkit/jsonl.md
[bkit-test] core: .bkit/LICENSE.md
[bkit-test] core: .bkit/pipeline.md
[bkit-test] core: .bkit/providers.md
[bkit-test] core: .bkit/prompts.md
[bkit-test] core: .bkit/router.md
[bkit-test] core: .bkit/templates.md
[bkit-test] core: .bkit/trackers.md
[bkit-test] core: .bkit/workflows.md
[bkit-test] core: .bkit/README.md
[bkit-test] Running template copies pass
[bkit-test] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-test] template added: .bkit/templates/.cursor/Dockerfile
[bkit-test] template added: .bkit/templates/.cursor/environment.json
[bkit-test] template added: .bkit/templates/.cursor/settings.json
[bkit-test] template added: .bkit/templates/.envrc
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-test] template added: .bkit/templates/.github/dependabot.yml
[bkit-test] template added: .bkit/templates/.github/renovate.json5
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-test] template added: .bkit/templates/.graphifyignore
[bkit-test] template added: .bkit/templates/.husky/pre-commit
[bkit-test] template added: .bkit/templates/.husky/pre-push
[bkit-test] template added: .bkit/templates/.lintstagedrc.json
[bkit-test] template added: .bkit/templates/.oxlintrc.json
[bkit-test] template added: .bkit/templates/.prettierignore
[bkit-test] template added: .bkit/templates/.serena/project.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-test] template added: .bkit/templates/.vale.ini
[bkit-test] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-test] template added: .bkit/templates/context/bkit-expo.md
[bkit-test] template added: .bkit/templates/context/bkit-github.md
[bkit-test] template added: .bkit/templates/context/bkit-inngest.md
[bkit-test] template added: .bkit/templates/context/bkit-maestro.md
[bkit-test] template added: .bkit/templates/context/bkit-playwright.md
[bkit-test] template added: .bkit/templates/context/bkit-resend.md
[bkit-test] template added: .bkit/templates/context/bkit-sentry.md
[bkit-test] template added: .bkit/templates/context/bkit-serena.md
[bkit-test] template added: .bkit/templates/context/bkit-stripe.md
[bkit-test] template added: .bkit/templates/context/bkit-supabase.md
[bkit-test] template added: .bkit/templates/context/bkit-tavily.md
[bkit-test] template added: .bkit/templates/context/bkit-vercel.md
[bkit-test] template added: .bkit/templates/docs/capabilities.md
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-test] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-test] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-test] template added: .bkit/templates/slop-scan.config.json
[bkit-test] payload link: .bkit/core
[bkit-test] payload link: .bkit/shared
[bkit-test] core: .bkit/allowlist.json
[bkit-test] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-test] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-test] write version pin: .bkit/version (6.1.1)
[bkit-test] Running core payload pass
[bkit-test] Running bkit docs pass
[bkit-test] Running template copies pass

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical --opencode=<provider> removal (#281 Task 4) > re-points bkit.providers.opencode.default when the active provider is removed
[bkit-uninstall] removed provider block "openrouter" from opencode.json
[bkit-uninstall] updated package.json: bkit.providers.opencode.installed=[ollama] bkit.providers.opencode.default=ollama
[bkit-uninstall] write: .opencode/agents/bkit-audit-generate.md
[bkit-uninstall] write: .opencode/agents/bkit-build-challenge-1.md
[bkit-uninstall] write: .opencode/agents/bkit-build-challenge-2.md
[bkit-uninstall] write: .opencode/agents/bkit-build-install-skills.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-convert.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-current.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-gaps-remediate.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-tasks.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-tests.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-uninstall] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-uninstall] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
[bkit-uninstall] write: .opencode/agents/bkit-design-brainstorm-ideate-3.md
[bkit-uninstall] write: .opencode/agents/bkit-design-generate.md
[bkit-uninstall] write: .opencode/agents/bkit-design-organise.md
[bkit-uninstall] write: .opencode/agents/bkit-design-review-1.md
[bkit-uninstall] write: .opencode/agents/bkit-design-review-2.md
[bkit-uninstall] write: .opencode/agents/bkit-design-spike.md
[bkit-uninstall] write: .opencode/agents/bkit-design-update.md
[bkit-uninstall] write: .opencode/agents/bkit-plan-generate.md
[bkit-uninstall] write: .opencode/agents/bkit-plan-review-1.md
[bkit-uninstall] write: .opencode/agents/bkit-plan-review-2.md
[bkit-uninstall] write: .opencode/agents/bkit-plan-scope-check.md
[bkit-uninstall] write: .opencode/agents/bkit-plan-update.md
[bkit-uninstall] write: .opencode/agents/bkit-ship-conflict-resolve.md
[bkit-uninstall] write: .opencode/agents/bkit-ship-deferred-sweep.md
[bkit-uninstall] write: .opencode/agents/bkit-ship-update-docs.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-compress-markdown.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-decisions.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-roadmap.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-tracker.md
[bkit-uninstall] write: .opencode/commands/bkit-auto.md
[bkit-uninstall] write: .opencode/commands/bkit-build.md
[bkit-uninstall] write: .opencode/commands/bkit-debug.md
[bkit-uninstall] write: .opencode/commands/bkit-design.md
[bkit-uninstall] write: .opencode/commands/bkit-plan.md
[bkit-uninstall] write: .opencode/commands/bkit-ship.md
[bkit-uninstall] active provider switched to "ollama" — re-rendered 46 .opencode/ agent/command file(s) to its model pins.

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical --opencode=<provider> removal (#281 Task 4) > falls through to full teardown when the last provider is removed
[bkit-uninstall] removed provider block "openrouter" from opencode.json
[bkit-uninstall] updated package.json: bkit.providers.opencode.installed=[] bkit.providers.opencode.default=(removed)
[bkit-uninstall] no providers remain — triggering full opencode host teardown...
[bkit-uninstall] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall] delete mirror: .opencode/agents/bkit-build-plan-tasks.md
[bkit-uninstall] delete mirror: .opencode/commands/bkit-build.md
[bkit-uninstall] prune empty dir: .opencode/agents
[bkit-uninstall] prune empty dir: .opencode/commands
[bkit-uninstall] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > targeted uninstall drops the module's bkit.* keys > --auto resets bkit.cloud.agent to unset and keeps every other key
[bkit-uninstall-surgical-test] package.json: reset bkit.cloud.agent to unset

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > targeted uninstall drops the module's bkit.* keys > --opencode resets bkit.providers.opencode.default and .installed to unset
[bkit-uninstall-surgical-test] absent: .opencode/opencode.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] package.json: reset bkit.providers.opencode.default, bkit.providers.opencode.installed to unset

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > targeted uninstall drops the module's bkit.* keys > a dry run lists the keys and writes nothing
[bkit-uninstall-surgical-test] [dry-run] Decision table:
[bkit-uninstall] No files to process.

[bkit-uninstall-surgical-test] [dry-run] package.json: reset bkit.cloud.agent to unset

 ✓ .bkit/core/engine/commands/install/uninstall.integration.test.ts (20 tests) 960ms
   ✓ surgical --opencode=<provider> removal (#281 Task 4) (4)
     ✓ re-points bkit.providers.opencode.default when the active provider is removed 634ms
stdout | .bkit/core/engine/install/template-copies.integration.test.ts > uninstall > removes the consumer's .bkit/templates/ copies
[bkit-test] Running core payload pass
[bkit-test] core: .agents/context.md
[bkit-test] core: .agents/docs.md
[bkit-test] core: .agents/rules.md
[bkit-test] core: .agents/skills.md
[bkit-test] core: AGENTS.md
[bkit-test] core: docs/templates/bkit-audit-accessibility.md
[bkit-test] core: docs/templates/bkit-audit-adoption.md
[bkit-test] core: docs/templates/bkit-audit-agents.md
[bkit-test] core: docs/templates/bkit-audit-aio-seo.md
[bkit-test] core: docs/templates/bkit-audit-analytics.md
[bkit-test] core: docs/templates/bkit-audit-annotations.md
[bkit-test] core: docs/templates/bkit-audit-app-performance.md
[bkit-test] core: docs/templates/bkit-audit-app-store.md
[bkit-test] core: docs/templates/bkit-audit-architecture.md
[bkit-test] core: docs/templates/bkit-audit-ci-performance.md
[bkit-test] core: docs/templates/bkit-audit-config.md
[bkit-test] core: docs/templates/bkit-audit-cost.md
[bkit-test] core: docs/templates/bkit-audit-coverage.md
[bkit-test] core: docs/templates/bkit-audit-database.md
[bkit-test] core: docs/templates/bkit-audit-dead-code.md
[bkit-test] core: docs/templates/bkit-audit-deferrals.md
[bkit-test] core: docs/templates/bkit-audit-dependencies.md
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
[bkit-test] core: docs/templates/bkit-audit-issues.md
[bkit-test] core: docs/templates/bkit-audit-llm.md
[bkit-test] core: docs/templates/bkit-audit-logs.md
[bkit-test] core: docs/templates/bkit-audit-models.md
[bkit-test] core: docs/templates/bkit-audit-privacy.md
[bkit-test] core: docs/templates/bkit-audit-prompts.md
[bkit-test] core: docs/templates/bkit-audit-red-team.md
[bkit-test] core: docs/templates/bkit-audit-reliability.md
[bkit-test] core: docs/templates/bkit-audit-repo.md
[bkit-test] core: docs/templates/bkit-audit-security.md
[bkit-test] core: docs/templates/bkit-audit-slop.md
[bkit-test] core: docs/templates/bkit-audit-testing.md
[bkit-test] core: docs/templates/bkit-audit-usability.md
[bkit-test] core: docs/templates/bkit-plan.md
[bkit-test] core: .gitignore
[bkit-test] core: .gitattributes
[bkit-test] core: docs/architecture.md
[bkit-test] core: docs/data-schema.md
[bkit-test] core: docs/deployments.md
[bkit-test] core: docs/design.md
[bkit-test] core: docs/noise.md
[bkit-test] core: docs/observability.md
[bkit-test] core: docs/security.md
[bkit-test] core: docs/setup.md
[bkit-test] core: docs/technology.md
[bkit-test] core: docs/testing.md
[bkit-test] Running bkit docs pass
[bkit-test] core: .bkit/authoring.md
[bkit-test] core: .bkit/cloud.md
[bkit-test] core: .bkit/cli.md
[bkit-test] core: .bkit/comparison.md
[bkit-test] core: .bkit/install.md
[bkit-test] core: .bkit/jsonl.md
[bkit-test] core: .bkit/LICENSE.md
[bkit-test] core: .bkit/pipeline.md
[bkit-test] core: .bkit/providers.md
[bkit-test] core: .bkit/prompts.md
[bkit-test] core: .bkit/router.md
[bkit-test] core: .bkit/templates.md
[bkit-test] core: .bkit/trackers.md
[bkit-test] core: .bkit/workflows.md
[bkit-test] core: .bkit/README.md
[bkit-test] Running template copies pass
[bkit-test] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-test] template added: .bkit/templates/.cursor/Dockerfile
[bkit-test] template added: .bkit/templates/.cursor/environment.json
[bkit-test] template added: .bkit/templates/.cursor/settings.json
[bkit-test] template added: .bkit/templates/.envrc
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-test] template added: .bkit/templates/.github/dependabot.yml
[bkit-test] template added: .bkit/templates/.github/renovate.json5
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-test] template added: .bkit/templates/.graphifyignore
[bkit-test] template added: .bkit/templates/.husky/pre-commit
[bkit-test] template added: .bkit/templates/.husky/pre-push
[bkit-test] template added: .bkit/templates/.lintstagedrc.json
[bkit-test] template added: .bkit/templates/.oxlintrc.json
[bkit-test] template added: .bkit/templates/.prettierignore
[bkit-test] template added: .bkit/templates/.serena/project.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-test] template added: .bkit/templates/.vale.ini
[bkit-test] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-test] template added: .bkit/templates/context/bkit-expo.md
[bkit-test] template added: .bkit/templates/context/bkit-github.md
[bkit-test] template added: .bkit/templates/context/bkit-inngest.md
[bkit-test] template added: .bkit/templates/context/bkit-maestro.md
[bkit-test] template added: .bkit/templates/context/bkit-playwright.md
[bkit-test] template added: .bkit/templates/context/bkit-resend.md
[bkit-test] template added: .bkit/templates/context/bkit-sentry.md
[bkit-test] template added: .bkit/templates/context/bkit-serena.md
[bkit-test] template added: .bkit/templates/context/bkit-stripe.md
[bkit-test] template added: .bkit/templates/context/bkit-supabase.md
[bkit-test] template added: .bkit/templates/context/bkit-tavily.md
[bkit-test] template added: .bkit/templates/context/bkit-vercel.md
[bkit-test] template added: .bkit/templates/docs/capabilities.md
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-test] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-test] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-test] template added: .bkit/templates/slop-scan.config.json
[bkit-test] payload link: .bkit/core
[bkit-test] payload link: .bkit/shared
[bkit-test] core: .bkit/allowlist.json
[bkit-test] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-test] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-test] write version pin: .bkit/version (6.1.1)
[bkit-test] delete (empty after strip): AGENTS.md
[bkit-test] delete (empty after strip): .gitignore
[bkit-test] delete (empty after strip): .gitattributes
[bkit-test] delete: .bkit/version
[bkit-test] delete: .bkit/allowlist.json
[bkit-test] delete: .bkit/authoring.md
[bkit-test] delete: .bkit/cloud.md
[bkit-test] delete: .bkit/cli.md
[bkit-test] delete: .bkit/comparison.md
[bkit-test] delete: .bkit/install.md
[bkit-test] delete: .bkit/jsonl.md
[bkit-test] delete: .bkit/LICENSE.md
[bkit-test] delete: .bkit/pipeline.md
[bkit-test] delete: .bkit/providers.md
[bkit-test] delete (empty after strip): .bkit/prompts.md
[bkit-test] delete: .bkit/router.md
[bkit-test] delete: .bkit/templates.md
[bkit-test] delete: .bkit/trackers.md
[bkit-test] delete: .bkit/workflows.md
[bkit-test] delete: .bkit/README.md
[bkit-test] delete (empty after strip): .agents/context.md
[bkit-test] delete (empty after strip): .agents/docs.md
[bkit-test] delete (empty after strip): .agents/rules.md
[bkit-test] delete (empty after strip): .agents/skills.md
[bkit-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-test] delete (empty after strip): docs/architecture.md
[bkit-test] delete (empty after strip): docs/data-schema.md
[bkit-test] delete (empty after strip): docs/deployments.md
[bkit-test] delete (empty after strip): docs/design.md
[bkit-test] delete (empty after strip): docs/noise.md
[bkit-test] delete (empty after strip): docs/observability.md
[bkit-test] delete (empty after strip): docs/security.md
[bkit-test] delete (empty after strip): docs/setup.md
[bkit-test] delete (empty after strip): docs/technology.md
[bkit-test] delete (empty after strip): docs/testing.md
[bkit-test] delete: docs/templates/bkit-audit-accessibility.md
[bkit-test] delete: docs/templates/bkit-audit-adoption.md
[bkit-test] delete: docs/templates/bkit-audit-agents.md
[bkit-test] delete: docs/templates/bkit-audit-aio-seo.md
[bkit-test] delete: docs/templates/bkit-audit-analytics.md
[bkit-test] delete: docs/templates/bkit-audit-annotations.md
[bkit-test] delete: docs/templates/bkit-audit-app-performance.md
[bkit-test] delete: docs/templates/bkit-audit-app-store.md
[bkit-test] delete: docs/templates/bkit-audit-architecture.md
[bkit-test] delete: docs/templates/bkit-audit-ci-performance.md
[bkit-test] delete: docs/templates/bkit-audit-config.md
[bkit-test] delete: docs/templates/bkit-audit-cost.md
[bkit-test] delete: docs/templates/bkit-audit-coverage.md
[bkit-test] delete: docs/templates/bkit-audit-database.md
[bkit-test] delete: docs/templates/bkit-audit-dead-code.md
[bkit-test] delete: docs/templates/bkit-audit-deferrals.md
[bkit-test] delete: docs/templates/bkit-audit-dependencies.md
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
[bkit-test] delete: docs/templates/bkit-audit-issues.md
[bkit-test] delete: docs/templates/bkit-audit-llm.md
[bkit-test] delete: docs/templates/bkit-audit-logs.md
[bkit-test] delete: docs/templates/bkit-audit-models.md
[bkit-test] delete: docs/templates/bkit-audit-privacy.md
[bkit-test] delete: docs/templates/bkit-audit-prompts.md
[bkit-test] delete: docs/templates/bkit-audit-red-team.md
[bkit-test] delete: docs/templates/bkit-audit-reliability.md
[bkit-test] delete: docs/templates/bkit-audit-repo.md
[bkit-test] delete: docs/templates/bkit-audit-security.md
[bkit-test] delete: docs/templates/bkit-audit-slop.md
[bkit-test] delete: docs/templates/bkit-audit-testing.md
[bkit-test] delete: docs/templates/bkit-audit-usability.md
[bkit-test] delete: docs/templates/bkit-plan.md
[bkit-test] package.json: removed bkit install-state block
[bkit-test] delete: .bkit/templates/
[bkit-test] delete: .bkit/core (payload view link)
[bkit-test] delete: .bkit/shared (payload view link)
[bkit-test] prune empty dir: docs/templates
[bkit-test] prune empty dir: .bkit
[bkit-test] prune empty dir: .agents
[bkit-test] prune empty dir: docs

 ✓ .bkit/core/engine/install/template-copies.integration.test.ts (9 tests) 1253ms
   ✓ install copies the template set into .bkit/templates/ (3)
     ✓ copies exactly the set, raw, keeping each file's mode, with no hash record 303ms
     ✓ a second run writes no copy; a stale or stray copy is a write in dry-run and live alike 613ms
stdout | .bkit/core/engine/install/modules/cloud.integration.test.ts > runCloudModule — opt-in cloud agents (post-CI auto-routing) > the default module set does NOT ship cloud scaffolding
[bkit-install] Running core payload pass
[bkit-install] core: .agents/context.md
[bkit-install] core: .agents/docs.md
[bkit-install] core: .agents/rules.md
[bkit-install] core: .agents/skills.md
[bkit-install] core: AGENTS.md
[bkit-install] core: docs/templates/bkit-audit-accessibility.md
[bkit-install] core: docs/templates/bkit-audit-adoption.md
[bkit-install] core: docs/templates/bkit-audit-agents.md
[bkit-install] core: docs/templates/bkit-audit-aio-seo.md
[bkit-install] core: docs/templates/bkit-audit-analytics.md
[bkit-install] core: docs/templates/bkit-audit-annotations.md
[bkit-install] core: docs/templates/bkit-audit-app-performance.md
[bkit-install] core: docs/templates/bkit-audit-app-store.md
[bkit-install] core: docs/templates/bkit-audit-architecture.md
[bkit-install] core: docs/templates/bkit-audit-ci-performance.md
[bkit-install] core: docs/templates/bkit-audit-config.md
[bkit-install] core: docs/templates/bkit-audit-cost.md
[bkit-install] core: docs/templates/bkit-audit-coverage.md
[bkit-install] core: docs/templates/bkit-audit-database.md
[bkit-install] core: docs/templates/bkit-audit-dead-code.md
[bkit-install] core: docs/templates/bkit-audit-deferrals.md
[bkit-install] core: docs/templates/bkit-audit-dependencies.md
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
[bkit-install] core: docs/templates/bkit-audit-issues.md
[bkit-install] core: docs/templates/bkit-audit-llm.md
[bkit-install] core: docs/templates/bkit-audit-logs.md
[bkit-install] core: docs/templates/bkit-audit-models.md
[bkit-install] core: docs/templates/bkit-audit-privacy.md
[bkit-install] core: docs/templates/bkit-audit-prompts.md
[bkit-install] core: docs/templates/bkit-audit-red-team.md
[bkit-install] core: docs/templates/bkit-audit-reliability.md
[bkit-install] core: docs/templates/bkit-audit-repo.md
[bkit-install] core: docs/templates/bkit-audit-security.md
[bkit-install] core: docs/templates/bkit-audit-slop.md
[bkit-install] core: docs/templates/bkit-audit-testing.md
[bkit-install] core: docs/templates/bkit-audit-usability.md
[bkit-install] core: docs/templates/bkit-plan.md
[bkit-install] core: .gitignore
[bkit-install] core: .gitattributes
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
[bkit-install] Running bkit docs pass
[bkit-install] core: .bkit/authoring.md
[bkit-install] core: .bkit/cloud.md
[bkit-install] core: .bkit/cli.md
[bkit-install] core: .bkit/comparison.md
[bkit-install] core: .bkit/install.md
[bkit-install] core: .bkit/jsonl.md
[bkit-install] core: .bkit/LICENSE.md
[bkit-install] core: .bkit/pipeline.md
[bkit-install] core: .bkit/providers.md
[bkit-install] core: .bkit/prompts.md
[bkit-install] core: .bkit/router.md
[bkit-install] core: .bkit/templates.md
[bkit-install] core: .bkit/trackers.md
[bkit-install] core: .bkit/workflows.md
[bkit-install] core: .bkit/README.md
[bkit-install] Running template copies pass
[bkit-install] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-install] template added: .bkit/templates/.cursor/Dockerfile
[bkit-install] template added: .bkit/templates/.cursor/environment.json
[bkit-install] template added: .bkit/templates/.cursor/settings.json
[bkit-install] template added: .bkit/templates/.envrc
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-install] template added: .bkit/templates/.github/dependabot.yml
[bkit-install] template added: .bkit/templates/.github/renovate.json5
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-install] template added: .bkit/templates/.graphifyignore
[bkit-install] template added: .bkit/templates/.husky/pre-commit
[bkit-install] template added: .bkit/templates/.husky/pre-push
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
[bkit-install] template added: .bkit/templates/.serena/project.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-install] template added: .bkit/templates/.vale.ini
[bkit-install] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-install] template added: .bkit/templates/context/bkit-expo.md
[bkit-install] template added: .bkit/templates/context/bkit-github.md
[bkit-install] template added: .bkit/templates/context/bkit-inngest.md
[bkit-install] template added: .bkit/templates/context/bkit-maestro.md
[bkit-install] template added: .bkit/templates/context/bkit-playwright.md
[bkit-install] template added: .bkit/templates/context/bkit-resend.md
[bkit-install] template added: .bkit/templates/context/bkit-sentry.md
[bkit-install] template added: .bkit/templates/context/bkit-serena.md
[bkit-install] template added: .bkit/templates/context/bkit-stripe.md
[bkit-install] template added: .bkit/templates/context/bkit-supabase.md
[bkit-install] template added: .bkit/templates/context/bkit-tavily.md
[bkit-install] template added: .bkit/templates/context/bkit-vercel.md
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-install] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-install] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-install] template added: .bkit/templates/slop-scan.config.json
[bkit-install] payload link: .bkit/core
[bkit-install] payload link: .bkit/shared
[bkit-install] core: .bkit/allowlist.json
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write: .claude/commands/bkit-auto.md
[bkit-install] write: .claude/commands/bkit-build.md
[bkit-install] write: .claude/commands/bkit-debug.md
[bkit-install] write: .claude/commands/bkit-design.md
[bkit-install] write: .claude/commands/bkit-plan.md
[bkit-install] write: .claude/commands/bkit-ship.md
[bkit-install] write: .claude/agents/bkit-audit-generate.md
[bkit-install] write: .claude/agents/bkit-build-challenge-1.md
[bkit-install] write: .claude/agents/bkit-build-challenge-2.md
[bkit-install] write: .claude/agents/bkit-build-install-skills.md
[bkit-install] write: .claude/agents/bkit-build-plan-convert.md
[bkit-install] write: .claude/agents/bkit-build-plan-current.md
[bkit-install] write: .claude/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .claude/agents/bkit-build-plan-tasks.md
[bkit-install] write: .claude/agents/bkit-build-plan-tests.md
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .claude/agents/bkit-design-generate.md
[bkit-install] write: .claude/agents/bkit-design-organise.md
[bkit-install] write: .claude/agents/bkit-design-review-1.md
[bkit-install] write: .claude/agents/bkit-design-review-2.md
[bkit-install] write: .claude/agents/bkit-design-spike.md
[bkit-install] write: .claude/agents/bkit-design-update.md
[bkit-install] write: .claude/agents/bkit-plan-generate.md
[bkit-install] write: .claude/agents/bkit-plan-review-1.md
[bkit-install] write: .claude/agents/bkit-plan-review-2.md
[bkit-install] write: .claude/agents/bkit-plan-scope-check.md
[bkit-install] write: .claude/agents/bkit-plan-update.md
[bkit-install] write: .claude/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .claude/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .claude/agents/bkit-ship-update-docs.md
[bkit-install] write: .claude/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .claude/agents/bkit-utility-update-decisions.md
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .claude/agents/bkit-utility-update-tracker.md
[bkit-install] claude: CLAUDE.md
[bkit-install] claude: .claude/settings.json
[bkit-install] claude: .claude/hooks/bkit-preflight.sh
[bkit-install] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-install] claude: .claude/hooks/bkit-readguard.cjs
[bkit-install] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-install] claude: .mcp.json
[bkit-install] claude: .bkit/.env.example
[bkit-install] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write version pin: .bkit/version (6.1.1)

 ✓ .bkit/core/engine/install/modules/cloud.integration.test.ts (9 tests) 1111ms
   ✓ runCloudModule — opt-in cloud agents (post-CI auto-routing) (9)
     ✓ the default module set does NOT ship cloud scaffolding 1051ms
 ✓ .bkit/core/engine/checks/before/files.integration.test.ts (12 tests) 36ms
 ✓ .bkit/core/engine/audits/templates/telemetry-gitattributes.integration.test.ts (18 tests) 296ms
 ✓ .bkit/core/engine/install/write.integration.test.ts (4 tests) 55ms
 ✓ .bkit/core/engine/install/version-file.integration.test.ts (5 tests) 176ms
npm warn Unknown env config "npm-globalconfig". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "verify-deps-before-run". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "_jsr-registry". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "block-exotic-subdeps". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "minimum-release-age". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "strict-dep-builds". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "trust-policy". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
[machine-lock] ❌ vitest all gave up after 0s waiting for tests, in use by wrapped gate holder — /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow (pid 28511, since 09:14:35), no earlier run
[machine-lock]    Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait.
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts (3 tests) 2712ms
   ✓ raw Vitest global setup against wrapped gates (3)
     ✓ the global setup waits for a held tests lock and takes it once the holder ends 1459ms
     ✓ the global setup throws naming the holder when the wait gives up 550ms
     ✓ the global setup's teardown frees the tests lock 700ms
npm warn Unknown env config "npm-globalconfig". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "verify-deps-before-run". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "_jsr-registry". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "block-exotic-subdeps". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "minimum-release-age". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "strict-dep-builds". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "trust-policy". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
 ✓ .bkit/core/engine/audits/templates/slop-type-suppression.integration.test.ts (5 tests) 10246ms
   ✓ boundary/type-suppression slop rule (scripts/slop/bkit-slop-type-suppression.mjs) (4)
     ✓ flags casts and ts-suppression directives; ignores single casts, comments, and test files 2315ms
     ✓ objectShapeOnly narrows to the object-literal double cast (no other casts, no directives) 1561ms
     ✓ includeAnyCast:false drops the any-cast but keeps double casts and directives 1798ms
     ✓ includeTsSuppress:false drops the directives but keeps the casts 3054ms
   ✓ boundary/gate-suppression slop rule (scripts/slop/bkit-slop-type-suppression.mjs) (1)
     ✓ flags executable skips/focus and blanket disables; ignores literal fixtures and keeps invalid-source detection 1506ms
 ✓ .bkit/core/engine/install/placeholders.integration.test.ts (6 tests) 545ms
 ✓ .bkit/core/engine/commands/workflow/branches-lock.integration.test.ts (2 tests) 2760ms
   ✓ branches push through a real pre-push lock (2)
     ✓ branches push exits 81 naming the holder when the pre-push hook's gate gave up on the tests lock 1494ms
     ✓ branches push passes LOCAL_STACK_LOCK_WAIT_S and LOCAL_STACK_LOCK_WHO to git push 1263ms
 ✓ .bkit/core/engine/checks/after/managed.integration.test.ts (1 test) 209ms
 ✓ .bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts (4 tests) 3254ms
   ✓ tests/shell/setup_suite.bash (4)
     ✓ CONTROL — without it, a temp repo's `git -C` init under the hook's GIT_DIR flips core.bare 667ms
     ✓ clears every GIT_* variable, so the same init stays in the temp dir 935ms
     ✓ fails the run when a test writes an identity into the checkout, and removes it 878ms
     ✓ fails the run when a test sets core.bare in the checkout, and puts it back 770ms
 ✓ .bkit/core/engine/audits/templates/disk-prune-worktrees.integration.test.ts (3 tests) 4570ms
   ✓ example repo step — leftover worktrees (3)
     ✓ removes what loses nothing, keeps what is in use, notes the rest 3985ms
     ✓ notes a plain folder under .worktrees, even while the checkout is busy 308ms
 ✓ .bkit/core/engine/checks/before/index.integration.test.ts (8 tests) 5392ms
   ✓ preflight tracker resolution order (linear -> github) — integration (2)
     ✓ grades --tracker=github, not the linear value still on disk 867ms
     ✓ names the tracker being installed in the advisory text 814ms
   ✓ preflight tracker resolution order (linear -> jira) — integration (2)
     ✓ grades --tracker=jira, not the linear value still on disk 604ms
     ✓ names the tracker being installed in the advisory text 591ms
   ✓ preflight tracker resolution order (jira -> github) — integration (2)
     ✓ grades --tracker=github, not the jira value still on disk 676ms
     ✓ names the tracker being installed in the advisory text 548ms
   ✓ preflight tracker resolution order (jira -> linear) — integration (2)
     ✓ grades --tracker=linear, not the jira value still on disk 667ms
     ✓ names the tracker being installed in the advisory text 622ms
 ✓ .bkit/core/engine/audits/repo/test-file-script.integration.test.ts (16 tests) 30719ms
   ✓ bkit:test:file runs every test file kind into a JUnit report (9)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs reports its named test passed 10443ms
     ✓ bats — tests/shell/bkit-gh-stub.bats reports its named test passed 2181ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs reports its named test passed 1589ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… reports its named test passed 1054ms
     ✓ node — with no report path the test file is left as it was 7200ms
     ✓ bats — with no report path the test file is left as it was 1694ms
     ✓ node — with no report path the test file is left as it was 1479ms
     ✓ vitest — with no report path the test file is left as it was 876ms
     ✓ a run naming files of two kinds is refused as a usage error 436ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 564ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 708ms
   ✓ bkit:lint:file passes a test file its linter does not cover (4)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs lints clean 503ms
     ✓ bats — tests/shell/bkit-gh-stub.bats lints clean 634ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs lints clean 724ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… lints clean 627ms
 ✓ .bkit/core/engine/commands/workflow/tracker.integration.test.ts (13 tests) 120625ms
   ✓ workflow comment lifecycle across real CLI processes (13)
     ✓ keeps auto startup with PR metadata and dispatch in one progress comment 5473ms
     ✓ redacts malformed Jira authorization from live probe diagnostics 1809ms
     ✓ keeps published build completion and PR links in one terminal comment 6972ms
     ✓ continues after the prepared completion source disappears 4095ms
     ✓ records preparation and session association failures despite successful delivery 3517ms
     ✓ associates startup and run across restart or starts fresh safely 4838ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 16019ms
     ✓ keeps auto and phase progress separate across worktrees 9191ms
     ✓ continues close and cleanup after lost terminal response 5587ms
     ✓ starts fresh progress after cleanup and on a fresh clone 6833ms
     ✓ preserves substantive step results under every comment boundary fault 44460ms
     ✓ keeps clean build progress and completion to two comments 6899ms
     ✓ preserves legacy receipts issue less skips and exact fallback through resume 4931ms
 ✓ .bkit/core/engine/commands/install/install.integration.test.ts (66 tests) 197619ms
   ✓ Scenario 1 — blocker: no package.json → exit 1, zero writes (4)
     ✓ spawning bkit-install with no package.json exits 1 and produces zero output files 518ms
   ✓ Scenario 2 — advisory checklist: N triggers → exit 0, checklist rendered (6)
     ✓ runPostInstallCheck adds gh-mcp-token-unset-shell when BKIT_GH_TOKEN is unset 330ms
   ✓ Scenario 5 — full install smoke against scratch consumer (1)
     ✓ bkit install --full against a clean consumer exits 0 and writes core mirrors 1633ms
   ✓ #507 — full install writes core/ and shared/, never a template or a stray LICENSE.md (1)
     ✓ every payload file lands, no template does, and .bkit/LICENSE.md is the only LICENSE.md 5481ms
   ✓ Scenario 5b — docs/roadmap.md is consumer-owned: bkit install never creates it (#380 matrix row 18) (1)
     ✓ `bkit install --full` against a clean consumer does NOT create docs/roadmap.md, and `bkit check` reports clean drift 3235ms
   ✓ Scenario 7 — bkit install subprocess exits 1 on Phase 3 blocker (P2.T9) (1)
     ✓ bkit install exits 1 when Phase 3 blocker detected + recovery line in output 1464ms
   ✓ Scenario 8 — bkit install --auto-revert reverts on Phase 3 blocker (P2.T10) (1)
     ✓ --auto-revert: exits 1, auto-revert message present, Tier-1 writes reverted 2455ms
   ✓ MCP config — fresh install and a consumer's own file (5)
     ✓ fresh install via bkit install --full (no --tracker) scaffolds .mcp.json with empty mcpServers 1803ms
     ✓ bkit install --tracker=github seeds .mcp.json with only that tracker's entry 4062ms
     ✓ bkit install --tracker=linear seeds .mcp.json with only that tracker's entry 4197ms
     ✓ bkit install --tracker=jira seeds .mcp.json with only that tracker's entry 4857ms
     ✓ re-install with no tracker (bkit owns no entry) leaves a consumer .mcp.json byte-for-byte unchanged 2240ms
   ✓ Challenge Finding 3 — cloud/tracker constraint-before-write regression (9)
     ✓ --tracker=github --auto=cursor exits non-zero (constraint mismatch) 1103ms
     ✓ --tracker=jira --auto=claude exits non-zero (constraint mismatch) 918ms
     ✓ --tracker=jira --auto=cursor exits non-zero (constraint mismatch) 652ms
     ✓ --tracker=jira --auto=opencode exits non-zero (constraint mismatch) 520ms
     ✓ --tracker=github --auto=cursor does NOT write bkit.tracker.default to package.json (no partial write) 564ms
     ✓ --tracker=jira --auto=claude does NOT write bkit.tracker.default to package.json (no partial write) 585ms
     ✓ --tracker=jira --auto=cursor does NOT write bkit.tracker.default to package.json (no partial write) 508ms
     ✓ --tracker=jira --auto=opencode does NOT write bkit.tracker.default to package.json (no partial write) 537ms
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 1134ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 1201ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 722ms
     ✓ explicit `bkit help` prints the same usage and exits 0 579ms
     ✓ `bkit check --claude` (stray module flag) errors 931ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 725ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 1937ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 1839ms
     ✓ `bkit install --ci` is an unknown flag and writes nothing (#489) 773ms
     ✓ `bkit install --claude` writes no bkit-ci.yml, .vale.ini or hooks (templates); no .cursor 2141ms
     ✓ `bkit check` after a --cursor-only install reports no drift (no false .claude drift) 2928ms
     ✓ `bkit install --tracker=github` alone switches the tracker on every installed host 8345ms
     ✓ `bkit install --tracker=linear` alone switches the tracker on every installed host 10671ms
     ✓ `bkit install --tracker=jira` alone switches the tracker on every installed host 9546ms
     ✓ `bkit install --claude --tracker=github` also re-renders the installed cursor host 8673ms
   ✓ opencodeProviders persist block — sequential installs (issue #281 Task 2) (1)
     ✓ two sequential installs: opencodeProviders = both, opencodeProvider = second 2674ms
   ✓ T10 — claudeAllowDerived survives a real install (1)
     ✓ records the resolved grant set, then updates it when allowed-domains shrinks 3905ms
   ✓ Scenario — Codex + Antigravity install side by side without conflict (#534) (3)
     ✓ combined `--codex --antigravity`: skills at separate paths, check green, advisory fires 7154ms
     ✓ separate `--antigravity` then `--codex`: both land at their own paths, check green 11484ms
     ✓ separate `--codex` then `--antigravity`: both land at their own paths, check green 9532ms
   ✓ Scenario — tracker switch and active opencode provider removal leave check green (7)
     ✓ --tracker=linear then --tracker=github removes the first MCP entry everywhere 18991ms
     ✓ --tracker=jira then --tracker=github removes the first MCP entry everywhere 18777ms
     ✓ --tracker=linear then --tracker=jira removes the first MCP entry everywhere 12087ms
     ✓ --tracker=jira then --tracker=linear removes the first MCP entry everywhere 9542ms
     ✓ a linear entry the consumer edited survives the switch, with a warning 2808ms
     ✓ a jira entry the consumer edited survives the switch, with a warning 3147ms
     ✓ uninstall --opencode=<active> re-renders the agents to the remaining provider 3003ms
   ✓ 5.x package.json layout — the tracker survives the first re-render (1)
     ✓ bkit install on the flat bkit.issueTracker layout renders the tracker and check passes 3859ms
stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > .gitignore — consumer secret-protection rules survive; bkit block is updated (the #129 case)
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > .gitattributes — consumer custom attributes outside the block survive
[bkit-upgrade] upgrade (merge): .gitattributes

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > docs/*.md — consumer prose AFTER bkit:end survives even with NO manifest entry (content-detected)
[bkit-upgrade] upgrade (merge): docs/testing.md

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > dest has NO bkit markers — block is appended at EOF, all consumer content preserved
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer keys (json deep-merge) > .claude/settings.json — consumer mcpServers survives; bkit keys merged in (the #129 case)
[bkit-upgrade] upgrade (merge): .claude/settings.json

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade is idempotent for block-merge formats > records the merged on-disk hash and skips on the second run
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade of an owned whole-file candidate > auto-updates when there is no consumer drift
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade of an owned whole-file candidate > honors contentOverride — writes rendered content, never the raw template
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade substitutes template tokens (#129 §2) > seeds an absent byte-equal file with {{DEFAULT_BRANCH}} resolved, not literal
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

 ✓ .bkit/core/engine/commands/install/upgrade.integration.test.ts (64 tests) 286452ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (5)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 757ms
     ✓ install --claude does not write Serena or graphify examples 1217ms
     ✓ upgrade does not rewrite a consumer-owned bkit-graphify.sh 693ms
     ✓ does not rewrite a consumer-owned .github/renovate.json5 827ms
     ✓ preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6) 698ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 8537ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 11404ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 12653ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 12858ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 11285ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 13233ms
     ✓ malformed .mcp.json fails install instead of being overwritten 2057ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 18711ms
     ✓ an adopted copy of every template survives upgrade and check 6607ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 5473ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 7351ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 6375ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 39055ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 6474ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (12)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 6901ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 15631ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 4902ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 2560ms
     ✓ slop plugin migration upgrades old bytes, stays idempotent, and preserves customization 3858ms
     ✓ branded script migration is idempotent and dry-run writes nothing 3501ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 2904ms
     ✓ a dry-run hook and CI token migration writes nothing 1189ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 3129ms
     ✓ a second check-name migration writes nothing 3000ms
     ✓ a dry-run check-name migration writes and moves nothing 1243ms
     ✓ a second Vale migration and a dry run write nothing 3174ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 4538ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 3744ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 7911ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 5732ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 2720ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 3310ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 3149ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 2862ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 3599ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 3715ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 3808ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 6496ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 6434ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 3140ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ previews the bump (pnpm add + re-render) and exits 0 without mutating 608ms
     ✓ bumps when --to names the installed version but package.json pins a file: tarball 315ms
     ✓ starts the package runner for the install and the re-exec 804ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 4713ms

 Test Files  56 passed (56)
      Tests  1830 passed (1830)
   Start at  09:11:56
   Duration  286.95s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/826-append-routine-workflow/run-tests-1.log.reports/vitest-78315.xml
> [bkit] TRUNCATED — kept 3079 of 19837 lines (214 KB of 1.4 MB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
