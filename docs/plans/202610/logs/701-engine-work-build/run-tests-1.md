
> @cbartens/bkit@6.0.0 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> pnpm bkit:gate:static-unit && pnpm test:integration


> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs


0/150 files need formatting

> @cbartens/bkit@6.0.0 lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'

✔ 0 errors, 0 warnings and 0 suggestions in 147 files.
passed: true
skipped: null
files: 147

> @cbartens/bkit@6.0.0 slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> bkit ci slop

[bkit-ci] base 79bf45172c08ed558e07b68b1a0c6f08113fc106 (79bf45172c08ed558e07b68b1a0c6f08113fc106) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 79bf45172c08ed558e07b68b1a0c6f08113fc106
base: 79bf45172c08ed558e07b68b1a0c6f08113fc106
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 4377ms
   ✓ bkit setup protect-main — apply (5)
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 315ms
     ✓ resolves config from the repo root when run from a subdirectory 313ms
     ✓ exits 6 when the PUT fails 321ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 634ms
   ✓ bkit setup protect-main — pre-flight (6)
     ✓ exits 4 when the CI workflow file is missing, before any write 409ms
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 429ms
     ✓ asks a human to log in when gh is not authenticated 315ms
     ✓ exits 3 when gh repo view names no repository 302ms
   ✓ bkit setup protect-main --print (4)
     ✓ exits 6 on any other api failure instead of calling main unprotected 322ms
     ✓ exits 6 when the api answer is not JSON 327ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 14932ms
   ✓ gateguard opencode plugin — advisory mode (default) (7)
     ✓ keeps the reuse checklist when the write CREATES the file (pre-write snapshot) 369ms
     ✓ warns again for a different file in the same session 510ms
   ✓ gateguard opencode plugin — deny mode (2)
     ✓ allows retry (second call is a no-op after dedup marked) 325ms
   ✓ gateguard opencode plugin — subagents are NOT exempt (3)
     ✓ a subagent session editing a file DOES get the advisory (exemption removed) 340ms
     ✓ orchestrator session gets the advisory too — same treatment either way 354ms
   ✓ gateguard opencode plugin — gate-config advisory (9)
     ✓ tsconfig.json triggers config advisory 359ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 891ms
     ✓ patch (v1 driver): checks every Add / Update / Move-to / Delete target 915ms
     ✓ apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target 891ms
     ✓ apply_patch (v1 driver): checks every Add / Update / Move-to / Delete target 862ms
     ✓ deny mode blocks when any patch target is a first touch, and records all of them 915ms
     ✓ deny mode still blocks when only one of several patch targets is new to the session 605ms
   ✓ dual driver shape (OpenCode 1.x server() + 2.0 setup()) (6)
     ✓ both drivers emit the same advisory for the same edit 602ms
     ✓ V1 driver reads the real 1.x arg key `filePath` 341ms
     ✓ deny mode blocks the first touch on BOTH drivers 619ms
   ✓ gateguard plugin — docs/*.md density advisory (#422) (6)
     ✓ appends the density advisory for a docs/ markdown file 301ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (47 tests) 17746ms
   ✓ bkit ci slop — gate decision (6)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 544ms
     ✓ fails on a net score rise with no net count change 420ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 856ms
     ✓ treats a net score at or below 0.001 as float noise 424ms
     ✓ passes when the change only resolves findings 425ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 437ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 523ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1052ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 878ms
     ✓ exits 4 on a dropped net field instead of silently passing 771ms
     ✓ exits 4 on no summary instead of silently passing 774ms
     ✓ exits 4 on output that is not JSON instead of silently passing 769ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1282ms
   ✓ bkit ci slop — real slop-scan (3)
     ✓ a genuinely new finding fails the gate 423ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 479ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 616ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1010ms
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 427ms
     ✓ fails (exit 1) when vale reports alerts 344ms
     ✓ exits 6 on a vale runtime error 454ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 878ms
     ✓ falls back to vale sync when the main worktree has none 454ms
     ✓ skips loudly with exit 0 when vale sync cannot restore it either 873ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (96 tests) 23572ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 14942ms
     ✓ sync has nothing left to rewrite 7514ms
   ✓ fully retired clauses (6)
     ✓ output-cap's sentence stays inline in the abort handover prompt 614ms
 ✓ .bkit/core/engine/audits/repo/resolve-push-base.test.ts (17 tests) 13698ms
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 1699ms
       ✓ falls back to event.before when gh prints unparseable output 777ms
       ✓ reports last-green-run as the source when the green head is an ancestor 2082ms
       ✓ CI mode: falls back to event.before and says so when the run list is unreadable 1082ms
       ✓ local mode (3)
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 2137ms
         ✓ tests ancestry against --head, not HEAD 2600ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 3316ms
(node:8194) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:8194) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:8194) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:8194) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:8194) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:8194) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:8194) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (29 tests) 15049ms
   ✓ shipped copy-and-own test files (5)
     ✓ ci/lanes/resolve-push-base.test.mjs passes when run on its own 14247ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (42 tests) 29503ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 1051ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 877ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 777ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 778ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 1148ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 988ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 716ms
     ✓ counts commits behind origin/dev and the divergence age 376ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 509ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 597ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 438ms
     ✓ from a worktree, still names the main checkout and its outbox 336ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 492ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 529ms
   ✓ bkit repo info — where the wired tracker's issues live (10)
     ✓ prints the Linear team and project under linear 699ms
     ✓ prints the Jira site and project under jira 877ms
     ✓ prints the board under github 1017ms
     ✓ prints the github progress and review states, defaults for a key left unset 1008ms
     ✓ prints the linear progress and review states, defaults for a key left unset 649ms
     ✓ prints the jira progress and review states, defaults for a key left unset 1078ms
     ✓ prints the linear progress and review states, defaults for a key left unset 1075ms
     ✓ prints null progress and review states under none 1194ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 1351ms
     ✓ prints nulls under github without a board, and for keys left unset 1283ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 1670ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 1617ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1408ms
     ✓ an unpinned repo reports nulls and asks no registry 1149ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 951ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 813ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 993ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 702ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (116 tests) 34628ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 365ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 424ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 740ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 431ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 391ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 347ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 435ms
     ✓ PASS is 0 failures with or without reports 664ms
     ✓ clears a previous attempt's reports before the gate runs 1069ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 875ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 706ms
     ✓ a log under the outbox is named main-checkout relative in the record 766ms
     ✓ a log small enough is copied whole: not clamped, raw null 1128ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 874ms
   ✓ bkit tests red / green (29)
     ✓ records a red: the named test failed; row, log and test snapshot written, path passed whole 428ms
     ✓ refuses a run that is not a red: exit 1, reason printed, no row 320ms
     ✓ a red already recorded for the unchanged test stands on resume; a changed test runs again 394ms
     ✓ refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2) 429ms
     ✓ a script that cannot run is exit 4, not a rejected red 545ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 816ms
     ✓ green: --group audits only that group's tasks 866ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 971ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 979ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 630ms
     ✓ green prints a verdict and a fixable per gap 1115ms
     ✓ green verdict is FAIL when a gap is unfixable 1018ms
     ✓ green leaves a diff-reading kind fixable null 1201ms
     ✓ green prints verdict null when a gap needs a diff read 1368ms
     ✓ green: lists each gap kind, with the diff for a test changed since its red 1182ms
     ✓ green: a red recorded for a different test than the plan names is a red-mismatch 1753ms
     ✓ green: a planned test that moved is a red-mismatch saying whether the recorded test passes now 1622ms
     ✓ green: every test a task names needs its own red and its own pass 1432ms
     ✓ test order (7)
       ✓ green finds the code commit for DONE — TASK N 1624ms
       ✓ a red recorded before the task's code commit stands, across a resumed execute 857ms
       ✓ a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked 959ms
       ✓ green emits a test-changed gap for a red whose test gained added lines only 642ms
       ✓ green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green 841ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (88 tests) 11592ms
   ✓ bkit steps done (19)
     ✓ reports a failed commit with exit 8 without writing the row 1681ms
     ✓ a failed commit leaves no row staged in the index 1612ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 375ms
     ✓ writeStepRow refuses when a recorded path changed 471ms
     ✓ writeStepRow appends its commit sha to the record 429ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 723ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (132 tests) 37997ms
   ✓ bkit workflows close (16)
     ✓ lists the feature's docs and this workflow's logs on the ref as links 342ms
   ✓ bkit workflows close — commit, outbox, comment (8)
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 311ms
   ✓ bkit workflows handover (22)
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 314ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 381ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 771ms
     ✓ --flush with nothing to record commits and pushes nothing 532ms
     ✓ --flush carries the named worktree's logs into the dev commit 716ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 1057ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 635ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 732ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 505ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 656ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 592ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 610ms
     ✓ --push on dev never carries a row whose references name another feature 600ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 478ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 902ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1440ms
   ✓ bkit workflows close --flush (ship) (6)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 614ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 405ms
     ✓ a close that landed releases the lock 516ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4156ms
       ✓ closePr refuses when the PR base is unknown 2969ms
     ✓ leaves a worktree no workflow created, and its branch, in place 629ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 504ms
     ✓ a second run's record does not let this FID's close commit 339ms
     ✓ record is present after workflows close and before the push 569ms
     ✓ failed handover from dev removes the record and keeps recorded paths 854ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 307ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (62 tests) 9894ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 366ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 368ms
     ✓ a new run of the same FID rewrites startSha 578ms
     ✓ a resume of the same FID reuses the record 612ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 327ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 377ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 446ms
     ✓ a stale record without a lock is replaced 537ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 425ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 357ms
   ✓ bkit worktrees remove (12)
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 324ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 355ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 41672ms
   ✓ bkit prs open (36)
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 388ms
     ✓ always writes the marker, even with no plan 422ms
     ✓ writes the linear marker shape, taking the tracker from package.json 749ms
     ✓ writes the jira marker shape, taking the tracker from package.json 431ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 427ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 453ms
     ✓ retries a failed create once, and exits 5 when it fails twice 693ms
     ✓ exits 5 when the open-PR probe errors 1016ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 903ms
     ✓ prs open still opens against any other base 661ms
     ✓ exits 6 when the created PR's base is not --base 769ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 1155ms
     ✓ exits 1 with found=false when there is none 986ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 635ms
     ✓ exits 4 when gh errors and 80 when it needs auth 587ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 401ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 517ms
     ✓ drops the force-build marker from the title subject 874ms
     ✓ takes an explicit --subject 866ms
     ✓ runs no merge when the PR is already MERGED 897ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 843ms
     ✓ prs merge refuses a PR whose base is main 927ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 1095ms
     ✓ prs merge refuses when the PR base is unknown 1069ms
     ✓ prs merge reads the base from the one pr view it already makes 1186ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 970ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 1236ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 1658ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 1632ms
     ✓ never reads dev's required checks without --only-if-required 1353ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 894ms
     ✓ updates when a dev ruleset requires status checks 1367ms
     ✓ updates when dev's branch protection requires status checks 691ms
     ✓ ignores dev rulesets that require no checks 1011ms
     ✓ updates when the repo cannot be resolved 648ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 722ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 545ms
     ✓ is not green when a check failed, naming it (exit 1) 489ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 579ms
     ✓ is not green on an empty rollup (total 0) 446ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 781ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 867ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 679ms
     ✓ is a no-op when the title already says so 778ms
     ✓ strips the marker, with or without its bkit prefix 929ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1231ms
 ✓ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests) 6509ms
   ✓ bkit skills prune (10)
     ✓ uninstalls unlisted skills from the union of folders and lock keys, never bkit-* 603ms
     ✓ matches whole names only: a listed name inside a longer one does not keep it 758ms
     ✓ treats regex characters in a skill name literally 765ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 766ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 794ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 757ms
     ✓ runs from the checkout top even when called from a subfolder 864ms
     ✓ keeps bkit-* skills, from folders or the lock, even when .agents/skills.md does not list them 1180ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 8949ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 5131ms
     ✓ every fence parses under zsh -n 3774ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (210 tests) 8761ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 403ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (84 tests) 9734ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (23)
     ✓ top-level docs/*.md is committed under scope=pr, not under scope=core or scope=full 417ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ a recorded ledger commits only the rows the run appended 395ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 407ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 357ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 2283ms
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 656ms
     ✓ is null when pnpm fails or prints something that is not a version 1606ms
 ✓ .bkit/core/engine/commands/land.test.ts (25 tests) 6929ms
   ✓ pushToDev (13)
     ✓ lands the commit on origin/dev and leaves the main checkout alone 478ms
     ✓ never pushes local dev commits missing from origin/dev 414ms
     ✓ dev moved: rebuilds on the new dev and pushes again 642ms
     ✓ dev moved before every push: exhausted, nothing landed 871ms
     ✓ any other refusal is returned, not retried 1260ms
     ✓ pushToDev replays a commit range onto origin/dev 502ms
     ✓ a replay retries on the new dev when dev moved 651ms
     ✓ pushToDev log line names what it lands 435ms
     ✓ runs no git hooks in the throwaway checkout, and says so 389ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 407ms
     ✓ a push that fails without a server answer is returned once, never retried 319ms
     ✓ build throwing stops the landing and removes the throwaway checkout 343ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (19 tests) 1319ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 1249ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (97 tests) 4739ms
   ✓ bkit context clamp — per-context profiles (#697) (4)
     ✓ keeps each context's own section banner and drops every other context's 799ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (40 tests) 3295ms
   ✓ bkit roadmap mirror (6)
     ✓ writes the row in the worktree, then commits and pushes the same row on dev 448ms
     ✓ never touches the main checkout and never pushes its local dev commits 508ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 531ms
     ✓ a refused dev push is logged, never fails the close 1065ms
     ✓ an unreachable remote is logged, never fails the close 333ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (26 tests) 1483ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 4004ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 743ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (40 tests) 992ms
 ✓ .bkit/core/engine/commands/lib.test.ts (62 tests) 1473ms
   ✓ runGit / runTool output limit (5)
     ✓ runGit names ENOBUFS when output passes the limit 501ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 545ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (32 tests) 1934ms
   ✓ bkit challenge gate (5)
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 571ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (18 tests) 1103ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 641ms
   ✓ shipped hook templates (5)
     ✓ every generated hook parses: node --check for JS, bash -n for shell 624ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (27 tests) 995ms
 ✓ .bkit/core/engine/audits/templates/context-templates.test.ts (74 tests) 754ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (51 tests) 654ms
   ✓ bkit counters route --point (4)
     ✓ takes each point's default limit and asks when nothing is set 303ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (161 tests) 50130ms
   ✓ bkit runs gate (58)
     ✓ --validated carry-forward (17) (6)
       ✓ the validated sha's own CI still has to be green (failed -> 12) 328ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 613ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 976ms
   ✓ bkit runs wait (10)
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 1518ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 805ms
     ✓ CLI: a failed gh workflow run exits 5 1153ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1992ms
   ✓ bkit runs dispatch (16)
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 387ms
     ✓ a failed re-trigger push names the cause in the log 502ms
     ✓ a failed re-trigger push leaves no orphan commit behind 461ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 690ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 332ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 328ms
     ✓ CLI: verdict JSON, body scan, exit codes 1224ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 1239ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 1119ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 614ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 563ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 501ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 1217ms
     ✓ --pr refuses a title carrying a skip token (18) and --record writes the refusal row 1150ms
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 1748ms
     ✓ --snapshot scopes its run list and dev lookups to --repo 1588ms
     ✓ --snapshot without --repo leaves its run list unscoped 1376ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 1017ms
     ✓ a refused capstone records FAIL with its reason 1237ms
     ✓ an unreadable PR is an API error (20) with no head 728ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 1096ms
       ✓ without --repo no call gains a --repo flag 739ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 650ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 1017ms
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 790ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 1551ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 812ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 703ms
     ✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 863ms
     ✓ CI_DEV refuses the slug "a/b" (exit 9) 1185ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 1058ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 872ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 1625ms
     ✓ an unknown phase exits 3; gh needing auth exits 80 540ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 1133ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 680ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1177ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 922ms
     ✓ --file and --step go together 689ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (9 tests) 605ms
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 747 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 243 lines omitted. Dropped content was NOT read.
     ✓ UNKNOWN -> runtimeHeadless=false 677ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 597ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 543ms
> [bkit] TRUNCATED HERE — 73 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 801ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 675ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 560ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 550ms
     ✓ fetches the issue and its comments as GitHub returns them 714ms
> [bkit] TRUNCATED HERE — 133 lines omitted. Dropped content was NOT read.
No outcome row records a duration.

## Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
No outcome row records a duration.

## Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 6ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 4ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 3ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (6 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 3ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 3ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 2ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 2ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 2ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (189 tests) 73218ms
   ✓ branches rebase: behaviour (17)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 412ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 805ms
     ✓ produces byte-identical output to merge=union 515ms
     ✓ restores a trailing newline so the next append starts on its own line 307ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 349ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1112ms
     ✓ refuses a lockfile whose regenerate command fails 827ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 389ms
     ✓ resolves a conflict in each of two replayed commits across rounds 327ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 977ms
     ✓ --mode=abort pushes when the branch has no open PR 1037ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1075ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 604ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 410ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 423ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2422ms
     ✓ skip-ci HEAD on the replay is refused 358ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 495ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 349ms
     ✓ scan-diff ignores a removed comment in a test file 406ms
     ✓ scan-diff ignores an assertion moved within the file 381ms
     ✓ scan-diff still reports a removed assertion 380ms
     ✓ scan-diff reports an assertion re-added only outside the test file 357ms
     ✓ scan-diff finds an added pytest mark skip 398ms
     ✓ scan-diff finds an added unittest skip 334ms
     ✓ scan-diff finds an added bare skip call 361ms
     ✓ scan-diff ignores a quoted skip in a documentation file 368ms
     ✓ scan-diff ignores a marker literal in a non-test source file 372ms
     ✓ scan-diff ignores an assertion whose expectation changed 340ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 381ms
     ✓ scan-diff reports a deleted test file 331ms
   ✓ branches force-build (8)
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 801ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 797ms
     ✓ exits 10 when the fetch fails 378ms
     ✓ refuses --merge-docs with --head, and an unknown --head 415ms
   ✓ branches sync-dev (5)
     ✓ fast-forwards local dev without checking it out 903ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1084ms
     ✓ a failed install stops ship (16) 880ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 322ms
   ✓ branches land (23)
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1032ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1979ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1007ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 769ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1740ms
> [bkit] TRUNCATED HERE — 103 lines omitted. Dropped content was NOT read.
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |     100 |    99.06 |     100 |     100 | 247               
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   90.71 |    85.83 |    95.4 |   91.43 |                   
  instructions.ts  |   90.71 |    85.83 |    95.4 |   91.43 | ...1662-1744,1749 
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
ok 17 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 19 ms
ok 18 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 14 ms
ok 19 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 12 ms
ok 20 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 17 ms
ok 21 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 13 ms
ok 22 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 28 ms
ok 23 stub: --paginate emits one document per page; --slurp collapses them into an array # in 46 ms
ok 24 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 398 ms
ok 25 a key removed from the env file is unset on the next run # in 167 ms
ok 26 an empty value unsets the key instead of setting an empty string # in 142 ms
ok 27 non-BKIT_ keys are skipped # in 135 ms
ok 28 one failing key does not stop the others and the exit status is non-zero # in 145 ms
ok 29 a failed unsetenv is retried on the next run # in 161 ms
ok 30 logs key names only, never values # in 162 ms
ok 31 missing env file exits 0 without calling launchctl # in 26 ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
> vitest run integration.test

[test-timeout-budget] load average 12.0 on 10 cores: unit limits 5997ms per test, 11993ms per hook (x1.20)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

stdout | .bkit/core/engine/install/modules/index.integration.test.ts
[test] core: .bkit/allowlist.json

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > P4.T7 — upgrade integration: heavy-customised-consumer scenario > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 137 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 137 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 149 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 137 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 131 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 131 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 137 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 137 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 137 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 137 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 149 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 149 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 149 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 149 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 149 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 137 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 149 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 160 lines omitted. Dropped content was NOT read.
     ✓ a stack named by BKIT_LOCAL_STACK never waits on the shared one 1208ms
     ✓ every worktree of one repo resolves the main checkout's lock, and waits on it 467ms
     ✓ a holder that stops before it answers fails the take at once instead of hanging 1065ms
     ✓ `run` holds the lock for the command and passes its exit status on 1114ms
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (37 tests) 40276ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (32)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 1617ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 353ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 1365ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone 1374ms
     ✓ T16: a Jira-shaped commit scope with a digit in the key (ab1-123-slug) no-ops — no dispatch 1287ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 1094ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 1642ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 1548ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 1716ms
     ✓ fix/** is not a routed surface (3)
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 1189ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 1351ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 1697ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 1354ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 1031ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 1387ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 1611ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 1237ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 1332ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 1388ms
       ✓ a branch with no status.jsonl dispatches as before 1307ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 1366ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 2223ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 774ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 1391ms
> [bkit] TRUNCATED HERE — 53 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 135 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 135 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 145 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 147 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 145 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 147 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 145 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 147 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 145 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 132 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ consumer-added extra key in opencode.json → check exits 0 (deep-contain, not drift) 1166ms
     ✓ opencode installed but no provider recorded → check exits 1 and names the fix 840ms
     ✓ a consumer with no opencode host at all is not failed for a missing provider 1189ms
   ✓ bkit check — antigravity detected from any plugin file (1)
     ✓ deleted plugin.json + neutered guardrails command + deleted guardrails hook → check exits 1 naming each 2445ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ bkit check with stale consumer prompts.md does not emit Missing model lookup 473ms
   ✓ Scenario: bkit check stale-marker gate is branch-scoped (#256) (2)
     ✓ on main: hard-fails (exit 1) and names the bkit-managed-stale BLOCKER 525ms
     ✓ on a feature branch: surfaces a non-blocking ADVISORY, no marker-drift hard-fail line 501ms
 ✓ .bkit/core/engine/commands/install/install.integration.test.ts (66 tests) 44768ms
   ✓ Scenario 5 — full install smoke against scratch consumer (1)
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 633ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ `bkit upgrade --claude` (stray module flag) errors 338ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 568ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 683ms
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1502ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1808ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 1888ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 860ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 986ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 833ms
     ✓ plan installs dependencies like build and debug 871ms
     ✓ design stops on a failed install (5) 947ms
     ✓ plan stops on a failed install (5) 952ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1017ms
     ✓ tracks origin/feat/{fid} when only the remote has it 936ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 880ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1207ms
   ✓ bkit worktrees setup — mint (resume) (14)
     ✓ rebases onto origin/dev and clears a stale sentinel 1714ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 1538ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 1414ms
     ✓ debug: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 1587ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 1702ms
     ✓ never commits the entries setup copies in from the main checkout 1452ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 1428ms
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
   ✓ bkit status — integration (4)
     ✓ exits 0 and prints [bkit-status] prefix 329ms
     ✓ writes zero files (purely read-only — write-set assertion) 396ms
     ✓ reports installed hosts (at minimum claude and cursor on a fresh consumer) 445ms
     ✓ reports opencode as absent when .opencode/ does not exist 332ms
> [bkit] TRUNCATED HERE — 47 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 945ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 920ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 537ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 894ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 481ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 530ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 447ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 866ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 484ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 495ms
     ✓ .husky/pre-push: a gate fails → no disk prune 487ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 868ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 501ms
     ✓ a stale register stops the push before any gate runs 809ms
     ✓ bkit check fails → the push stops before any gate runs 479ms
     ✓ the dependency audit runs before any gate, when its script is present 973ms
     ✓ no dependency-audit script → skipped, the gates still run 451ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 912ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 473ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 953ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 451ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 939ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 545ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 938ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 587ms
   ✓ graphify register pre-push gate (8)
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 344ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 948ms
     ✓ stops the step when the command crashed or was misused 412ms
npm warn Unknown env config "npm-globalconfig". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 2299ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 2287ms
     ✓ malformed .mcp.json fails install instead of being overwritten 430ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 2349ms
> [bkit] TRUNCATED HERE — 124 lines omitted. Dropped content was NOT read.
     ✓ denies the first touch with the checklist as the reason 730ms
     ✓ allows the retry (dedup) after the first deny 658ms
   ✓ gateguard hook — no-op / fail-open cases (7)
     ✓ subagents are NOT exempt — an agent_id payload still gets the checklist 703ms
     ✓ a subagent sharing its parent's session_id gets its own checklist, once 1502ms
> [bkit] TRUNCATED HERE — 44 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 149 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 151 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 148 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 165 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 160 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 145 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 196 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 145 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 182 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 149 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 179 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 164 lines omitted. Dropped content was NOT read.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

stderr | scripts/harvest/ledgers.integration.test.ts > Harvest boundary: stats copy-only, friction moved (WS4-T1, #343) > count-only aggregates deferrals.jsonl and failures.jsonl without copying prose
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-a09wyg/bkit
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 167 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 184 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 165 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 174 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 163 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 153 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 149 lines omitted. Dropped content was NOT read.
[bkit-test] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 149 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 168 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 171 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 153 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 140 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 136 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 175 lines omitted. Dropped content was NOT read.
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 61 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 134 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 178 lines omitted. Dropped content was NOT read.
docs/templates/bkit-audit-documentation.md       | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-duplication.md         | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-failures.md            | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-flakes.md              | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-gates.md               | delete                 | bkit-owned docs template — removed on full/core uninstall
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 55 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 175 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 46 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 55 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 62 lines omitted. Dropped content was NOT read.

 ✓ .bkit/core/engine/install/modules/core.integration.test.ts (86 tests) 3908ms
stdout | .bkit/core/engine/install/modules/opencode.integration.test.ts > runOpencodeModule — staging zero-footprint on failure (KN-12, Task 2.2) > after a successful install, .opencode/ exists; uninstalling leaves zero footprint
[bkit-install] write: .opencode/agents/bkit-audit-generate.md
[bkit-install] write: .opencode/agents/bkit-build-challenge-1.md
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 175 lines omitted. Dropped content was NOT read.
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 53 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 308 lines omitted. Dropped content was NOT read.
[bkit-uninstall-surgical-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-surgical-test] preserve: .opencode/plugin/bkit-gateguard.js (markered-text but no bkit markers found — 100% consumer content)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete mirror: .opencode/agents/bkit-build-plan-execute.md
[bkit-uninstall-surgical-test] delete mirror: .opencode/commands/bkit-build.md
[bkit-uninstall-surgical-test] prune empty dir: .opencode/commands

stdout | .bkit/core/engine/install/modules/claude.integration.test.ts > bkit-gateguard.cjs / bkit-gateguard.js markered-text — install engine (#422) > install generates each hook from its template plus the shared hook parts
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
[bkit-install] write: .claude/agents/bkit-build-plan-execute.md
[bkit-install] write: .claude/agents/bkit-build-plan-gaps-remediate.md
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
[bkit-install] write: .opencode/agents/bkit-audit-generate.md
[bkit-install] write: .opencode/agents/bkit-build-challenge-1.md
[bkit-install] write: .opencode/agents/bkit-build-challenge-2.md
[bkit-install] write: .opencode/agents/bkit-build-install-skills.md
[bkit-install] write: .opencode/agents/bkit-build-plan-convert.md
[bkit-install] write: .opencode/agents/bkit-build-plan-current.md
[bkit-install] write: .opencode/agents/bkit-build-plan-execute.md
[bkit-install] write: .opencode/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .opencode/agents/bkit-design-generate.md
[bkit-install] write: .opencode/agents/bkit-design-organise.md
[bkit-install] write: .opencode/agents/bkit-design-review-1.md
[bkit-install] write: .opencode/agents/bkit-design-review-2.md
[bkit-install] write: .opencode/agents/bkit-design-spike.md
[bkit-install] write: .opencode/agents/bkit-design-update.md
[bkit-install] write: .opencode/agents/bkit-plan-generate.md
[bkit-install] write: .opencode/agents/bkit-plan-review-1.md
[bkit-install] write: .opencode/agents/bkit-plan-review-2.md
[bkit-install] write: .opencode/agents/bkit-plan-scope-check.md
[bkit-install] write: .opencode/agents/bkit-plan-update.md
[bkit-install] write: .opencode/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .opencode/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .opencode/agents/bkit-ship-update-docs.md
[bkit-install] write: .opencode/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .opencode/agents/bkit-utility-update-decisions.md
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .opencode/agents/bkit-utility-update-tracker.md
[bkit-install] write: .opencode/commands/bkit-auto.md
[bkit-install] write: .opencode/commands/bkit-build.md
[bkit-install] write: .opencode/commands/bkit-debug.md
[bkit-install] write: .opencode/commands/bkit-design.md
[bkit-install] write: .opencode/commands/bkit-plan.md
[bkit-install] write: .opencode/commands/bkit-ship.md
[bkit-install] opencode: .opencode/opencode.json
[bkit-install] opencode: .opencode/plugin/bkit-gateguard.js
[bkit-install] opencode: .opencode/plugin/bkit-readguard.js
[bkit-install] opencode: .opencode/plugin/bkit-rules.js

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > opencode round-trip: zero footprint — no bkit-prefix .opencode/ files remain after uninstall
[bkit-uninstall-surgical-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-surgical-test] strip-block: .opencode/plugin/bkit-gateguard.js
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete mirror: .opencode/agents/bkit-build-plan-execute.md
[bkit-uninstall-surgical-test] delete mirror: .opencode/commands/bkit-build.md
[bkit-uninstall-surgical-test] prune empty dir: .opencode/agents
[bkit-uninstall-surgical-test] prune empty dir: .opencode/commands

 ✓ .bkit/core/engine/audits/templates/telemetry-gitattributes.integration.test.ts (18 tests) 228ms
stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > targeted uninstall does NOT cross-delete other hosts' bkit-prefix mirrors (#255 P0-1)
[bkit-uninstall-surgical-test] absent: .opencode/opencode.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete mirror: .opencode/agents/bkit-build-plan-execute.md
[bkit-uninstall-surgical-test] delete mirror: .opencode/commands/bkit-build.md
[bkit-uninstall-surgical-test] prune empty dir: .opencode/agents
[bkit-uninstall-surgical-test] prune empty dir: .opencode/commands
[bkit-uninstall-surgical-test] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > targeted uninstall does NOT cross-delete other hosts' bkit-prefix mirrors (#255 P0-1)
[bkit-uninstall-surgical-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete mirror: .claude/commands/bkit-build.md
[bkit-uninstall-surgical-test] delete mirror: .claude/agents/bkit-build-plan-execute.md
[bkit-uninstall-surgical-test] prune empty dir: .claude/commands
[bkit-uninstall-surgical-test] prune empty dir: .claude/agents

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > deletes a bkit-seeded markdown husk (AGENTS.md reduced to a lone H1) (#255 P2-15)
[bkit-uninstall-surgical-test] delete (empty after strip): AGENTS.md
[bkit-uninstall-surgical-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete: .bkit/version
[bkit-uninstall-surgical-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > preserves a consumer-customised AGENTS.md (content outside the bkit block survives)
[bkit-uninstall-surgical-test] strip-block: AGENTS.md
[bkit-uninstall-surgical-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete: .bkit/version
[bkit-uninstall-surgical-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical --opencode=<provider> removal (#281 Task 4) > removes exactly ONE provider block; the other provider remains intact
[bkit-uninstall] removed provider block "openrouter" from opencode.json
[bkit-uninstall] updated package.json: bkit.providers.opencode.installed=[ollama]

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical --opencode=<provider> removal (#281 Task 4) > updates bkit.providers.opencode.installed array in package.json
[bkit-uninstall] removed provider block "openrouter" from opencode.json
[bkit-uninstall] updated package.json: bkit.providers.opencode.installed=[ollama]

stdout | .bkit/core/engine/install/modules/claude.integration.test.ts > bkit-gateguard.cjs / bkit-gateguard.js markered-text — install engine (#422) > an existing hook gets the shared parts in its managed block; the driver below it stays
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
[bkit-install] write: .claude/agents/bkit-build-plan-execute.md
[bkit-install] write: .claude/agents/bkit-build-plan-gaps-remediate.md
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
[bkit-install] core: .bkit/comparison.md
[bkit-install] core: .bkit/install.md
[bkit-install] core: .bkit/jsonl.md
[bkit-install] core: .bkit/LICENSE.md
[bkit-install] core: .bkit/lite.md
[bkit-install] core: .bkit/pipeline.md
[bkit-install] core: .bkit/providers.md
[bkit-install] core: .bkit/prompts.md
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
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-install] template added: .bkit/templates/.graphifyignore
[bkit-install] template added: .bkit/templates/.husky/pre-commit
[bkit-install] template added: .bkit/templates/.husky/pre-push
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
[bkit-install] template added: .bkit/templates/.serena/project.yml
[bkit-install] template added: .bkit/templates/.vale/styles/House/Filler.yml
[bkit-install] template added: .bkit/templates/.vale/styles/House/Hedging.yml
[bkit-install] template added: .bkit/templates/.vale/styles/House/LLMSlop.yml
[bkit-install] template added: .bkit/templates/.vale/styles/House/Verbose.yml
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
[bkit-install] template added: .bkit/templates/scripts/ci/accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/ai.bkit.launchd.plist
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/launchd.env.example
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit]
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
[bkit-install] write: .claude/agents/bkit-build-plan-execute.md
[bkit-install] write: .claude/agents/bkit-build-plan-gaps-remediate.md
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
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical --opencode=<provider> removal (#281 Task 4) > re-points bkit.providers.opencode.default when the active provider is removed
[bkit-uninstall] removed provider block "openrouter" from opencode.json
[bkit-uninstall] updated package.json: bkit.providers.opencode.installed=[ollama] bkit.providers.opencode.default=ollama
[bkit-uninstall] write: .opencode/agents/bkit-audit-generate.md
[bkit-uninstall] write: .opencode/agents/bkit-build-challenge-1.md
[bkit-uninstall] write: .opencode/agents/bkit-build-challenge-2.md
[bkit-uninstall] write: .opencode/agents/bkit-build-install-skills.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-convert.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-current.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-execute.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-gaps-remediate.md
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
[bkit-uninstall] active provider switched to "ollama" — re-rendered 45 .opencode/ agent/command file(s) to its model pins.

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical --opencode=<provider> removal (#281 Task 4) > falls through to full teardown when the last provider is removed
[bkit-uninstall] removed provider block "openrouter" from opencode.json
[bkit-uninstall] updated package.json: bkit.providers.opencode.installed=[] bkit.providers.opencode.default=(removed)
[bkit-uninstall] no providers remain — triggering full opencode host teardown...
[bkit-uninstall] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall] delete mirror: .opencode/agents/bkit-build-plan-execute.md
[bkit-uninstall] delete mirror: .opencode/commands/bkit-build.md
[bkit-uninstall] prune empty dir: .opencode/agents
[bkit-uninstall] prune empty dir: .opencode/commands
[bkit-uninstall] prune empty dir: .opencode

 ✓ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts (12 tests) 518ms
stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > targeted uninstall drops the module's bkit.* keys > --auto resets bkit.cloud.agent to unset and keeps every other key
[bkit-uninstall-surgical-test] package.json: reset bkit.cloud.agent to unset

 ✓ .bkit/core/engine/checks/after/managed.integration.test.ts (1 test) 207ms
stdout | .bkit/core/engine/install/modules/claude.integration.test.ts > Scenario: .bkit/.env.example (owned) and .envrc (template) > first install writes .bkit/.env.example when template exists
[bkit-test] write: .claude/commands/bkit-auto.md
[bkit-test] write: .claude/commands/bkit-build.md
[bkit-test] write: .claude/commands/bkit-debug.md
[bkit-test] write: .claude/commands/bkit-design.md
[bkit-test] write: .claude/commands/bkit-plan.md
[bkit-test] write: .claude/commands/bkit-ship.md
[bkit-test] write: .claude/agents/bkit-audit-generate.md
[bkit-test] write: .claude/agents/bkit-build-challenge-1.md
[bkit-test] write: .claude/agents/bkit-build-challenge-2.md
[bkit-test] write: .claude/agents/bkit-build-install-skills.md
[bkit-test] write: .claude/agents/bkit-build-plan-convert.md
[bkit-test] write: .claude/agents/bkit-build-plan-current.md
[bkit-test] write: .claude/agents/bkit-build-plan-execute.md
[bkit-test] write: .claude/agents/bkit-build-plan-gaps-remediate.md
[bkit-test] write: .claude/agents/bkit-build-plan-verify.md
[bkit-test] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-test] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-test] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-test] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-test] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-3.md
[bkit-test] write: .claude/agents/bkit-design-generate.md
[bkit-test] write: .claude/agents/bkit-design-organise.md
[bkit-test] write: .claude/agents/bkit-design-review-1.md
[bkit-test] write: .claude/agents/bkit-design-review-2.md
[bkit-test] write: .claude/agents/bkit-design-spike.md
[bkit-test] write: .claude/agents/bkit-design-update.md
[bkit-test] write: .claude/agents/bkit-plan-generate.md
[bkit-test] write: .claude/agents/bkit-plan-review-1.md
[bkit-test] write: .claude/agents/bkit-plan-review-2.md
[bkit-test] write: .claude/agents/bkit-plan-scope-check.md
[bkit-test] write: .claude/agents/bkit-plan-update.md
[bkit-test] write: .claude/agents/bkit-ship-conflict-resolve.md
[bkit-test] write: .claude/agents/bkit-ship-deferred-sweep.md
[bkit-test] write: .claude/agents/bkit-ship-update-docs.md
[bkit-test] write: .claude/agents/bkit-utility-compress-markdown.md
[bkit-test] write: .claude/agents/bkit-utility-update-decisions.md
[bkit-test] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-test] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-test] write: .claude/agents/bkit-utility-update-failures.md
[bkit-test] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-test] write: .claude/agents/bkit-utility-update-roadmap.md
[bkit-test] write: .claude/agents/bkit-utility-update-tracker.md
[bkit-test] claude: CLAUDE.md
[bkit-test] claude: .claude/settings.json
[bkit-test] claude: .claude/hooks/bkit-preflight.sh
[bkit-test] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-test] claude: .claude/hooks/bkit-readguard.cjs
[bkit-test] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-test] claude: .mcp.json
[bkit-test] claude: .bkit/.env.example
[bkit-test] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)

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

 ✓ .bkit/core/engine/install/modules/cloud.integration.test.ts (9 tests) 266ms
 ✓ .bkit/core/engine/commands/install/uninstall.integration.test.ts (20 tests) 253ms
stdout | .bkit/core/engine/install/modules/claude.integration.test.ts > Scenario: .bkit/.env.example (owned) and .envrc (template) > install never writes .envrc (a template the consumer copies)
[bkit-test] write: .claude/commands/bkit-auto.md
[bkit-test] write: .claude/commands/bkit-build.md
[bkit-test] write: .claude/commands/bkit-debug.md
[bkit-test] write: .claude/commands/bkit-design.md
[bkit-test] write: .claude/commands/bkit-plan.md
[bkit-test] write: .claude/commands/bkit-ship.md
[bkit-test] write: .claude/agents/bkit-audit-generate.md
[bkit-test] write: .claude/agents/bkit-build-challenge-1.md
[bkit-test] write: .claude/agents/bkit-build-challenge-2.md
[bkit-test] write: .claude/agents/bkit-build-install-skills.md
[bkit-test] write: .claude/agents/bkit-build-plan-convert.md
[bkit-test] write: .claude/agents/bkit-build-plan-current.md
[bkit-test] write: .claude/agents/bkit-build-plan-execute.md
[bkit-test] write: .claude/agents/bkit-build-plan-gaps-remediate.md
[bkit-test] write: .claude/agents/bkit-build-plan-verify.md
[bkit-test] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-test] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-test] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-test] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-test] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-3.md
[bkit-test] write: .claude/agents/bkit-design-generate.md
[bkit-test] write: .claude/agents/bkit-design-organise.md
[bkit-test] write: .claude/agents/bkit-design-review-1.md
[bkit-test] write: .claude/agents/bkit-design-review-2.md
[bkit-test] write: .claude/agents/bkit-design-spike.md
[bkit-test] write: .claude/agents/bkit-design-update.md
[bkit-test] write: .claude/agents/bkit-plan-generate.md
[bkit-test] write: .claude/agents/bkit-plan-review-1.md
[bkit-test] write: .claude/agents/bkit-plan-review-2.md
[bkit-test] write: .claude/agents/bkit-plan-scope-check.md
[bkit-test] write: .claude/agents/bkit-plan-update.md
[bkit-test] write: .claude/agents/bkit-ship-conflict-resolve.md
[bkit-test] write: .claude/agents/bkit-ship-deferred-sweep.md
[bkit-test] write: .claude/agents/bkit-ship-update-docs.md
[bkit-test] write: .claude/agents/bkit-utility-compress-markdown.md
[bkit-test] write: .claude/agents/bkit-utility-update-decisions.md
[bkit-test] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-test] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-test] write: .claude/agents/bkit-utility-update-failures.md
[bkit-test] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-test] write: .claude/agents/bkit-utility-update-roadmap.md
[bkit-test] write: .claude/agents/bkit-utility-update-tracker.md
[bkit-test] claude: CLAUDE.md
[bkit-test] claude: .claude/settings.json
[bkit-test] claude: .claude/hooks/bkit-preflight.sh
[bkit-test] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-test] claude: .claude/hooks/bkit-readguard.cjs
[bkit-test] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-test] claude: .mcp.json
[bkit-test] claude: .bkit/.env.example
[bkit-test] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)

 ✓ .bkit/core/engine/checks/before/files.integration.test.ts (12 tests) 33ms
stdout | .bkit/core/engine/install/modules/claude.integration.test.ts > Scenario: .bkit/.env.example (owned) and .envrc (template) > re-install overwrites a consumer-edited .bkit/.env.example (owned), in dry-run and live alike
[bkit-test] write: .claude/commands/bkit-auto.md
[bkit-test] write: .claude/commands/bkit-build.md
[bkit-test] write: .claude/commands/bkit-debug.md
[bkit-test] write: .claude/commands/bkit-design.md
[bkit-test] write: .claude/commands/bkit-plan.md
[bkit-test] write: .claude/commands/bkit-ship.md
[bkit-test] write: .claude/agents/bkit-audit-generate.md
[bkit-test] write: .claude/agents/bkit-build-challenge-1.md
[bkit-test] write: .claude/agents/bkit-build-challenge-2.md
[bkit-test] write: .claude/agents/bkit-build-install-skills.md
[bkit-test] write: .claude/agents/bkit-build-plan-convert.md
[bkit-test] write: .claude/agents/bkit-build-plan-current.md
[bkit-test] write: .claude/agents/bkit-build-plan-execute.md
[bkit-test] write: .claude/agents/bkit-build-plan-gaps-remediate.md
[bkit-test] write: .claude/agents/bkit-build-plan-verify.md
[bkit-test] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-test] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-test] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-test] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-test] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-3.md
[bkit-test] write: .claude/agents/bkit-design-generate.md
[bkit-test] write: .claude/agents/bkit-design-organise.md
[bkit-test] write: .claude/agents/bkit-design-review-1.md
[bkit-test] write: .claude/agents/bkit-design-review-2.md
[bkit-test] write: .claude/agents/bkit-design-spike.md
[bkit-test] write: .claude/agents/bkit-design-update.md
[bkit-test] write: .claude/agents/bkit-plan-generate.md
[bkit-test] write: .claude/agents/bkit-plan-review-1.md
[bkit-test] write: .claude/agents/bkit-plan-review-2.md
[bkit-test] write: .claude/agents/bkit-plan-scope-check.md
[bkit-test] write: .claude/agents/bkit-plan-update.md
[bkit-test] write: .claude/agents/bkit-ship-conflict-resolve.md
[bkit-test] write: .claude/agents/bkit-ship-deferred-sweep.md
[bkit-test] write: .claude/agents/bkit-ship-update-docs.md
[bkit-test] write: .claude/agents/bkit-utility-compress-markdown.md
[bkit-test] write: .claude/agents/bkit-utility-update-decisions.md
[bkit-test] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-test] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-test] write: .claude/agents/bkit-utility-update-failures.md
[bkit-test] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-test] write: .claude/agents/bkit-utility-update-roadmap.md
[bkit-test] write: .claude/agents/bkit-utility-update-tracker.md
[bkit-test] claude: CLAUDE.md
[bkit-test] claude: .claude/settings.json
[bkit-test] claude: .claude/hooks/bkit-preflight.sh
[bkit-test] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-test] claude: .claude/hooks/bkit-readguard.cjs
[bkit-test] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-test] claude: .mcp.json
[bkit-test] claude: .bkit/.env.example
[bkit-test] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-test] [dry-run] claude: .bkit/.env.example
[bkit-test] claude: .bkit/.env.example
[bkit-test] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)

 ✓ .bkit/core/engine/install/modules/claude.integration.test.ts (31 tests) 568ms
 ✓ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts (22 tests) 76ms
 ✓ .bkit/core/engine/install/write.integration.test.ts (5 tests) 7ms
 ✓ .bkit/core/engine/install/version-file.integration.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-dogfood.integration.test.ts (84 tests) 72064ms
   ✓ dogfood authoring advisories — fire on the right paths (20)
     ✓ claude: a .bkit/core/workflows/ file gets the workflow advisory 346ms
     ✓ claude: a .bkit/core/prompts/ file gets the prompt advisory 406ms
     ✓ claude: the rule files themselves get neither 1270ms
     ✓ claude: unrelated paths get neither 1320ms
     ✓ claude: a non-.md file under those dirs gets neither 412ms
     ✓ cursor: a .bkit/core/workflows/ file gets the workflow advisory 430ms
     ✓ cursor: a .bkit/core/prompts/ file gets the prompt advisory 474ms
     ✓ cursor: the rule files themselves get neither 1270ms
     ✓ cursor: unrelated paths get neither 1226ms
     ✓ cursor: a non-.md file under those dirs gets neither 399ms
     ✓ codex: a .bkit/core/workflows/ file gets the workflow advisory 402ms
     ✓ codex: a .bkit/core/prompts/ file gets the prompt advisory 411ms
     ✓ codex: the rule files themselves get neither 1104ms
     ✓ codex: unrelated paths get neither 1107ms
     ✓ codex: a non-.md file under those dirs gets neither 419ms
     ✓ opencode: a .bkit/core/workflows/ file gets the workflow advisory 372ms
     ✓ opencode: a .bkit/core/prompts/ file gets the prompt advisory 360ms
     ✓ opencode: the rule files themselves get neither 1174ms
     ✓ opencode: unrelated paths get neither 1250ms
     ✓ opencode: a non-.md file under those dirs gets neither 516ms
   ✓ dogfood advisory — bkit's own .md docs (16)
     ✓ claude: bkit and .agents markdown gets the doc advisory, relabelled 2464ms
     ✓ claude: docs/** keeps the shipped label, never the dogfood one 777ms
     ✓ claude: the execution surfaces keep their own advisory, no double-fire 830ms
     ✓ claude: non-markdown under .bkit/ gets nothing 838ms
     ✓ cursor: bkit and .agents markdown gets the doc advisory, relabelled 2570ms
     ✓ cursor: docs/** keeps the shipped label, never the dogfood one 950ms
     ✓ cursor: the execution surfaces keep their own advisory, no double-fire 977ms
     ✓ cursor: non-markdown under .bkit/ gets nothing 897ms
     ✓ codex: bkit and .agents markdown gets the doc advisory, relabelled 2787ms
     ✓ codex: docs/** keeps the shipped label, never the dogfood one 902ms
     ✓ codex: the execution surfaces keep their own advisory, no double-fire 903ms
     ✓ codex: non-markdown under .bkit/ gets nothing 906ms
     ✓ opencode: bkit and .agents markdown gets the doc advisory, relabelled 2815ms
     ✓ opencode: docs/** keeps the shipped label, never the dogfood one 799ms
     ✓ opencode: the execution surfaces keep their own advisory, no double-fire 846ms
     ✓ opencode: non-markdown under .bkit/ gets nothing 863ms
   ✓ dogfood advisories — carry EVERY rule from their source section (6)
     ✓ .bkit/core/workflows/bkit-build.md: every rule of .bkit/authoring.md § All Agent-Read Files, § Prompts and Workflows, § Workflows Only appears in the advisory 425ms
     ✓ .bkit/core/workflows/bkit-build.md: the advisory does NOT defer to the section 437ms
     ✓ .bkit/core/prompts/bkit-plan-generate.md: every rule of .bkit/authoring.md § All Agent-Read Files, § Prompts and Workflows, § Prompts Only appears in the advisory 414ms
     ✓ .bkit/core/prompts/bkit-plan-generate.md: the advisory does NOT defer to the section 403ms
     ✓ both advisories carry the cost reminder and the advisory footer 804ms
   ✓ dogfood advisories — shared rules read from their section at hook time (17)
     ✓ claude: .bkit/core/workflows/bkit-build.md carries each shared rule exactly as .bkit/authoring.md states it 458ms
     ✓ claude: .bkit/core/workflows/bkit-build.md carries the § Notation Grammar paragraph as .bkit/authoring.md states it 435ms
     ✓ cursor: .bkit/core/workflows/bkit-build.md carries each shared rule exactly as .bkit/authoring.md states it 487ms
     ✓ cursor: .bkit/core/workflows/bkit-build.md carries the § Notation Grammar paragraph as .bkit/authoring.md states it 536ms
     ✓ codex: .bkit/core/workflows/bkit-build.md carries each shared rule exactly as .bkit/authoring.md states it 535ms
     ✓ codex: .bkit/core/workflows/bkit-build.md carries the § Notation Grammar paragraph as .bkit/authoring.md states it 531ms
     ✓ opencode: .bkit/core/workflows/bkit-build.md carries each shared rule exactly as .bkit/authoring.md states it 536ms
     ✓ opencode: .bkit/core/workflows/bkit-build.md carries the § Notation Grammar paragraph as .bkit/authoring.md states it 465ms
     ✓ claude: .bkit/core/prompts/bkit-plan-generate.md carries each shared rule exactly as .bkit/authoring.md states it 498ms
     ✓ claude: .bkit/core/prompts/bkit-plan-generate.md carries the § Notation Grammar paragraph as .bkit/authoring.md states it 468ms
     ✓ cursor: .bkit/core/prompts/bkit-plan-generate.md carries each shared rule exactly as .bkit/authoring.md states it 513ms
     ✓ cursor: .bkit/core/prompts/bkit-plan-generate.md carries the § Notation Grammar paragraph as .bkit/authoring.md states it 519ms
     ✓ codex: .bkit/core/prompts/bkit-plan-generate.md carries each shared rule exactly as .bkit/authoring.md states it 498ms
     ✓ codex: .bkit/core/prompts/bkit-plan-generate.md carries the § Notation Grammar paragraph as .bkit/authoring.md states it 483ms
     ✓ opencode: .bkit/core/prompts/bkit-plan-generate.md carries each shared rule exactly as .bkit/authoring.md states it 564ms
     ✓ opencode: .bkit/core/prompts/bkit-plan-generate.md carries the § Notation Grammar paragraph as .bkit/authoring.md states it 509ms
     ✓ a hook that cannot read the doc still fires, naming where to read the rule 563ms
   ✓ dogfood advisories — .agents/rules.md § Repo Authoring (13)
     ✓ claude: every Prose edits path gets the prose advisory 4146ms
     ✓ claude: workflow and prompt advisories carry the reference inline, no second block 1284ms
     ✓ claude: non-markdown gets no prose advisory 1875ms
     ✓ cursor: every Prose edits path gets the prose advisory 4567ms
     ✓ cursor: workflow and prompt advisories carry the reference inline, no second block 1384ms
     ✓ cursor: non-markdown gets no prose advisory 1785ms
     ✓ codex: every Prose edits path gets the prose advisory 4259ms
     ✓ codex: workflow and prompt advisories carry the reference inline, no second block 1351ms
     ✓ codex: non-markdown gets no prose advisory 1314ms
     ✓ opencode: every Prose edits path gets the prose advisory 1808ms
     ✓ opencode: workflow and prompt advisories carry the reference inline, no second block 548ms
     ✓ opencode: non-markdown gets no prose advisory 853ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts (320 tests) 95440ms
   ✓ gateguard behaviour parity — advisory content (210)
     ✓ claude (42)
       ✓ first edit to an existing file gets the investigation checklist 353ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 383ms
       ✓ a gate-config path gets the weaken-the-gate advisory 388ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 406ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 461ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 466ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 390ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 410ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 491ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 429ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 465ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 498ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 410ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 400ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 444ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 405ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 377ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 398ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 459ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 412ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 399ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 387ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 393ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 367ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 339ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 388ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 396ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 358ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 380ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 356ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 409ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 400ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 407ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 407ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 454ms
       ✓ ordinary file README.md is not treated as a gate config 513ms
       ✓ ordinary file src/index.ts is not treated as a gate config 463ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 415ms
       ✓ mixed-purpose package.json is not treated as a gate config 389ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 383ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 412ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 374ms
     ✓ cursor (42)
       ✓ first edit to an existing file gets the investigation checklist 373ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 386ms
       ✓ a gate-config path gets the weaken-the-gate advisory 369ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 430ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 404ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 421ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 392ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 421ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 457ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 426ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 414ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 450ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 468ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 501ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 468ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 487ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 434ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 473ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 438ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 424ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 482ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 492ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 412ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 518ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 447ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 477ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 429ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 447ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 440ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 448ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 492ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 456ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 470ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 434ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 447ms
       ✓ ordinary file README.md is not treated as a gate config 439ms
       ✓ ordinary file src/index.ts is not treated as a gate config 410ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 411ms
       ✓ mixed-purpose package.json is not treated as a gate config 439ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 393ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 378ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 438ms
     ✓ opencode (42)
       ✓ first edit to an existing file gets the investigation checklist 409ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 430ms
       ✓ a gate-config path gets the weaken-the-gate advisory 372ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 426ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 335ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 352ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 375ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 454ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 430ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 450ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 529ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 523ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 510ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 505ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 476ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 477ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 444ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 482ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 436ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 483ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 407ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 456ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 502ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 464ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 496ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 558ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 491ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 525ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 502ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 482ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 526ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 518ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 574ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 615ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 613ms
       ✓ ordinary file README.md is not treated as a gate config 645ms
       ✓ ordinary file src/index.ts is not treated as a gate config 563ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 540ms
       ✓ mixed-purpose package.json is not treated as a gate config 564ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 493ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 511ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 513ms
     ✓ codex (42)
       ✓ first edit to an existing file gets the investigation checklist 594ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 693ms
       ✓ a gate-config path gets the weaken-the-gate advisory 623ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 730ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 702ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 704ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 574ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 663ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 572ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 674ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 677ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 742ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 652ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 643ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 602ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 687ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 728ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 680ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 462ms
     ✓ antigravity (42)
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 311ms
   ✓ gateguard behaviour parity — dedup (10)
     ✓ claude: a different file in the same session warns again 323ms
     ✓ cursor: a different file in the same session warns again 325ms
     ✓ codex: a different file in the same session warns again 312ms
     ✓ antigravity: a different file in the same session warns again 316ms
   ✓ gateguard structural parity (21)
     ✓ codex advises on the *** Move to: target of a renaming patch 312ms
   ✓ gateguard parity — documented deviations (4)
     ✓ blocking is expressed differently per host but means the same thing 309ms

 Test Files  47 passed (47)
      Tests  1602 passed (1602)
   Start at  15:00:33
   Duration  95.67s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/701-engine-work-build/run-tests-1.log.reports/vitest-19372.xml
> [bkit] TRUNCATED — kept 2662 of 17456 lines (184 KB of 1.2 MB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
