
> @cbartens/bkit@6.0.0 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> pnpm bkit:gate:static-unit && pnpm test:integration


> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs


0/149 files need formatting

> @cbartens/bkit@6.0.0 lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'

✔ 0 errors, 0 warnings and 0 suggestions in 148 files.
passed: true
skipped: null
files: 148

> @cbartens/bkit@6.0.0 slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> bkit ci slop

[bkit-ci] base 49bb597f63fa3f4d969a48f01aad17272e74079f (49bb597f63fa3f4d969a48f01aad17272e74079f) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 49bb597f63fa3f4d969a48f01aad17272e74079f
base: 49bb597f63fa3f4d969a48f01aad17272e74079f
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (56 tests) 15483ms
   ✓ trackerTarget (3)
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 420ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 911ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 554ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 705ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 553ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 552ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 385ms
     ✓ fetches the issue and its comments as GitHub returns them 640ms
   ✓ postCommentOnce (4)
     ✓ records an engine-action row and skips the same key + body on a re-run 664ms
     ✓ a recent identical comment counts as done (the final close comment) 495ms
     ✓ a failed post reports done false with the reason and never leaks a token 696ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 715ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 817ms
     ✓ a board the token cannot see is scope 1011ms
     ✓ an HTTP 403 from gh is scope 517ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 623ms
     ✓ github: no block, no blockers and no further reads 806ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 803ms
     ✓ a different marker hash posts 432ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 600ms
 ✓ .bkit/core/engine/audits/repo/resolve-push-base.test.ts (17 tests) 8453ms
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 814ms
       ✓ falls back to event.before when gh prints unparseable output 597ms
       ✓ reports last-green-run as the source when the green head is an ancestor 1646ms
       ✓ CI mode: falls back to event.before and says so when the run list is unreadable 792ms
       ✓ local mode (3)
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 1885ms
         ✓ tests ancestry against --head, not HEAD 1599ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 1110ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (93 tests) 24285ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 563ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 565ms
     ✓ carries extra fields, parsed as JSON when they are JSON 336ms
     ✓ reports a failed commit with exit 8 without writing the row 866ms
     ✓ a failed commit leaves no row staged in the index 677ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 814ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 611ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 821ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 743ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 770ms
   ✓ bkit steps gate (8)
     ✓ --ref reads the status file as committed on that ref, not from disk 305ms
     ✓ --ref exits 3 when the ref does not carry the status file 407ms
     ✓ fails on a placeholder left in the artifact 315ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 304ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 444ms
   ✓ bkit steps finish (14)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 416ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 322ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 322ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 408ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 500ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 311ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 338ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 503ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 341ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 408ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 673ms
     ✓ writeStepRow refuses when a recorded path changed 636ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 341ms
     ✓ writeStepRow appends its commit sha to the record 645ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1279ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (47 tests) 27559ms
   ✓ bkit ci slop — gate decision (6)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 973ms
     ✓ fails on a net score rise with no net count change 1034ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1152ms
     ✓ treats a net score at or below 0.001 as float noise 516ms
     ✓ passes when the change only resolves findings 681ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 970ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 648ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 448ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 971ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 761ms
     ✓ exits 4 on a dropped net field instead of silently passing 1457ms
     ✓ exits 4 on no summary instead of silently passing 823ms
     ✓ exits 4 on output that is not JSON instead of silently passing 951ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1183ms
   ✓ bkit ci slop — real slop-scan (3)
     ✓ a genuinely new finding fails the gate 950ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1093ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 879ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1434ms
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 952ms
     ✓ fails (exit 1) when vale reports alerts 835ms
     ✓ exits 6 on a vale runtime error 711ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 961ms
     ✓ falls back to vale sync when the main worktree has none 883ms
     ✓ skips loudly with exit 0 when vale sync cannot restore it either 719ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 389ms
   ✓ bkit ci min-push (8)
     ✓ exits 0 when every changed file is a plan log or a ledger 388ms
     ✓ exits 1 naming the files outside, whatever the commit message says 397ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 693ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 382ms
     ✓ reads bkit.testing.minPushPaths from package.json; an explicit [] turns it off 545ms
     ✓ exits 7 when a commit or its base cannot be read 331ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (116 tests) 30618ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 561ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 607ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 528ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 874ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 382ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 326ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 598ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 604ms
     ✓ a log under the outbox is named main-checkout relative in the record 552ms
     ✓ a log small enough is copied whole: not clamped, raw null 614ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 351ms
   ✓ bkit tests red / green (29)
     ✓ records a red: the named test failed; row, log and test snapshot written, path passed whole 973ms
     ✓ refuses a run that is not a red: exit 1, reason printed, no row 1015ms
     ✓ a red already recorded for the unchanged test stands on resume; a changed test runs again 805ms
     ✓ refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2) 638ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 574ms
     ✓ green: --group audits only that group's tasks 395ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 518ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1287ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 957ms
     ✓ green prints a verdict and a fixable per gap 902ms
     ✓ green verdict is FAIL when a gap is unfixable 1079ms
     ✓ green leaves a diff-reading kind fixable null 919ms
     ✓ green prints verdict null when a gap needs a diff read 739ms
     ✓ green: lists each gap kind, with the diff for a test changed since its red 551ms
     ✓ green: a red recorded for a different test than the plan names is a red-mismatch 575ms
     ✓ green: a planned test that moved is a red-mismatch saying whether the recorded test passes now 397ms
     ✓ green: every test a task names needs its own red and its own pass 479ms
     ✓ test order (7)
       ✓ green finds the code commit for DONE — TASK N 1055ms
       ✓ a red recorded before the task's code commit stands, across a resumed execute 1446ms
       ✓ a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked 593ms
       ✓ green emits a test-changed gap for a red whose test gained added lines only 739ms
       ✓ green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green 805ms
       ✓ green refuses an exception-only task from a workflow step commit 468ms
       ✓ green clears an exception-only task from a human commit 320ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 33556ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 524ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 877ms
     ✓ always writes the marker, even with no plan 561ms
     ✓ writes the linear marker shape, taking the tracker from package.json 694ms
     ✓ writes the jira marker shape, taking the tracker from package.json 561ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 474ms
     ✓ refuses a PR from dev, main, or the base itself 329ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 323ms
     ✓ retries a failed create once, and exits 5 when it fails twice 563ms
     ✓ exits 5 when the open-PR probe errors 422ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 434ms
     ✓ prs open still opens against any other base 455ms
     ✓ exits 6 when the created PR's base is not --base 368ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 652ms
     ✓ exits 1 with found=false when there is none 1029ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 635ms
     ✓ --number reads one PR, mergeable included 774ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 926ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1093ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 658ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 461ms
     ✓ drops the force-build marker from the title subject 353ms
     ✓ takes an explicit --subject 913ms
     ✓ runs no merge when the PR is already MERGED 713ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1023ms
     ✓ prs merge refuses a PR whose base is main 732ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 947ms
     ✓ prs merge refuses when the PR base is unknown 501ms
     ✓ prs merge reads the base from the one pr view it already makes 1080ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 605ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 492ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 415ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 572ms
     ✓ updates when a dev ruleset requires status checks 626ms
     ✓ updates when dev's branch protection requires status checks 966ms
     ✓ ignores dev rulesets that require no checks 550ms
     ✓ updates when the repo cannot be resolved 460ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 906ms
   ✓ bkit prs checks (6)
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 480ms
   ✓ bkit prs verbose-ci (4)
     ✓ strips the marker, with or without its bkit prefix 396ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 588ms
 ✓ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests) 4717ms
   ✓ bkit skills prune (10)
     ✓ uninstalls unlisted skills from the union of folders and lock keys, never bkit-* 447ms
     ✓ matches whole names only: a listed name inside a longer one does not keep it 496ms
     ✓ treats regex characters in a skill name literally 517ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 479ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 516ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 829ms
     ✓ runs from the checkout top even when called from a subfolder 553ms
     ✓ keeps bkit-* skills, from folders or the lock, even when .agents/skills.md does not list them 831ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (96 tests) 44525ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 25455ms
     ✓ every prompt, workflow and utility agent has the three header blocks 419ms
     ✓ sync has nothing left to rewrite 16517ms
     ✓ every clause reaches the cut-off of one surface it applies to 392ms
   ✓ fully retired clauses (6)
     ✓ output-cap's sentence stays inline in the abort handover prompt 1551ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (42 tests) 21027ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 780ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 983ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 546ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 487ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 885ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 501ms
     ✓ counts commits behind origin/dev and the divergence age 738ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 340ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 837ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 578ms
     ✓ from a worktree, still names the main checkout and its outbox 468ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 487ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 712ms
   ✓ bkit repo info — where the wired tracker's issues live (10)
     ✓ prints the Linear team and project under linear 516ms
     ✓ prints the Jira site and project under jira 514ms
     ✓ prints the board under github 491ms
     ✓ prints the github progress and review states, defaults for a key left unset 493ms
     ✓ prints the linear progress and review states, defaults for a key left unset 857ms
     ✓ prints the jira progress and review states, defaults for a key left unset 891ms
     ✓ prints the linear progress and review states, defaults for a key left unset 901ms
     ✓ prints null progress and review states under none 444ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 521ms
     ✓ prints nulls under github without a board, and for keys left unset 1061ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 671ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 876ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 611ms
     ✓ an unpinned repo reports nulls and asks no registry 494ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 587ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 567ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 667ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (64 tests) 21676ms
   ✓ bkit worktrees setup — debug (4)
     ✓ may debug in place on dev 370ms
     ✓ adopts in place when the session is already on feat/{fid} 301ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 794ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 841ms
     ✓ a new run of the same FID rewrites startSha 1484ms
     ✓ a resume of the same FID reuses the record 1254ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 883ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 896ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 984ms
     ✓ a stale record without a lock is replaced 1117ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 721ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 781ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 406ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 338ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 353ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 418ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 395ms
     ✓ never commits an entry only the main checkout's copy list names 350ms
   ✓ bkit worktrees remove (12)
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 682ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 412ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 452ms
       ✓ a branch already gone everywhere is reported deleted 334ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 673ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (84 tests) 21089ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (23)
     ✓ modified ledger under the FID logdir is staged and committed 437ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 373ms
     ✓ path containing a space is staged and committed 336ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 331ms
     ✓ staging failure: exit 4 and no commit is created, no false success 306ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 332ms
     ✓ --mode=stage stages the sweep but creates no commit 327ms
     ✓ top-level docs/*.md is committed under scope=pr, not under scope=core or scope=full 850ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 402ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 471ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 427ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 372ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 356ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 559ms
     ✓ --path records its commit on the run's record, like every other commit mode 514ms
     ✓ a recorded ledger commits only the rows the run appended 797ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 1006ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 899ms
     ✓ commitBookkeeping refuses when a recorded path changed 505ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 759ms
     ✓ under --mode=commit counts the squashed paths as something to commit 665ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 371ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 359ms
   ✓ bkit ledgers only-bookkeeping (5)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 377ms
     ✓ a source file in the range: exit 7, path listed 425ms
     ✓ another FID's plan file in the range: exit 7 361ms
     ✓ from not an ancestor of to: exit 7 336ms
   ✓ bkit ledgers triage (11)
     ✓ triage refuses a plan whose task blocks do not parse 352ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (210 tests) 19219ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ linear with no key configured: a bare key names no issue, with a hint naming bkit.tracker.linear.team 360ms
     ✓ jira with no key configured: a bare key names no issue, with a hint naming bkit.tracker.jira.project 403ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 1011ms
   ✓ bkit fids resolve (12)
     ✓ 4. a stopword-only title falls back to the prompt; non-ASCII titles fold 302ms
   ✓ bkit fids design --description-file --prompt-file (4)
     ✓ the issue's Parent design link wins; audit paths are listed in order 325ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 3460ms
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 1099ms
     ✓ is null when pnpm fails or prints something that is not a version 2327ms
 ✓ .bkit/core/engine/commands/land.test.ts (30 tests) 16763ms
   ✓ pushToDev (16)
     ✓ lands the commit on origin/dev and leaves the main checkout alone 974ms
     ✓ never pushes local dev commits missing from origin/dev 942ms
     ✓ dev moved: rebuilds on the new dev and pushes again 1547ms
     ✓ dev moved before every push: exhausted, nothing landed 2102ms
     ✓ any other refusal is returned, not retried 1084ms
     ✓ pushToDev replays a commit range onto origin/dev 980ms
     ✓ a replay retries on the new dev when dev moved 1329ms
     ✓ pushToDev log line names what it lands 865ms
     ✓ runs no git hooks in the throwaway checkout, and says so 711ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1013ms
     ✓ a push that fails without a server answer is returned once, never retried 525ms
     ✓ a failed fetch is returned before anything is built 375ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1218ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1352ms
     ✓ lands from a clone whose fetch refspec omits dev 1162ms
     ✓ build throwing stops the landing and removes the throwaway checkout 573ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (102 tests) 9171ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 501ms
     ✓ keeps each context's own section banner and drops every other context's 1145ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ clamps a ci block with the ci profile and a runtime block without it 353ms
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 565ms
   ✓ bkit context diff (10)
     ✓ --base narrows the range to the commits after a group's start sha 378ms
     ✓ diff from a group start covers only the group's commits 408ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 482ms
     ✓ --reset-log empties the step's clamp log before the record lands 483ms
     ✓ partial: prints and writes the files not shown whole, and keeps the whole diff in the outbox 314ms
     ✓ whole: nothing omitted and no copy kept 309ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 12810ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 599ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 879ms
     ✓ resolves config from the repo root when run from a subdirectory 711ms
     ✓ exits 6 when the PUT fails 908ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 878ms
   ✓ bkit setup protect-main — pre-flight (6)
     ✓ exits 4 when the CI workflow file is missing, before any write 820ms
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 1249ms
     ✓ asks a human to log in when gh is not authenticated 1057ms
     ✓ exits 3 when gh repo view names no repository 1237ms
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 1130ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 1168ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 935ms
     ✓ exits 6 when the api answer is not JSON 1130ms
(node:19661) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:19661) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:19661) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:19661) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:19661) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:19661) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:19661) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (29 tests) 13442ms
   ✓ shipped copy-and-own test files (5)
     ✓ ci/check-capstone.test.mjs passes when run on its own 307ms
     ✓ ci/lanes/resolve-push-base.test.mjs passes when run on its own 12249ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 16181ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 10203ms
     ✓ every fence parses under zsh -n 5894ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 7071ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 888ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 5038ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 5029ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (33 tests) 4029ms
   ✓ bkit challenge gate (5)
     ✓ challenge gate writes a challenge-gate row 531ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1133ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 314ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (161 tests) 65795ms
   ✓ bkit runs gate (58)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 466ms
       ✓ a source change past the validated head refuses (17) and names the path 531ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 500ms
       ✓ --validated without --month / --fid is a usage error (2) 382ms
       ✓ a validated sha that is not an ancestor refuses (17) 463ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 1489ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 684ms
     ✓ CLI: a failed gh workflow run exits 5 1057ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1615ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 358ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 796ms
     ✓ a failed re-trigger push names the cause in the log 1484ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1472ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 968ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 542ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 355ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 463ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 538ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 753ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 730ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 1815ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1771ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 542ms
     ✓ re-trigger on dev only uses the record of its own FID 727ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 650ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 577ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 503ms
     ✓ a refused capstone records FAIL with its reason 905ms
     ✓ an unreadable PR is an API error (20) with no head 538ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 982ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 1620ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 893ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 972ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1195ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1223ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1219ms
     ✓ --file and --step go together 1063ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (40 tests) 6849ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 623ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1178ms
     ✓ a refused dev push is logged, never fails the close 1979ms
     ✓ an unreachable remote is logged, never fails the close 738ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (26 tests) 3118ms
   ✓ bkit disk prune — notes (5)
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 714ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 645ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 508ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 15727ms
   ✓ bkit runtime detect — the table (17)
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ re-derives per call: one run's answer does not leak into the next 332ms
   ✓ bkit runtime row (6)
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 302ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 343ms
 ❯ .bkit/core/engine/tools/instructions-coverage.test.ts (24 tests | 1 failed) 759ms
   ✓ checkCoverage (10)
     ✓ the fixture passes 8ms
     ✓ a standing line no entry matches fails and prints the entry to add 2ms
     ✓ a local entry whose text left its file fails 0ms
     ✓ a listed verbatim carrier without the text fails 0ms
     ✓ a condensed carrier without a tagged local line fails 1ms
     ✓ a clause tagged with the rule backs a condensed carrier 0ms
     ✓ a tag naming no rule fails instead of pointing at another rule 1ms
     ✓ a clause rule or tag naming no rule fails 0ms
     ✓ two entries 80% alike are flagged 1ms
     ✓ a drift excerpt not on its cited line fails 1ms
   ✓ checkCarry (5)
     ✓ a carry line naming each prompt that holds the whole rule passes 1ms
     ✓ a carry line naming a prompt without the whole rule fails 0ms
     ✓ a prompt holding a bkit rule its carry line does not name fails 0ms
     ✓ sync rewrites a copy of the rule's retired text in a carrying prompt's block 1ms
     ✓ a prompt that carries no rule is listed 0ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ a drift item without a kept reason is open 1ms
   ❯ the repo (7)
     × has no coverage findings 498ms
     ✓ has no unreviewed near-alike entries 108ms
     ✓ every fit tag matches its target or records why it stays 21ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ is undefined outside a repo 313ms
   ✓ guardRepoConfig (6)
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 349ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 329ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (9 tests) 1250ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (18 tests) 2187ms
> [bkit] TRUNCATED HERE — 774 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 444 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
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
[test] antigravity: .agents/plugins/bkit/hooks/bkit-rules.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs

 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 466ms
 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (49 tests) 1022ms
 ✓ .bkit/core/engine/audits/templates/template-ci-yml.test.ts (13 tests) 655ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (5 tests) 728ms
   ✓ catalog parity — retired plan agents (1)
     ✓ removed plan agents absent 719ms
 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (265 tests) 924ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 49ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 304ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 151ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (99 tests) 190ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (15 tests) 283ms
stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing
[bkit-install] Wrote .bkit/advisories.md (1 item).

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > overwrites an existing artifact on each call
[bkit-install] Wrote .bkit/advisories.md (0 items).

 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (279 tests) 133ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-LNnIt2/nonexistent.md — skipping .claude/agents/bkit-foo.md

 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (73 tests) 175ms
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

 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 139ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 261ms
 ✓ .bkit/core/engine/checks/after/index.test.ts (53 tests) 343ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (19 tests) 21ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (52 tests) 235ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 291ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-7PWoFo/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/audits/templates/templates.test.ts (250 tests) 128ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 132ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (96 tests) 205ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 37ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (242 tests) 375ms
 ✓ .bkit/core/engine/ledgers/journal.test.ts (9 tests) 337ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (43 tests) 190ms
 ❯ .bkit/core/engine/render/trackers.test.ts (102 tests | 1 failed) 135ms
   ✓ substituteWorkflow — tracker groups (9)
     ✓ keeps the chosen tracker's block; none collapses to the generic skip message 5ms
     ✓ preserves a list-number prefix on the resolved pair 0ms
     ✓ uses a pair's trailing false block under none instead of the generic stub 2ms
     ✓ resolves multiple pairs 0ms
     ✓ does not jam content that follows a pair with no trailing false block 0ms
     ✓ keeps the jira block of a three-tracker group under jira 0ms
     ✓ leaves a group without a jira block whole under jira, so its markers are orphans 0ms
     ✓ flags a lone github block (no linear) as an orphan 2ms
     ✓ flags a lone jira block (no github, linear) as an orphan 0ms
   ✓ substituteWorkflow — true/false conditionals (9)
     ✓ `true` keeps content when wired (github), removes it entirely under none (no stub) 0ms
     ✓ `true` keeps content when wired (linear), removes it entirely under none (no stub) 0ms
     ✓ `true` keeps content when wired (jira), removes it entirely under none (no stub) 0ms
     ✓ `false` keeps content only under none, removes it when wired (github) 0ms
     ✓ `false` keeps content only under none, removes it when wired (linear) 0ms
     ✓ `false` keeps content only under none, removes it when wired (jira) 0ms
     ✓ resolves a pair nested inside a `true` block 0ms
     ✓ resolves a three-tracker group nested inside a `true` block under jira 0ms
     ✓ flags an unbalanced true marker as an orphan 0ms
   ✓ real workflow sources (37)
     ✓ bkit-build resolves cleanly for github 1ms
     ✓ bkit-build resolves cleanly for linear 1ms
     ✓ bkit-build resolves cleanly for jira 1ms
     ✓ bkit-build resolves cleanly for none 1ms
     ✓ bkit-ship resolves cleanly for github 3ms
     ✓ bkit-ship resolves cleanly for linear 1ms
     ✓ bkit-ship resolves cleanly for jira 1ms
     ✓ bkit-ship resolves cleanly for none 1ms
     ✓ bkit-debug resolves cleanly for github 1ms
     ✓ bkit-debug resolves cleanly for linear 1ms
     ✓ bkit-debug resolves cleanly for jira 1ms
     ✓ bkit-debug resolves cleanly for none 1ms
     ✓ bkit-design resolves cleanly for github 1ms
     ✓ bkit-design resolves cleanly for linear 1ms
     ✓ bkit-design resolves cleanly for jira 1ms
     ✓ bkit-design resolves cleanly for none 1ms
     ✓ bkit-plan resolves cleanly for github 1ms
     ✓ bkit-plan resolves cleanly for linear 1ms
     ✓ bkit-plan resolves cleanly for jira 1ms
     ✓ bkit-plan resolves cleanly for none 1ms
     ✓ bkit-auto resolves cleanly for github 0ms
     ✓ bkit-auto resolves cleanly for linear 0ms
     ✓ bkit-auto resolves cleanly for jira 1ms
     ✓ bkit-auto resolves cleanly for none 1ms
     ✓ every github block has a matching linear and jira block; no legacy none markers remain 4ms
     ✓ bkit-build leaks no tracker-only token into the none render (#202 guard) 2ms
     ✓ bkit-ship leaks no tracker-only token into the none render (#202 guard) 1ms
     ✓ bkit-debug leaks no tracker-only token into the none render (#202 guard) 1ms
     ✓ bkit-design leaks no tracker-only token into the none render (#202 guard) 1ms
     ✓ bkit-plan leaks no tracker-only token into the none render (#202 guard) 1ms
     ✓ bkit-auto leaks no tracker-only token into the none render (#202 guard) 0ms
     ✓ bkit-build has no identical github/linear pair (should be a true block) 1ms
     ✓ bkit-ship has no identical github/linear pair (should be a true block) 0ms
     ✓ bkit-debug has no identical github/linear pair (should be a true block) 1ms
     ✓ bkit-design has no identical github/linear pair (should be a true block) 0ms
     ✓ bkit-plan has no identical github/linear pair (should be a true block) 0ms
     ✓ bkit-auto has no identical github/linear pair (should be a true block) 0ms
   ✓ issue-less runs render only under a wired tracker (20)
     ✓ bkit-design: the none render carries none of the issue-less machinery 1ms
     ✓ bkit-design: the github render keeps the warning bullet once and the recovery in Step 1 1ms
     ✓ bkit-design: the linear render keeps the warning bullet once and the recovery in Step 1 1ms
     ✓ bkit-design: the jira render keeps the warning bullet once and the recovery in Step 1 0ms
     ✓ bkit-plan: the none render carries none of the issue-less machinery 1ms
     ✓ bkit-plan: the github render keeps the warning bullet once and the recovery in Step 1 3ms
     ✓ bkit-plan: the linear render keeps the warning bullet once and the recovery in Step 1 1ms
     ✓ bkit-plan: the jira render keeps the warning bullet once and the recovery in Step 1 2ms
     ✓ bkit-build: the none render carries none of the issue-less machinery 1ms
     ✓ bkit-build: the github render keeps the warning bullet once and the recovery in Step 1 1ms
     ✓ bkit-build: the linear render keeps the warning bullet once and the recovery in Step 1 2ms
     ✓ bkit-build: the jira render keeps the warning bullet once and the recovery in Step 1 1ms
     ✓ bkit-debug: the none render carries none of the issue-less machinery 1ms
     ✓ bkit-debug: the github render keeps the warning bullet once and the recovery in Step 1 1ms
     ✓ bkit-debug: the linear render keeps the warning bullet once and the recovery in Step 1 1ms
     ✓ bkit-debug: the jira render keeps the warning bullet once and the recovery in Step 1 0ms
     ✓ bkit-ship: the none render carries none of the issue-less machinery 1ms
     ✓ bkit-ship: the github render keeps the warning bullet once and the recovery in Step 1 1ms
     ✓ bkit-ship: the linear render keeps the warning bullet once and the recovery in Step 1 1ms
     ✓ bkit-ship: the jira render keeps the warning bullet once and the recovery in Step 1 0ms
   ❯ none render baselines (5)
     ✓ bkit-design: the none render matches its baseline byte for byte 6ms
     ✓ bkit-plan: the none render matches its baseline byte for byte 3ms
     × bkit-build: the none render matches its baseline byte for byte 11ms
     ✓ bkit-debug: the none render matches its baseline byte for byte 2ms
     ✓ bkit-ship: the none render matches its baseline byte for byte 1ms
   ✓ real prompt sources (10)
     ✓ every prompt resolves cleanly for github 6ms
     ✓ every prompt resolves cleanly for linear 6ms
     ✓ every prompt resolves cleanly for jira 5ms
     ✓ every prompt resolves cleanly for none 6ms
     ✓ source frontmatter carries no bare HTML-comment line (invalid YAML) 4ms
     ✓ roadmap agent gets only the chosen tracker's read tools 2ms
     ✓ tracker agent gets only the chosen tracker's read and field-write tools 1ms
     ✓ audit agent gets only the chosen tracker's comment and search tools 2ms
     ✓ audit agent searches for the template's audit parent only when a tracker is wired 1ms
     ✓ audit agent posts its summary only when a tracker is wired 1ms
   ✓ issue-scan call sites (#135) (12)
     ✓ bkit-design wires a github scan whose hits the engine reads 1ms
     ✓ bkit-design wires a linear scan whose hits the engine reads 1ms
     ✓ bkit-design wires a jira scan whose hits the engine reads 2ms
     ✓ bkit-design omits the scan entirely under none (no tracker call) 1ms
     ✓ bkit-plan wires a github scan whose hits the engine reads 1ms
     ✓ bkit-plan wires a linear scan whose hits the engine reads 1ms
     ✓ bkit-plan wires a jira scan whose hits the engine reads 0ms
     ✓ bkit-plan omits the scan entirely under none (no tracker call) 2ms
     ✓ bkit-debug wires a github scan whose hits the engine reads 1ms
     ✓ bkit-debug wires a linear scan whose hits the engine reads 1ms
     ✓ bkit-debug wires a jira scan whose hits the engine reads 1ms
     ✓ bkit-debug omits the scan entirely under none (no tracker call) 1ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 62ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 206ms
 ✓ .bkit/core/engine/audits/workflows/question-option-format.test.ts (22 tests) 274ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 155ms
 ✓ .bkit/core/engine/install/manifest.test.ts (47 tests) 75ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 58ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 73ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (125 tests) 68ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 100ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (65 tests) 110ms
 ✓ .bkit/core/engine/shared/settings.test.ts (26 tests) 100ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (6 tests) 51ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 62ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > writes the file when absent and records the write
[test] core: .bkit/allowlist.json

 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 93ms
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

 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 147ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > leaves a .cursor/allowlist.json bkit never recorded alone
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > is idempotent — a second run finds nothing to migrate
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 32ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (35 tests) 87ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 78ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 82ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (33 tests) 47ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 59ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 84ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 80ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 44ms
 ✓ .bkit/core/engine/commands/workflow/workstreams.test.ts (9 tests) 62ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (23 tests) 70ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (22 tests) 62ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 31ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (48 tests) 49ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 8ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 20ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 74ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 99ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (28 tests) 22ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (24 tests) 60ms
 ❯ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests | 1 failed) 71ms
   ✓ rules and Project Rules (10)
     ✓ ruleBullets reads the bkit block and the Project Rules section, in file order 4ms
     ✓ parseRuleEntries reads name, text, retired and refs 3ms
     ✓ the fixture passes 1ms
     ✓ rule entries match rules.md bullets one to one 0ms
     ✓ a rule inserted mid-list needs no edit to any other entry 0ms
     ✓ two rules with one name fail, since names are rule IDs 1ms
     ✓ a reworded rules.md bullet fails until sync retires the old text 1ms
     ✓ a refs section that does not exist fails 0ms
     ✓ refExists finds files, globs and headings in the repo 2ms
     ✓ the repo store matches rules.md 16ms
   ✓ Hook Text (4)
     ✓ hookMessages joins concatenated literals and keeps ${…} holes 2ms
     ✓ the fixture passes 1ms
     ✓ a message without an entry and an entry no longer emitted both fail 0ms
     ✓ every hook message has an entry and every entry is still emitted 12ms
   ✓ Permissions (4)
     ✓ the fixture passes 1ms
     ✓ a pattern missing, extra, doubled or miscounted fails 0ms
     ✓ an opencode permission block that differs fails 0ms
     ✓ shipped permission patterns and store groups match exactly 1ms
   ❯ Special Behaviors and Authoring Rules (5)
     ✓ catalogSection runs to the next heading of the same or a higher level, fences skipped 1ms
     ✓ the fixture passes 1ms
     ✓ an edited row or section fails until sync copies it 1ms
     ✓ a row with no entry fails 0ms
     × each Special Behaviors row and authoring section has one equal entry 20ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 48ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 22ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 37ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 37ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 27ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (64 tests) 48ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 26ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 24ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 27ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (23 tests | 1 skipped) 33ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (60 tests) 27ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 21ms
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

 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 25ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 28ms
 ✓ .bkit/core/engine/commands/stats.test.ts (8 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (32 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 35ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 30ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 22ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (20 tests) 11ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 19ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793237072430.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793237072433.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793237072433.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793237072444.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 26ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 19ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 25ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 18ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 11ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (8 tests) 23ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 11ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (6 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 19ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 6ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 4ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (135 tests) 82572ms
   ✓ bkit workflows start (13)
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 385ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 303ms
       ✓ writes none outside Claude Code 313ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 315ms
     ✓ --lock-held checks the lock is ours 408ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 355ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 453ms
   ✓ bkit workflows start — resume facts (5)
     ✓ an OPEN decision of an earlier run never resurfaces 388ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 370ms
     ✓ writes no row when status.jsonl does not exist 306ms
     ✓ aborts a rebase only when one is in progress 569ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 588ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 356ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 371ms
     ✓ --max-exceeded says a handover is due without any sentinel 301ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 333ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 414ms
   ✓ bkit workflows close (16)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 621ms
       ✓ counts subagents of an earlier chat the run's session rows name 485ms
       ✓ records no context block, and still closes, outside a Claude Code session 456ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 505ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 511ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 605ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 529ms
     ✓ always writes the telemetry, whatever the runtime 611ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 452ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 447ms
     ✓ an unwritable stats path is logged and never fails the close 609ms
     ✓ ship: run.pr, size of the squash commit, and coverage 537ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 660ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 418ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 447ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 476ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 530ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 518ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 475ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 511ms
     ✓ --record-step writes the close step's row before workflow-done 378ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 321ms
     ✓ --number without --outbox is a usage error 325ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 632ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 771ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 889ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 875ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 612ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1360ms
     ✓ --flush with nothing to record commits and pushes nothing 868ms
     ✓ --flush carries the named worktree's logs into the dev commit 1443ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 1814ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1621ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2070ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1454ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1878ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1747ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1623ms
     ✓ --push on dev never carries a row whose references name another feature 1527ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1469ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 2572ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2206ms
     ✓ --push commits in the named worktree, not the checkout it runs from 846ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1372ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1321ms
     ✓ a close that landed releases the lock 1700ms
     ✓ removes the worktree before it releases the lock 1600ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4633ms
       ✓ closePr refuses when the PR base is unknown 2927ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1672ms
   ✓ bkit workflows promote (7)
     ✓ stamps the anchor from the runtime-resolved base commit 326ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 372ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 511ms
     ✓ names the branch, not the remote-tracking ref, in each URL 457ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 367ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 360ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 829ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 653ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1655ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 745ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 812ms
     ✓ a second run's record does not let this FID's close commit 978ms
     ✓ record is present after workflows close and before the push 1745ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1886ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 319ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (195 tests) 116790ms
   ✓ branches rebase: behaviour (17)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 848ms
     ✓ refuses a code conflict and aborts the rebase on the spot 467ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1250ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 614ms
     ✓ produces byte-identical output to merge=union 1392ms
     ✓ restores a trailing newline so the next append starts on its own line 861ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 717ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 919ms
     ✓ refuses a union that leaves a line which is not JSON 619ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 888ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1681ms
     ✓ refuses a lockfile whose regenerate command fails 996ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 450ms
     ✓ removes a stale sentinel when the rebase succeeds 560ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 821ms
     ✓ resolves a conflict in each of two replayed commits across rounds 791ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 402ms
       ✓ skips (12) with no anchor 481ms
       ✓ skips (12) when the base is unreachable in this clone 478ms
       ✓ skips (12) when nothing landed since the base 507ms
       ✓ runs (0) with the landed path count once dev moved 750ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 346ms
   ✓ branches push (17)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 752ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 462ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 534ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1562ms
     ✓ runs exactly one git push 1258ms
     ✓ --set-upstream records the upstream 540ms
     ✓ refuses with no branch checked out 448ms
     ✓ --mode=dev refuses a feature checkout 467ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1191ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 545ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1111ms
     ✓ --mode=abort pushes when the branch has no open PR 1052ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1087ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 517ms
     ✓ --open-pr carries the MCP answer and skips gh 712ms
     ✓ --mode=abort on dev pushes plainly without probing 701ms
     ✓ rejects an unknown mode 495ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1502ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1186ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1373ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2650ms
     ✓ skip-ci HEAD on the replay is refused 873ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1557ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2321ms
     ✓ a level local dev is a plain push, recording nothing extra 1072ms
     ✓ a record with no commits pushes nothing 838ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 570ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1573ms
     ✓ a rewritten branch is refused, never forced 727ms
     ✓ refuses dev and main with exit 21 and pushes nothing 487ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1332ms
     ✓ refuses a detached HEAD (exit 5) 671ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 795ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 798ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 716ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 832ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 521ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1275ms
     ✓ an up-to-date branch is a no-op 806ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1227ms
     ✓ a fetch that fails exits 10 513ms
   ✓ branches scan-diff (24)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 717ms
     ✓ --paths with no match exits 1 627ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 421ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 857ms
     ✓ --marker reads a diff over 1 MiB 732ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 980ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 903ms
     ✓ scan-diff finds an added skip 893ms
     ✓ scan-diff ignores a skip predating the base 871ms
     ✓ scan-diff reports a disabled test with its line 855ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 832ms
     ✓ scan-diff ignores a removed comment in a test file 822ms
     ✓ scan-diff ignores an assertion moved within the file 897ms
     ✓ scan-diff still reports a removed assertion 864ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1010ms
     ✓ scan-diff finds an added pytest mark skip 901ms
     ✓ scan-diff finds an added unittest skip 872ms
     ✓ scan-diff finds an added bare skip call 1015ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1011ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1039ms
     ✓ scan-diff ignores an assertion whose expectation changed 987ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 991ms
     ✓ scan-diff reports a deleted test file 1054ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 739ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1409ms
     ✓ a title that already carries the marker is left alone 582ms
     ✓ with no open PR: pushes the marker commit and edits no title 543ms
     ✓ a re-run is deduped: no second marker commit 595ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 729ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 303ms
     ✓ --title-set skips gh entirely 426ms
   ✓ branches sync (11)
     ✓ Path A when origin/dev is an ancestor of HEAD 309ms
     ✓ Path B once dev moved; --head checks a given commit 424ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 424ms
     ✓ --merge-docs merges dev when docs/ is behind 426ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 395ms
     ✓ --merge-docs never merges on dev itself 401ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 604ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 627ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 534ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 457ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 673ms
     ✓ a failed install stops ship (16) 567ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 446ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 442ms
     ✓ exits 10 when the fetch fails 325ms
   ✓ branches land (27)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1146ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1005ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 896ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 858ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 1850ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2217ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 625ms
     ✓ local: names unpushed dev as the cause when the branch carries it 676ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 661ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1301ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1051ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 801ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 845ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1169ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 895ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 596ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1095ms
     ✓ land removes the worktree when only the copied .env is untracked 910ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1000ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 996ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1545ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1474ms
     ✓ landPr refuses a main-based PR without retrying 698ms
     ✓ landPr refuses when the PR base is unknown 581ms
     ✓ PR not open (closed): stops (17) at once, no retry 673ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/render/trackers.test.ts > none render baselines > bkit-build: the none render matches its baseline byte for byte
Error: Snapshot `none render baselines > bkit-build: the none render matches its baseline byte for byte 1` mismatched

- Expected
+ Received

@@ -294,11 +294,12 @@
  1. Check the plan is in task-block form, within the group caps:
     ```bash
     "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
     ```
     Route:
-    - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.
+    - **If** exit 0, `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.
+    - **If** exit 0 **and** `CONVERTED` is held → Step 5.
     - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 2.
     - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.
     - **Else** → **Failure Path** naming each problem in the report.
  2. **Subagent:** Invoke `@bkit-build-plan-convert` using `Agent` tool:
     Context: You are a subagent in the Build phase. Write the plan in task-block form. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. **If** `CONVERT_RETRY` is held → add `Your last plan failed the plan check: {CONVERT_RETRY}. Fix only those problems.` **If** `NEWER_COMMENTS` > 0 → add `{NEWER_COMMENTS} issue comments are newer than the plan; write what they change into it.` Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. Check command: `"{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"`.
@@ -306,16 +307,22 @@
     Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
  3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
     ```bash
     "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
     ```
+ 4. Plan already in task-block form: finish the step with no agent and no artifact, its comment naming the skip:
+    ```bash
+    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt=1 --number=4 --post --title="Plan Convert" --comment-field="Status=skipped (plan already in task-block form)" --message="chore({FID}): plan-convert skipped"
+    ```
+    Every outcome → Step 5.

  ### 🔒 Gate 4 — Plan Convert

  - [ ] Plan checked (`tests plan-check`)
  - [ ] Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
  - [ ] Converted plan checked again (`tests plan-check`)
+ - [ ] Skip recorded (`steps finish`) when the plan needed no conversion
  - [ ] Mechanical checks passed (`steps finish`)

  ---

  ## 🧠 Step 5 — Plan Current

 ❯ .bkit/core/engine/render/trackers.test.ts:379:7
    377|     it(`${wf}: the none render matches its baseline byte for byte`, as…
    378|       const out = substituteWorkflow(source(wf), "none").output;
    379|       await expect(out).toMatchFileSnapshot(path.join(BASELINES, `${wf…
       |       ^
    380|     });
    381|   }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/tools/instructions-coverage.test.ts > the repo > has no coverage findings
AssertionError: expected [ …(6) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   ".bkit/core/workflows/bkit-build.md:381: no entry — add under #### bkit-build: **If** exit 0, `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.",
+   ".bkit/core/workflows/bkit-build.md:382: no entry — add under #### bkit-build: **If** exit 0 **and** `CONVERTED` is held → Step 5.",
+   ".bkit/core/workflows/bkit-build.md:394: no entry — add under #### bkit-build: Plan already in task-block form: finish the step with no agent and no artifact, its comment naming the skip:",
+   ".bkit/core/workflows/bkit-build.md:398: no entry — add under #### bkit-build: Every outcome → Step 5.",
+   ".bkit/core/workflows/bkit-build.md:405: no entry — add under #### bkit-build: Skip recorded (`steps finish`) when the plan needed no conversion",
+   "bkit-build: local entry no longer in the file: **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.",
+ ]

 ❯ .bkit/core/engine/tools/instructions-coverage.test.ts:278:42
    276| describe("the repo", () => {
    277|   it("has no coverage findings", { timeout: 60_000 }, () => {
    278|     expect(checkCoverage(STORE, CORPUS)).toEqual([]);
       |                                          ^
    279|   });
    280|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/tools/instructions-sources.test.ts > Special Behaviors and Authoring Rules > each Special Behaviors row and authoring section has one equal entry
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "`workflows-only`: text differs — run pnpm instructions:sync",
+ ]

 ❯ .bkit/core/engine/tools/instructions-sources.test.ts:393:40
    391|   it("each Special Behaviors row and authoring section has one equal e…
    392|     const cats = new Map(CATALOG_SOURCES.map((f) => [f, read(f)]));
    393|     expect(checkCatalogs(STORE, cats)).toEqual([]);
       |                                        ^
    394|   });
    395| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


  Snapshots  1 failed
 Test Files  3 failed | 154 passed (157)
      Tests  3 failed | 6492 passed | 1 skipped (6496)
   Start at  11:23:13
   Duration  118.10s (tests 96%, setup 1%, transform 1%, import 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/699-engine-run-completeness/build-group-gate-3-2.log.reports/vitest-43941.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.22 |     81.9 |   95.06 |   90.54 |                   
 engine            |   75.47 |    79.27 |    87.5 |   75.86 |                   
  cli.ts           |   75.47 |    79.27 |    87.5 |   75.86 | ...11,921,926-928 
 ...e/checks/after |   90.64 |    85.19 |   94.56 |    94.4 |                   
  auth.ts          |   98.46 |    98.11 |     100 |   97.95 | 69                
  ci-yml.ts        |   90.09 |    82.06 |     100 |   92.49 | ...09,422-424,435 
  github.ts        |   96.42 |    90.42 |     100 |   96.84 | 333-335           
  index.ts         |   86.25 |    72.72 |     100 |   97.09 | ...97,317,412-413 
  managed.ts       |   82.92 |    89.39 |   58.33 |   83.87 | 216-237           
  suppression.ts   |     100 |      100 |     100 |     100 |                   
  tools.ts         |   96.96 |       90 |     100 |   98.14 | 299               
 .../checks/before |   94.44 |    88.31 |   95.45 |   97.76 |                   
  context-fetch.ts |    98.8 |    91.95 |     100 |     100 | ...17,539,553,600 
  env.ts           |   90.16 |    79.62 |     100 |   91.83 | 176-181,188-196   
  files.ts         |   92.64 |    89.74 |   93.75 |   98.11 | 129               
  index.ts         |   83.78 |    73.33 |     100 |     100 | ...38,144,152-171 
  mcp.ts           |     100 |    96.96 |     100 |     100 | 81                
  repo.ts          |   92.66 |    92.77 |   86.36 |   92.77 | 154-162           
  version.ts       |   96.87 |    82.35 |     100 |     100 | 18-20,34,61-62    
 engine/commands   |   83.03 |     76.2 |   87.16 |   83.87 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...67,376,444,492 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   97.46 |    91.11 |     100 |     100 | 87-91,156,162     
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   75.69 |    71.13 |   84.37 |   77.82 | ...67-473,477-480 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   77.14 |    59.09 |   66.66 |   77.27 | ...58-171,201-202 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   98.36 |    86.09 |   96.29 |   99.53 |                   
  ci.ts            |   98.36 |    86.09 |   96.29 |   99.53 | 164               
 ...mmands/install |    47.9 |    45.63 |   59.49 |   48.26 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |      20 |     26.5 |      50 |   17.77 | ...42-146,217-613 
  uninstall.ts     |   67.79 |    64.18 |      70 |   68.92 | ...1099,1122-1289 
  upgrade.ts       |   32.45 |    30.88 |   35.71 |   33.57 | 350-378,560-1064  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   92.63 |    83.92 |   96.98 |   94.14 |                   
  branches.ts      |   89.52 |    81.52 |   97.41 |   91.04 | ...2084,2089,2114 
  challenge.ts     |   96.14 |    80.92 |     100 |   97.53 | ...50-352,586,610 
  context.ts       |   96.52 |    86.88 |   98.57 |   97.37 | ...1570,1735,1824 
  counters.ts      |   99.15 |     95.1 |     100 |   99.08 | 142               
  decisions.ts     |   95.26 |    80.52 |   97.72 |   98.34 | 193,296,364       
  disk.ts          |   92.88 |    84.69 |   95.55 |   95.54 | ...29,412-420,536 
  fids.ts          |    98.3 |    95.03 |   98.71 |   98.87 | 160,446,915-916   
  issues.ts        |   97.87 |    91.54 |   98.24 |   98.79 | 195,436-437,765   
  ledgers.ts       |   91.39 |    80.09 |   96.94 |   95.22 | ...1589-1590,1618 
  locks.ts         |   93.75 |    85.91 |   95.45 |   95.49 | ...09-210,377-378 
  plan-blocks.ts   |   90.59 |     82.6 |     100 |   90.67 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1153,1169-1170 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,219         
  roadmap.ts       |   96.63 |    91.42 |     100 |   97.15 | ...63,483-485,489 
  run-facts.ts     |    96.9 |    90.34 |     100 |   98.92 | 504-505           
  runs.ts          |   93.17 |    84.35 |     100 |   94.46 | ...1876,1908-1912 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...53,301,321-326 
  skills.ts        |     100 |     92.3 |     100 |     100 | 97,102            
  status.ts        |   97.29 |    95.54 |     100 |   98.45 | 103,203,407       
  step-table.ts    |     100 |    98.48 |     100 |     100 | 319               
  steps.ts         |   87.35 |    81.55 |   89.55 |   88.46 | ...1449,1454,1456 
  summary.ts       |   95.07 |    87.43 |    91.3 |   93.78 | ...68-369,377-383 
  tasks.ts         |   83.58 |    66.66 |   85.71 |   87.82 | ...35,352,383,387 
  tests.ts         |   96.07 |    86.91 |   97.24 |   97.49 | ...1627,1632-1633 
  tracker.ts       |   92.89 |    73.23 |     100 |   96.73 | ...36,848,931,979 
  workflows.ts     |   93.04 |    81.76 |   97.01 |   94.82 | ...1612,1785,2481 
  workstreams.ts   |   98.27 |    96.42 |     100 |     100 | 115               
  worktrees.ts     |   65.61 |    62.82 |   76.74 |   65.99 | ...57-960,963-964 
 engine/install    |   93.15 |    84.64 |   94.15 |   95.94 |                   
  cloud-env.ts     |    96.9 |     91.3 |     100 |   99.64 | 223               
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 572-579           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,293            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   96.41 |    91.93 |   98.82 |   96.91 |                   
  status.ts        |     100 |    98.64 |     100 |     100 | 114               
  telemetry.ts     |   95.85 |    91.16 |   98.51 |   96.44 | ...1719,1762,2130 
 engine/render     |   90.65 |    82.42 |    98.3 |    92.7 |                   
  hosts.ts         |   89.62 |     81.2 |   96.15 |   90.74 | ...45-255,587-588 
  models.ts        |      90 |    81.11 |     100 |   94.26 | ...80,266,288,322 
  trackers.ts      |     100 |      100 |     100 |     100 |                   
 engine/shared     |   99.36 |    97.29 |     100 |   99.26 |                   
  package-json.ts  |     100 |    96.77 |     100 |     100 | 65                
  ...ge-manager.ts |     100 |      100 |     100 |     100 |                   
  package-roots.ts |      96 |       75 |     100 |   95.45 | 119               
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |     100 |    99.06 |     100 |     100 | 247               
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |    90.8 |     85.8 |   95.48 |    91.5 |                   
  instructions.ts  |    90.8 |     85.8 |   95.48 |    91.5 | ...1671-1753,1758 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.22% ( 15775/17680 )
Branches     : 81.9% ( 11049/13490 )
Functions    : 95.06% ( 2545/2677 )
Lines        : 90.54% ( 13816/15258 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1657 of 3121 lines (114 KB of 240 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
