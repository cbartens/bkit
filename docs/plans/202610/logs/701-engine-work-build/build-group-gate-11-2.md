
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

 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 14443ms
   ✓ gateguard opencode plugin — advisory mode (default) (7)
     ✓ warns again for a different file in the same session 426ms
   ✓ gateguard opencode plugin — subagents are NOT exempt (3)
     ✓ a subagent session editing a file DOES get the advisory (exemption removed) 302ms
     ✓ orchestrator session gets the advisory too — same treatment either way 329ms
   ✓ gateguard opencode plugin — gate-config advisory (9)
     ✓ tsconfig.json triggers config advisory 308ms
     ✓ flags vitest.config.ts as gate config 327ms
     ✓ flags eslint.config.mjs as gate config 331ms
     ✓ flags slop-scan.config.json as gate config 303ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 808ms
     ✓ patch (v1 driver): checks every Add / Update / Move-to / Delete target 854ms
     ✓ apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target 942ms
     ✓ apply_patch (v1 driver): checks every Add / Update / Move-to / Delete target 980ms
     ✓ deny mode blocks when any patch target is a first touch, and records all of them 935ms
     ✓ deny mode still blocks when only one of several patch targets is new to the session 511ms
   ✓ dual driver shape (OpenCode 1.x server() + 2.0 setup()) (6)
     ✓ both drivers emit the same advisory for the same edit 543ms
     ✓ V1 driver reads the real 1.x arg key `filePath` 325ms
     ✓ deny mode blocks the first touch on BOTH drivers 530ms
   ✓ gateguard plugin — docs/*.md density advisory (#422) (6)
     ✓ matches a nested docs/ tree via segment match (.bkit/shared/docs/architecture.md) 307ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (47 tests) 21239ms
   ✓ bkit ci slop — gate decision (6)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1089ms
     ✓ fails on a net score rise with no net count change 1155ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 454ms
     ✓ treats a net score at or below 0.001 as float noise 441ms
     ✓ passes when the change only resolves findings 455ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 446ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 522ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1031ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 950ms
     ✓ exits 4 on a dropped net field instead of silently passing 945ms
     ✓ exits 4 on no summary instead of silently passing 806ms
     ✓ exits 4 on output that is not JSON instead of silently passing 823ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 927ms
   ✓ bkit ci slop — real slop-scan (3)
     ✓ a genuinely new finding fails the gate 527ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 508ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 439ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1632ms
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 872ms
     ✓ fails (exit 1) when vale reports alerts 794ms
     ✓ exits 6 on a vale runtime error 912ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 981ms
     ✓ falls back to vale sync when the main worktree has none 1018ms
     ✓ skips loudly with exit 0 when vale sync cannot restore it either 574ms
   ✓ bkit ci min-push (8)
     ✓ checks every --ref: one code ref among min-push refs fails the push 314ms
     ✓ reads bkit.testing.minPushPaths from package.json; an explicit [] turns it off 339ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (96 tests) 24466ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 14589ms
     ✓ sync has nothing left to rewrite 8520ms
   ✓ fully retired clauses (6)
     ✓ output-cap's sentence stays inline in the abort handover prompt 744ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (42 tests) 24393ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 1025ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 998ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 442ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 448ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 449ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 820ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 824ms
     ✓ counts commits behind origin/dev and the divergence age 1251ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 908ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 900ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 745ms
     ✓ from a worktree, still names the main checkout and its outbox 823ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 727ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 303ms
   ✓ bkit repo info — where the wired tracker's issues live (10)
     ✓ prints the Linear team and project under linear 356ms
     ✓ prints the Jira site and project under jira 778ms
     ✓ prints the board under github 564ms
     ✓ prints the github progress and review states, defaults for a key left unset 880ms
     ✓ prints the linear progress and review states, defaults for a key left unset 915ms
     ✓ prints the jira progress and review states, defaults for a key left unset 537ms
     ✓ prints the linear progress and review states, defaults for a key left unset 1120ms
     ✓ prints null progress and review states under none 581ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 1030ms
     ✓ prints nulls under github without a board, and for keys left unset 1161ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 894ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 482ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 356ms
     ✓ an unpinned repo reports nulls and asks no registry 462ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 812ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 578ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 799ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 926ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (56 tests) 16585ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 704ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 911ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 708ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 903ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1022ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 467ms
     ✓ fetches the issue and its comments as GitHub returns them 698ms
   ✓ postCommentOnce (4)
     ✓ records an engine-action row and skips the same key + body on a re-run 331ms
     ✓ a recent identical comment counts as done (the final close comment) 450ms
     ✓ a failed post reports done false with the reason and never leaks a token 952ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 832ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 903ms
     ✓ a board the token cannot see is scope 1201ms
     ✓ an HTTP 403 from gh is scope 796ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 1088ms
     ✓ github: no block, no blockers and no further reads 955ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 724ms
     ✓ a different marker hash posts 844ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 703ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (116 tests) 32880ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1282ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 763ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 450ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 446ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 753ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 687ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 928ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 724ms
     ✓ PASS is 0 failures with or without reports 949ms
     ✓ clears a previous attempt's reports before the gate runs 798ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 709ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 866ms
     ✓ a log under the outbox is named main-checkout relative in the record 673ms
     ✓ a log small enough is copied whole: not clamped, raw null 323ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 353ms
   ✓ bkit tests red / green (29)
     ✓ records a red: the named test failed; row, log and test snapshot written, path passed whole 887ms
     ✓ refuses a run that is not a red: exit 1, reason printed, no row 962ms
     ✓ a red already recorded for the unchanged test stands on resume; a changed test runs again 831ms
     ✓ refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2) 896ms
     ✓ a script that cannot run is exit 4, not a rejected red 1009ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 916ms
     ✓ green: --group audits only that group's tasks 570ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 849ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 348ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 434ms
     ✓ green prints a verdict and a fixable per gap 874ms
     ✓ green verdict is FAIL when a gap is unfixable 534ms
     ✓ green leaves a diff-reading kind fixable null 807ms
     ✓ green prints verdict null when a gap needs a diff read 817ms
     ✓ green: lists each gap kind, with the diff for a test changed since its red 920ms
     ✓ green: a red recorded for a different test than the plan names is a red-mismatch 1108ms
     ✓ green: a planned test that moved is a red-mismatch saying whether the recorded test passes now 1042ms
     ✓ green: every test a task names needs its own red and its own pass 1030ms
     ✓ test order (7)
       ✓ green finds the code commit for DONE — TASK N 1000ms
       ✓ a red recorded before the task's code commit stands, across a resumed execute 1067ms
       ✓ a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked 733ms
       ✓ green emits a test-changed gap for a red whose test gained added lines only 644ms
       ✓ green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green 897ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (88 tests) 11552ms
   ✓ bkit steps done (19)
     ✓ reports a failed commit with exit 8 without writing the row 1207ms
     ✓ a failed commit leaves no row staged in the index 930ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 447ms
     ✓ writeStepRow refuses when a recorded path changed 519ms
     ✓ writeStepRow appends its commit sha to the record 421ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 915ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (84 tests) 9839ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (23)
     ✓ top-level docs/*.md is committed under scope=pr, not under scope=core or scope=full 350ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ a recorded ledger commits only the rows the run appended 341ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 413ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 367ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (62 tests) 10008ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 391ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 366ms
     ✓ a new run of the same FID rewrites startSha 517ms
     ✓ a resume of the same FID reuses the record 504ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 308ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 359ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 385ms
     ✓ a stale record without a lock is replaced 466ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 327ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 388ms
   ✓ bkit worktrees remove (12)
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 405ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 330ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 442ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (132 tests) 38213ms
   ✓ bkit workflows close (16)
     ✓ lists the feature's docs and this workflow's logs on the ref as links 319ms
   ✓ bkit workflows handover (22)
     ✓ --push commits and pushes the record on the feature branch without a handover 324ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 332ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 332ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 690ms
     ✓ --flush with nothing to record commits and pushes nothing 470ms
     ✓ --flush carries the named worktree's logs into the dev commit 627ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 1696ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 729ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 736ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 585ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 679ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 544ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 543ms
     ✓ --push on dev never carries a row whose references name another feature 574ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 607ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 1210ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1483ms
     ✓ --push commits in the named worktree, not the checkout it runs from 420ms
   ✓ bkit workflows close --flush (ship) (6)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 708ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 489ms
     ✓ a close that landed releases the lock 642ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2735ms
       ✓ closePr refuses when the PR base is unknown 2584ms
     ✓ leaves a worktree no workflow created, and its branch, in place 769ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 347ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 719ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 350ms
     ✓ a second run's record does not let this FID's close commit 342ms
     ✓ record is present after workflows close and before the push 519ms
     ✓ failed handover from dev removes the record and keeps recorded paths 702ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 346ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 9267ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 5296ms
     ✓ every fence parses under zsh -n 3907ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (210 tests) 8346ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 444ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 42092ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 598ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1205ms
     ✓ always writes the marker, even with no plan 692ms
     ✓ writes the linear marker shape, taking the tracker from package.json 439ms
     ✓ writes the jira marker shape, taking the tracker from package.json 456ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 470ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 808ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1314ms
     ✓ exits 5 when the open-PR probe errors 877ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 837ms
     ✓ prs open still opens against any other base 695ms
     ✓ exits 6 when the created PR's base is not --base 818ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 680ms
     ✓ exits 1 with found=false when there is none 338ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 404ms
     ✓ --number reads one PR, mergeable included 609ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 619ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1016ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 683ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 976ms
     ✓ drops the force-build marker from the title subject 967ms
     ✓ takes an explicit --subject 684ms
     ✓ runs no merge when the PR is already MERGED 904ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 994ms
     ✓ prs merge refuses a PR whose base is main 395ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 382ms
     ✓ prs merge refuses when the PR base is unknown 449ms
     ✓ prs merge reads the base from the one pr view it already makes 964ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 806ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 902ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 913ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 999ms
     ✓ never reads dev's required checks without --only-if-required 790ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 1038ms
     ✓ updates when a dev ruleset requires status checks 1147ms
     ✓ updates when dev's branch protection requires status checks 1029ms
     ✓ ignores dev rulesets that require no checks 698ms
     ✓ updates when the repo cannot be resolved 871ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 720ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 608ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 527ms
     ✓ is not green on an empty rollup (total 0) 826ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 938ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1193ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 1144ms
     ✓ is a no-op when the title already says so 1146ms
     ✓ strips the marker, with or without its bkit prefix 1476ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1432ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 1853ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 1848ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (97 tests) 3287ms
   ✓ bkit context clamp — per-context profiles (#697) (4)
     ✓ keeps each context's own section banner and drops every other context's 474ms
 ✓ .bkit/core/engine/commands/land.test.ts (25 tests) 6144ms
   ✓ pushToDev (13)
     ✓ lands the commit on origin/dev and leaves the main checkout alone 344ms
     ✓ never pushes local dev commits missing from origin/dev 308ms
     ✓ dev moved: rebuilds on the new dev and pushes again 519ms
     ✓ dev moved before every push: exhausted, nothing landed 833ms
     ✓ any other refusal is returned, not retried 1656ms
     ✓ pushToDev replays a commit range onto origin/dev 349ms
     ✓ a replay retries on the new dev when dev moved 551ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 321ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (40 tests) 3217ms
   ✓ bkit roadmap mirror (6)
     ✓ writes the row in the worktree, then commits and pushes the same row on dev 343ms
     ✓ never touches the main checkout and never pushes its local dev commits 416ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 405ms
     ✓ a refused dev push is logged, never fails the close 1604ms
 ✓ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests) 12807ms
   ✓ bkit skills prune (10)
     ✓ uninstalls unlisted skills from the union of folders and lock keys, never bkit-* 1349ms
     ✓ matches whole names only: a listed name inside a longer one does not keep it 1236ms
     ✓ treats regex characters in a skill name literally 1686ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 1866ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 1992ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 1500ms
     ✓ runs from the checkout top even when called from a subfolder 1594ms
     ✓ keeps bkit-* skills, from folders or the lock, even when .agents/skills.md does not list them 1564ms
 ✓ .bkit/core/engine/audits/repo/resolve-push-base.test.ts (17 tests) 17356ms
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 1883ms
       ✓ falls back to event.before when gh prints unparseable output 1121ms
       ✓ reports last-green-run as the source when the green head is an ancestor 2584ms
       ✓ CI mode: falls back to event.before and says so when the run list is unreadable 1438ms
       ✓ local mode (3)
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 3641ms
         ✓ tests ancestry against --head, not HEAD 3442ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 3240ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 4604ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 2268ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (19 tests) 1146ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (32 tests) 1543ms
   ✓ bkit challenge gate (5)
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 460ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 19054ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 1188ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 898ms
     ✓ resolves config from the repo root when run from a subdirectory 1100ms
     ✓ exits 6 when the PUT fails 1152ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1415ms
   ✓ bkit setup protect-main — pre-flight (6)
     ✓ exits 4 when the CI workflow file is missing, before any write 1406ms
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 1729ms
     ✓ asks a human to log in when gh is not authenticated 1736ms
     ✓ exits 3 when gh repo view names no repository 1742ms
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 1699ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 1407ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 2289ms
     ✓ exits 6 when the api answer is not JSON 1258ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 1380ms
   ✓ gradeCompliance — the grade bkit workflows close runs before its report (7)
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 307ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 312ms
 ✓ .bkit/core/engine/commands/lib.test.ts (62 tests) 1597ms
   ✓ runGit / runTool output limit (5)
     ✓ runGit names ENOBUFS when output passes the limit 572ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 602ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (26 tests) 1622ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (40 tests) 1213ms
   ✓ runLines (5)
     ✓ cuts at each merge on the first-parent chain, so merged-in work is not counted 360ms
 ✓ .bkit/core/engine/audits/templates/context-templates.test.ts (74 tests) 926ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (18 tests) 1029ms
   ✓ bkit tasks currency (5)
     ✓ currency judges base...against (origin/dev), not base...HEAD 314ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (27 tests) 1074ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 4276ms
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 1416ms
     ✓ is null when pnpm fails or prints something that is not a version 2831ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (9 tests) 703ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (51 tests) 763ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (19 tests) 786ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (265 tests) 440ms
 ✓ .bkit/core/engine/tools/instructions-coverage.test.ts (22 tests) 476ms
   ✓ the repo (7)
     ✓ has no coverage findings 318ms
 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (49 tests) 664ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 816ms
   ✓ shipped hook templates (5)
     ✓ every generated hook parses: node --check for JS, bash -n for shell 794ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > repeat harvest of same rows does not duplicate (idempotent)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1enrP/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1enrP/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1enrP/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1enrP/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1enrP/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1enrP/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1enrP/consumer-app/.bkit/stats.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1enrP/consumer-app/.bkit/friction.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1enrP/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1enrP/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-q1enrP/consumer-app/.bkit/friction.jsonl — pruned 1 harvested row(s)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 1, kept in repos: 0
> [bkit] TRUNCATED HERE — 114 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 742 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 320 lines omitted. Dropped content was NOT read.
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 2230ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 826ms
     ✓ CLI: a failed gh workflow run exits 5 825ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1824ms
   ✓ bkit runs dispatch (16)
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 347ms
     ✓ a failed re-trigger push names the cause in the log 1132ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1142ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 629ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 366ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 1003ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 814ms
     ✓ a refused capstone records FAIL with its reason 1035ms
     ✓ an unreadable PR is an API error (20) with no head 790ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 1204ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 2098ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1098ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 1401ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1601ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1586ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1041ms
     ✓ --file and --step go together 884ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 22ms
> [bkit] TRUNCATED HERE — 48 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1632ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 1250ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 906ms
> [bkit] TRUNCATED HERE — 92 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 4ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 5ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 3ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 3ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (188 tests) 78966ms
   ✓ branches rebase: behaviour (17)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 378ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1435ms
     ✓ produces byte-identical output to merge=union 558ms
     ✓ restores a trailing newline so the next append starts on its own line 312ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 367ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1352ms
     ✓ refuses a lockfile whose regenerate command fails 1134ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 374ms
     ✓ resolves a conflict in each of two replayed commits across rounds 311ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1217ms
     ✓ --mode=abort pushes when the branch has no open PR 876ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1107ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 596ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 524ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 694ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2138ms
     ✓ skip-ci HEAD on the replay is refused 398ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 607ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 550ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 802ms
     ✓ a fetch that fails exits 10 323ms
   ✓ branches scan-diff (23)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 365ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 336ms
     ✓ scan-diff ignores a removed comment in a test file 311ms
     ✓ scan-diff ignores an assertion moved within the file 304ms
     ✓ scan-diff finds an added pytest mark skip 310ms
     ✓ scan-diff ignores a quoted skip in a documentation file 327ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 859ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 820ms
     ✓ exits 10 when the fetch fails 403ms
     ✓ refuses --merge-docs with --head, and an unknown --head 462ms
   ✓ branches sync-dev (5)
     ✓ fast-forwards local dev without checking it out 844ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 2161ms
     ✓ a failed install stops ship (16) 1818ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1303ms
     ✓ exits 10 when the fetch fails 843ms
   ✓ branches land (23)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 647ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 517ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 762ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 783ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 525ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 775ms
> [bkit] TRUNCATED HERE — 103 lines omitted. Dropped content was NOT read.
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |     100 |    99.06 |     100 |     100 | 247               
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   90.71 |    85.83 |    95.4 |   91.43 |                   
  instructions.ts  |   90.71 |    85.83 |    95.4 |   91.43 | ...1662-1744,1749 
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
ok 17 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 20 ms
ok 18 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 16 ms
ok 19 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 13 ms
ok 20 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 19 ms
ok 21 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 12 ms
ok 22 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 31 ms
ok 23 stub: --paginate emits one document per page; --slurp collapses them into an array # in 48 ms
ok 24 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 393 ms
ok 25 a key removed from the env file is unset on the next run # in 176 ms
ok 26 an empty value unsets the key instead of setting an empty string # in 156 ms
ok 27 non-BKIT_ keys are skipped # in 145 ms
ok 28 one failing key does not stop the others and the exit status is non-zero # in 172 ms
ok 29 a failed unsetenv is retried on the next run # in 186 ms
ok 30 logs key names only, never values # in 146 ms
ok 31 missing env file exits 0 without calling launchctl # in 25 ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > P4.T7 — upgrade integration: heavy-customised-consumer scenario > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

> [bkit] TRUNCATED HERE — 76 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 125 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (37 tests) 62647ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (32)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 2621ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 492ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 1237ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone 1966ms
     ✓ T16: a Jira-shaped commit scope with a digit in the key (ab1-123-slug) no-ops — no dispatch 1798ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 1755ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 2642ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 2621ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 2989ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 490ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 1752ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 2034ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 2498ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 2509ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 1712ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 2480ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 2355ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 2623ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 2287ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 2465ms
       ✓ a branch with no status.jsonl dispatches as before 2469ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 2056ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 3173ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 1253ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 1218ms
> [bkit] TRUNCATED HERE — 74 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1899ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 3399ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 4192ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1516ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 790ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 1383ms
     ✓ plan installs dependencies like build and debug 1387ms
     ✓ design stops on a failed install (5) 1314ms
     ✓ plan stops on a failed install (5) 1235ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1307ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1921ms
     ✓ fails without minting when origin cannot be reached 346ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1338ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1251ms
   ✓ bkit worktrees setup — mint (resume) (14)
     ✓ rebases onto origin/dev and clears a stale sentinel 3227ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2571ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 3161ms
     ✓ debug: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 3781ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 3302ms
     ✓ never commits the entries setup copies in from the main checkout 3004ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 2853ms
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 1307ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 1053ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 786ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 1415ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 819ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 1203ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 1133ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 793ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 634ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 898ms
     ✓ .husky/pre-push: a gate fails → no disk prune 738ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 1021ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 872ms
     ✓ a stale register stops the push before any gate runs 687ms
     ✓ bkit check fails → the push stops before any gate runs 682ms
     ✓ the dependency audit runs before any gate, when its script is present 949ms
     ✓ no dependency-audit script → skipped, the gates still run 639ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 994ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 769ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1348ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 897ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1031ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 1250ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1152ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 787ms
   ✓ graphify register pre-push gate (8)
> [bkit] TRUNCATED HERE — 106 lines omitted. Dropped content was NOT read.
     ✓ denies the first touch with the checklist as the reason 705ms
     ✓ allows the retry (dedup) after the first deny 850ms
   ✓ gateguard hook — no-op / fail-open cases (7)
     ✓ subagents are NOT exempt — an agent_id payload still gets the checklist 764ms
     ✓ a subagent sharing its parent's session_id gets its own checklist, once 1660ms
> [bkit] TRUNCATED HERE — 84 lines omitted. Dropped content was NOT read.
     ✓ a stack named by BKIT_LOCAL_STACK never waits on the shared one 1342ms
     ✓ every worktree of one repo resolves the main checkout's lock, and waits on it 845ms
     ✓ a holder that stops before it answers fails the take at once instead of hanging 1126ms
     ✓ `run` holds the lock for the command and passes its exit status on 1169ms
npm warn Unknown env config "npm-globalconfig". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
> [bkit] TRUNCATED HERE — 60 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 162 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 46 lines omitted. Dropped content was NOT read.
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 1349ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 607ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 722ms
     ✓ explicit `bkit help` prints the same usage and exits 0 733ms
     ✓ `bkit check --claude` (stray module flag) errors 658ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 589ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 1314ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 1725ms
> [bkit] TRUNCATED HERE — 56 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 136 lines omitted. Dropped content was NOT read.
     ✓ consumer-added extra key in opencode.json → check exits 0 (deep-contain, not drift) 2313ms
     ✓ opencode installed but no provider recorded → check exits 1 and names the fix 2026ms
     ✓ a consumer with no opencode host at all is not failed for a missing provider 2369ms
   ✓ bkit check — antigravity detected from any plugin file (1)
     ✓ deleted plugin.json + neutered guardrails command + deleted guardrails hook → check exits 1 naming each 5146ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ bkit check with stale consumer prompts.md does not emit Missing model lookup 1096ms
   ✓ Scenario: bkit check stale-marker gate is branch-scoped (#256) (2)
     ✓ on main: hard-fails (exit 1) and names the bkit-managed-stale BLOCKER 992ms
     ✓ on a feature branch: surfaces a non-blocking ADVISORY, no marker-drift hard-fail line 1035ms
stdout | .bkit/core/engine/install/modules/core.integration.test.ts > bkit canonical docs pass (runBkitDocs, #218) > writes .bkit/LICENSE.md with the full MIT text and copyright notice
[bkit-install] Running core payload pass
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 132 lines omitted. Dropped content was NOT read.
   ✓ bkit status — integration (4)
     ✓ exits 0 and prints [bkit-status] prefix 803ms
     ✓ writes zero files (purely read-only — write-set assertion) 810ms
     ✓ reports installed hosts (at minimum claude and cursor on a fresh consumer) 648ms
     ✓ reports opencode as absent when .opencode/ does not exist 647ms
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 149 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 149 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 149 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 147 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 147 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 162 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 159 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 176 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 187 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 196 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 190 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 349 lines omitted. Dropped content was NOT read.
[bkit-install] core: moved .agents/shortcuts.md → .bkit/lite.md

stderr | scripts/harvest/ledgers.integration.test.ts > Harvest boundary: stats copy-only, friction moved (WS4-T1, #343) > count-only aggregates deferrals.jsonl and failures.jsonl without copying prose
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-ob1vVP/bkit
> [bkit] TRUNCATED HERE — 244 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 149 lines omitted. Dropped content was NOT read.
[bkit-test] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 126 lines omitted. Dropped content was NOT read.
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 1134ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 740ms
     ✓ stops the step when the command crashed or was misused 1073ms
stdout | .bkit/core/engine/install/payload-links.integration.test.ts > install creates the payload view links > never clobbers a real directory — skipped, contents intact, advisory raised
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 137 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 45 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
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
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
   ✓ uninstall (1)
     ✓ removes the consumer's .bkit/templates/ copies 319ms
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
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 44 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 108 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 71 lines omitted. Dropped content was NOT read.
[bkit-uninstall-surgical-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] package.json: removed bkit install-state block
[bkit-uninstall-surgical-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical uninstall — heavy-customised consumer fixture > JSON file (.claude/settings.json) has bkit scope stripped by uninstall (format: json semantics)
[bkit-uninstall-surgical-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/.env.example (file not found — nothing to do)

 ✓ .bkit/core/engine/install/modules/claude.integration.test.ts (31 tests) 1147ms
stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical uninstall — heavy-customised consumer fixture > round-trip: uninstall is idempotent on heavy-customised consumer
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
[bkit-uninstall-surgical-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/.env.example (file not found — nothing to do)
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

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical uninstall — heavy-customised consumer fixture > round-trip: uninstall is idempotent on heavy-customised consumer
[bkit-uninstall-surgical-test] preserve: AGENTS.md (markered-text but no bkit markers found — 100% consumer content)
[bkit-uninstall-surgical-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/version (file not found — nothing to do)
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
[bkit-uninstall-surgical-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/.env.example (file not found — nothing to do)
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

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical uninstall — heavy-customised consumer fixture > fixture AGENTS.md consumer content is byte-identical after strip (regression guard)
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

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > uninstall(opencode) strips the bkit block from bkit-gateguard.js, preserving the consumer's driver (markered-text)
[bkit-uninstall-surgical-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-surgical-test] strip-block: .opencode/plugin/bkit-gateguard.js
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > uninstall(opencode) strips bkit-managed scope from opencode.json; deletes when empty after strip
[bkit-uninstall-surgical-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > uninstall(opencode) removes .opencode/agents/ and .opencode/commands/ bkit-prefix mirrors
[bkit-uninstall-surgical-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-surgical-test] preserve: .opencode/plugin/bkit-gateguard.js (markered-text but no bkit markers found — 100% consumer content)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete mirror: .opencode/agents/bkit-build-plan-execute.md
[bkit-uninstall-surgical-test] delete mirror: .opencode/commands/bkit-build.md
[bkit-uninstall-surgical-test] prune empty dir: .opencode/commands

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > opencode round-trip: zero footprint — no bkit-prefix .opencode/ files remain after uninstall
[bkit-uninstall-surgical-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-surgical-test] strip-block: .opencode/plugin/bkit-gateguard.js
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete mirror: .opencode/agents/bkit-build-plan-execute.md
[bkit-uninstall-surgical-test] delete mirror: .opencode/commands/bkit-build.md
[bkit-uninstall-surgical-test] prune empty dir: .opencode/agents
[bkit-uninstall-surgical-test] prune empty dir: .opencode/commands

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

 ✓ .bkit/core/engine/audits/templates/telemetry-gitattributes.integration.test.ts (18 tests) 367ms
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

 ✓ .bkit/core/engine/commands/install/uninstall.integration.test.ts (20 tests) 440ms
 ✓ .bkit/core/engine/install/modules/cloud.integration.test.ts (9 tests) 453ms
   ✓ runCloudModule — opt-in cloud agents (post-CI auto-routing) (9)
     ✓ the default module set does NOT ship cloud scaffolding 384ms
 ✓ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts (22 tests) 165ms
 ✓ .bkit/core/engine/install/placeholders.integration.test.ts (6 tests) 764ms
 ✓ .bkit/core/engine/checks/after/managed.integration.test.ts (1 test) 254ms
 ✓ .bkit/core/engine/checks/before/files.integration.test.ts (12 tests) 36ms
 ✓ .bkit/core/engine/install/write.integration.test.ts (5 tests) 16ms
 ✓ .bkit/core/engine/install/version-file.integration.test.ts (5 tests) 21ms
 ✓ .bkit/core/engine/commands/install/upgrade.integration.test.ts (54 tests) 134333ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (5)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 1403ms
     ✓ install --claude does not write Serena or graphify examples 2663ms
     ✓ upgrade does not rewrite a consumer-owned bkit-graphify.sh 1562ms
     ✓ does not rewrite a consumer-owned .github/renovate.json5 1084ms
     ✓ preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6) 1207ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 3280ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 5357ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 3626ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 6148ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 6615ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 5619ms
     ✓ malformed .mcp.json fails install instead of being overwritten 1282ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 5419ms
     ✓ an adopted copy of every template survives upgrade and check 5879ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 6266ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 5707ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 2020ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 7290ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (4)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 4537ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 6621ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 4126ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 3721ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 3734ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 3361ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 3847ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 2980ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 3202ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 2857ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 3009ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 2904ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 3164ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 3599ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 2888ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 1998ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 1940ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 1023ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ previews the bump (pnpm add + re-render) and exits 0 without mutating 361ms
     ✓ bumps when --to names the installed version but package.json pins a file: tarball 329ms
     ✓ passes -w when the consumer is a pnpm workspace root 311ms
     ✓ starts the package runner for the install and the re-exec 789ms
     ✓ rejects --to=<version> with --latest (mutually exclusive) at exit 1 444ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-dogfood.integration.test.ts (84 tests) 144078ms
   ✓ dogfood authoring advisories — fire on the right paths (20)
     ✓ claude: a .bkit/core/workflows/ file gets the workflow advisory 643ms
     ✓ claude: a .bkit/core/prompts/ file gets the prompt advisory 997ms
     ✓ claude: the rule files themselves get neither 3276ms
     ✓ claude: unrelated paths get neither 2788ms
     ✓ claude: a non-.md file under those dirs gets neither 904ms
     ✓ cursor: a .bkit/core/workflows/ file gets the workflow advisory 936ms
     ✓ cursor: a .bkit/core/prompts/ file gets the prompt advisory 891ms
     ✓ cursor: the rule files themselves get neither 2411ms
     ✓ cursor: unrelated paths get neither 4061ms
     ✓ cursor: a non-.md file under those dirs gets neither 848ms
     ✓ codex: a .bkit/core/workflows/ file gets the workflow advisory 1284ms
     ✓ codex: a .bkit/core/prompts/ file gets the prompt advisory 892ms
     ✓ codex: the rule files themselves get neither 2612ms
     ✓ codex: unrelated paths get neither 2913ms
     ✓ codex: a non-.md file under those dirs gets neither 1120ms
     ✓ opencode: a .bkit/core/workflows/ file gets the workflow advisory 968ms
     ✓ opencode: a .bkit/core/prompts/ file gets the prompt advisory 1102ms
     ✓ opencode: the rule files themselves get neither 3096ms
     ✓ opencode: unrelated paths get neither 2601ms
     ✓ opencode: a non-.md file under those dirs gets neither 805ms
   ✓ dogfood advisory — bkit's own .md docs (16)
     ✓ claude: bkit and .agents markdown gets the doc advisory, relabelled 5185ms
     ✓ claude: docs/** keeps the shipped label, never the dogfood one 2010ms
     ✓ claude: the execution surfaces keep their own advisory, no double-fire 2352ms
     ✓ claude: non-markdown under .bkit/ gets nothing 2091ms
     ✓ cursor: bkit and .agents markdown gets the doc advisory, relabelled 6085ms
     ✓ cursor: docs/** keeps the shipped label, never the dogfood one 2217ms
     ✓ cursor: the execution surfaces keep their own advisory, no double-fire 1724ms
     ✓ cursor: non-markdown under .bkit/ gets nothing 1726ms
     ✓ codex: bkit and .agents markdown gets the doc advisory, relabelled 5794ms
     ✓ codex: docs/** keeps the shipped label, never the dogfood one 2123ms
     ✓ codex: the execution surfaces keep their own advisory, no double-fire 1905ms
     ✓ codex: non-markdown under .bkit/ gets nothing 1985ms
     ✓ opencode: bkit and .agents markdown gets the doc advisory, relabelled 5938ms
     ✓ opencode: docs/** keeps the shipped label, never the dogfood one 1778ms
     ✓ opencode: the execution surfaces keep their own advisory, no double-fire 1979ms
     ✓ opencode: non-markdown under .bkit/ gets nothing 2308ms
   ✓ dogfood advisories — carry EVERY rule from their source section (6)
     ✓ .bkit/core/workflows/bkit-build.md: every rule of .bkit/authoring.md § All Agent-Read Files, § Prompts and Workflows, § Workflows Only appears in the advisory 1044ms
     ✓ .bkit/core/workflows/bkit-build.md: the advisory does NOT defer to the section 1106ms
     ✓ .bkit/core/prompts/bkit-plan-generate.md: every rule of .bkit/authoring.md § All Agent-Read Files, § Prompts and Workflows, § Prompts Only appears in the advisory 1110ms
     ✓ .bkit/core/prompts/bkit-plan-generate.md: the advisory does NOT defer to the section 1111ms
     ✓ both advisories carry the cost reminder and the advisory footer 1783ms
   ✓ dogfood advisories — shared rules read from their section at hook time (17)
     ✓ claude: .bkit/core/workflows/bkit-build.md carries each shared rule exactly as .bkit/authoring.md states it 1108ms
     ✓ claude: .bkit/core/workflows/bkit-build.md carries the § Notation Grammar paragraph as .bkit/authoring.md states it 864ms
     ✓ cursor: .bkit/core/workflows/bkit-build.md carries each shared rule exactly as .bkit/authoring.md states it 751ms
     ✓ cursor: .bkit/core/workflows/bkit-build.md carries the § Notation Grammar paragraph as .bkit/authoring.md states it 802ms
     ✓ codex: .bkit/core/workflows/bkit-build.md carries each shared rule exactly as .bkit/authoring.md states it 787ms
     ✓ codex: .bkit/core/workflows/bkit-build.md carries the § Notation Grammar paragraph as .bkit/authoring.md states it 937ms
     ✓ opencode: .bkit/core/workflows/bkit-build.md carries each shared rule exactly as .bkit/authoring.md states it 824ms
     ✓ opencode: .bkit/core/workflows/bkit-build.md carries the § Notation Grammar paragraph as .bkit/authoring.md states it 791ms
     ✓ claude: .bkit/core/prompts/bkit-plan-generate.md carries each shared rule exactly as .bkit/authoring.md states it 814ms
     ✓ claude: .bkit/core/prompts/bkit-plan-generate.md carries the § Notation Grammar paragraph as .bkit/authoring.md states it 739ms
     ✓ cursor: .bkit/core/prompts/bkit-plan-generate.md carries each shared rule exactly as .bkit/authoring.md states it 855ms
     ✓ cursor: .bkit/core/prompts/bkit-plan-generate.md carries the § Notation Grammar paragraph as .bkit/authoring.md states it 831ms
     ✓ codex: .bkit/core/prompts/bkit-plan-generate.md carries each shared rule exactly as .bkit/authoring.md states it 743ms
     ✓ codex: .bkit/core/prompts/bkit-plan-generate.md carries the § Notation Grammar paragraph as .bkit/authoring.md states it 980ms
     ✓ opencode: .bkit/core/prompts/bkit-plan-generate.md carries each shared rule exactly as .bkit/authoring.md states it 836ms
     ✓ opencode: .bkit/core/prompts/bkit-plan-generate.md carries the § Notation Grammar paragraph as .bkit/authoring.md states it 756ms
     ✓ a hook that cannot read the doc still fires, naming where to read the rule 796ms
   ✓ dogfood advisories — .agents/rules.md § Repo Authoring (13)
     ✓ claude: every Prose edits path gets the prose advisory 6112ms
     ✓ claude: workflow and prompt advisories carry the reference inline, no second block 1947ms
     ✓ claude: non-markdown gets no prose advisory 2692ms
     ✓ cursor: every Prose edits path gets the prose advisory 6524ms
     ✓ cursor: workflow and prompt advisories carry the reference inline, no second block 2063ms
     ✓ cursor: non-markdown gets no prose advisory 3391ms
     ✓ codex: every Prose edits path gets the prose advisory 4967ms
     ✓ codex: workflow and prompt advisories carry the reference inline, no second block 1142ms
     ✓ codex: non-markdown gets no prose advisory 1635ms
     ✓ opencode: every Prose edits path gets the prose advisory 5566ms
     ✓ opencode: workflow and prompt advisories carry the reference inline, no second block 2300ms
     ✓ opencode: non-markdown gets no prose advisory 2993ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts (320 tests) 265656ms
   ✓ gateguard behaviour parity — advisory content (210)
     ✓ claude (42)
       ✓ first edit to an existing file gets the investigation checklist 658ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 992ms
       ✓ a gate-config path gets the weaken-the-gate advisory 978ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 1334ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 1035ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 1368ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 867ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 826ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 867ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 857ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 845ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 706ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 912ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 1032ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 1542ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 1462ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 1170ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 841ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 1127ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 872ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 714ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 783ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 921ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 879ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 804ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 897ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 864ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 988ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 996ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 922ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 1220ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 1070ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 727ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 911ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 819ms
       ✓ ordinary file README.md is not treated as a gate config 732ms
       ✓ ordinary file src/index.ts is not treated as a gate config 825ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 789ms
       ✓ mixed-purpose package.json is not treated as a gate config 828ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 753ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 755ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 894ms
     ✓ cursor (42)
       ✓ first edit to an existing file gets the investigation checklist 1096ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 1025ms
       ✓ a gate-config path gets the weaken-the-gate advisory 934ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 1048ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 1229ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 974ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 1041ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 989ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 1021ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 953ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 797ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 1018ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 1280ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 1013ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 982ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 838ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 888ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 948ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 1019ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 968ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 859ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 963ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 1062ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 1028ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 951ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 1071ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 1037ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 940ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 765ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 1126ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 943ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 1120ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 941ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 1003ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 893ms
       ✓ ordinary file README.md is not treated as a gate config 850ms
       ✓ ordinary file src/index.ts is not treated as a gate config 925ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 953ms
       ✓ mixed-purpose package.json is not treated as a gate config 989ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 887ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 1104ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 1048ms
     ✓ opencode (42)
       ✓ first edit to an existing file gets the investigation checklist 1114ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 1206ms
       ✓ a gate-config path gets the weaken-the-gate advisory 1187ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 1130ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 1056ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 923ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 1007ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 1143ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 964ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 839ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 896ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 1035ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 964ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 782ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 908ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 778ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 808ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 761ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 826ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 904ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 980ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 808ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 842ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 950ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 1027ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 926ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 757ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 791ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 1024ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 1073ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 902ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 944ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 1069ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 884ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 961ms
       ✓ ordinary file README.md is not treated as a gate config 999ms
       ✓ ordinary file src/index.ts is not treated as a gate config 937ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 836ms
       ✓ mixed-purpose package.json is not treated as a gate config 903ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 1030ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 1153ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 1265ms
     ✓ codex (42)
       ✓ first edit to an existing file gets the investigation checklist 1002ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 1437ms
       ✓ a gate-config path gets the weaken-the-gate advisory 1039ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 901ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 841ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 1076ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 619ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 552ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 560ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 578ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 588ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 589ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 553ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 549ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 539ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 547ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 587ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 543ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 588ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 620ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 1285ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 1082ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 958ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 1222ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 1204ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 1060ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 1087ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 684ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 437ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 359ms
     ✓ antigravity (42)
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 334ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 512ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 898ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 1079ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 862ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 1123ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 1006ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 1435ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 1102ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 1073ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 1243ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 827ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 1154ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 893ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 1018ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 907ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 1050ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 1116ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 955ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 942ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 971ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 1018ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 952ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 925ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 922ms
       ✓ ordinary file README.md is not treated as a gate config 961ms
       ✓ ordinary file src/index.ts is not treated as a gate config 1490ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 1184ms
       ✓ mixed-purpose package.json is not treated as a gate config 950ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 867ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 911ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 1508ms
   ✓ gateguard behaviour parity — template copies (25)
     ✓ claude: a consumer's .bkit/templates/.vale.ini is not a gate config 1483ms
     ✓ claude: a consumer's root .vale.ini is a gate config 1002ms
     ✓ claude: bkit's own .bkit/templates/.vale.ini is a gate config 1044ms
     ✓ claude: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 855ms
     ✓ claude: a folder that merely ends in .bkit/templates is not a template copy 955ms
     ✓ cursor: a consumer's .bkit/templates/.vale.ini is not a gate config 946ms
     ✓ cursor: a consumer's root .vale.ini is a gate config 754ms
     ✓ cursor: bkit's own .bkit/templates/.vale.ini is a gate config 862ms
     ✓ cursor: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 785ms
     ✓ cursor: a folder that merely ends in .bkit/templates is not a template copy 798ms
     ✓ opencode: a consumer's .bkit/templates/.vale.ini is not a gate config 813ms
     ✓ opencode: a consumer's root .vale.ini is a gate config 766ms
     ✓ opencode: bkit's own .bkit/templates/.vale.ini is a gate config 1037ms
     ✓ opencode: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 1063ms
     ✓ opencode: a folder that merely ends in .bkit/templates is not a template copy 1005ms
     ✓ codex: a consumer's .bkit/templates/.vale.ini is not a gate config 1258ms
     ✓ codex: a consumer's root .vale.ini is a gate config 1138ms
     ✓ codex: bkit's own .bkit/templates/.vale.ini is a gate config 1157ms
     ✓ codex: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 1474ms
     ✓ codex: a folder that merely ends in .bkit/templates is not a template copy 940ms
     ✓ antigravity: a consumer's .bkit/templates/.vale.ini is not a gate config 1485ms
     ✓ antigravity: a consumer's root .vale.ini is a gate config 1406ms
     ✓ antigravity: bkit's own .bkit/templates/.vale.ini is a gate config 863ms
     ✓ antigravity: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 894ms
     ✓ antigravity: a folder that merely ends in .bkit/templates is not a template copy 788ms
   ✓ gateguard behaviour parity — docs density advisory (25)
     ✓ claude: fires on docs/architecture.md (a docs markdown file) 946ms
     ✓ claude: fires on .bkit/shared/docs/architecture.md (nested docs tree) 1086ms
     ✓ claude: does not fire on Documents/architecture.md (segment match, not substring) 916ms
     ✓ claude: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 869ms
     ✓ claude: does not fire on docs/knowledge.jsonl (gated on .md) 772ms
     ✓ cursor: fires on docs/architecture.md (a docs markdown file) 973ms
     ✓ cursor: fires on .bkit/shared/docs/architecture.md (nested docs tree) 833ms
     ✓ cursor: does not fire on Documents/architecture.md (segment match, not substring) 829ms
     ✓ cursor: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 751ms
     ✓ cursor: does not fire on docs/knowledge.jsonl (gated on .md) 927ms
     ✓ opencode: fires on docs/architecture.md (a docs markdown file) 839ms
     ✓ opencode: fires on .bkit/shared/docs/architecture.md (nested docs tree) 868ms
     ✓ opencode: does not fire on Documents/architecture.md (segment match, not substring) 870ms
     ✓ opencode: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 796ms
     ✓ opencode: does not fire on docs/knowledge.jsonl (gated on .md) 822ms
     ✓ codex: fires on docs/architecture.md (a docs markdown file) 847ms
     ✓ codex: fires on .bkit/shared/docs/architecture.md (nested docs tree) 1035ms
     ✓ codex: does not fire on Documents/architecture.md (segment match, not substring) 924ms
     ✓ codex: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 894ms
     ✓ codex: does not fire on docs/knowledge.jsonl (gated on .md) 764ms
     ✓ antigravity: fires on docs/architecture.md (a docs markdown file) 981ms
     ✓ antigravity: fires on .bkit/shared/docs/architecture.md (nested docs tree) 893ms
     ✓ antigravity: does not fire on Documents/architecture.md (segment match, not substring) 938ms
     ✓ antigravity: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 713ms
     ✓ antigravity: does not fire on docs/knowledge.jsonl (gated on .md) 725ms
   ✓ gateguard behaviour parity — dedup (10)
     ✓ claude: second touch of the same file in the same session is silent 789ms
     ✓ claude: a different file in the same session warns again 1510ms
     ✓ cursor: second touch of the same file in the same session is silent 1054ms
     ✓ cursor: a different file in the same session warns again 1694ms
     ✓ opencode: second touch of the same file in the same session is silent 907ms
     ✓ opencode: a different file in the same session warns again 1693ms
     ✓ codex: second touch of the same file in the same session is silent 1197ms
     ✓ codex: a different file in the same session warns again 2284ms
     ✓ antigravity: second touch of the same file in the same session is silent 1128ms
     ✓ antigravity: a different file in the same session warns again 2158ms
   ✓ gateguard behaviour parity — modes (15)
     ✓ claude: BKIT_GATEGUARD=deny blocks the first touch with the checklist 947ms
     ✓ claude: deny mode allows the retry (dedup lets the second call through) 1014ms
     ✓ cursor: BKIT_GATEGUARD=deny blocks the first touch with the checklist 917ms
     ✓ cursor: deny mode allows the retry (dedup lets the second call through) 951ms
     ✓ opencode: BKIT_GATEGUARD=deny blocks the first touch with the checklist 937ms
     ✓ opencode: deny mode allows the retry (dedup lets the second call through) 1023ms
     ✓ codex: BKIT_GATEGUARD=deny blocks the first touch with the checklist 1130ms
     ✓ codex: deny mode allows the retry (dedup lets the second call through) 1177ms
     ✓ antigravity: BKIT_GATEGUARD=deny blocks the first touch with the checklist 1125ms
     ✓ antigravity: deny mode allows the retry (dedup lets the second call through) 1065ms
   ✓ gateguard behaviour parity — no-op and fail-open (10)
     ✓ claude: subagents are NOT exempt 935ms
     ✓ cursor: subagents are NOT exempt 999ms
     ✓ opencode: subagents are NOT exempt 857ms
     ✓ codex: subagents are NOT exempt 1024ms
     ✓ antigravity: subagents are NOT exempt 967ms
   ✓ gateguard structural parity (21)
     ✓ codex advises on the *** Move to: target of a renaming patch 1865ms
   ✓ gateguard parity — documented deviations (4)
     ✓ only Claude distinguishes Edit from Write for the new-file nudge 1185ms
     ✓ blocking is expressed differently per host but means the same thing 2311ms
     ✓ Antigravity delivers the checklist by denying the first edit once; the retry passes 1127ms

 Test Files  47 passed (47)
      Tests  1602 passed (1602)
   Start at  11:54:58
   Duration  265.96s (tests 99%, transform 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/701-engine-work-build/build-group-gate-11-2.log.reports/vitest-76834.xml
> [bkit] TRUNCATED — kept 2749 of 17788 lines (200 KB of 1.2 MB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
