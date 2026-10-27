
> @cbartens/bkit@6.0.0 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> pnpm bkit:gate:static-unit && pnpm test:integration


> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs


0/148 files need formatting

> @cbartens/bkit@6.0.0 lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'

✔ 0 errors, 0 warnings and 0 suggestions in 147 files.
passed: true
skipped: null
files: 147

> @cbartens/bkit@6.0.0 slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> bkit ci slop

[bkit-ci] base f8c67d9ab66de0c133922aad3959793b2bc2377f (f8c67d9ab66de0c133922aad3959793b2bc2377f) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: f8c67d9ab66de0c133922aad3959793b2bc2377f
base: f8c67d9ab66de0c133922aad3959793b2bc2377f
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
      Coverage enabled with v8

(node:41058) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:41058) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:41058) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:41058) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:41058) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:41058) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:41058) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ❯ .bkit/core/engine/audits/templates/ci-scripts.test.ts (29 tests | 1 failed) 35383ms
   ✓ check-accepted-divergences (6)
     ✓ collects event-keyed sites with their job and step 4ms
     ✓ collects the workflow-level concurrency block and steps whose first key is not name/uses 2ms
     ✓ reports an unregistered site as missing 0ms
     ✓ reports a registry row that no longer exists as stale 0ms
     ✓ flags an unknown decision or a missing reason 0ms
     ✓ is clean when a live site is registered with a known decision and a reason 1ms
   ✓ check-dependency-audit (5)
     ✓ blocks high and critical by default, not moderate 0ms
     ✓ reports an unaccepted advisory as missing and an accepted one as clean 0ms
     ✓ flags an expired, over-long or stale acceptance 0ms
     ✓ exits 1 on a missing acceptance, 0 when clean, and 1 on a report with no advisories 108ms
     ✓ rejects an --unreachable value that is neither fail nor warn 33ms
   ❯ shipped copy-and-own test files (5)
     ✓ finds the shipped .test.mjs files 0ms
     ✓ ci/check-accepted-divergences.test.mjs passes when run on its own 38ms
     ✓ ci/check-capstone.test.mjs passes when run on its own 278ms
     ✓ ci/check-dependency-audit.test.mjs passes when run on its own 60ms
     × ci/lanes/resolve-push-base.test.mjs passes when run on its own 34532ms
   ✓ capstone env wiring checks (3)
     ✓ flag a lane whose result is not wired to its job 0ms
     ✓ flag a wrongly wired optional lane variable but accept an absent one 1ms
     ✓ require PLAN and SCOPE_RESULT only when the capstone needs the scope job 0ms
   ✓ check-capstone (10)
     ✓ passes its own copy-and-own test file (bkit's own copy) 163ms
     ✓ the template capstone calls the script, with every lane it needs wired in 19ms
     ✓ the repo capstone calls the script, with every lane it needs wired in 7ms
     ✓ the template capstone fetches the script with an ungated checkout before it runs 5ms
     ✓ the repo capstone fetches the script with an ungated checkout before it runs 6ms
     ✓ the template's step (5)
       ✓ sets exactly the variables this test supplies 6ms
       ✓ reds with a copy-the-script message when scripts/ci/check-capstone.mjs is missing 15ms
       ✓ never skips itself: a missing script reds even when every lane is green 13ms
       ✓ passes with the script present and the lanes green 44ms
       ✓ reds with the script present when the unit lane ran 0 tests 45ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 35644ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 1987ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 4252ms
     ✓ resolves config from the repo root when run from a subdirectory 3175ms
     ✓ exits 6 when the PUT fails 3382ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 2903ms
   ✓ bkit setup protect-main — pre-flight (6)
     ✓ exits 4 when the CI workflow file is missing, before any write 2340ms
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 2800ms
     ✓ asks a human to log in when gh is not authenticated 2442ms
     ✓ exits 3 when gh repo view names no repository 2916ms
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 1814ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 2574ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 1992ms
     ✓ exits 6 when the api answer is not JSON 3029ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (87 tests) 13761ms
   ✓ bkit steps done (18)
     ✓ reports a failed commit with exit 8 without writing the row 2825ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 333ms
     ✓ writeStepRow refuses when a recorded path changed 375ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 2971ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (56 tests) 53143ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 3280ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 3329ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 3476ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 3021ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 2661ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 2561ms
     ✓ fetches the issue and its comments as GitHub returns them 2780ms
   ✓ postCommentOnce (4)
     ✓ records an engine-action row and skips the same key + body on a re-run 3010ms
     ✓ a recent identical comment counts as done (the final close comment) 2227ms
     ✓ a failed post reports done false with the reason and never leaks a token 2782ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 2328ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 3050ms
     ✓ a board the token cannot see is scope 1992ms
     ✓ an HTTP 403 from gh is scope 2611ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 2348ms
     ✓ github: no block, no blockers and no further reads 3021ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 2517ms
     ✓ a different marker hash posts 2507ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 2404ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (47 tests) 60104ms
   ✓ bkit ci slop — gate decision (6)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 2495ms
     ✓ fails on a net score rise with no net count change 4110ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 3301ms
     ✓ treats a net score at or below 0.001 as float noise 3156ms
     ✓ passes when the change only resolves findings 2853ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 2439ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 2542ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 3147ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 2449ms
     ✓ exits 4 on a dropped net field instead of silently passing 2896ms
     ✓ exits 4 on no summary instead of silently passing 2301ms
     ✓ exits 4 on output that is not JSON instead of silently passing 3093ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 2386ms
   ✓ bkit ci slop — real slop-scan (3)
     ✓ a genuinely new finding fails the gate 467ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 434ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 428ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 2954ms
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 2950ms
     ✓ fails (exit 1) when vale reports alerts 2347ms
     ✓ exits 6 on a vale runtime error 2840ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 2331ms
     ✓ falls back to vale sync when the main worktree has none 2271ms
     ✓ skips loudly with exit 0 when vale sync cannot restore it either 2409ms
   ✓ bkit ci min-push (8)
     ✓ checks every --ref: one code ref among min-push refs fails the push 412ms
     ✓ reads bkit.testing.minPushPaths from package.json; an explicit [] turns it off 405ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 10790ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 5708ms
     ✓ every fence parses under zsh -n 5040ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (62 tests) 11720ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 520ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 417ms
     ✓ a new run of the same FID rewrites startSha 696ms
     ✓ a resume of the same FID reuses the record 769ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 547ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 507ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 514ms
     ✓ a stale record without a lock is replaced 583ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 427ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 345ms
   ✓ bkit worktrees remove (12)
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 332ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 419ms
 ❯ .bkit/core/engine/audits/repo/resolve-push-base.test.ts (17 tests | 2 failed) 30829ms
   ❯ resolve-push-base (17)
     ✓ uses the last green run's head, not event.before, so a cancelled push stays in scope 1ms
     ✓ falls back to event.before when there is no green run on the branch 0ms
     ✓ falls back to event.before when the last green head is not an ancestor (force-push) 0ms
     ✓ returns an empty base when there is nothing at all (planner run-to-be-safe path) 0ms
     ✓ picks the newest run by run number, whatever order the API lists them in 0ms
     ✓ names a run list that could not be read in the source 0ms
     ✓ names origin/<branch> as the fallback in local mode 0ms
     ✓ reads owner/repo from https, ssh and scp-style remote URLs 0ms
     ✓ reads --local, --branch and --head from argv 0ms
     ✓ returns an empty sha for a missing or malformed run list 0ms
     ❯ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 4895ms
       ✓ falls back to event.before when gh prints unparseable output 2381ms
       × reports last-green-run as the source when the green head is an ancestor 5808ms
       ✓ CI mode: falls back to event.before and says so when the run list is unreadable 2795ms
       ❯ local mode (3)
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 4856ms
         ✓ tests ancestry against --head, not HEAD 4813ms
         × falls back to origin/dev with the reason on stderr when gh fails 5275ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 66878ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 2678ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 3813ms
     ✓ CI=true -> GITHUB_ACTION 3298ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 3120ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 2850ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 2216ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 2697ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 2944ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 2466ms
     ✓ LOCAL -> runtimeHeadless=false 2012ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 2560ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 2214ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 2852ms
     ✓ UNKNOWN -> runtimeHeadless=false 2518ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 2310ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 2333ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 3064ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 2715ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 2830ms
     ✓ re-derives per call: one run's answer does not leak into the next 2489ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 2183ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 2615ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 2176ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 2644ms
     ✓ --file into a missing directory is refused, not created 2647ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (210 tests) 11117ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 658ms
 ✓ .bkit/core/engine/commands/land.test.ts (25 tests) 13316ms
   ✓ pushToDev (13)
     ✓ lands the commit on origin/dev and leaves the main checkout alone 750ms
     ✓ never pushes local dev commits missing from origin/dev 633ms
     ✓ dev moved: rebuilds on the new dev and pushes again 1052ms
     ✓ dev moved before every push: exhausted, nothing landed 1519ms
     ✓ any other refusal is returned, not retried 2982ms
     ✓ pushToDev replays a commit range onto origin/dev 1044ms
     ✓ a replay retries on the new dev when dev moved 1309ms
     ✓ pushToDev log line names what it lands 849ms
     ✓ runs no git hooks in the throwaway checkout, and says so 637ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 900ms
     ✓ a push that fails without a server answer is returned once, never retried 663ms
     ✓ a failed fetch is returned before anything is built 439ms
     ✓ build throwing stops the landing and removes the throwaway checkout 529ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (73 tests) 15671ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (23)
     ✓ top-level docs/*.md is committed under scope=pr, not under scope=core or scope=full 713ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 348ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 382ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 305ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 359ms
     ✓ --path records its commit on the run's record, like every other commit mode 327ms
     ✓ a recorded ledger commits only the rows the run appended 596ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 751ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 600ms
     ✓ commitBookkeeping refuses when a recorded path changed 691ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 647ms
     ✓ under --mode=commit counts the squashed paths as something to commit 530ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 421ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 548ms
   ✓ bkit ledgers only-bookkeeping (5)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 391ms
     ✓ a source file in the range: exit 7, path listed 435ms
     ✓ another FID's plan file in the range: exit 7 350ms
     ✓ unknown commit exits 3; a missing flag exits 2 301ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (42 tests) 81687ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 3694ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 3478ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 3625ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 2844ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 2582ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 2473ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 2740ms
     ✓ counts commits behind origin/dev and the divergence age 3356ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 1918ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 2840ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 2250ms
     ✓ from a worktree, still names the main checkout and its outbox 3023ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 2450ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 2537ms
   ✓ bkit repo info — where the wired tracker's issues live (10)
     ✓ prints the Linear team and project under linear 2302ms
     ✓ prints the Jira site and project under jira 3058ms
     ✓ prints the board under github 2641ms
     ✓ prints the github progress and review states, defaults for a key left unset 2921ms
     ✓ prints the linear progress and review states, defaults for a key left unset 2671ms
     ✓ prints the jira progress and review states, defaults for a key left unset 2183ms
     ✓ prints the linear progress and review states, defaults for a key left unset 2390ms
     ✓ prints null progress and review states under none 2260ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 2480ms
     ✓ prints nulls under github without a board, and for keys left unset 3071ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 2567ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 2178ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 2541ms
     ✓ an unpinned repo reports nulls and asks no registry 1212ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 1500ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 1627ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 1802ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1888ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 8361ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 1866ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (97 tests) 10874ms
   ✓ bkit context clamp — per-context profiles (#697) (4)
     ✓ keeps each context's own section header and drops every other context's 682ms
     ✓ keeps each context's own section banner and drops every other context's 1901ms
   ✓ bkit context run-block / finalise (#427 T4) (15)
     ✓ clamps a ci block with the ci profile and a runtime block without it 470ms
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 445ms
   ✓ bkit context diff (10)
     ✓ --base narrows the range to the commits after a group's start sha 365ms
     ✓ diff from a group start covers only the group's commits 372ms
     ✓ an empty range writes a one-line note and zero numbers 308ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 607ms
     ✓ --reset-log empties the step's clamp log before the record lands 584ms
     ✓ partial: prints and writes the files not shown whole, and keeps the whole diff in the outbox 385ms
     ✓ whole: nothing omitted and no copy kept 302ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 26035ms
   ✓ gateguard opencode plugin — advisory mode (default) (7)
     ✓ emits reuse checklist on first write to a NEW (nonexistent) file 310ms
     ✓ keeps the reuse checklist when the write CREATES the file (pre-write snapshot) 369ms
     ✓ (V1) keeps the reuse checklist when the write CREATES the file (pre-write snapshot) 378ms
     ✓ emits investigation checklist on a write to an EXISTING file 440ms
     ✓ dedups: second write to the same file in the same session emits nothing 323ms
     ✓ warns again for a different file in the same session 664ms
   ✓ gateguard opencode plugin — deny mode (2)
     ✓ throws with advisory text on first write (blocks edit) 354ms
   ✓ gateguard opencode plugin — subagents are NOT exempt (3)
     ✓ a subagent session editing a file DOES get the advisory (exemption removed) 393ms
   ✓ gateguard opencode plugin — gate-config advisory (9)
     ✓ flags slop-scan.config.json as gate config 312ms
     ✓ flags .vale.ini as gate config 388ms
     ✓ flags .lintstagedrc.json as gate config 343ms
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 351ms
     ✓ source file is not treated as gate config 411ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 657ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 2117ms
     ✓ patch (v1 driver): checks every Add / Update / Move-to / Delete target 1501ms
     ✓ apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target 1807ms
     ✓ apply_patch (v1 driver): checks every Add / Update / Move-to / Delete target 2311ms
     ✓ deny mode blocks when any patch target is a first touch, and records all of them 1495ms
     ✓ deny mode still blocks when only one of several patch targets is new to the session 804ms
   ✓ dual driver shape (OpenCode 1.x server() + 2.0 setup()) (6)
     ✓ both drivers emit the same advisory for the same edit 1450ms
     ✓ V1 driver reads the real 1.x arg key `filePath` 615ms
     ✓ deny mode blocks the first touch on BOTH drivers 1165ms
   ✓ gateguard plugin — docs/*.md density advisory (#422) (6)
     ✓ appends the density advisory for a docs/ markdown file 729ms
     ✓ does NOT match a Documents/ ancestor (segment match, not substring) 1087ms
     ✓ excludes docs/plans/ (plan template governs those, not the docs register) 541ms
     ✓ does NOT match docs/knowledge.jsonl (gated on .md) 534ms
     ✓ matches a nested docs/ tree via segment match (.bkit/shared/docs/architecture.md) 437ms
 ✓ .bkit/core/engine/commands/lib.test.ts (62 tests) 3120ms
   ✓ runGit / runTool output limit (5)
     ✓ runGit names ENOBUFS when output passes the limit 1099ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1146ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (40 tests) 7532ms
   ✓ bkit roadmap mirror (6)
     ✓ writes the row in the worktree, then commits and pushes the same row on dev 1229ms
     ✓ never touches the main checkout and never pushes its local dev commits 973ms
     ✓ run from a checkout on dev writes the row once and mirrors nothing 420ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 982ms
     ✓ a refused dev push is logged, never fails the close 2954ms
     ✓ an unreachable remote is logged, never fails the close 545ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (31 tests) 3189ms
   ✓ bkit challenge gate (5)
     ✓ challenge gate writes a challenge-gate row 443ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 765ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 8947ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 8937ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (26 tests) 3046ms
   ✓ bkit disk prune — step files (9)
     ✓ min runs only min steps; max runs both 311ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (19 tests) 2599ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 2832ms
   ✓ gradeCompliance — the grade bkit workflows close runs before its report (7)
     ✓ stamps HEAD as run.parentSha and close-gate as by.step by default 315ms
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 580ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 541ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 469ms
 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (49 tests) 1767ms
 ✓ .bkit/core/engine/tools/instructions-coverage.test.ts (22 tests) 1964ms
   ✓ the repo (7)
     ✓ has no coverage findings 1007ms
     ✓ has no unreviewed near-alike entries 566ms
 ✓ .bkit/core/engine/audits/templates/context-templates.test.ts (74 tests) 2231ms
   ✓ .bkit/templates/context/ (74)
     ✓ bkit-github.md: github self-skips with no credentials 314ms
     ✓ bkit-github.md: github self-skips with no credentials 407ms
     ✓ bkit-playwright.md: playwright self-skips with no credentials 317ms
     ✓ install copies them into .bkit/templates/context/ 587ms
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts (159 tests | 1 failed) 109197ms
   ✓ fixture gh stub (10)
     ✓ runs?head_sha=green-capstone returns the captured workflow_runs list 28ms
     ✓ runs/<id>/jobs returns the captured jobs list, --paginate is accepted 31ms
     ✓ runs?head_sha=<unknown> returns total_count 0 (no-run shape) 18ms
     ✓ BKIT_FAKE_GH_API_ERROR=1: every api call exits 1 with stderr 15ms
     ✓ rate_limit returns the requested fixture state 21ms
     ✓ non-api argv exits non-zero (loud on an unmocked boundary) 14ms
     ✓ BKIT_FAKE_RATELIMITED=1: the run list fails rate-limit-shaped, rate_limit still answers 32ms
     ✓ --paginate emits one document per page; --slurp collapses them into an array 41ms
     ✓ rejects a '../'-laden SHA (no path traversal out of the runs dir) 14ms
     ✓ pr view is keyed by --repo; without it the checkout fixture is read 45ms
   ✓ bkit runs gate (58)
     ✓ accepts a green capstone at the head (exit 0) and says so 49ms
     ✓ rejects a failed run (12) 23ms
     ✓ rejects no run at the head (10) 42ms
     ✓ rejects runs that have not completed (11) 26ms
     ✓ rejects a green run at a superseded head (14), given --branch 39ms
     ✓ --fetch refreshes origin/<branch> before gating 276ms
     ✓ --fetch needs --branch (2) 1ms
     ✓ without --branch a superseded head is 10, not 14 (no invented attribution) 18ms
     ✓ rejects a run without the capstone job (13) 40ms
     ✓ rejects a cancelled run (15) 22ms
     ✓ rejects a green run whose capstone concluded 'cancelled' (12) 41ms
     ✓ rejects a green run whose capstone concluded 'skipped' (12) 60ms
     ✓ rejects a green run whose capstone concluded 'timed_out' (12) 52ms
     ✓ rejects a green run whose capstone concluded 'neutral' (12) 45ms
     ✓ rejects a green run whose capstone concluded 'action_required' (12) 47ms
     ✓ rejects a green run whose capstone concluded 'stale' (12) 48ms
     ✓ rejects a green run whose capstone concluded 'startup_failure' (12) 48ms
     ✓ --repo scopes --pr resolution (2)
       ✓ reads the head from the named repo, not the checkout's own PR 58ms
       ✓ logs the disagreement when the resolved repo differs from --repo 32ms
     ✓ skipped lanes (16 is opt-in) (5)
       ✓ a skipped lane alone does not refuse — the capstone's green settles it — but is reported 36ms
       ✓ refuses a skipped lane named in bkit.testing.shipGate (16) 37ms
       ✓ a required lane naming a different lane does not refuse 37ms
       ✓ refuses when any of several required lanes was skipped 36ms
       ✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 40ms
     ✓ a newer in-flight re-dispatch does not mask a completed green at the head 34ms
     ✓ tells an API error (20) from no run (10) 104ms
     ✓ shapes a rate-limit refusal from rate_limit (20) 31ms
     ✓ stderr noise on a successful gh call does not corrupt the JSON read 39ms
     ✓ an unparseable jobs response is an API error (20), not a missing capstone (13) 44ms
     ✓ gh missing from PATH exits 80 (use the MCP fallback), not an API error 2ms
     ✓ BKIT_SHIP_GATE_OVERRIDE (4)
       ✓ pinned to the refused head turns the refusal into 0 and appends the audit row 23ms
       ✓ a different SHA is ignored — the refusal stands 21ms
       ✓ honoured with no status file (no crash), the row goes to stderr 21ms
       ✓ an unwritable status file still exits 0 and emits the row to stderr (never invisible) 21ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 76ms
       ✓ bkit.testing.shipGate resolves from package.json 37ms
       ✓ absent shipGateRequiredLanes means no refusal 37ms
       ✓ a malformed shipGateRequiredLanes falls back to none, never crashes 35ms
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 78ms
     ✓ missing --head is a usage error (2) 1ms
     ✓ an empty --head= is a usage error (2), not a gate refusal 6ms
     ✓ --event (5)
       ✓ --event push ignores a pull_request run: no push run is 10, not 11 20ms
       ✓ without --event the in-flight pull_request run reads as in progress (11) 23ms
       ✓ --event push selects the green push run beside an in-flight pull_request run 44ms
       ✓ --event push reds on a failed push run even when a newer pull_request run is green 19ms
       ✓ without --event the newer green pull_request run masks the failed push run 68ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 59ms
       ✓ a run still in progress whose capstone already passed passes 56ms
       ✓ a capstone still running is in progress (11) 37ms
       ✓ a failed capstone fails (12) even when every other job passed 39ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 75ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 79ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 194ms
       ✓ a source change past the validated head refuses (17) and names the path 169ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 192ms
       ✓ --validated equal to --head is the plain head check 39ms
       ✓ --validated without --month / --fid is a usage error (2) 149ms
       ✓ a validated sha that is not an ancestor refuses (17) 156ms
   ✓ bkit runs mirror (18)
     ✓ green push run capstone -> 0 0ms
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
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 3637ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 3484ms
     ✓ e2e: green push run beside the PR's own in-flight run -> 0 61ms
     ✓ e2e: a red push run is not masked by a newer green PR run -> 1 33ms
     ✓ e2e: only the PR's own run exists -> absent, not in progress (3) 32ms
     ✓ usage: missing --head or a non-numeric minute value exits 2 1ms
   ❯ bkit runs wait (10)
     ✓ the dispatch probe matches the capstone's lane namespace, case-insensitive, by name or context 0ms
     ✓ is bounded: ceil(budget / interval) attempts, no sleep after the last 0ms
     ✓ found stops polling; every poll erroring is err with allErrored 0ms
     ✓ a sleep that overruns its window is blocked: hand the poll to the agent 0ms
     ✓ PR completed = no open checks; run targets are head-anchored 0ms
     × CLI: found exits 0; --once not found exits 81 (end the turn, call again) 5482ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 2608ms
     ✓ CLI: a failed gh workflow run exits 5 2712ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 4364ms
     ✓ CLI: usage errors exit 2 6ms
   ✓ bkit runs dispatch (14)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 139ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 235ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 381ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 208ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 139ms
     ✓ gh-error: every poll errored 112ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 182ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 177ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 213ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 183ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 102ms
     ✓ CLI: verdict JSON, body scan, exit codes 2644ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 2576ms
     ✓ CLI: --poll-result is validated, --attempts needs it 98ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 2843ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 696ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 684ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 677ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 234ms
     ✓ re-trigger on dev only uses the record of its own FID 287ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 378ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 234ms
   ✓ bkit runs declared (2)
     ✓ exit 0 when .github/workflows/<bkit.testing.ciWorkflow> exists, 1 when not 22ms
     ✓ the default bkit-ci.yml counts when no bkit.testing.ciWorkflow is configured 9ms
   ✓ scanBody (8)
     ✓ flags [skip ci] inherited into the landed commit body 42ms
     ✓ flags [ci skip] inherited into the landed commit body 46ms
     ✓ flags [no ci] inherited into the landed commit body 49ms
     ✓ flags [skip actions] inherited into the landed commit body 64ms
     ✓ flags [actions skip] inherited into the landed commit body 43ms
     ✓ flags [SKIP CI] inherited into the landed commit body 47ms
     ✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 89ms
     ✓ an empty or unreadable sha is an error, not a clean result 43ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 2449ms
     ✓ --pr refuses a title carrying a skip token (18) and --record writes the refusal row 2999ms
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 2743ms
     ✓ --snapshot scopes its run list and dev lookups to --repo 2885ms
     ✓ --snapshot without --repo leaves its run list unscoped 2627ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 1846ms
     ✓ a refused capstone records FAIL with its reason 2326ms
     ✓ an unreadable PR is an API error (20) with no head 2457ms
     ✓ takes exactly one of --head, --pr, --squash-of 11ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 2578ms
       ✓ without --repo no call gains a --repo flag 2927ms
       ✓ repoScopedGh appends --repo to workflow run, leaves gh api alone, and is a no-op without a repo 0ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 2815ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 4673ms
     ✓ refuses an unknown --reason 191ms
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 1606ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 3281ms
     ✓ ref uppercases a Linear or Jira key 0ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1929ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 1910ms
     ✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 1836ms
     ✓ CI_DEV refuses the slug "a/b" (exit 9) 1932ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 2333ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 2020ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 3890ms
     ✓ an unknown phase exits 3; gh needing auth exits 80 2236ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 3910ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 2087ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 2654ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 2213ms
     ✓ --file and --step go together 2093ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (51 tests) 1497ms
   ✓ bkit counters route --point (4)
     ✓ takes each point's default limit and asks when nothing is set 648ms
   ✓ bkit counters progress (5)
     ✓ judges codeChanged on source only, from the rounds' parent commits 349ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (13 tests) 1148ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (9 tests) 1507ms
   ✓ bkit context fetch (9)
     ✓ renders a JSON array of flat objects as a table and keeps the raw output in the outbox 317ms
 ✓ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests) 14643ms
   ✓ bkit skills prune (10)
     ✓ uninstalls unlisted skills from the union of folders and lock keys, never bkit-* 1880ms
     ✓ matches whole names only: a listed name inside a longer one does not keep it 1707ms
     ✓ treats regex characters in a skill name literally 1926ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 2209ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 1383ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 2003ms
     ✓ runs from the checkout top even when called from a subfolder 2159ms
     ✓ keeps bkit-* skills, from folders or the lock, even when .agents/skills.md does not list them 1328ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 112656ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 2065ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 4357ms
     ✓ always writes the marker, even with no plan 3219ms
     ✓ writes the linear marker shape, taking the tracker from package.json 3138ms
     ✓ writes the jira marker shape, taking the tracker from package.json 2936ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 2333ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 2498ms
     ✓ retries a failed create once, and exits 5 when it fails twice 3197ms
     ✓ exits 5 when the open-PR probe errors 2389ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 2520ms
     ✓ prs open still opens against any other base 2331ms
     ✓ exits 6 when the created PR's base is not --base 2455ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 2544ms
     ✓ exits 1 with found=false when there is none 2401ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 2161ms
     ✓ --number reads one PR, mergeable included 2420ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 3110ms
     ✓ exits 4 when gh errors and 80 when it needs auth 3112ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 2460ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 1947ms
     ✓ drops the force-build marker from the title subject 2190ms
     ✓ takes an explicit --subject 2385ms
     ✓ runs no merge when the PR is already MERGED 2343ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 2438ms
     ✓ prs merge refuses a PR whose base is main 2809ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 1777ms
     ✓ prs merge refuses when the PR base is unknown 1860ms
     ✓ prs merge reads the base from the one pr view it already makes 2763ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 1422ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 1516ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 1635ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 1388ms
     ✓ never reads dev's required checks without --only-if-required 1904ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 1968ms
     ✓ updates when a dev ruleset requires status checks 1891ms
     ✓ updates when dev's branch protection requires status checks 1851ms
     ✓ ignores dev rulesets that require no checks 1517ms
     ✓ updates when the repo cannot be resolved 2255ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 1509ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 2024ms
     ✓ is not green when a check failed, naming it (exit 1) 2256ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 1762ms
     ✓ is not green on an empty rollup (total 0) 1710ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 1327ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 2175ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 2004ms
     ✓ is a no-op when the title already says so 1962ms
     ✓ strips the marker, with or without its bkit prefix 1935ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1632ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (5 tests) 858ms
   ✓ catalog parity — retired plan agents (1)
     ✓ removed plan agents absent 852ms
 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (265 tests) 1485ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > repeat harvest of same rows does not duplicate (idempotent)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/consumer-app/.bkit/stats.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/consumer-app/.bkit/friction.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/consumer-app/.bkit/friction.jsonl — pruned 1 harvested row(s)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 1, kept in repos: 0
[bkit-harvest] 1 row(s) now exist ONLY in harvest/ (gitignored, not backed up by bkit).
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/consumer-app/.bkit/stats.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/consumer-app/.bkit/friction.jsonl — copied 0 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-wjNcDp/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 1, entities after fold: 2, pruned from repos: 0, kept in repos: 0

stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > rows with different identity keys are preserved (not over-deduped)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lRc82E/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lRc82E/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lRc82E/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lRc82E/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lRc82E/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lRc82E/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lRc82E/consumer-app/.bkit/stats.jsonl — copied 2 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lRc82E/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lRc82E/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lRc82E/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 0, kept in repos: 0

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > writes plugin prompts + workflow skills, and stamps the managed version
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-execute.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
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

stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > store keeps both same-key rows; the fold reads the later one (higher ts)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1LJXz/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1LJXz/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1LJXz/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1LJXz/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1LJXz/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1LJXz/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1LJXz/consumer-app/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1LJXz/consumer-app/.bkit/friction.jsonl — copied 2 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1LJXz/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1LJXz/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1LJXz/consumer-app/.bkit/friction.jsonl — pruned 2 harvested row(s)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 1, pruned from repos: 2, kept in repos: 0
[bkit-harvest] 2 row(s) now exist ONLY in harvest/ (gitignored, not backed up by bkit).

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > never writes Codex's `.agents/skills/`
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-execute.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
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

 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 1445ms
   ✓ shipped hook templates (5)
     ✓ every generated hook parses: node --check for JS, bash -n for shell 1419ms
stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > skips a half-written trailing line without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zMUW4t/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zMUW4t/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zMUW4t/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zMUW4t/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zMUW4t/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zMUW4t/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zMUW4t/consumer-app/.bkit/stats.jsonl — copied 2 rows (malformed: 1)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zMUW4t/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zMUW4t/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zMUW4t/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zMUW4t/consumer-app/.bkit/stats.jsonl — kept 1 line(s) not in the store (malformed, or appended after the copy)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 0, kept in repos: 1

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > is idempotent — a second render writes nothing
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-execute.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
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

stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles entirely empty .jsonl file without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-9ZdCwT/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-9ZdCwT/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-9ZdCwT/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-9ZdCwT/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-9ZdCwT/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-9ZdCwT/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-9ZdCwT/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-9ZdCwT/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-9ZdCwT/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-9ZdCwT/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > writes plugin.json, hooks.json, both hook scripts, and emits the setup advisory
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-execute.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
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
[test] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > warns when Codex is also installed (skill-overlap advisory)
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-execute.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
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
[test] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs

stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles a file with only malformed lines without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-qnsPcy/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

 ✓ scripts/harvest/ledgers.test.ts (7 tests) 1639ms
   ✓ Harvest dedup by per-kind composite identity (WS4-T2) (3)
     ✓ repeat harvest of same rows does not duplicate (idempotent) 579ms
   ✓ Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) (3)
     ✓ handles a file with only malformed lines without throwing 366ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > stays silent about the overlap when Codex is absent
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-execute.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
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
[test] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > strips only the managed blocks of .agents/context.md and .agents/skills.md, marker included
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] strip-block: .agents/context.md
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] strip-block: .agents/skills.md
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
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
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
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
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
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
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
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
.bkit/comparison.md                              | skip-absent            | file not found — nothing to do
.bkit/install.md                                 | skip-absent            | file not found — nothing to do
.bkit/jsonl.md                                   | skip-absent            | file not found — nothing to do
.bkit/LICENSE.md                                 | skip-absent            | file not found — nothing to do
.bkit/lite.md                                    | skip-absent            | file not found — nothing to do
.bkit/pipeline.md                                | skip-absent            | file not found — nothing to do
.bkit/providers.md                               | skip-absent            | file not found — nothing to do
.bkit/prompts.md                                 | skip-absent            | file not found — nothing to do
.bkit/templates.md                               | skip-absent            | file not found — nothing to do
.bkit/trackers.md                                | skip-absent            | file not found — nothing to do
.bkit/workflows.md                               | skip-absent            | file not found — nothing to do
.bkit/README.md                                  | skip-absent            | file not found — nothing to do
.agents/context.md                               | skip-absent            | file not found — nothing to do
.agents/docs.md                                  | skip-absent            | file not found — nothing to do
.agents/rules.md                                 | skip-absent            | file not found — nothing to do
.agents/skills.md                                | skip-absent            | file not found — nothing to do
.agents/shortcuts.md                             | skip-absent            | file not found — nothing to do
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


 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 1019ms
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
.bkit/comparison.md                              | skip-absent            | file not found — nothing to do
.bkit/install.md                                 | skip-absent            | file not found — nothing to do
.bkit/jsonl.md                                   | skip-absent            | file not found — nothing to do
.bkit/LICENSE.md                                 | skip-absent            | file not found — nothing to do
.bkit/lite.md                                    | skip-absent            | file not found — nothing to do
.bkit/pipeline.md                                | skip-absent            | file not found — nothing to do
.bkit/providers.md                               | skip-absent            | file not found — nothing to do
.bkit/prompts.md                                 | skip-absent            | file not found — nothing to do
.bkit/templates.md                               | skip-absent            | file not found — nothing to do
.bkit/trackers.md                                | skip-absent            | file not found — nothing to do
.bkit/workflows.md                               | skip-absent            | file not found — nothing to do
.bkit/README.md                                  | skip-absent            | file not found — nothing to do
.agents/context.md                               | skip-absent            | file not found — nothing to do
.agents/docs.md                                  | skip-absent            | file not found — nothing to do
.agents/rules.md                                 | skip-absent            | file not found — nothing to do
.agents/skills.md                                | skip-absent            | file not found — nothing to do
.agents/shortcuts.md                             | skip-absent            | file not found — nothing to do
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
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
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
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
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

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > preserves markered-text file when no bkit markers present (100% consumer)
[bkit-uninstall-test] preserve: AGENTS.md (markered-text but no bkit markers found — 100% consumer content)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
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
[bkit-uninstall-test] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > deletes opencode.json holding every provider block and tracker entry earlier installs left
[bkit-uninstall-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > keeps a provider block and a github tracker entry the consumer edited, whole, and their own entries
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > keeps a provider block and a linear tracker entry the consumer edited, whole, and their own entries
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > keeps a provider block and a jira tracker entry the consumer edited, whole, and their own entries
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > preserves opencode.json when the consumer added their own key
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > deletes .bkit/version on a full/core uninstall (bkit install-state, zero-footprint)
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/version
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
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
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
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
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
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
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
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
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
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
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
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
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
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
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (87 tests) 759ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 869ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 791ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (55 tests) 735ms
stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing
[bkit-install] Wrote .bkit/advisories.md (1 item).

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > overwrites an existing artifact on each call
[bkit-install] Wrote .bkit/advisories.md (0 items).

 ✓ .bkit/core/engine/checks/after/index.test.ts (53 tests) 715ms
 ✓ .bkit/core/engine/audits/templates/template-ci-yml.test.ts (13 tests) 757ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 3519ms
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 801ms
     ✓ is null when pnpm fails or prints something that is not a version 2670ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (73 tests) 447ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (15 tests) 650ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 1248ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 1117ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (94 tests) 385ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 485ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 418ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (81 tests) 250ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-cMKh1H/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 444ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (250 tests) 292ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (40 tests) 2709ms
   ✓ runLines (5)
     ✓ counts code, tests and docs apart, and leaves out plans, run logs and the ledgers 470ms
     ✓ counts deleted lines into changed 520ms
     ✓ cuts at each merge on the first-parent chain, so merged-in work is not counted 735ms
     ✓ is null when first is not an ancestor of last, or either is missing 441ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (30 tests) 2809ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (50 tests) 416ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-tUcQWm/nonexistent.md — skipping .claude/agents/bkit-foo.md

 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (277 tests) 235ms
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

 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 295ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 308ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 190ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 196ms
 ✓ .bkit/core/engine/shared/settings.test.ts (26 tests) 245ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 253ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (41 tests) 253ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (22 tests) 212ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 374ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 283ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (35 tests) 277ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 229ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (96 tests) 399ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 278ms
 ✓ .bkit/core/engine/commands/workflow/workstreams.test.ts (9 tests) 275ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 138ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 259ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 229ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (33 tests) 193ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 271ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (6 tests) 225ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 285ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 294ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 60ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (48 tests) 307ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/install/manifest.test.ts (47 tests) 190ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (115 tests) 305ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (64 tests) 124ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (23 tests) 129ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 132ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 113ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 99ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 194ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (24 tests) 175ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (23 tests | 1 skipped) 90ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 102ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 64ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793090363029.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793090363033.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793090363034.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793090363042.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 25ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 243ms
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

 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 42ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > leaves a .cursor/allowlist.json bkit never recorded alone
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > is idempotent — a second run finds nothing to migrate
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 175ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (65 tests) 378ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 24ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 70ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (60 tests) 117ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 258ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (21 tests) 209ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 18ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 142ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 17ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 19ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 13ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (104 tests) 49596ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1804ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 1732ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 2218ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1372ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 1495ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1926ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1838ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 2047ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1759ms
     ✓ PASS is 0 failures with or without reports 1760ms
     ✓ clears a previous attempt's reports before the gate runs 1857ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1832ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1976ms
     ✓ a log under the outbox is named main-checkout relative in the record 1915ms
     ✓ a log small enough is copied whole: not clamped, raw null 2114ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1326ms
   ✓ bkit tests red / green (25)
     ✓ records a red: the named test failed; row, log and test snapshot written, path passed whole 1723ms
     ✓ refuses a run that is not a red: exit 1, reason printed, no row 1003ms
     ✓ a red already recorded for the unchanged test stands on resume; a changed test runs again 1122ms
     ✓ refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2) 1122ms
     ✓ a script that cannot run is exit 4, not a rejected red 717ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 780ms
     ✓ green: --group audits only that group's tasks 353ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 681ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 526ms
     ✓ green: red recorded, test unchanged, named test passing -> no gaps 413ms
     ✓ green: lists each gap kind, with the diff for a test changed since its red 728ms
     ✓ green: a red recorded for a different test than the plan names is a red-mismatch 388ms
     ✓ green: a planned test that moved is a red-mismatch saying whether the recorded test passes now 427ms
     ✓ green: every test a task names needs its own red and its own pass 416ms
     ✓ test order (7)
       ✓ green finds the code commit for DONE — TASK N 1002ms
       ✓ a red recorded before the task's code commit stands, across a resumed execute 829ms
       ✓ a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked 605ms
       ✓ a test file that only gained lines since its red is no gap; the diff stays in the report 415ms
       ✓ green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green 721ms
       ✓ green refuses an exception-only task from a workflow step commit 357ms
       ✓ green clears an exception-only task from a human commit 343ms
 ✓ .bkit/core/engine/checks/tips/index.test.ts (21 tests) 26ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 25ms
stdout | .bkit/core/engine/commands/stats.test.ts > bkit stats > writes .bkit/stats.md, and the same ledgers give the same file
# bkit stats

This repo only: `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`. Written by `bkit stats`; workflow closes append the rows.

## Rows

<!-- prettier-ignore -->
| Kind | Rows |
| --- | --- |
| outcome | 1 |

<!-- prettier-ignore -->
| Workflow | Rows |
| --- | --- |
| build | 1 |

## Run durations

No outcome row records a duration.

## Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |

Attempt counters: 0 counted by the shell (trusted), 1 reported by the model (untrusted).

## Agent context peaks

No context data. A close records it from the Claude Code session that ran the workflow.

# bkit stats

This repo only: `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`. Written by `bkit stats`; workflow closes append the rows.

## Rows

<!-- prettier-ignore -->
| Kind | Rows |
| --- | --- |
| outcome | 1 |

<!-- prettier-ignore -->
| Workflow | Rows |
| --- | --- |
| build | 1 |

## Run durations

No outcome row records a duration.

## Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |

Attempt counters: 0 counted by the shell (trusted), 1 reported by the model (untrusted).

## Agent context peaks

No context data. A close records it from the Claude Code session that ran the workflow.


stderr | .bkit/core/engine/commands/stats.test.ts > bkit stats > writes .bkit/stats.md, and the same ledgers give the same file
[bkit-stats] wrote .bkit/stats.md
[bkit-stats] wrote .bkit/stats.md

 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 15ms
 ✓ .bkit/core/engine/commands/stats.test.ts (8 tests) 141ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (5 tests) 57ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 16ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (25 tests) 133ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (32 tests) 146ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 50ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 70ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 16ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (17 tests) 90ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 62ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 11ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 17ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 16ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (20 tests) 7ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 17ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 9ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 19ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 8ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 37ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (6 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 6ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (132 tests) 74191ms
   ✓ bkit workflows close (16)
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 331ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 481ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 457ms
     ✓ always writes the telemetry, whatever the runtime 462ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 313ms
     ✓ an unwritable stats path is logged and never fails the close 388ms
     ✓ ship: run.pr, size of the squash commit, and coverage 480ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 605ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 336ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 355ms
   ✓ bkit workflows close — commit, outbox, comment (8)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 395ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 455ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 488ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 528ms
     ✓ --record-step writes the close step's row before workflow-done 320ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 616ms
     ✓ --number without --outbox is a usage error 553ms
   ✓ bkit workflows handover (22)
     ✓ --push commits and pushes the record on the feature branch without a handover 811ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 817ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 952ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 468ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 346ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 367ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1387ms
     ✓ --flush with nothing to record commits and pushes nothing 1035ms
     ✓ --flush carries the named worktree's logs into the dev commit 1305ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3170ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1529ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1986ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1553ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1899ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1333ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1282ms
     ✓ --push on dev never carries a row whose references name another feature 1297ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1295ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 2422ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2820ms
     ✓ --push commits in the named worktree, not the checkout it runs from 995ms
   ✓ bkit workflows close --flush (ship) (6)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1855ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1725ms
     ✓ a close that landed releases the lock 1917ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4113ms
       ✓ closePr refuses when the PR base is unknown 4271ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1492ms
   ✓ bkit workflows promote (7)
     ✓ stamps the anchor from the runtime-resolved base commit 310ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 423ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 482ms
     ✓ names the branch, not the remote-tracking ref, in each URL 304ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 593ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 438ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1242ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 634ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 487ms
     ✓ a second run's record does not let this FID's close commit 518ms
     ✓ record is present after workflows close and before the push 924ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1430ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 340ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 389ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 563ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 493ms
     ✓ puts each --line after the summary, in flag order 566ms
     ✓ --summary prints the file and keeps a copy in --outbox 423ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 444ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 4ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/render/trackers.test.ts (102 tests) 273ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (236 tests) 500ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (173 tests) 141079ms
   ✓ branches rebase: behaviour (17)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 449ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 4392ms
     ✓ produces byte-identical output to merge=union 539ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 358ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 3674ms
     ✓ refuses a lockfile whose regenerate command fails 3086ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 354ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ runs (0) with the landed path count once dev moved 331ms
   ✓ branches push (17)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 339ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 3022ms
     ✓ runs exactly one git push 3101ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 353ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 2181ms
     ✓ --mode=abort pushes when the branch has no open PR 2821ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 2265ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 415ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 324ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 416ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 5702ms
     ✓ skip-ci HEAD on the replay is refused 416ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 823ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3428ms
     ✓ a level local dev is a plain push, recording nothing extra 539ms
     ✓ a record with no commits pushes nothing 393ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 3119ms
     ✓ a rewritten branch is refused, never forced 317ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 606ms
     ✓ refuses a detached HEAD (exit 5) 323ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 538ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 476ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 447ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 534ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 835ms
     ✓ an up-to-date branch is a no-op 518ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 870ms
     ✓ a fetch that fails exits 10 338ms
   ✓ branches scan-diff (8)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 427ms
     ✓ --paths with no match exits 1 395ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 314ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 487ms
     ✓ --marker reads a diff over 1 MiB 409ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 490ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 500ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 368ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 2579ms
     ✓ a title that already carries the marker is left alone 2930ms
     ✓ with no open PR: pushes the marker commit and edits no title 3611ms
     ✓ a re-run is deduped: no second marker commit 2289ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 2788ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 404ms
     ✓ --title-set skips gh entirely 575ms
     ✓ refuses dev and main (exit 21) 610ms
   ✓ branches sync (10)
     ✓ Path A when origin/dev is an ancestor of HEAD 739ms
     ✓ Path B once dev moved; --head checks a given commit 942ms
     ✓ --merge-docs merges dev when docs/ is behind 1221ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 887ms
     ✓ --merge-docs never merges on dev itself 958ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1260ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1474ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 1031ms
     ✓ exits 10 when the fetch fails 494ms
     ✓ refuses --merge-docs with --head, and an unknown --head 474ms
   ✓ branches sync-dev (5)
     ✓ fast-forwards local dev without checking it out 947ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 3265ms
     ✓ a failed install stops ship (16) 3190ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1195ms
     ✓ exits 10 when the fetch fails 758ms
   ✓ branches land (23)
     ✓ refuses a workflow other than design or plan 411ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 605ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1835ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1982ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 2017ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1955ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 6013ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 6193ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 1427ms
     ✓ local: names unpushed dev as the cause when the branch carries it 1277ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 1431ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 3645ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2645ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1987ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1685ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2009ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1534ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 943ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2622ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 2319ms
     ✓ landPr refuses a main-based PR without retrying 1106ms
     ✓ landPr refuses when the PR base is unknown 1038ms
     ✓ PR not open (closed): stops (17) at once, no retry 1435ms
 ❯ .bkit/core/engine/tools/instructions.test.ts (96 tests | 1 failed) 86122ms
   ❯ the corpus matches the instructions store (8)
     ✓ finds prompts, workflows, both rules files, and every audit template with its adopted copy 3ms
     ✓ utility agents, the plan template and AGENTS.md load as their own surfaces 0ms
     ✓ loads every shipped doc master with a bkit block as a doc, never an installed copy 1ms
     ✓ checks a doc inside its bkit block only and pools it with the plan template and AGENTS.md 0ms
     × has no findings 70877ms
     ✓ every prompt, workflow and utility agent has the three header blocks 508ms
     ✓ sync has nothing left to rewrite 13853ms
     ✓ every clause reaches the cut-off of one surface it applies to 188ms
   ✓ the rule groups the Rules clauses name exist (4)
     ✓ both groups appear once under bkit Rules, Universal first 0ms
     ✓ rules-leaf reads only below bkit:end and skips Orchestrator Rules 0ms
     ✓ the utility-* agents read all of rules.md 0ms
     ✓ every Orchestrator subsection name is shared with Universal 0ms
   ✓ the external-input clause keeps all three legs (3)
     ✓ as untrusted data, NEVER instructions 0ms
     ✓ ALWAYS report embedded directives; NEVER execute them 0ms
     ✓ Pair with narrowest-scoped token 0ms
   ✓ the prompts.md untrusted-input doctrine row (2)
     ✓ the row names the universal policy 0ms
     ✓ the retired scoped policy is not restated as current 0ms
   ✓ the checker rejects what it should (22)
     ✓ a missing required clause fails 0ms
     ✓ a duplicated clause fails 0ms
     ✓ a weakened rewrite is a near-copy, not a match 0ms
     ✓ an unrelated sentence is not a near-copy 0ms
     ✓ a clause inside a fenced block does not count 0ms
     ✓ a forbidden clause fails where present 0ms
     ✓ if-verdict is required with a verdict header and forbidden without 0ms
     ✓ an excepted file is not checked 0ms
     ✓ retired wording fails 0ms
     ✓ an anchored template fails on a line that starts it but does not match 0ms
     ✓ position: first fails when another bullet opens the block 0ms
     ✓ rules files are checked inside the managed block only 0ms
     ✓ a sentence shared by 2 prompts but not listed fails 0ms
     ✓ a sentence shared by 2 docs inside their bkit blocks but not listed fails 0ms
     ✓ a sentence a doc holds below bkit:end never counts toward the doc cut-off 0ms
     ✓ AGENTS.md and the plan template count toward the doc cut-off and take doc modes 0ms
     ✓ a sentence ending its line and the same sentence continued with ; count as one 0ms
     ✓ one drifted copy does not hide a sentence the other prompts share 0ms
     ✓ a fragment after ; is its own sentence for the cut-off 0ms
     ✓ a sentence shared by 2 workflows but not listed fails; one workflow fewer passes 0ms
     ✓ each surface keeps its own cut-off: prompts and workflows never pool 0ms
     ✓ headings, HTML comments, and table rows never count toward the cut-off 0ms
   ✓ standing lines (1)
     ✓ standingLines keeps a NEVER bullet and drops tables, headings and fences 0ms
   ✓ the store parser (2)
     ✓ parseInstructions reads clauses only up to the next section 0ms
     ✓ a clause with rule and carriers keys parses 0ms
   ✓ store carriers (2)
     ✓ carriersLine writes all, all except, and prefix families 0ms
     ✓ syncStore rewrites a stale carriers line and keeps a current one 0ms
   ✓ audit templates (6)
     ✓ the store accepts an audit mode 0ms
     ✓ a required clause is checked inside the managed block only 0ms
     ✓ a near-copy in an audit template is flagged and sync rewrites the template and its adopted copy alike 0ms
     ✓ a sentence shared by 5 audit templates but not listed fails 0ms
     ✓ an adopted copy never counts twice toward the cut-off 0ms
     ✓ text below `bkit:end` never counts toward the cut-off 0ms
   ✓ checkboxes and sibling clauses (3)
     ✓ a gate checkbox is a line prefix, like a list marker 0ms
     ✓ a drifted gate item behind a checkbox is a near-copy 0ms
     ✓ a line carrying one clause verbatim is not a near-copy of its sibling 0ms
   ✓ sentence splitting (3)
     ✓ splits after . and ;, keeps the punctuation, and never splits after e.g. 0ms
     ✓ a clause ending in . matches a line that continues it with ; 0ms
     ✓ a drift that turns the clause's ; into , is still a near-copy 0ms
   ✓ modes (6)
     ✓ reads the tools list in block and inline form, skipping comment lines 0ms
     ✓ if-bash is required with Bash in the tools list and forbidden without 0ms
     ✓ if-search is required with Grep or Bash in the tools list and forbidden without 0ms
     ✓ if-no-search is required without Grep and Bash in the tools list and forbidden with either 0ms
     ✓ lines in a prompt's Rules block are rule copies, never clause carriers 0ms
     ✓ repeatable allows any number of copies but still flags near-copies 0ms
   ✓ templates (3)
     ✓ an anchored line may match any one of several templates 0ms
     ✓ a drifted anchored line fails 0ms
     ✓ a line two overlapping templates both fit counts once 0ms
   ✓ header blocks (7)
     ✓ each clause in its block, in wording-file order, passes; local lines in between allowed 0ms
     ✓ two swapped lines in one block fail 0ms
     ✓ a clause in the wrong block fails 0ms
     ✓ a placed clause in the body fails 0ms
     ✓ a CAUTION box, a missing block and blocks out of order fail 0ms
     ✓ files outside prompts, workflows and repo agents need no blocks 0ms
     ✓ the wording file takes block and position: first, and rejects anything else 1ms
   ✓ rule copies outside the Rules block (2)
     ✓ a rule's copy in Protocol or Contract fails, a cut-short copy included 2ms
     ✓ a line sharing only the rule's label, and the Rules block copy, pass 1ms
   ✓ fully retired clauses (6)
     ✓ parse with no text block and no surface 0ms
     ✓ reject a text block or a surface 0ms
     ✓ are a record only: their wording in a file is neither flagged nor rewritten 0ms
     ✓ never cover a sentence for the cut-off 0ms
     ✓ the removed prompt clauses stay on record, and the cut-off skips them 0ms
     ✓ output-cap's sentence stays inline in the abort handover prompt 593ms
   ✓ sync (7)
     ✓ rewrites a near-copy and keeps the list marker 0ms
     ✓ rewrites the text behind a different label when the clause is unlabelled 0ms
     ✓ rewrites retired wording, carrying slot values across 0ms
     ✓ rewrites a near-copy that closes a sentence opened by local text 0ms
     ✓ rewrites retired wording continued with ; and keeps the ; 0ms
     ✓ rewrites a near-copy continued with ; and keeps the ; 0ms
     ✓ is idempotent and leaves fenced examples alone 0ms
   ✓ issue-less workflow clauses (7)
     ✓ workflow-issue-id-missing leads into the branch recovery without a STOP 0ms
     ✓ the fids parse routes: hit, no issue, non-slug STOP 0ms
     ✓ Step 1 reads the issue and FID from the prompt file, and resolves FID in the engine 0ms
     ✓ changed issue clauses keep their old text in retired 0ms
     ✓ the issue-less gate clauses read as the issue-less behaviour 0ms
     ✓ the warning, the final-message line and the skip line are clauses 0ms
     ✓ the diff reaches each reader as a file written just before its step, not a guard rule 0ms
   ✓ the Template Instructions tables match the prompts (2)
     ✓ every row's bullet is byte-identical across its carriers 43ms
     ✓ every label's rows list exactly the prompts that carry it 42ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/tools/instructions.test.ts > the corpus matches the instructions store > has no findings
Error: Test timed out in 60000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/tools/instructions.test.ts:206:3
    204|   });
    205|
    206|   it("has no findings", { timeout: 60_000 }, () => {
       |   ^
    207|     const findings = checkClauses(CLAUSES, CORPUS).map(formatFinding);
    208|     expect(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  .bkit/core/engine/audits/repo/resolve-push-base.test.ts > resolve-push-base > exit 0 always > reports last-green-run as the source when the green head is an ancestor
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/repo/resolve-push-base.test.ts:167:5
    165|     });
    166|
    167|     it("reports last-green-run as the source when the green head is an…
       |     ^
    168|       const r = runWithFakes(runs, "exit 0");
    169|       expect(r).toMatchObject({ status: 0, stdout: GREEN, source: "las…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  .bkit/core/engine/audits/repo/resolve-push-base.test.ts > resolve-push-base > exit 0 always > local mode > falls back to origin/dev with the reason on stderr when gh fails
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/repo/resolve-push-base.test.ts:205:7
    203|       });
    204|
    205|       it("falls back to origin/dev with the reason on stderr when gh f…
       |       ^
    206|         const r = runWithFakes("echo 'gh: not logged in' >&2; exit 4",…
    207|         expect(r).toMatchObject({ status: 0, stdout: ORIGIN });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

 FAIL  .bkit/core/engine/audits/templates/ci-scripts.test.ts > shipped copy-and-own test files > ci/lanes/resolve-push-base.test.mjs passes when run on its own
Error: Test timed out in 30000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/templates/ci-scripts.test.ts:260:29
    258|   });
    259|
    260|   it.each(SHIPPED_TEST_FILES)("%s passes when run on its own", { timeo…
       |                             ^
    261|     const res = spawnSync(process.execPath, [path.join(SHIPPED_SCRIPTS…
    262|       encoding: "utf-8",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs wait > CLI: found exits 0; --once not found exits 81 (end the turn, call again)
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:1108:3
    1106|     JSON.stringify({ statusCheckRollup: names.map((name) => ({ name, s…
    1107|
    1108|   it("CLI: found exits 0; --once not found exits 81 (end the turn, cal…
       |   ^
    1109|     fakeGhBin({ "pr-view": ROLLUP("bkit-tests-static") });
    1110|     const r = await cli(tmp(), ["wait", "--pr=7"]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯


 Test Files  4 failed | 148 passed (152)
      Tests  5 failed | 6269 passed | 1 skipped (6275)
   Start at  18:37:12
   Duration  159.05s (tests 96%, import 1%, transform 1%, worker 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/705-build-plan-convert/run-tests-1.log.reports/vitest-40417.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.43 |    82.33 |   95.15 |   90.72 |                   
 engine            |   75.47 |    79.27 |    87.5 |   75.86 |                   
  cli.ts           |   75.47 |    79.27 |    87.5 |   75.86 | ...11,921,926-928 
 ...e/checks/after |   90.62 |     85.4 |   94.44 |    94.4 |                   
  auth.ts          |   98.41 |    98.38 |     100 |   97.95 | 70                
  ci-yml.ts        |   90.09 |    82.06 |     100 |   92.49 | ...09,422-424,435 
  github.ts        |   96.42 |    90.42 |     100 |   96.84 | 333-335           
  index.ts         |   86.25 |    72.72 |     100 |   97.09 | ...97,317,412-413 
  managed.ts       |   82.92 |    89.39 |   58.33 |   83.87 | 216-237           
  suppression.ts   |     100 |      100 |     100 |     100 |                   
  tools.ts         |   96.96 |       90 |     100 |   98.14 | 299               
 .../checks/before |   94.29 |    88.34 |   95.45 |   97.69 |                   
  context-fetch.ts |   98.72 |     92.4 |     100 |     100 | ...92,514,528,575 
  env.ts           |   90.16 |    79.62 |     100 |   91.83 | 176-181,188-196   
  files.ts         |   92.64 |    89.74 |   93.75 |   98.11 | 129               
  index.ts         |   83.78 |    73.33 |     100 |     100 | ...38,144,152-171 
  mcp.ts           |     100 |    96.96 |     100 |     100 | 81                
  repo.ts          |   92.66 |    92.77 |   86.36 |   92.77 | 154-162           
  version.ts       |   96.87 |    82.35 |     100 |     100 | 18-20,34,61-62    
 engine/commands   |   90.11 |    84.71 |    90.9 |   90.06 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...67,376,444,492 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   97.14 |    89.74 |     100 |     100 | 70-74,134,140     
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   97.86 |    92.44 |      94 |   98.73 | 283-284           
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   77.14 |    59.09 |   66.66 |   77.27 | ...58-171,201-202 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   98.36 |    86.09 |   96.29 |   99.53 |                   
  ci.ts            |   98.36 |    86.09 |   96.29 |   99.53 | 164               
 ...mmands/install |   47.55 |    45.73 |   59.49 |   48.12 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |      20 |     26.5 |      50 |   17.77 | ...42-146,217-613 
  uninstall.ts     |    66.6 |    63.09 |      70 |   67.96 | ...1107,1130-1297 
  upgrade.ts       |   32.77 |    31.87 |   35.71 |   34.05 | 348-376,558-1049  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |    92.8 |     84.2 |   96.96 |   94.28 |                   
  branches.ts      |    88.9 |    81.22 |   97.11 |    90.6 | ...1847,1852,1877 
  challenge.ts     |   95.92 |    83.07 |     100 |   97.39 | ...17-319,553,577 
  context.ts       |   96.56 |    87.02 |   98.52 |    97.3 | ...1564,1719,1808 
  counters.ts      |   99.15 |       93 |     100 |   99.08 | 142               
  decisions.ts     |   94.05 |     74.4 |   97.36 |   98.13 | 160,259,327       
  disk.ts          |   92.88 |    84.69 |   95.55 |   95.54 | ...29,412-420,536 
  fids.ts          |    98.3 |    95.03 |   98.71 |   98.87 | 160,446,915-916   
  issues.ts        |   97.87 |    91.54 |   98.24 |   98.79 | 195,436-437,765   
  ledgers.ts       |   90.63 |       80 |   97.05 |   94.68 | ...1361,1371,1447 
  locks.ts         |   93.75 |    85.91 |   95.45 |   95.49 | ...09-210,377-378 
  plan-blocks.ts   |   89.28 |    81.96 |     100 |   89.49 | ...70-572,575-576 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1153,1169-1170 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,219         
  roadmap.ts       |   96.63 |    91.42 |     100 |   97.15 | ...63,483-485,489 
  run-facts.ts     |    96.9 |    90.34 |     100 |   98.92 | 498-499           
  runs.ts          |   92.81 |     84.8 |     100 |    94.1 | ...1858,1890-1894 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...53,301,321-326 
  skills.ts        |     100 |     92.3 |     100 |     100 | 97,102            
  status.ts        |   97.29 |    95.54 |     100 |   98.45 | 103,203,407       
  step-table.ts    |     100 |    98.48 |     100 |     100 | 319               
  steps.ts         |   87.57 |    81.59 |   89.06 |    88.7 | ...1385,1390,1392 
  summary.ts       |   93.93 |    87.09 |   88.37 |   93.03 | ...56-357,365-371 
  tests.ts         |   95.62 |    86.21 |   95.65 |   97.06 | ...1499,1561,1570 
  tracker.ts       |   92.89 |    73.23 |     100 |   96.73 | ...36,848,931,979 
  workflows.ts     |   93.14 |    81.85 |   97.01 |   94.82 | ...1610,1783,2479 
  workstreams.ts   |   98.27 |    96.42 |     100 |     100 | 115               
  worktrees.ts     |   68.25 |    64.07 |   76.92 |   68.73 | ...93-896,899-900 
 engine/install    |   93.11 |    84.79 |   93.23 |   95.86 |                   
  cloud-env.ts     |   97.45 |    92.51 |     100 |     100 | ...98,722-774,877 
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 548-555           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,293            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   96.41 |    91.93 |   98.82 |   96.91 |                   
  status.ts        |     100 |    98.64 |     100 |     100 | 114               
  telemetry.ts     |   95.85 |    91.16 |   98.51 |   96.44 | ...1719,1762,2130 
 engine/render     |   90.02 |    81.39 |   98.07 |   92.24 |                   
  hosts.ts         |   88.31 |    78.89 |   94.73 |   89.69 | ...48-158,490-491 
  models.ts        |      90 |    81.11 |     100 |   94.26 | ...80,266,288,322 
  trackers.ts      |     100 |      100 |     100 |     100 |                   
 engine/shared     |   99.36 |    97.29 |     100 |   99.26 |                   
  package-json.ts  |     100 |    96.77 |     100 |     100 | 65                
  ...ge-manager.ts |     100 |      100 |     100 |     100 |                   
  package-roots.ts |      96 |       75 |     100 |   95.45 | 119               
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |     100 |    99.06 |     100 |     100 | 247               
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   90.71 |    85.83 |    95.4 |   91.43 |                   
  instructions.ts  |   90.71 |    85.83 |    95.4 |   91.43 | ...1662-1744,1749 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.43% ( 15005/16778 )
Branches     : 82.33% ( 10576/12845 )
Functions    : 95.15% ( 2397/2519 )
Lines        : 90.72% ( 13169/14516 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
