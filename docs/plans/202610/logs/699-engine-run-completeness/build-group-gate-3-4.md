
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

[test-timeout-budget] load average 15.1 on 10 cores: unit limits 7540ms per test, 15080ms per hook (x1.51)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (42 tests) 26568ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 572ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 777ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 573ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 651ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 818ms
     ✓ gh not on PATH at all also falls back to the remote 314ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 520ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 732ms
     ✓ counts commits behind origin/dev and the divergence age 873ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 738ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1286ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 670ms
     ✓ from a worktree, still names the main checkout and its outbox 641ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 1041ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 697ms
   ✓ bkit repo info — where the wired tracker's issues live (10)
     ✓ prints the Linear team and project under linear 656ms
     ✓ prints the Jira site and project under jira 916ms
     ✓ prints the board under github 731ms
     ✓ prints the github progress and review states, defaults for a key left unset 1127ms
     ✓ prints the linear progress and review states, defaults for a key left unset 971ms
     ✓ prints the jira progress and review states, defaults for a key left unset 797ms
     ✓ prints the linear progress and review states, defaults for a key left unset 928ms
     ✓ prints null progress and review states under none 964ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 612ms
     ✓ prints nulls under github without a board, and for keys left unset 1787ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 624ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 551ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 620ms
     ✓ an unpinned repo reports nulls and asks no registry 863ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 519ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 778ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 683ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 401ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (64 tests) 36967ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 367ms
     ✓ adopts the main checkout even when called from a linked worktree 447ms
     ✓ design refuses to work in place on dev 317ms
     ✓ design and plan in place on main are refused 469ms
     ✓ still adopts a cloud session branch whose upstream is main 512ms
   ✓ bkit worktrees setup — debug (4)
     ✓ may debug in place on dev 610ms
     ✓ adopts in place when the session is already on feat/{fid} 415ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 1275ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1589ms
     ✓ a new run of the same FID rewrites startSha 2056ms
     ✓ a resume of the same FID reuses the record 1939ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1016ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1033ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1171ms
     ✓ a stale record without a lock is replaced 1486ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1447ms
     ✓ ship names a missing feat branch 452ms
     ✓ ship on dev refuses with the releases-stay-manual text 411ms
     ✓ refuses dev / main as the ship branch 304ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1750ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 444ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 430ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 345ms
       ✓ checks no disk when there are no cleanup step files 562ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 514ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 541ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 530ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 436ms
     ✓ never commits an entry only the main checkout's copy list names 985ms
   ✓ paths (2)
     ✓ resolves the same marker from inside the worktree 362ms
   ✓ bkit worktrees remove (12)
     ✓ leaves a worktree without the marker in place 327ms
     ✓ removes a marked worktree with uncommitted changes and clears the marker 654ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 917ms
     ✓ tells a caller inside the removed worktree where to cd 389ms
     ✓ fails with its own exit code when git cannot remove a marked path 317ms
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 1356ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 773ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 825ms
       ✓ a branch already gone everywhere is reported deleted 685ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 815ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1431ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (116 tests) 38480ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 302ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 379ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 381ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 584ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 511ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 455ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 320ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 310ms
     ✓ PASS is 0 failures with or without reports 447ms
     ✓ clears a previous attempt's reports before the gate runs 374ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 502ms
     ✓ a log under the outbox is named main-checkout relative in the record 743ms
     ✓ a log small enough is copied whole: not clamped, raw null 515ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 329ms
   ✓ bkit tests red / green (29)
     ✓ records a red: the named test failed; row, log and test snapshot written, path passed whole 1035ms
     ✓ refuses a run that is not a red: exit 1, reason printed, no row 1116ms
     ✓ a red already recorded for the unchanged test stands on resume; a changed test runs again 885ms
     ✓ refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2) 744ms
     ✓ a script that cannot run is exit 4, not a rejected red 729ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 303ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 792ms
     ✓ green: --group audits only that group's tasks 539ms
     ✓ green: --group naming a group with no tasks is refused 334ms
     ✓ green: a code fence never closed is the reason, not missing task markers 347ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 962ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 751ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 707ms
     ✓ green prints a verdict and a fixable per gap 984ms
     ✓ green verdict is FAIL when a gap is unfixable 446ms
     ✓ green leaves a diff-reading kind fixable null 873ms
     ✓ green prints verdict null when a gap needs a diff read 661ms
     ✓ green: lists each gap kind, with the diff for a test changed since its red 1218ms
     ✓ green: a red recorded for a different test than the plan names is a red-mismatch 598ms
     ✓ green: a planned test that moved is a red-mismatch saying whether the recorded test passes now 927ms
     ✓ green: every test a task names needs its own red and its own pass 1235ms
     ✓ test order (7)
       ✓ green finds the code commit for DONE — TASK N 1896ms
       ✓ a red recorded before the task's code commit stands, across a resumed execute 1705ms
       ✓ a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked 1704ms
       ✓ green emits a test-changed gap for a red whose test gained added lines only 663ms
       ✓ green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green 1406ms
       ✓ green refuses an exception-only task from a workflow step commit 785ms
       ✓ green clears an exception-only task from a human commit 625ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 39678ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 445ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 659ms
     ✓ always writes the marker, even with no plan 585ms
     ✓ writes the linear marker shape, taking the tracker from package.json 577ms
     ✓ writes the jira marker shape, taking the tracker from package.json 596ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 759ms
     ✓ refuses a PR from dev, main, or the base itself 414ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 671ms
     ✓ retries a failed create once, and exits 5 when it fails twice 981ms
     ✓ exits 5 when the open-PR probe errors 661ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 649ms
     ✓ prs open still opens against any other base 430ms
     ✓ exits 6 when the created PR's base is not --base 592ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 552ms
     ✓ exits 1 with found=false when there is none 462ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 576ms
     ✓ --number reads one PR, mergeable included 907ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 856ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1185ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 799ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 649ms
     ✓ drops the force-build marker from the title subject 392ms
     ✓ takes an explicit --subject 637ms
     ✓ runs no merge when the PR is already MERGED 484ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 916ms
     ✓ prs merge refuses a PR whose base is main 534ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 457ms
     ✓ prs merge refuses when the PR base is unknown 597ms
     ✓ prs merge reads the base from the one pr view it already makes 825ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 797ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 655ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 623ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 896ms
     ✓ never reads dev's required checks without --only-if-required 550ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 1014ms
     ✓ updates when a dev ruleset requires status checks 1011ms
     ✓ updates when dev's branch protection requires status checks 526ms
     ✓ ignores dev rulesets that require no checks 770ms
     ✓ updates when the repo cannot be resolved 466ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 479ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 478ms
     ✓ is not green when a check failed, naming it (exit 1) 610ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 396ms
     ✓ is not green on an empty rollup (total 0) 920ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 422ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 752ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 502ms
     ✓ is a no-op when the title already says so 543ms
     ✓ strips the marker, with or without its bkit prefix 553ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 683ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ scans a clean landed body and records the close-transport row 411ms
     ✓ exits 8 on an unreadable commit, writing nothing 326ms
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 373ms
     ✓ needs --scan or --scan-result 343ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (93 tests) 41920ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 703ms
     ✓ done --group writes group on the row 532ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 711ms
     ✓ carries extra fields, parsed as JSON when they are JSON 476ms
     ✓ reports a failed commit with exit 8 without writing the row 846ms
     ✓ a failed commit leaves no row staged in the index 792ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1034ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 886ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 808ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 792ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 739ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 425ms
     ✓ --ref reads the status file as committed on that ref, not from disk 370ms
     ✓ --ref exits 3 when the ref does not carry the status file 434ms
     ✓ fails on a placeholder left in the artifact 341ms
     ✓ fails when the row's verdict differs from the artifact's 344ms
     ✓ fails when the row does not list the artifact, or carries another attempt 430ms
     ✓ fails on a missing artifact 341ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 337ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 308ms
     ✓ fails a run-tests row missing its scope, and an empty scope 714ms
   ✓ bkit steps finish (14)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 713ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 301ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 347ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 582ms
     ✓ records the header's Strategy on the row 344ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 609ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 387ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 547ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 887ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 615ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 675ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1756ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 699ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 597ms
     ✓ checks the FID's shape for the wired tracker 497ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 478ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 1027ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 774ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 439ms
     ✓ --attempt-of checks the row carries the derived counter 590ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1694ms
     ✓ writeStepRow refuses when a recorded path changed 1985ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 886ms
     ✓ writeStepRow appends its commit sha to the record 1936ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1836ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 16011ms
   ✓ gateguard opencode plugin — advisory mode (default) (7)
     ✓ emits reuse checklist on first write to a NEW (nonexistent) file 583ms
     ✓ keeps the reuse checklist when the write CREATES the file (pre-write snapshot) 642ms
     ✓ (V1) keeps the reuse checklist when the write CREATES the file (pre-write snapshot) 364ms
     ✓ emits investigation checklist on a write to an EXISTING file 325ms
     ✓ emits investigation checklist on first edit to a file 365ms
     ✓ dedups: second write to the same file in the same session emits nothing 390ms
     ✓ warns again for a different file in the same session 647ms
   ✓ gateguard opencode plugin — deny mode (2)
     ✓ throws with advisory text on first write (blocks edit) 317ms
     ✓ allows retry (second call is a no-op after dedup marked) 364ms
   ✓ gateguard opencode plugin — gate-config advisory (9)
     ✓ tsconfig.json triggers config advisory 331ms
     ✓ flags eslint.config.mjs as gate config 356ms
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 424ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 304ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 887ms
     ✓ patch (v1 driver): checks every Add / Update / Move-to / Delete target 931ms
     ✓ apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target 830ms
     ✓ apply_patch (v1 driver): checks every Add / Update / Move-to / Delete target 863ms
     ✓ deny mode blocks when any patch target is a first touch, and records all of them 699ms
     ✓ deny mode still blocks when only one of several patch targets is new to the session 592ms
   ✓ dual driver shape (OpenCode 1.x server() + 2.0 setup()) (6)
     ✓ 1.x server() returns the tool.execute.before + tool.execute.after hooks 361ms
     ✓ both drivers emit the same advisory for the same edit 509ms
     ✓ deny mode blocks the first touch on BOTH drivers 451ms
   ✓ gateguard plugin — docs/*.md density advisory (#422) (6)
     ✓ matches a nested docs/ tree via segment match (.bkit/shared/docs/architecture.md) 312ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (56 tests) 17955ms
   ✓ trackerTarget (3)
     ✓ linear and jira: the uppercased key from the FID, plus team / site 496ms
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 661ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 564ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 621ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 715ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1054ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 440ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 788ms
     ✓ fetches the issue and its comments as GitHub returns them 514ms
   ✓ postCommentOnce (4)
     ✓ skips issue-less runs and tracker none 341ms
     ✓ records an engine-action row and skips the same key + body on a re-run 487ms
     ✓ a recent identical comment counts as done (the final close comment) 438ms
     ✓ a failed post reports done false with the reason and never leaks a token 415ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 594ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 1131ms
     ✓ a board the token cannot see is scope 685ms
     ✓ an HTTP 403 from gh is scope 844ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 949ms
     ✓ github: no block, no blockers and no further reads 592ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 541ms
     ✓ a different marker hash posts 944ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 576ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 15671ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 524ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 1057ms
     ✓ CI=true -> GITHUB_ACTION 466ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 751ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 506ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 360ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 332ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 486ms
     ✓ classifyAt reads the marker from the main checkout inside a linked worktree 315ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 455ms
     ✓ LOCAL -> runtimeHeadless=false 458ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 437ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 468ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 1056ms
     ✓ UNKNOWN -> runtimeHeadless=false 427ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 438ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 398ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 417ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 726ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 661ms
     ✓ re-derives per call: one run's answer does not leak into the next 546ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 318ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 663ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 329ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 691ms
     ✓ --file into a missing directory is refused, not created 615ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (47 tests) 38342ms
   ✓ bkit ci slop — gate decision (6)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1088ms
     ✓ fails on a net score rise with no net count change 1353ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 937ms
     ✓ treats a net score at or below 0.001 as float noise 1049ms
     ✓ passes when the change only resolves findings 1030ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1091ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 395ms
     ✓ skips (exit 0) when the base resolves to HEAD 777ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1108ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 890ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 434ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 934ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1008ms
     ✓ exits 4 on a dropped net field instead of silently passing 1046ms
     ✓ exits 4 on no summary instead of silently passing 1123ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1194ms
     ✓ exits 5 when the base worktree cannot be created 535ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1491ms
   ✓ bkit ci slop — real slop-scan (3)
     ✓ a genuinely new finding fails the gate 1747ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1269ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1315ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 2220ms
   ✓ bkit ci prose — file selection (3)
     ✓ a one-level glob does not descend; ** does; each file once across globs 312ms
   ✓ bkit ci prose — gate (5)
     ✓ skips with exit 0 when vale is not installed 325ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 1269ms
     ✓ fails (exit 1) when vale reports alerts 673ms
     ✓ exits 6 on a vale runtime error 641ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 761ms
     ✓ falls back to vale sync when the main worktree has none 820ms
     ✓ skips loudly with exit 0 when vale sync cannot restore it either 630ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 668ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 698ms
     ✓ is a usage error when the commit cannot be read 466ms
   ✓ bkit ci min-push (8)
     ✓ exits 0 when every changed file is a plan log or a ledger 637ms
     ✓ exits 1 naming the files outside, whatever the commit message says 697ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1122ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 629ms
     ✓ reads bkit.testing.minPushPaths from package.json; an explicit [] turns it off 1003ms
     ✓ a top-level glob does not reach into folders 872ms
     ✓ a push that changes no files is not proven a min push 726ms
     ✓ exits 7 when a commit or its base cannot be read 661ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (84 tests) 38599ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (23)
     ✓ modified ledger under the FID logdir is staged and committed 912ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 977ms
     ✓ brand-new untracked ledger is staged and committed 830ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 696ms
     ✓ path containing a space is staged and committed 545ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 457ms
     ✓ staging failure: exit 4 and no commit is created, no false success 586ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 555ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 531ms
     ✓ --mode=stage stages the sweep but creates no commit 725ms
     ✓ top-level docs/*.md is committed under scope=pr, not under scope=core or scope=full 1465ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 787ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 398ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 369ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 374ms
     ✓ --root defaults to the working directory 415ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 636ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 637ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 468ms
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 947ms
     ✓ keeps each context's own section banner and drops every other context's 2946ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 459ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped fetch keeps the whole payload in the outbox; the record carries the block body as its source 393ms
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 943ms
       ✓ a source change past the validated head refuses (17) and names the path 698ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 641ms
       ✓ --validated without --month / --fid is a usage error (2) 548ms
       ✓ a validated sha that is not an ancestor refuses (17) 865ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 1793ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 829ms
     ✓ CLI: a failed gh workflow run exits 5 783ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1811ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 797ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1743ms
     ✓ a failed re-trigger push names the cause in the log 1504ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1547ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2866ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1780ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 929ms
     ✓ gh-error: every poll errored 818ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1240ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1202ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1623ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1565ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2778ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3216ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 953ms
     ✓ re-trigger on dev only uses the record of its own FID 1249ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1362ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 634ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 817ms
     ✓ a refused capstone records FAIL with its reason 705ms
     ✓ an unreadable PR is an API error (20) with no head 503ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 799ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 1601ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 827ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 885ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1907ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1807ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1431ms
     ✓ --file and --step go together 1437ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (210 tests) 33195ms
> [bkit] TRUNCATED HERE — 41 lines omitted. Dropped content was NOT read.
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 1824ms
       ✓ falls back to event.before when gh prints unparseable output 842ms
       ✓ reports last-green-run as the source when the green head is an ancestor 1778ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 1913ms
         ✓ tests ancestry against --head, not HEAD 1941ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 2166ms
(node:27201) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 1239ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1258ms
     ✓ a push that fails without a server answer is returned once, never retried 1004ms
     ✓ a failed fetch is returned before anything is built 688ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1965ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1892ms
     ✓ lands from a clone whose fetch refspec omits dev 1933ms
     ✓ build throwing stops the landing and removes the throwaway checkout 991ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ treats regex characters in a skill name literally 1291ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 469ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 667ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 750ms
     ✓ runs from the checkout top even when called from a subfolder 587ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 846ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1892ms
     ✓ a refused dev push is logged, never fails the close 1849ms
     ✓ an unreachable remote is logged, never fails the close 1104ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (18 tests) 2794ms
   ✓ bkit tasks currency (5)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 965ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1472ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 499ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 6624ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 514ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 624ms
     ✓ resolves config from the repo root when run from a subdirectory 681ms
     ✓ exits 6 when the PUT fails 671ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1037ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 368ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 330ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 334ms
     ✓ exits 6 when the api answer is not JSON 352ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (30 tests) 3102ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 447ms
     ✓ is null when pnpm fails or prints something that is not a version 896ms
 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (49 tests) 1026ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (26 tests) 4787ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 841ms
     ✓ passes every rule on a clean head 376ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 509ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (22 tests) 1711ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (9 tests) 1805ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
   ✓ guardRepoConfig (6)
     ✓ passes when only another key changed, such as a branch's upstream 348ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 360ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 492ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 439ms
 ✓ .bkit/core/engine/checks/tips/index.test.ts (26 tests) 1528ms
   ✓ tipsBase (4)
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
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 219 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 586 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 630 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 46 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (6 tests) 7ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 6ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 7ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ a resumed run prints its last DONE step; a closed decision is not open 301ms
     ✓ reads Test attempt from a tests pause 344ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 551ms
     ✓ writes no row when status.jsonl does not exist 498ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 437ms
     ✓ aborts a rebase only when one is in progress 1035ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 718ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 452ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 713ms
     ✓ --max-exceeded says a handover is due without any sentinel 575ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 323ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 443ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 518ms
   ✓ bkit workflows close (16)
     ✓ context peaks (3)
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 620ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 612ms
     ✓ an unwritable stats path is logged and never fails the close 922ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1058ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 2166ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1256ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1386ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 940ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1072ms
     ✓ --number without --outbox is a usage error 1102ms
     ✓ --flush is ship only 493ms
   ✓ bkit workflows handover (23)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 577ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 431ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2318ms
     ✓ --flush with nothing to record commits and pushes nothing 2131ms
     ✓ --flush carries the named worktree's logs into the dev commit 2465ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3207ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1963ms
     ✓ a close that landed releases the lock 3039ms
     ✓ removes the worktree before it releases the lock 2764ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ closePr refuses when the PR base is unknown 3550ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2629ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 408ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 722ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ a second run's record does not let this FID's close commit 435ms
     ✓ record is present after workflows close and before the push 729ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1049ms
   ✓ bkit workflows input (7)
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 303ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1193ms
     ✓ refuses a code conflict and aborts the rebase on the spot 780ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1149ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 726ms
     ✓ produces byte-identical output to merge=union 1973ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1116ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1905ms
     ✓ refuses a lockfile whose regenerate command fails 1318ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 533ms
     ✓ removes a stale sentinel when the rebase succeeds 854ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 652ms
       ✓ runs (0) with the landed path count once dev moved 1383ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 814ms
   ✓ branches push (17)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 2250ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --mode=dev refuses a feature checkout 940ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2448ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 1232ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1331ms
     ✓ --mode=abort pushes when the branch has no open PR 1709ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1209ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 963ms
     ✓ --open-pr carries the MCP answer and skips gh 1135ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1933ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2380ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3726ms
     ✓ skip-ci HEAD on the replay is refused 1376ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3028ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 1054ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1660ms
     ✓ a fetch that fails exits 10 783ms
   ✓ branches scan-diff (24)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1299ms
     ✓ --paths with no match exits 1 1243ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 782ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1300ms
     ✓ --marker reads a diff over 1 MiB 1436ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1252ms
     ✓ scan-diff ignores a removed comment in a test file 1076ms
     ✓ scan-diff ignores an assertion moved within the file 1145ms
     ✓ scan-diff still reports a removed assertion 1234ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1133ms
     ✓ scan-diff finds an added pytest mark skip 1150ms
     ✓ scan-diff finds an added unittest skip 1351ms
     ✓ scan-diff finds an added bare skip call 770ms
     ✓ scan-diff ignores a quoted skip in a documentation file 494ms
     ✓ scan-diff ignores a marker literal in a non-test source file 583ms
     ✓ scan-diff ignores an assertion whose expectation changed 443ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 438ms
     ✓ scan-diff reports a deleted test file 457ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 334ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ fast-forwards local dev without checking it out 624ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1061ms
     ✓ a failed install stops ship (16) 966ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 840ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 755ms
     ✓ exits 10 when the fetch fails 490ms
   ✓ branches land (27)
     ✓ refuses a workflow other than design or plan 321ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2792ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2115ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 2013ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 900ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2472ms
> [bkit] TRUNCATED HERE — 107 lines omitted. Dropped content was NOT read.
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |     100 |    99.06 |     100 |     100 | 247               
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |    90.8 |     85.8 |   95.48 |    91.5 |                   
  instructions.ts  |    90.8 |     85.8 |   95.48 |    91.5 | ...1671-1753,1758 
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 262 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 845 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 2080 ms
ok 17 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 182 ms
ok 18 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 84 ms
ok 19 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 106 ms
ok 20 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 39 ms
ok 21 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 50 ms
ok 22 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 44 ms
ok 23 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 80 ms
ok 24 stub: --paginate emits one document per page; --slurp collapses them into an array # in 106 ms
ok 25 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 480 ms
ok 26 a key removed from the env file is unset on the next run # in 397 ms
ok 27 an empty value unsets the key instead of setting an empty string # in 316 ms
ok 28 non-BKIT_ keys are skipped # in 305 ms
ok 29 one failing key does not stop the others and the exit status is non-zero # in 289 ms
ok 30 a failed unsetenv is retried on the next run # in 441 ms
ok 31 logs key names only, never values # in 257 ms
ok 32 missing env file exits 0 without calling launchctl # in 52 ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
> vitest run integration.test

[test-timeout-budget] load average 10.4 on 10 cores: unit limits 5190ms per test, 10379ms per hook (x1.04)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> [bkit] TRUNCATED HERE — 87 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 189 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 151 lines omitted. Dropped content was NOT read.
[bkit-test] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 213 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 177 lines omitted. Dropped content was NOT read.
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 64 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 133 lines omitted. Dropped content was NOT read.
     ✓ skips a call made outside the run's worktree 562ms
     ✓ writes nothing when no run is active in the cwd 453ms
stderr | scripts/harvest/ledgers.integration.test.ts > Harvest boundary: stats copy-only, friction moved (WS4-T1, #343) > count-only aggregates deferrals.jsonl and failures.jsonl without copying prose
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-8KzXJH/bkit
> [bkit] TRUNCATED HERE — 56 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 189 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 177 lines omitted. Dropped content was NOT read.
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 72 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 180 lines omitted. Dropped content was NOT read.
docs/templates/bkit-audit-documentation.md       | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-duplication.md         | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-failures.md            | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-flakes.md              | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-gates.md               | delete                 | bkit-owned docs template — removed on full/core uninstall
> [bkit] TRUNCATED HERE — 56 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 177 lines omitted. Dropped content was NOT read.
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 78 lines omitted. Dropped content was NOT read.
     ✓ denies private-key material every time 549ms
     ✓ hands env / secrets files to Antigravity's own approval prompt 377ms
stderr | scripts/harvest/ledgers.integration.test.ts > Harvest: a friction row the dispatch seam wrote > keeps a seam-written tool-failure row through commit and harvest
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-SAx9Ry/bkit
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ is stable when the checkout moves 556ms
   ✓ Harvest: a friction row the dispatch seam wrote (1)
     ✓ keeps a seam-written tool-failure row through commit and harvest 2646ms
 ✓ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts (12 tests) 617ms
 ✓ .bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts (16 tests) 1215ms
> [bkit] TRUNCATED HERE — 45 lines omitted. Dropped content was NOT read.
     ✓ denies the first touch with the checklist as the reason 385ms
     ✓ allows the retry (dedup) after the first deny 507ms
   ✓ gateguard hook — no-op / fail-open cases (7)
     ✓ subagents are NOT exempt — an agent_id payload still gets the checklist 360ms
     ✓ a subagent sharing its parent's session_id gets its own checklist, once 930ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ Codex: the dependency install runs in the repo after a download step leaves it 1307ms
     ✓ Claude session hook: context-fetch provisioning (3)
       ✓ runs every recipe through bkit context provision and tells the agent on stdout what failed 2504ms
       ✓ prints nothing to stdout when every recipe succeeds 2571ms
       ✓ logs and carries on when the installed bkit has no provision verb 1205ms
> [bkit] TRUNCATED HERE — 121 lines omitted. Dropped content was NOT read.
     ✓ a stack named by BKIT_LOCAL_STACK never waits on the shared one 1657ms
     ✓ every worktree of one repo resolves the main checkout's lock, and waits on it 885ms
     ✓ a holder that stops before it answers fails the take at once instead of hanging 1805ms
     ✓ `run` holds the lock for the command and passes its exit status on 1452ms
 ✓ .bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts (4 tests) 8012ms
   ✓ tests/setup_suite.bash (4)
     ✓ CONTROL — without it, a temp repo's `git -C` init under the hook's GIT_DIR flips core.bare 848ms
     ✓ clears every GIT_* variable, so the same init stays in the temp dir 1443ms
     ✓ fails the run when a test writes an identity into the checkout, and removes it 1328ms
     ✓ fails the run when a test sets core.bare in the checkout, and puts it back 4388ms
 ✓ .bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts (3 tests) 3994ms
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 1859ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 776ms
     ✓ stops the step when the command crashed or was misused 1355ms
 ✓ .bkit/core/engine/checks/after/managed.integration.test.ts (1 test) 312ms
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
   ✓ bkit status — integration (4)
     ✓ exits 0 and prints [bkit-status] prefix 1516ms
     ✓ writes zero files (purely read-only — write-set assertion) 806ms
     ✓ reports installed hosts (at minimum claude and cursor on a fresh consumer) 947ms
     ✓ reports opencode as absent when .opencode/ does not exist 729ms
> [bkit] TRUNCATED HERE — 451 lines omitted. Dropped content was NOT read.
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-uninstall] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-uninstall] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 75 lines omitted. Dropped content was NOT read.
     ✓ bkit-plan.md: runs the same under zsh 1008ms
     ✓ bkit-ship.md: runs the same under zsh 1103ms
stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > P4.T7 — upgrade integration: heavy-customised-consumer scenario > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

> [bkit] TRUNCATED HERE — 33 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 153 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 146 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 148 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 146 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 124 lines omitted. Dropped content was NOT read.
[bkit-install] write version pin: .bkit/version (6.0.0)

 ❯ .bkit/core/engine/audits/hooks/gateguard-dogfood.integration.test.ts (84 tests | 1 failed) 74397ms
   ✓ dogfood authoring advisories — fire on the right paths (20)
     ✓ claude: a .bkit/core/workflows/ file gets the workflow advisory 590ms
> [bkit] TRUNCATED HERE — 49 lines omitted. Dropped content was NOT read.
   ❯ dogfood advisories — carry EVERY rule from their source section (6)
     ✓ every exempted rule's enforcing test still exists 2ms
     × .bkit/core/workflows/bkit-build.md: every rule of .bkit/authoring.md § All Agent-Read Files, § Prompts and Workflows, § Workflows Only appears in the advisory 688ms
     ✓ .bkit/core/workflows/bkit-build.md: the advisory does NOT defer to the section 574ms
     ✓ .bkit/core/prompts/bkit-plan-generate.md: every rule of .bkit/authoring.md § All Agent-Read Files, § Prompts and Workflows, § Prompts Only appears in the advisory 514ms
> [bkit] TRUNCATED HERE — 58 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 164 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 171 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 166 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 50 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 126 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (37 tests) 70499ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (32)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 2341ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 743ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 2273ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone 3848ms
     ✓ T16: a Jira-shaped commit scope with a digit in the key (ab1-123-slug) no-ops — no dispatch 2882ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 1750ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 2012ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 1808ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 5089ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 993ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 2376ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 1875ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 1689ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 2114ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 2161ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 2020ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 2775ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 2929ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 2778ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 2870ms
       ✓ a branch with no status.jsonl dispatches as before 1452ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 1612ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 4660ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 2171ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 1544ms
> [bkit] TRUNCATED HERE — 116 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 75 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 107 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 132 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
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
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 132 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 997ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 635ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 733ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 930ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 1440ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 917ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 819ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 632ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 600ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 692ms
     ✓ .husky/pre-push: a gate fails → no disk prune 822ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 689ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 1093ms
     ✓ a stale register stops the push before any gate runs 910ms
     ✓ bkit check fails → the push stops before any gate runs 628ms
     ✓ the dependency audit runs before any gate, when its script is present 769ms
     ✓ no dependency-audit script → skipped, the gates still run 722ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 898ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 796ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 900ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 825ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 869ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 848ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 856ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 920ms
   ✓ graphify register pre-push gate (8)
> [bkit] TRUNCATED HERE — 56 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 136 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 136 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 146 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 148 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 146 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 148 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 146 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 97 lines omitted. Dropped content was NOT read.
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
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/commands/install/check.integration.test.ts > dry-run-parity > check ≡ install writeset parity — cloud=opencode (dry-run parity, #245) > check --cloud=opencode writeset ≡ install --cloud=opencode writeset
[bkit-check] [dry-run] Running core payload pass
[bkit-check] [dry-run] core: .agents/context.md
[bkit-check] [dry-run] core: .agents/docs.md
[bkit-check] [dry-run] core: .agents/rules.md
[bkit-check] [dry-run] core: .agents/skills.md
[bkit-check] [dry-run] core: AGENTS.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-accessibility.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-adoption.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-agents.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-aio-seo.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-analytics.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-annotations.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-app-performance.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-app-store.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-architecture.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-ci-performance.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-config.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-cost.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-coverage.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-database.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-dead-code.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-deferrals.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-dependencies.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-issues.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-llm.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-logs.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-models.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-privacy.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-prompts.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-red-team.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-reliability.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-repo.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-security.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-slop.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-testing.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-usability.md
[bkit-check] [dry-run] core: docs/templates/bkit-plan.md
[bkit-check] [dry-run] core: .gitignore
[bkit-check] [dry-run] core: .gitattributes
[bkit-check] [dry-run] core: docs/architecture.md
[bkit-check] [dry-run] core: docs/data-schema.md
[bkit-check] [dry-run] core: docs/deployments.md
[bkit-check] [dry-run] core: docs/design.md
[bkit-check] [dry-run] core: docs/noise.md
[bkit-check] [dry-run] core: docs/observability.md
[bkit-check] [dry-run] core: docs/security.md
[bkit-check] [dry-run] core: docs/setup.md
[bkit-check] [dry-run] core: docs/technology.md
[bkit-check] [dry-run] core: docs/testing.md
[bkit-check] [dry-run] Running bkit docs pass
[bkit-check] [dry-run] core: .bkit/authoring.md
[bkit-check] [dry-run] core: .bkit/cloud.md
[bkit-check] [dry-run] core: .bkit/comparison.md
[bkit-check] [dry-run] core: .bkit/install.md
[bkit-check] [dry-run] core: .bkit/jsonl.md
[bkit-check] [dry-run] core: .bkit/LICENSE.md
[bkit-check] [dry-run] core: .bkit/lite.md
[bkit-check] [dry-run] core: .bkit/pipeline.md
[bkit-check] [dry-run] core: .bkit/providers.md
[bkit-check] [dry-run] core: .bkit/prompts.md
[bkit-check] [dry-run] core: .bkit/router.md
[bkit-check] [dry-run] core: .bkit/templates.md
[bkit-check] [dry-run] core: .bkit/trackers.md
[bkit-check] [dry-run] core: .bkit/workflows.md
[bkit-check] [dry-run] core: .bkit/README.md
[bkit-check] [dry-run] Running template copies pass
[bkit-check] [dry-run] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/Dockerfile
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/environment.json
[bkit-check] [dry-run] template added: .bkit/templates/.cursor/settings.json
[bkit-check] [dry-run] template added: .bkit/templates/.envrc
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/dependabot.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/renovate.json5
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-check] [dry-run] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-check] [dry-run] template added: .bkit/templates/.graphifyignore
[bkit-check] [dry-run] template added: .bkit/templates/.husky/pre-commit
[bkit-check] [dry-run] template added: .bkit/templates/.husky/pre-push
[bkit-check] [dry-run] template added: .bkit/templates/.lintstagedrc.json
[bkit-check] [dry-run] template added: .bkit/templates/.oxlintrc.json
[bkit-check] [dry-run] template added: .bkit/templates/.prettierignore
[bkit-check] [dry-run] template added: .bkit/templates/.serena/project.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/House/Filler.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/House/Hedging.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/House/LLMSlop.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale/styles/House/Verbose.yml
[bkit-check] [dry-run] template added: .bkit/templates/.vale.ini
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-expo.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-github.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-inngest.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-maestro.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-playwright.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-resend.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-sentry.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-serena.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-stripe.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-supabase.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-tavily.md
[bkit-check] [dry-run] template added: .bkit/templates/context/bkit-vercel.md
[bkit-check] [dry-run] template added: .bkit/templates/docs/capabilities.md
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/accepted-advisories.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/accepted-divergences.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/check-accepted-divergences.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/check-accepted-divergences.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/check-capstone.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/check-capstone.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/check-dependency-audit.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/check-dependency-audit.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/lanes/resolve-push-base.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/ci/lanes/resolve-push-base.test.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-check] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/ai.bkit.launchd.plist
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/launchd/launchd.env.example
[bkit-check] [dry-run] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-check] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-check] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-check] [dry-run] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-check] [dry-run] template added: .bkit/templates/slop-scan.config.json
[bkit-check] [dry-run] payload link: .bkit/core
[bkit-check] [dry-run] payload link: .bkit/shared
[bkit-check] [dry-run] core: .bkit/allowlist.json
[bkit-check] [dry-run] write version pin: .bkit/version (6.0.0)
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
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/commands/install/check.integration.test.ts > dry-run-parity > check ≡ install writeset parity — --opencode=opencode-go (Task 2.2) > check --opencode writeset ≡ install --opencode writeset (tier-writer path-set equality)
[bkit-check] [dry-run] write: .opencode/agents/bkit-audit-generate.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-build-challenge-1.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-build-challenge-2.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-build-install-skills.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-build-plan-convert.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-build-plan-current.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-build-plan-execute.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-build-plan-gaps-remediate.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-brainstorm-ideate-3.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-generate.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-organise.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-review-1.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-review-2.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-spike.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-update.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-plan-generate.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-plan-review-1.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-plan-review-2.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-plan-scope-check.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-plan-update.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-ship-conflict-resolve.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-ship-deferred-sweep.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-ship-update-docs.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-compress-markdown.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-decisions.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-roadmap.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-tracker.md
[bkit-check] [dry-run] write: .opencode/commands/bkit-auto.md
[bkit-check] [dry-run] write: .opencode/commands/bkit-build.md
[bkit-check] [dry-run] write: .opencode/commands/bkit-debug.md
[bkit-check] [dry-run] write: .opencode/commands/bkit-design.md
[bkit-check] [dry-run] write: .opencode/commands/bkit-plan.md
[bkit-check] [dry-run] write: .opencode/commands/bkit-ship.md
[bkit-check] [dry-run] opencode: .opencode/opencode.json
[bkit-check] [dry-run] opencode: .opencode/plugin/bkit-gateguard.js
[bkit-check] [dry-run] opencode: .opencode/plugin/bkit-readguard.js
[bkit-check] [dry-run] opencode: .opencode/plugin/bkit-rules.js
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

 ✓ .bkit/core/engine/commands/install/check.integration.test.ts (33 tests) 74838ms
   ✓ #255 #8 — bkit check gates opencode drift (no false positives) (12)
     ✓ clean install (openrouter + github) → check exits 0, zero would-write drift 3985ms
     ✓ clean install (openrouter + linear) → check exits 0, zero would-write drift 3243ms
     ✓ clean install (openrouter + jira) → check exits 0, zero would-write drift 4837ms
     ✓ clean install (opencode-go gateway, opencode-go block keyed by provider) → check exits 0, no false drift 4019ms
     ✓ clean install (ollama, no tracker) → check exits 0, no false drift 4763ms
     ✓ dropped permission block in opencode.json → check exits 1 (drift detected) 3583ms
     ✓ tampered gateguard.js INSIDE the managed block → check exits 1 (drift detected) 4052ms
     ✓ tampered gateguard.js OUTSIDE the managed block → check exits 0 (consumer-owned) 6490ms
     ✓ tampered agent mirror content → check exits 1 (writeset drift) 4334ms
     ✓ consumer-added extra key in opencode.json → check exits 0 (deep-contain, not drift) 3959ms
     ✓ opencode installed but no provider recorded → check exits 1 and names the fix 2345ms
     ✓ a consumer with no opencode host at all is not failed for a missing provider 2935ms
   ✓ bkit check — antigravity detected from any plugin file (1)
     ✓ deleted plugin.json + neutered guardrails command + deleted guardrails hook → check exits 1 naming each 5627ms
   ✓ check-owned-hooks (11)
     ✓ bkit check — exit code on a missing owned hook (6)
       ✓ clean install → check exits 0 2597ms
       ✓ missing .claude/hooks/bkit-guardrails.cjs → check exits 1 and names it 3233ms
       ✓ missing .cursor/hooks/bkit-gateguard.cjs → check exits 1 and names it 2562ms
       ✓ missing .codex/hooks/bkit-guardrails.cjs → check exits 1 and names it 1792ms
       ✓ missing .opencode/plugin/bkit-gateguard.js → check exits 1 and names it 1572ms
       ✓ claude host without the cloud module → no bkit-cloud-bootstrap.sh required 2298ms
   ✓ Scenario 4 — stale consumer prompts.md tolerated on upgrade (1)
     ✓ bkit check with stale consumer prompts.md does not emit Missing model lookup 1150ms
   ✓ Scenario: bkit check stale-marker gate is branch-scoped (#256) (2)
     ✓ on main: hard-fails (exit 1) and names the bkit-managed-stale BLOCKER 911ms
     ✓ on a feature branch: surfaces a non-blocking ADVISORY, no marker-drift hard-fail line 1083ms
stdout | .bkit/core/engine/install/modules/index.integration.test.ts > permissions-parity > cross-host gate parity — network allowlist > every derived base reaches BOTH fetch surfaces on every host (fetch tool + shell)
[test] core: .bkit/allowlist.json

 ✓ .bkit/core/engine/install/modules/index.integration.test.ts (149 tests) 45197ms
   ✓ install never writes or flags an adopted template copy (1)
     ✓ an adopted copy of every template stays byte-identical, with no write and no advisory for it 769ms
   ✓ module dispatch: --claude seeds only .claude/** + core (1)
     ✓ --claude writes only .claude/** + core files; no .cursor/, .github/, .vale*, .husky/ 842ms
   ✓ module dispatch: --core alone seeds no host or tooling file (1)
     ✓ core writes the core payload; nothing under Cursor/Claude/Husky/GitHub 662ms
   ✓ module dispatch: the network allowlist reaches every host whose hook reads it (5)
     ✓ --claude writes .bkit/allowlist.json and no .cursor/allowlist.json 521ms
     ✓ --codex writes .bkit/allowlist.json and no .cursor/allowlist.json 419ms
     ✓ --antigravity writes .bkit/allowlist.json and no .cursor/allowlist.json 429ms
     ✓ --cursor writes .bkit/allowlist.json and no .cursor/allowlist.json 348ms
     ✓ re-install moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 684ms
   ✓ core payload footprint (#265) (1)
     ✓ a fresh --claude install seeds every bkit:gate:* name and no tool script or devDep 962ms
   ✓ module dispatch: --full ≡ no flags (writeset equality) (1)
     ✓ --full and no flags produce the same set of modules dispatched 865ms
   ✓ module dispatch: idempotence — second install --full produces zero writes (1)
     ✓ running dispatchModules twice stabilises: third run = zero writes (true idempotence) 394ms
   ✓ permissions-parity (129)
     ✓ cross-host gate parity — shell (75)
       ✓ DENY on `rm -rf /` (recursive delete of the filesystem root) — all five hosts 354ms
       ✓ DENY on `rm -rf ~/*` (recursive delete of home) — all five hosts 347ms
       ✓ DENY on `rm -rf $HOME/*` (recursive delete of home) — all five hosts 313ms
       ✓ DENY on `rm -rf ~` (recursive delete of home itself) — all five hosts 306ms
       ✓ DENY on `rm -rf $HOME` (recursive delete of home itself) — all five hosts 307ms
       ✓ DENY on `rm -fr ~` (recursive delete of home, flags swapped) — all five hosts 419ms
       ✓ ASK on `brew install jq` (system package install) — all five hosts 378ms
       ✓ ASK on `pnpm publish` (package publish) — all five hosts 307ms
       ✓ ASK on `git clean -fd` (deletes untracked files) — all five hosts 315ms
       ✓ DENY on `git -C ../x push -fu origin dev` (force-push cluster after a git option) — all five hosts 339ms
       ✓ DENY on `git -c a=b push origin +dev` (+refspec after a git option) — all five hosts 375ms
       ✓ DENY on `git -C ../x push -vf origin dev` (force letter second, after a git option) — all five hosts 524ms
       ✓ ALLOW on `git -C ../x push --force-with-lease origin dev` (lease-guarded push after a git option) — all five hosts 345ms
       ✓ ALLOW on `git push -u origin feature` (upstream push, f in the branch) — all five hosts 303ms
       ✓ ALLOW on `git push origin dev` (plain push) — all five hosts 379ms
       ✓ ALLOW on `git push origin feat --force-with-lease` (lease-guarded push, flag after args) — all five hosts 329ms
       ✓ ASK on `git reset -q --hard HEAD` (--hard after another flag) — all five hosts 866ms
       ✓ ASK on `git reset HEAD --hard` (--hard after the commit) — all five hosts 577ms
       ✓ ALLOW on `git reset HEAD~1 --soft` (soft reset keeps the work) — all five hosts 663ms
       ✓ ASK on `git clean -df` (reordered short-flag cluster) — all five hosts 404ms
       ✓ ASK on `git clean -f -d` (split short flags) — all five hosts 512ms
       ✓ ASK on `git clean -xdf` (force last in the cluster) — all five hosts 573ms
       ✓ ALLOW on `git clean -n` (dry run deletes nothing) — all five hosts 499ms
       ✓ ALLOW on `git clean -nd` (dry run deletes nothing) — all five hosts 450ms
       ✓ ASK on `git checkout -q -- .` (flag before the pathspec) — all five hosts 497ms
       ✓ ASK on `git checkout .` (whole-tree pathspec without --) — all five hosts 660ms
       ✓ ALLOW on `git checkout feature-branch` (branch switch) — all five hosts 347ms
       ✓ ASK on `git restore --worktree .` (explicit worktree restore) — all five hosts 312ms
       ✓ ASK on `git rebase --interactive main` (long interactive flag) — all five hosts 371ms
       ✓ ASK on `git rebase main -i` (-i after the upstream) — all five hosts 386ms
       ✓ ALLOW on `git rebase main` (non-interactive rebase) — all five hosts 307ms
       ✓ ALLOW on `git stash list` (read-only stash command) — all five hosts 303ms
       ✓ ASK on `git push --no-verify` (skips pre-push hooks) — all five hosts 373ms
       ✓ ASK on `git commit --no-verify -m x` (skips commit hooks) — all five hosts 301ms
     ✓ shell reads of secret files — script hosts gate, permission tables do not (16)
       ✓ ASK on `cat ~/.ssh/id_rsa` (private-key material) — cursor/codex/antigravity; claude/opencode Bash rows allow 305ms
     ✓ cross-host gate parity — curl / wget in a shell (6)
       ✓ the allowlist is host-matched, not substring-matched, on every host that parses it 448ms
       ✓ a bare mention of curl in another command does not trip the gate 356ms
       ✓ a fetch wrapped in sh -c, $( ), backticks or ( ) is gated like a bare one 1151ms
       ✓ a wrapped fetch to an allowlisted host is not interrupted on any host 681ms
     ✓ cross-host gate parity — network allowlist (4)
       ✓ every host's hook finds the allowlist from the payload's repo dirs, whatever its own cwd 851ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts (344 tests) 123590ms
   ✓ gateguard behaviour parity — advisory content (210)
     ✓ claude (42)
       ✓ first edit to an existing file gets the investigation checklist 706ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 745ms
       ✓ a gate-config path gets the weaken-the-gate advisory 940ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 719ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 414ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 510ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 421ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 531ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 464ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 361ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 417ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 368ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 372ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 386ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 470ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 673ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 354ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 437ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 347ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 318ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 342ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 364ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 527ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 326ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 313ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 313ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 474ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 419ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 328ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 337ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 774ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 1085ms
       ✓ ordinary file README.md is not treated as a gate config 592ms
       ✓ ordinary file src/index.ts is not treated as a gate config 326ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 452ms
       ✓ mixed-purpose package.json is not treated as a gate config 313ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 362ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 476ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 302ms
     ✓ cursor (42)
       ✓ first edit to an existing file gets the investigation checklist 313ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 337ms
       ✓ a gate-config path gets the weaken-the-gate advisory 336ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 897ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 470ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 582ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 417ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 340ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 331ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 550ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 556ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 521ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 396ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 343ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 427ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 511ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 344ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 419ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 366ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 316ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 526ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 528ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 358ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 358ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 305ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 463ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 1696ms
       ✓ ordinary file README.md is not treated as a gate config 1146ms
       ✓ ordinary file src/index.ts is not treated as a gate config 664ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 458ms
       ✓ mixed-purpose package.json is not treated as a gate config 354ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 309ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 305ms
     ✓ opencode (42)
       ✓ first edit to an existing file gets the investigation checklist 342ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 605ms
       ✓ a gate-config path gets the weaken-the-gate advisory 345ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 332ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 402ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 343ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 508ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 415ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 462ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 587ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 331ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 400ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 313ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 308ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 358ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 304ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 308ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 360ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 323ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 352ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 410ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 394ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 1060ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 342ms
       ✓ ordinary file README.md is not treated as a gate config 325ms
       ✓ ordinary file src/index.ts is not treated as a gate config 683ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 379ms
       ✓ mixed-purpose package.json is not treated as a gate config 331ms
     ✓ codex (42)
       ✓ first edit to an existing file gets the investigation checklist 370ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 343ms
       ✓ a gate-config path gets the weaken-the-gate advisory 616ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 312ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 365ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 400ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 495ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 445ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 613ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 589ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 414ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 812ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 525ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 544ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 324ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 455ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 470ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 546ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 451ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 321ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 507ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 317ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 560ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 448ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 428ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 330ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 364ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 447ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 404ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 330ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 424ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 510ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 438ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 846ms
       ✓ ordinary file README.md is not treated as a gate config 1064ms
       ✓ ordinary file src/index.ts is not treated as a gate config 1227ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 790ms
       ✓ mixed-purpose package.json is not treated as a gate config 570ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 872ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 809ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 492ms
     ✓ antigravity (42)
       ✓ first edit to an existing file gets the investigation checklist 722ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 371ms
       ✓ a gate-config path gets the weaken-the-gate advisory 372ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 448ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 461ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 645ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 428ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 372ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 424ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 577ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 382ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 343ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 734ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 958ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 332ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 385ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 330ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 316ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 314ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 435ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 335ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 539ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 307ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 337ms
       ✓ ordinary file README.md is not treated as a gate config 338ms
       ✓ ordinary file src/index.ts is not treated as a gate config 318ms
       ✓ mixed-purpose package.json is not treated as a gate config 317ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 410ms
   ✓ gateguard behaviour parity — template copies (25)
     ✓ claude: a consumer's .bkit/templates/.vale.ini is not a gate config 309ms
     ✓ claude: bkit's own .bkit/templates/.vale.ini is a gate config 300ms
     ✓ cursor: a consumer's .bkit/templates/.vale.ini is not a gate config 352ms
     ✓ cursor: bkit's own .bkit/templates/.vale.ini is a gate config 319ms
     ✓ codex: a consumer's .bkit/templates/.vale.ini is not a gate config 471ms
     ✓ codex: a consumer's root .vale.ini is a gate config 313ms
     ✓ codex: bkit's own .bkit/templates/.vale.ini is a gate config 360ms
     ✓ codex: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 607ms
     ✓ antigravity: a consumer's .bkit/templates/.vale.ini is not a gate config 369ms
     ✓ antigravity: a consumer's root .vale.ini is a gate config 563ms
     ✓ antigravity: bkit's own .bkit/templates/.vale.ini is a gate config 554ms
     ✓ antigravity: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 488ms
     ✓ antigravity: a folder that merely ends in .bkit/templates is not a template copy 780ms
   ✓ gateguard behaviour parity — docs density advisory (25)
     ✓ claude: fires on docs/architecture.md (a docs markdown file) 863ms
     ✓ claude: fires on .bkit/shared/docs/architecture.md (nested docs tree) 488ms
     ✓ claude: does not fire on Documents/architecture.md (segment match, not substring) 940ms
     ✓ claude: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 585ms
     ✓ claude: does not fire on docs/knowledge.jsonl (gated on .md) 467ms
     ✓ cursor: fires on docs/architecture.md (a docs markdown file) 461ms
     ✓ cursor: fires on .bkit/shared/docs/architecture.md (nested docs tree) 671ms
     ✓ cursor: does not fire on Documents/architecture.md (segment match, not substring) 730ms
     ✓ cursor: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 341ms
     ✓ cursor: does not fire on docs/knowledge.jsonl (gated on .md) 415ms
     ✓ opencode: fires on docs/architecture.md (a docs markdown file) 317ms
     ✓ opencode: does not fire on Documents/architecture.md (segment match, not substring) 309ms
     ✓ opencode: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 373ms
     ✓ opencode: does not fire on docs/knowledge.jsonl (gated on .md) 325ms
     ✓ codex: fires on .bkit/shared/docs/architecture.md (nested docs tree) 339ms
     ✓ antigravity: fires on docs/architecture.md (a docs markdown file) 318ms
     ✓ antigravity: does not fire on docs/knowledge.jsonl (gated on .md) 325ms
   ✓ gateguard behaviour parity — dedup (10)
     ✓ claude: second touch of the same file in the same session is silent 409ms
     ✓ claude: a different file in the same session warns again 476ms
     ✓ cursor: second touch of the same file in the same session is silent 307ms
     ✓ cursor: a different file in the same session warns again 505ms
     ✓ opencode: a different file in the same session warns again 482ms
     ✓ codex: second touch of the same file in the same session is silent 424ms
     ✓ codex: a different file in the same session warns again 550ms
     ✓ antigravity: second touch of the same file in the same session is silent 310ms
     ✓ antigravity: a different file in the same session warns again 516ms
   ✓ gateguard behaviour parity — modes (15)
     ✓ claude: deny mode allows the retry (dedup lets the second call through) 390ms
     ✓ cursor: BKIT_GATEGUARD=deny blocks the first touch with the checklist 304ms
     ✓ antigravity: BKIT_GATEGUARD=deny blocks the first touch with the checklist 308ms
     ✓ antigravity: deny mode allows the retry (dedup lets the second call through) 364ms
   ✓ gateguard structural parity (21)
     ✓ codex advises on the *** Move to: target of a renaming patch 624ms
   ✓ gateguard parity — documented deviations (4)
     ✓ blocking is expressed differently per host but means the same thing 603ms
     ✓ Antigravity delivers the checklist by denying the first edit once; the retry passes 330ms
 ✓ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts (10 tests) 46825ms
   ✓ the push of a debug run in place on dev sends only the run's commits (4)
     ✓ push from an ahead local dev lands only the run commits 6111ms
     ✓ a foreign commit made mid-run never reaches the remote 5213ms
     ✓ feature-mode push on dev with a record never pushes the foreign commit 7060ms
     ✓ push from a level local dev is a plain push 5816ms
   ✓ the dev push lands on a moved origin and only with the run's own record (3)
     ✓ a local dev one remote commit behind origin/dev lands by replay, not a rejected push 5772ms
     ✓ with the record gone, the dev push refuses and the foreign commit stays local 3943ms
     ✓ two records on dev: each push selects its own FID's commits 4736ms
   ✓ the commits of a debug run in place on dev carry only the run's own paths (3)
     ✓ foreign staged and untracked files survive a run commit 2228ms
     ✓ close commit tree excludes foreign files 2792ms
     ✓ debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not 3150ms
 ✓ .bkit/core/engine/commands/install/install.integration.test.ts (66 tests) 98548ms
   ✓ Scenario 1 — blocker: no package.json → exit 1, zero writes (4)
     ✓ spawning bkit-install with no package.json exits 1 and produces zero output files 946ms
   ✓ Scenario 2 — advisory checklist: N triggers → exit 0, checklist rendered (6)
     ✓ runPostInstallCheck adds gh-mcp-token-unset-shell when BKIT_GH_TOKEN is unset 435ms
     ✓ full pipeline: combined Phase 1 + Phase 3 findings all appear in final banner 405ms
     ✓ no duplicate ids in the final checklist 342ms
   ✓ Scenario 3 — bkit check: Phase 3 detectors run for parity with install (4)
     ✓ runPostInstallCheck includes Phase 3 detector findings (gh-mcp-token-unset-shell when BKIT_GH_TOKEN unset) 401ms
   ✓ Scenario 5 — full install smoke against scratch consumer (1)
     ✓ bkit install --full against a clean consumer exits 0 and writes core mirrors 3090ms
   ✓ #507 — full install writes core/ and shared/, never a template or a stray LICENSE.md (1)
     ✓ every payload file lands, no template does, and .bkit/LICENSE.md is the only LICENSE.md 2722ms
   ✓ Scenario 5b — docs/roadmap.md is consumer-owned: bkit install never creates it (#380 matrix row 18) (1)
     ✓ `bkit install --full` against a clean consumer does NOT create docs/roadmap.md, and `bkit check` reports clean drift 3626ms
   ✓ Scenario 6 — Phase 3 blocker exit-1 + recovery line (P2.T9) (2)
     ✓ Phase 3 blocker findings are distinguished from advisories (severity=blocker) 342ms
   ✓ Scenario 7 — bkit install subprocess exits 1 on Phase 3 blocker (P2.T9) (1)
     ✓ bkit install exits 1 when Phase 3 blocker detected + recovery line in output 1661ms
   ✓ Scenario 8 — bkit install --auto-revert reverts on Phase 3 blocker (P2.T10) (1)
     ✓ --auto-revert: exits 1, auto-revert message present, Tier-1 writes reverted 3943ms
   ✓ MCP config — fresh install and a consumer's own file (5)
     ✓ fresh install via bkit install --full (no --tracker) scaffolds .mcp.json with empty mcpServers 2927ms
     ✓ bkit install --tracker=github seeds .mcp.json with only that tracker's entry 2482ms
     ✓ bkit install --tracker=linear seeds .mcp.json with only that tracker's entry 2627ms
     ✓ bkit install --tracker=jira seeds .mcp.json with only that tracker's entry 2682ms
     ✓ re-install with no tracker (bkit owns no entry) leaves a consumer .mcp.json byte-for-byte unchanged 1756ms
   ✓ Challenge Finding 3 — cloud/tracker constraint-before-write regression (9)
     ✓ --tracker=github --auto=cursor exits non-zero (constraint mismatch) 717ms
     ✓ --tracker=jira --auto=claude exits non-zero (constraint mismatch) 852ms
     ✓ --tracker=jira --auto=cursor exits non-zero (constraint mismatch) 679ms
     ✓ --tracker=jira --auto=opencode exits non-zero (constraint mismatch) 1038ms
     ✓ --tracker=github --auto=cursor does NOT write bkit.tracker.default to package.json (no partial write) 621ms
     ✓ --tracker=jira --auto=claude does NOT write bkit.tracker.default to package.json (no partial write) 625ms
     ✓ --tracker=jira --auto=cursor does NOT write bkit.tracker.default to package.json (no partial write) 765ms
     ✓ --tracker=jira --auto=opencode does NOT write bkit.tracker.default to package.json (no partial write) 638ms
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 1472ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 608ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 726ms
     ✓ explicit `bkit help` prints the same usage and exits 0 544ms
     ✓ `bkit check --claude` (stray module flag) errors 610ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 514ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 1593ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 2016ms
     ✓ `bkit install --ci` is an unknown flag and writes nothing (#489) 1270ms
     ✓ `bkit install --claude` writes no bkit-ci.yml, .vale.ini or hooks (templates); no .cursor 3350ms
     ✓ `bkit check` after a --cursor-only install reports no drift (no false .claude drift) 4194ms
     ✓ `bkit install --tracker=github` alone switches the tracker on every installed host 4178ms
     ✓ `bkit install --tracker=linear` alone switches the tracker on every installed host 3625ms
     ✓ `bkit install --tracker=jira` alone switches the tracker on every installed host 3334ms
     ✓ `bkit install --claude --tracker=github` also re-renders the installed cursor host 3985ms
   ✓ opencodeProviders persist block — sequential installs (issue #281 Task 2) (1)
     ✓ two sequential installs: opencodeProviders = both, opencodeProvider = second 2140ms
   ✓ T10 — claudeAllowDerived survives a real install (1)
     ✓ records the resolved grant set, then updates it when allowed-domains shrinks 2498ms
   ✓ Scenario — Codex + Antigravity install side by side without conflict (#534) (3)
     ✓ combined `--codex --antigravity`: skills at separate paths, check green, advisory fires 2239ms
     ✓ separate `--antigravity` then `--codex`: both land at their own paths, check green 2895ms
     ✓ separate `--codex` then `--antigravity`: both land at their own paths, check green 2598ms
   ✓ Scenario — tracker switch and active opencode provider removal leave check green (7)
     ✓ --tracker=linear then --tracker=github removes the first MCP entry everywhere 3154ms
     ✓ --tracker=jira then --tracker=github removes the first MCP entry everywhere 2572ms
     ✓ --tracker=linear then --tracker=jira removes the first MCP entry everywhere 2784ms
     ✓ --tracker=jira then --tracker=linear removes the first MCP entry everywhere 2125ms
     ✓ a linear entry the consumer edited survives the switch, with a warning 1350ms
     ✓ a jira entry the consumer edited survives the switch, with a warning 1199ms
     ✓ uninstall --opencode=<active> re-renders the agents to the remaining provider 2154ms
   ✓ 5.x package.json layout — the tracker survives the first re-render (1)
     ✓ bkit install on the flat bkit.issueTracker layout renders the tracker and check passes 2128ms
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

 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (43 tests) 80978ms
   ✓ bkit worktrees setup — mint (create) (19)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 2612ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 1836ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 1686ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 2292ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 2537ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 3873ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1977ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 1811ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 2547ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 1828ms
     ✓ design installs dependencies like build and debug 1844ms
     ✓ plan installs dependencies like build and debug 1345ms
     ✓ design stops on a failed install (5) 1387ms
     ✓ plan stops on a failed install (5) 1323ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1361ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1596ms
     ✓ fails without minting when origin cannot be reached 328ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1213ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1178ms
   ✓ bkit worktrees setup — mint (resume) (19)
     ✓ rebases onto origin/dev and clears a stale sentinel 2828ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 4726ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 4094ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2226ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 2069ms
     ✓ debug: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 2968ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 2753ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 2555ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 2791ms
     ✓ commits leftovers when a copy entry points outside the checkout 1996ms
     ✓ never commits the entries setup copies in from the main checkout 1899ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 1949ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 1483ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 1405ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 1433ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 727ms
     ✓ leaves a clean worktree's history alone 1494ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 1782ms
     ✓ does not mark a resumed worktree it did not create 865ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 637ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 844ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 1075ms
   ✓ bkit worktrees remove (1)
     ✓ removes a worktree setup created, uncommitted changes and all, and clears the marker 761ms
 ✓ .bkit/core/engine/commands/install/upgrade.integration.test.ts (55 tests) 103240ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (5)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 1177ms
     ✓ install --claude does not write Serena or graphify examples 1921ms
     ✓ upgrade does not rewrite a consumer-owned bkit-graphify.sh 1173ms
     ✓ does not rewrite a consumer-owned .github/renovate.json5 3830ms
     ✓ preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6) 2347ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 4851ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 4657ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 3400ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 5218ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 7616ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 9049ms
     ✓ malformed .mcp.json fails install instead of being overwritten 783ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 4183ms
     ✓ an adopted copy of every template survives upgrade and check 4202ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 5160ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 3736ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 1351ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 4828ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 3105ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (4)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 2625ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 3709ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 2059ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 1995ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 1924ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 1893ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 2086ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 1090ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 1093ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 1126ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 1112ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 1060ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 1164ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 1208ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 1235ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 1481ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 1444ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 837ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ starts the package runner for the install and the re-exec 567ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/hooks/gateguard-dogfood.integration.test.ts > dogfood advisories — carry EVERY rule from their source section > .bkit/core/workflows/bkit-build.md: every rule of .bkit/authoring.md § All Agent-Read Files, § Prompts and Workflows, § Workflows Only appears in the advisory
AssertionError: expected [ 'Step conditionality and rows' ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "Step conditionality and rows",
+ ]

 ❯ .bkit/core/engine/audits/hooks/gateguard-dogfood.integration.test.ts:436:23
    434|           return !haystack.includes(words(needleFor(lead)));
    435|         });
    436|       expect(missing).toEqual([]);
       |                       ^
    437|     });
    438|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 48 passed (49)
      Tests  1 failed | 1662 passed (1663)
   Start at  11:38:07
   Duration  170.58s (tests 98%, transform 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/699-engine-run-completeness/build-group-gate-3-4.log.reports/vitest-55404.xml
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 2902 of 18569 lines (206 KB of 1.3 MB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
