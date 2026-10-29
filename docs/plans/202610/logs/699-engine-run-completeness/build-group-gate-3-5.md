
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

[test-timeout-budget] load average 21.2 on 10 cores: unit limits 10606ms per test, 21211ms per hook (x2.12)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/ci/ci.test.ts (47 tests) 51306ms
   ✓ bkit ci slop — gate decision (6)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 944ms
     ✓ fails on a net score rise with no net count change 1137ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1182ms
     ✓ treats a net score at or below 0.001 as float noise 1315ms
     ✓ passes when the change only resolves findings 911ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1062ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 365ms
     ✓ skips (exit 0) when the base resolves to HEAD 602ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1633ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 817ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 547ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1304ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1241ms
     ✓ exits 4 on a dropped net field instead of silently passing 1232ms
     ✓ exits 4 on no summary instead of silently passing 1296ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1186ms
     ✓ exits 5 when the base worktree cannot be created 821ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1754ms
   ✓ bkit ci slop — real slop-scan (3)
     ✓ a genuinely new finding fails the gate 3293ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 2668ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 3155ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 3469ms
   ✓ bkit ci prose — gate (5)
     ✓ skips with exit 0 when vale is not installed 344ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 1055ms
     ✓ fails (exit 1) when vale reports alerts 883ms
     ✓ exits 6 on a vale runtime error 1001ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 707ms
     ✓ falls back to vale sync when the main worktree has none 771ms
     ✓ skips loudly with exit 0 when vale sync cannot restore it either 1006ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 764ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 703ms
     ✓ is a usage error when the commit cannot be read 666ms
   ✓ bkit ci min-push (8)
     ✓ exits 0 when every changed file is a plan log or a ledger 857ms
     ✓ exits 1 naming the files outside, whatever the commit message says 1071ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1628ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 1369ms
     ✓ reads bkit.testing.minPushPaths from package.json; an explicit [] turns it off 2510ms
     ✓ a top-level glob does not reach into folders 888ms
     ✓ a push that changes no files is not proven a min push 1286ms
     ✓ exits 7 when a commit or its base cannot be read 930ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (116 tests) 51798ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 542ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 524ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 679ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 691ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 606ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 503ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 359ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 435ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 583ms
     ✓ PASS is 0 failures with or without reports 420ms
     ✓ clears a previous attempt's reports before the gate runs 592ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 460ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1184ms
     ✓ a log under the outbox is named main-checkout relative in the record 740ms
     ✓ a log small enough is copied whole: not clamped, raw null 640ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 872ms
   ✓ bkit tests plan-check (27)
     ✓ plan-check accepts a matrix that maps every test-bearing task 306ms
   ✓ bkit tests red / green (29)
     ✓ records a red: the named test failed; row, log and test snapshot written, path passed whole 1579ms
     ✓ refuses a run that is not a red: exit 1, reason printed, no row 957ms
     ✓ a red already recorded for the unchanged test stands on resume; a changed test runs again 1068ms
     ✓ refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2) 862ms
     ✓ a script that cannot run is exit 4, not a rejected red 545ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 450ms
     ✓ green refuses a plan with no task markers 457ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 916ms
     ✓ green: --group audits only that group's tasks 893ms
     ✓ green: --group naming a group with no tasks is refused 484ms
     ✓ green: a code fence never closed is the reason, not missing task markers 438ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1118ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1228ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1231ms
     ✓ green prints a verdict and a fixable per gap 1337ms
     ✓ green verdict is FAIL when a gap is unfixable 1032ms
     ✓ green leaves a diff-reading kind fixable null 1119ms
     ✓ green prints verdict null when a gap needs a diff read 1097ms
     ✓ green: lists each gap kind, with the diff for a test changed since its red 687ms
     ✓ green: a red recorded for a different test than the plan names is a red-mismatch 828ms
     ✓ green: a planned test that moved is a red-mismatch saying whether the recorded test passes now 898ms
     ✓ green: every test a task names needs its own red and its own pass 788ms
     ✓ test order (7)
       ✓ green finds the code commit for DONE — TASK N 2352ms
       ✓ a red recorded before the task's code commit stands, across a resumed execute 2408ms
       ✓ a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked 1799ms
       ✓ green emits a test-changed gap for a red whose test gained added lines only 1640ms
       ✓ green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green 2327ms
       ✓ green refuses an exception-only task from a workflow step commit 1422ms
       ✓ green clears an exception-only task from a human commit 1192ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (84 tests) 53571ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (23)
     ✓ modified ledger under the FID logdir is staged and committed 582ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 614ms
     ✓ brand-new untracked ledger is staged and committed 716ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 618ms
     ✓ path containing a space is staged and committed 580ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 455ms
     ✓ staging failure: exit 4 and no commit is created, no false success 452ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 529ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 440ms
     ✓ --mode=stage stages the sweep but creates no commit 528ms
     ✓ top-level docs/*.md is committed under scope=pr, not under scope=core or scope=full 1565ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 814ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 379ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 364ms
     ✓ --root defaults to the working directory 437ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 1060ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 728ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 1051ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 1128ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 530ms
     ✓ a path outside the checkout exits 6 with nothing committed 382ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 426ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 321ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 1345ms
     ✓ --path records its commit on the run's record, like every other commit mode 1360ms
     ✓ a recorded ledger commits only the rows the run appended 2535ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 3300ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 2772ms
     ✓ commitBookkeeping refuses when a recorded path changed 1616ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 1775ms
     ✓ under --mode=commit counts the squashed paths as something to commit 2041ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 954ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 1300ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 911ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 725ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 321ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 416ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 423ms
     ✓ carries untracked ledgers too 604ms
     ✓ keeps rows on separate lines when the destination has no final newline 315ms
   ✓ bkit ledgers only-bookkeeping (5)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 741ms
     ✓ a source file in the range: exit 7, path listed 1058ms
     ✓ another FID's plan file in the range: exit 7 981ms
     ✓ from not an ancestor of to: exit 7 980ms
     ✓ unknown commit exits 3; a missing flag exits 2 620ms
   ✓ bkit ledgers append (15)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 354ms
     ✓ append keeps a row's own repo 333ms
     ✓ append --ledger=stats takes compliance, counter and outcome rows 302ms
     ✓ append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts 324ms
     ✓ append bumps a round-second mint 385ms
     ✓ append refuses a writer not listed for the kind 470ms
     ✓ append starts a new line when the ledger lacks its final newline 924ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 498ms
     ✓ triage keeps an own-cycle deferral exempt 364ms
     ✓ triage marks an unjustified deferral lazy 450ms
     ✓ triage writes an unjustified row with a minted ts 451ms
     ✓ triage writes no row for a closed deferral 698ms
     ✓ triage reports an adjudicated unjustified row outside exempt 495ms
     ✓ triage ignores another feature's deferral rows 445ms
     ✓ triage writes nothing when the FID has no deferral row 433ms
     ✓ triage refuses a plan with no task blocks 940ms
     ✓ triage refuses a plan whose task blocks do not parse 696ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 617ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 55377ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 469ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 828ms
     ✓ always writes the marker, even with no plan 842ms
     ✓ writes the linear marker shape, taking the tracker from package.json 911ms
     ✓ writes the jira marker shape, taking the tracker from package.json 913ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 681ms
     ✓ refuses a linear marker with fid "12-x" issue "ABC-1" (exit 2) 329ms
     ✓ refuses a PR from dev, main, or the base itself 525ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1395ms
     ✓ retries a failed create once, and exits 5 when it fails twice 867ms
     ✓ exits 5 when the open-PR probe errors 939ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 849ms
     ✓ prs open refuses --base=main 327ms
     ✓ prs open refuses --base=origin/main, the same branch as main 382ms
     ✓ prs open still opens against any other base 565ms
     ✓ exits 6 when the created PR's base is not --base 612ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 691ms
     ✓ exits 1 with found=false when there is none 1017ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 656ms
     ✓ --number reads one PR, mergeable included 461ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 778ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1448ms
     ✓ refuses a bad --state or --number 665ms
   ✓ bkit prs scan-body (10)
     ✓ flags [skip ci] in the landed commit body (exit 1) 940ms
     ✓ flags [ci skip] in the landed commit body (exit 1) 711ms
     ✓ flags [no ci] in the landed commit body (exit 1) 402ms
     ✓ flags [skip actions] in the landed commit body (exit 1) 308ms
     ✓ flags [actions skip] in the landed commit body (exit 1) 658ms
     ✓ flags [SKIP CI] in the landed commit body (exit 1) 380ms
     ✓ passes a token-free body 550ms
     ✓ passes a deliberate token in the SUBJECT with a clean body (docs-only close) 454ms
     ✓ exits 2 on an empty or option-like sha, 3 on an unreadable one 361ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 667ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 892ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 1163ms
     ✓ drops the force-build marker from the title subject 692ms
     ✓ takes an explicit --subject 609ms
     ✓ runs no merge when the PR is already MERGED 828ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1121ms
     ✓ prs merge refuses a PR whose base is main 721ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 612ms
     ✓ prs merge refuses when the PR base is unknown 570ms
     ✓ prs merge reads the base from the one pr view it already makes 1181ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 1262ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 453ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 543ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 444ms
     ✓ never reads dev's required checks without --only-if-required 509ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 711ms
     ✓ updates when a dev ruleset requires status checks 695ms
     ✓ updates when dev's branch protection requires status checks 655ms
     ✓ ignores dev rulesets that require no checks 1097ms
     ✓ updates when the repo cannot be resolved 1193ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 1065ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 1201ms
     ✓ is not green when a check failed, naming it (exit 1) 870ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 463ms
     ✓ is not green on an empty rollup (total 0) 1180ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 965ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1265ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 562ms
     ✓ is a no-op when the title already says so 696ms
     ✓ strips the marker, with or without its bkit prefix 961ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1650ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ scans a clean landed body and records the close-transport row 590ms
     ✓ records a skip token found in the body, then exits 1 373ms
     ✓ exits 8 on an unreadable commit, writing nothing 531ms
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 547ms
     ✓ needs --scan or --scan-result 475ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (93 tests) 65663ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 660ms
     ✓ done --group writes group on the row 792ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 832ms
     ✓ carries extra fields, parsed as JSON when they are JSON 524ms
     ✓ rejects ["--failures=-1"] 371ms
     ✓ reports a failed commit with exit 8 without writing the row 792ms
     ✓ a failed commit leaves no row staged in the index 924ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1427ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1331ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1089ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1012ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1335ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 812ms
     ✓ fails when no row was written for the step 344ms
     ✓ --ref reads the status file as committed on that ref, not from disk 730ms
     ✓ --ref exits 3 when the ref does not carry the status file 863ms
     ✓ fails on a placeholder left in the artifact 1082ms
     ✓ fails when the row's verdict differs from the artifact's 1524ms
     ✓ fails when the row does not list the artifact, or carries another attempt 727ms
     ✓ fails on a missing artifact 955ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 904ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 302ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 453ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 327ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 459ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 575ms
     ✓ fails a diagnose row missing its strategy, passes with it 915ms
     ✓ fails a run-tests row missing its scope, and an empty scope 1067ms
     ✓ names every missing field at once 633ms
     ✓ asks nothing of a step that writes none of them 383ms
   ✓ bkit steps finish (14)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 1249ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 706ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 359ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 892ms
     ✓ records the header's Strategy on the row 650ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 364ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 889ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 315ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 389ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 918ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1381ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 1066ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 1231ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1895ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 957ms
     ✓ --post needs --number; without --post there is no tracker key 414ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 343ms
     ✓ --strip-header drops the prior version's own header 365ms
     ✓ exits 4 when the prior version is missing or empty 360ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 423ms
     ✓ checks the FID's shape for the wired tracker 431ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 1509ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 376ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 1345ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 1417ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 1067ms
       ✓ gate --issue without --fid is a usage error 430ms
       ✓ gate --issue="" under none keeps today's check 420ms
     ✓ --attempt-of checks the row carries the derived counter 945ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 2554ms
     ✓ writeStepRow refuses when a recorded path changed 3275ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 1639ms
     ✓ writeStepRow appends its commit sha to the record 2605ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 2731ms
 ✓ .bkit/core/engine/commands/land.test.ts (30 tests) 53128ms
   ✓ pushToDev (16)
     ✓ lands the commit on origin/dev and leaves the main checkout alone 2027ms
     ✓ never pushes local dev commits missing from origin/dev 3108ms
     ✓ dev moved: rebuilds on the new dev and pushes again 4422ms
     ✓ dev moved before every push: exhausted, nothing landed 5624ms
     ✓ any other refusal is returned, not retried 4409ms
     ✓ pushToDev replays a commit range onto origin/dev 3971ms
     ✓ a replay retries on the new dev when dev moved 4992ms
     ✓ pushToDev log line names what it lands 4006ms
     ✓ runs no git hooks in the throwaway checkout, and says so 3601ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2811ms
     ✓ a push that fails without a server answer is returned once, never retried 1886ms
     ✓ a failed fetch is returned before anything is built 1348ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 3643ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2779ms
     ✓ lands from a clone whose fetch refspec omits dev 2611ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1538ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 67076ms
   ✓ gateguard opencode plugin — advisory mode (default) (7)
     ✓ emits reuse checklist on first write to a NEW (nonexistent) file 1188ms
     ✓ keeps the reuse checklist when the write CREATES the file (pre-write snapshot) 666ms
     ✓ (V1) keeps the reuse checklist when the write CREATES the file (pre-write snapshot) 715ms
     ✓ emits investigation checklist on a write to an EXISTING file 1044ms
     ✓ emits investigation checklist on first edit to a file 1106ms
     ✓ dedups: second write to the same file in the same session emits nothing 1519ms
     ✓ warns again for a different file in the same session 1568ms
   ✓ gateguard opencode plugin — deny mode (2)
     ✓ throws with advisory text on first write (blocks edit) 1013ms
     ✓ allows retry (second call is a no-op after dedup marked) 1160ms
   ✓ gateguard opencode plugin — subagents are NOT exempt (3)
     ✓ a subagent session editing a file DOES get the advisory (exemption removed) 1263ms
     ✓ orchestrator session gets the advisory too — same treatment either way 1684ms
   ✓ gateguard opencode plugin — gate-config advisory (9)
     ✓ tsconfig.json triggers config advisory 2096ms
     ✓ flags vitest.config.ts as gate config 1348ms
     ✓ flags eslint.config.mjs as gate config 1157ms
     ✓ flags .prettierrc as gate config 1011ms
     ✓ flags slop-scan.config.json as gate config 900ms
     ✓ flags .vale.ini as gate config 1268ms
     ✓ flags .lintstagedrc.json as gate config 1681ms
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 1567ms
     ✓ source file is not treated as gate config 1786ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 2005ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 4031ms
     ✓ patch (v1 driver): checks every Add / Update / Move-to / Delete target 5511ms
     ✓ apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target 4708ms
     ✓ apply_patch (v1 driver): checks every Add / Update / Move-to / Delete target 5030ms
     ✓ deny mode blocks when any patch target is a first touch, and records all of them 4203ms
     ✓ deny mode still blocks when only one of several patch targets is new to the session 2403ms
   ✓ dual driver shape (OpenCode 1.x server() + 2.0 setup()) (6)
     ✓ both drivers emit the same advisory for the same edit 2065ms
     ✓ V1 driver reads the real 1.x arg key `filePath` 1442ms
     ✓ deny mode blocks the first touch on BOTH drivers 1002ms
   ✓ gateguard plugin — docs/*.md density advisory (#422) (6)
     ✓ appends the density advisory for a docs/ markdown file 1427ms
     ✓ does NOT match a Documents/ ancestor (segment match, not substring) 1057ms
     ✓ excludes docs/plans/ (plan template governs those, not the docs register) 721ms
     ✓ does NOT match docs/knowledge.jsonl (gated on .md) 1111ms
     ✓ matches a nested docs/ tree via segment match (.bkit/shared/docs/architecture.md) 1322ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (161 tests) 134341ms
   ✓ bkit runs gate (58)
     ✓ --fetch refreshes origin/<branch> before gating 1080ms
     ✓ tells an API error (20) from no run (10) 400ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 305ms
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 313ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 1273ms
       ✓ a source change past the validated head refuses (17) and names the path 883ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 1017ms
       ✓ --validated equal to --head is the plain head check 395ms
       ✓ --validated without --month / --fid is a usage error (2) 725ms
       ✓ a validated sha that is not an ancestor refuses (17) 820ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 525ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 961ms
   ✓ bkit runs wait (10)
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 1304ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 680ms
     ✓ CLI: a failed gh workflow run exits 5 1824ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1636ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 1049ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1978ms
     ✓ a failed re-trigger push names the cause in the log 2079ms
     ✓ a failed re-trigger push leaves no orphan commit behind 2425ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 4630ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1750ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 847ms
     ✓ gh-error: every poll errored 1044ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1252ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1716ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 2162ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1876ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 1049ms
     ✓ CLI: verdict JSON, body scan, exit codes 2973ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 4702ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 4614ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1543ms
     ✓ re-trigger on dev only uses the record of its own FID 3875ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 2198ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ flags [SKIP CI] inherited into the landed commit body 317ms
     ✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 1415ms
     ✓ an empty or unreadable sha is an error, not a clean result 405ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 1531ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 919ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 1095ms
     ✓ a refused capstone records FAIL with its reason 1535ms
     ✓ an unreadable PR is an API error (20) with no head 604ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 2129ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 2277ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1798ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 1098ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1697ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 2624ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 3407ms
     ✓ --file and --step go together 7145ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (210 tests) 82218ms
> [bkit] TRUNCATED HERE — 72 lines omitted. Dropped content was NOT read.
     ✓ a bare number with no issue prints a hint to write #N 588ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 3004ms
     ✓ a missing prompt file exits 7; --prompt-file with --branch is a usage error 483ms
   ✓ bkit fids resolve (12)
     ✓ 1. a FID the prompt names wins 608ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ refuses (exit 9) to mint from the workflow name when the prompt holds only a bare number 885ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 1400ms
     ✓ 6. a FID that fails the format check exits 1 1085ms
     ✓ a missing title or prompt file exits 7 472ms
   ✓ bkit fids plans (2)
> [bkit] TRUNCATED HERE — 43 lines omitted. Dropped content was NOT read.
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 698ms
     ✓ fails with a fetch error when there is no origin to rebase onto 819ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 1047ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 829ms
     ✓ tells a caller inside the removed worktree where to cd 680ms
     ✓ fails with its own exit code when git cannot remove a marked path 460ms
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 2222ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
(node:59812) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
   ✓ check-dependency-audit (5)
     ✓ exits 1 on a missing acceptance, 0 when clean, and 1 on a report with no advisories 913ms
     ✓ rejects an --unreachable value that is neither fail nor warn 482ms
   ✓ shipped copy-and-own test files (5)
     ✓ ci/check-accepted-divergences.test.mjs passes when run on its own 688ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 2471ms
       ✓ falls back to event.before when gh prints unparseable output 1689ms
       ✓ reports last-green-run as the source when the green head is an ancestor 3834ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 4288ms
         ✓ tests ancestry against --head, not HEAD 2947ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 2437ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 37873ms
   ✓ normFlag (11)
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 2178ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 1567ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 1376ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 1328ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 695ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 737ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 512ms
     ✓ --file into a missing directory is refused, not created 476ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ fires the byte cap independently of the line cap 655ms
     ✓ reports counts that match the clamped file, and the artifact as given 482ms
     ✓ keeps both ends of a long failing run under debug-evidence 463ms
     ✓ never drops a signal line buried in the middle 1179ms
     ✓ keeps every signal line when they are scattered throughout 943ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 5728ms
     ✓ keeps each context's own section banner and drops every other context's 9146ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 1143ms
   ✓ untouched originals (keepRaw) (4)
     ✓ clamp keeps the original in the outbox, never under logs/, and the record names it with its source 890ms
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1145ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1577ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1744ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 968ms
     ✓ fetches the issue and its comments as GitHub returns them 1126ms
   ✓ linear client (4)
     ✓ GraphQL errors map by code; DNS failure is network 394ms
   ✓ postCommentOnce (4)
     ✓ skips issue-less runs and tracker none 488ms
     ✓ records an engine-action row and skips the same key + body on a re-run 1794ms
     ✓ a recent identical comment counts as done (the final close comment) 2239ms
     ✓ a failed post reports done false with the reason and never leaks a token 1802ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 2333ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker 354ms
     ✓ a different marker hash posts 1295ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 752ms
   ✓ linear: errors on a non-2xx answer and comment paging (2)
     ✓ a 400 carrying a GraphQL RATELIMITED / AUTHENTICATION_ERROR code maps by code 414ms
     ✓ fetchIssue pages comments past the first page 444ms
   ✓ jira: HTML comment pages and non-string bodies (2)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 1231ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2288ms
     ✓ a refused dev push is logged, never fails the close 3274ms
     ✓ an unreachable remote is logged, never fails the close 1131ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (42 tests) 68678ms
   ✓ splitSlug (6)
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 2214ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 2070ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 2905ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1345ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 900ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 878ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1327ms
     ✓ an unpinned repo reports nulls and asks no registry 1347ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 1575ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 917ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 2595ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1777ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ treats regex characters in a skill name literally 644ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 1076ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 1787ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 2365ms
     ✓ runs from the checkout top even when called from a subfolder 1800ms
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 690ms
     ✓ resolves config from the repo root when run from a subdirectory 691ms
     ✓ exits 6 when the PUT fails 902ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1060ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 1947ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 754ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 523ms
     ✓ exits 6 when the api answer is not JSON 906ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (33 tests) 12704ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses a finding with 16 planned tests 422ms
     ✓ LOW finding becomes a deferral row 377ms
     ✓ a failed LOW deferral append leaves the plan unchanged; the re-run writes both 725ms
     ✓ writes LOW deferrals at the checkout root when run from a subfolder 421ms
   ✓ bkit challenge gate (5)
     ✓ challenge gate writes a challenge-gate row 1758ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 2094ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 637ms
     ✓ challenge gate exits 5 when --base names no commit 330ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (26 tests) 11675ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ bkit disk prune — step files (9)
     ✓ min runs only min steps; max runs both 877ms
     ✓ a failing or throwing step is reported and the next step still runs 651ms
     ✓ a broken file is reported and the other file's steps still run 1109ms
     ✓ drops an invalid step and runs the valid ones 625ms
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ refuses while the holder's run stepped in the last 30 minutes 523ms
     ✓ reclaims a finished (DONE or FAILED) run's old lock 708ms
     ✓ reclaims a fresh lock over a finished run: the lock file's age is not checked 388ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 457ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 1167ms
     ✓ passes every rule on a clean head 559ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 1329ms
 ✓ .bkit/core/engine/commands/lib.test.ts (65 tests) 14928ms
   ✓ --json on every registered command (3)
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ passes when nothing changed 362ms
     ✓ passes when only another key changed, such as a branch's upstream 493ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 521ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 606ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 743ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (41 tests) 5814ms
   ✓ runLines (5)
> [bkit] TRUNCATED HERE — 184 lines omitted. Dropped content was NOT read.
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 858ms
     ✓ is null when pnpm fails or prints something that is not a version 1415ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ passes actionlint 514ms
   ✓ ship gate against the template's job names (2)
     ✓ refuses when the template's capstone job fails 348ms
 ✓ .bkit/core/engine/tools/instructions-coverage.test.ts (24 tests) 3791ms
   ✓ the repo (7)
> [bkit] TRUNCATED HERE — 752 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 359 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (52 tests) 1486ms
   ✓ SETUP_TIPS — detection (37)
     ✓ ignoring context-fetch-missing does not drop a context-fetch-unbounded finding 401ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (99 tests) 734ms
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

 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 1725ms
   ✓ runAntigravityModule (3)
     ✓ writes plugin.json, hooks.json, both hook scripts, and emits the setup advisory 347ms
     ✓ stays silent about the overlap when Codex is absent 339ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 1006ms
   ✓ main (5)
     ✓ runs as a script 420ms
 ✓ .bkit/core/engine/ledgers/journal.test.ts (9 tests) 1012ms
   ✓ frictionRow (3)
     ✓ never leaves by.step empty 510ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (73 tests) 645ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 844ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (43 tests) 473ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (242 tests) 1535ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-R2mYdF/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 1554ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 741ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 830ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 600ms
   ✓ refreshPreflightAfterWrites — post-write preflight re-check (2)
     ✓ returns a blocker that only appears after the writes 397ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-390MCz/nonexistent.md — skipping .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > block-merge skip is seedable even though disk carries consumer prose outside the block
[bkit-upgrade] upgrade (merge): docs/foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > a consumer edit survives a no-op upgrade and is a conflict on the next template change
[bkit-upgrade] conflict: .bkit/scripts/bkit-foo.sh — consumer drift detected, NOT overwriting

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > template with a slash-prefixed HTML marker (// <!-- bkit:start -->) is classified html-comment, not slash-comment (site-9 mis-classification trap)
[bkit-upgrade] upgrade (merge): weird.js

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > a marker-less consumer file gets the block appended, its own content kept
[bkit-upgrade] upgrade (merge): .claude/hooks/gateguard.cjs

 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 307ms
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

 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 1318ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 776ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (279 tests) 586ms
 ✓ .bkit/core/engine/render/trackers.test.ts (102 tests) 802ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (250 tests) 533ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 219ms
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

 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 325ms
   ✓ disk prune step-file templates (7)
     ✓ both copy into place and load as valid steps of both modes 304ms
 ✓ .bkit/core/engine/render/hosts.test.ts (125 tests) 577ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 243ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 634ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (6 tests) 317ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (96 tests) 766ms
   ✓ consumer .prettierignore template (.bkit/templates/.prettierignore) (7)
     ✓ prettier ignores the committed gate log build-plan-verify-1-1.md: false 303ms
 ✓ .bkit/core/engine/shared/settings.test.ts (26 tests) 264ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 305ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 417ms
 ✓ .bkit/core/engine/install/manifest.test.ts (47 tests) 188ms
 ✓ .bkit/core/engine/commands/workflow/workstreams.test.ts (9 tests) 557ms
   ✓ bkit workstreams comment (2)
     ✓ builds the Step 11 comment body 458ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 534ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 110ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 730ms
   ✓ textOmit audit (12)
     ✓ no workflow or prompt code span reads an omitted key 591ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 162ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (65 tests) 645ms
   ✓ 3. commit cadence — every counted step commits in-block or is explicitly exempted (5)
     ✓ real corpus: every counted step commits in-block or is exempted 331ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 215ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (48 tests) 383ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (23 tests) 100ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (23 tests | 1 skipped) 35ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 226ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 158ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (22 tests) 498ms
   ✓ detectBkitNotOnPath (3)
     ✓ returns null when `bkit` is on PATH (found by which) 328ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (33 tests) 215ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (35 tests) 455ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (24 tests) 435ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 220ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 174ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (64 tests) 113ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 381ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 55ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (28 tests) 26ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 14ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 193ms
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

 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 59ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > leaves a .cursor/allowlist.json bkit never recorded alone
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > is idempotent — a second run finds nothing to migrate
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 68ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 30ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 106ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 176ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 90ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (60 tests) 47ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 32ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793238534929.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793238534935.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793238534936.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793238534946.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 28ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 252ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (8 tests) 180ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 73ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 19ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 43ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 174ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 232ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (19 tests) 179ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 196ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 45ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 46ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 78ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 266ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 93ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (135 tests) 249588ms
   ✓ bkit workflows start (13)
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 411ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 348ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 835ms
       ✓ a new run in the same chat gets its own session row 389ms
       ✓ writes none outside Claude Code 407ms
     ✓ opens the next run after a finished one, and after another workflow's run 385ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 479ms
     ✓ design / plan / build / debug book in the current worktree 547ms
     ✓ refuses when the lock is live, writing no row 375ms
     ✓ --lock-held checks the lock is ours 571ms
     ✓ rejects an unknown workflow 443ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 536ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 557ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 518ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 440ms
     ✓ an OPEN decision of an earlier run never resurfaces 311ms
     ✓ reads Test attempt from a tests pause 313ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 451ms
     ✓ writes no row when status.jsonl does not exist 455ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 596ms
     ✓ aborts a rebase only when one is in progress 1445ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1609ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 658ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 653ms
     ✓ --max-exceeded says a handover is due without any sentinel 395ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 404ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 560ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 921ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 441ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 467ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 341ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 380ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 466ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 640ms
     ✓ a debug run in SOAK mode always needs a handover 935ms
   ✓ bkit workflows close (16)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 2141ms
       ✓ counts subagents of an earlier chat the run's session rows name 1709ms
       ✓ records no context block, and still closes, outside a Claude Code session 1508ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 2259ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1873ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 2046ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1850ms
     ✓ always writes the telemetry, whatever the runtime 1468ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 945ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1108ms
     ✓ an unwritable stats path is logged and never fails the close 1280ms
     ✓ refuses without status.jsonl and writes nothing 450ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1749ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 2596ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1603ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 2250ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 2073ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 2487ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 2405ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1967ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 2241ms
     ✓ --record-step writes the close step's row before workflow-done 1513ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1674ms
     ✓ --number without --outbox is a usage error 1710ms
     ✓ --flush is ship only 765ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1707ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 2747ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 2006ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 3562ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 2440ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 1131ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 838ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3931ms
     ✓ --flush with nothing to record commits and pushes nothing 5396ms
     ✓ --flush carries the named worktree's logs into the dev commit 6216ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 5706ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 6863ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 5972ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 3461ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 5340ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 10858ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 12134ms
     ✓ --push on dev never carries a row whose references name another feature 5124ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 4094ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 6425ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 5206ms
     ✓ --push commits in the named worktree, not the checkout it runs from 3083ms
     ✓ rejects --push with --flush, and --flush outside ship 466ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 4081ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 4871ms
     ✓ a close that landed releases the lock 4579ms
     ✓ removes the worktree before it releases the lock 3763ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 6390ms
       ✓ closePr refuses when the PR base is unknown 7363ms
     ✓ leaves a worktree no workflow created, and its branch, in place 3228ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 517ms
     ✓ exits 12 when there is no versioned draft 899ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 638ms
     ✓ stamps the anchor from the runtime-resolved base commit 1009ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 1031ms
     ✓ promote copies the plan only 446ms
     ✓ rejects a workflow other than design or plan 578ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 749ms
     ✓ names the branch, not the remote-tracking ref, in each URL 742ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 855ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 1047ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1525ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 1219ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 3193ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 1782ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 1092ms
     ✓ a second run's record does not let this FID's close commit 1334ms
     ✓ record is present after workflows close and before the push 2287ms
     ✓ failed handover from dev removes the record and keeps recorded paths 4303ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 616ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 1093ms
     ✓ a run with no issue holds the prompt alone 517ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 944ms
     ✓ --plan is appended when the file exists and skipped when it does not 892ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 846ms
     ✓ a missing prompt file exits 13 895ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 2455ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 2702ms
     ✓ puts each --line after the summary, in flag order 1929ms
     ✓ refuses --final-return without --summary-file 975ms
     ✓ --summary prints the file and keeps a copy in --outbox 1898ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 1366ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 591ms
     ✓ a missing summary file exits 13 before anything is written 682ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 1019ms
     ✓ a folder outside the outbox sessions folder is kept 907ms
     ✓ without --session-dir prints no sessionRemoved 689ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 37ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 51ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 167ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 16ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (32 tests) 279ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (8 tests) 212ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 61ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 27ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 15ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 49ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 53ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 20ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (20 tests) 232ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 17ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 13ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 15ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (3 tests) 13ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 12ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 13ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 26ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (6 tests) 9ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 8ms
 ❯ .bkit/core/engine/tools/instructions.test.ts (96 tests | 2 failed) 285241ms
   ❯ the corpus matches the instructions store (8)
     ✓ finds prompts, workflows, both rules files, and every audit template with its adopted copy 4ms
     ✓ utility agents, the plan template and AGENTS.md load as their own surfaces 1ms
     ✓ loads every shipped doc master with a bkit block as a doc, never an installed copy 2ms
     ✓ checks a doc inside its bkit block only and pools it with the plan template and AGENTS.md 1ms
     × has no findings 160719ms
     ✓ every prompt, workflow and utility agent has the three header blocks 1912ms
     × sync has nothing left to rewrite 112541ms
     ✓ every clause reaches the cut-off of one surface it applies to 1659ms
   ✓ the rule groups the Rules clauses name exist (4)
     ✓ both groups appear once under bkit Rules, Universal first 1ms
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
     ✓ a missing required clause fails 1ms
     ✓ a duplicated clause fails 0ms
     ✓ a weakened rewrite is a near-copy, not a match 1ms
     ✓ an unrelated sentence is not a near-copy 0ms
     ✓ a clause inside a fenced block does not count 0ms
     ✓ a forbidden clause fails where present 0ms
     ✓ if-verdict is required with a verdict header and forbidden without 1ms
     ✓ an excepted file is not checked 0ms
     ✓ retired wording fails 1ms
     ✓ an anchored template fails on a line that starts it but does not match 1ms
     ✓ position: first fails when another bullet opens the block 1ms
     ✓ rules files are checked inside the managed block only 1ms
     ✓ a sentence shared by 2 prompts but not listed fails 0ms
     ✓ a sentence shared by 2 docs inside their bkit blocks but not listed fails 0ms
     ✓ a sentence a doc holds below bkit:end never counts toward the doc cut-off 0ms
     ✓ AGENTS.md and the plan template count toward the doc cut-off and take doc modes 0ms
     ✓ a sentence ending its line and the same sentence continued with ; count as one 0ms
     ✓ one drifted copy does not hide a sentence the other prompts share 0ms
     ✓ a fragment after ; is its own sentence for the cut-off 0ms
     ✓ a sentence shared by 2 workflows but not listed fails; one workflow fewer passes 0ms
     ✓ each surface keeps its own cut-off: prompts and workflows never pool 0ms
     ✓ headings, HTML comments, and table rows never count toward the cut-off 1ms
   ✓ standing lines (1)
     ✓ standingLines keeps a NEVER bullet and drops tables, headings and fences 1ms
   ✓ the store parser (2)
     ✓ parseInstructions reads clauses only up to the next section 0ms
     ✓ a clause with rule and carriers keys parses 0ms
   ✓ store carriers (2)
     ✓ carriersLine writes all, all except, and prefix families 1ms
     ✓ syncStore rewrites a stale carriers line and keeps a current one 0ms
   ✓ audit templates (6)
     ✓ the store accepts an audit mode 0ms
     ✓ a required clause is checked inside the managed block only 0ms
     ✓ a near-copy in an audit template is flagged and sync rewrites the template and its adopted copy alike 1ms
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
     ✓ if-bash is required with Bash in the tools list and forbidden without 1ms
     ✓ if-search is required with Grep or Bash in the tools list and forbidden without 1ms
     ✓ if-no-search is required without Grep and Bash in the tools list and forbidden with either 0ms
     ✓ lines in a prompt's Rules block are rule copies, never clause carriers 0ms
     ✓ repeatable allows any number of copies but still flags near-copies 0ms
   ✓ templates (3)
     ✓ an anchored line may match any one of several templates 0ms
     ✓ a drifted anchored line fails 0ms
     ✓ a line two overlapping templates both fit counts once 0ms
   ✓ header blocks (7)
     ✓ each clause in its block, in wording-file order, passes; local lines in between allowed 2ms
     ✓ two swapped lines in one block fail 1ms
     ✓ a clause in the wrong block fails 0ms
     ✓ a placed clause in the body fails 0ms
     ✓ a CAUTION box, a missing block and blocks out of order fail 0ms
     ✓ files outside prompts, workflows and repo agents need no blocks 0ms
     ✓ the wording file takes block and position: first, and rejects anything else 1ms
   ✓ rule copies outside the Rules block (2)
     ✓ a rule's copy in Protocol or Contract fails, a cut-short copy included 6ms
     ✓ a line sharing only the rule's label, and the Rules block copy, pass 3ms
   ✓ fully retired clauses (6)
     ✓ parse with no text block and no surface 0ms
     ✓ reject a text block or a surface 0ms
     ✓ are a record only: their wording in a file is neither flagged nor rewritten 0ms
     ✓ never cover a sentence for the cut-off 0ms
     ✓ the removed prompt clauses stay on record, and the cut-off skips them 0ms
     ✓ output-cap's sentence stays inline in the abort handover prompt 7812ms
   ✓ sync (7)
     ✓ rewrites a near-copy and keeps the list marker 1ms
     ✓ rewrites the text behind a different label when the clause is unlabelled 0ms
     ✓ rewrites retired wording, carrying slot values across 0ms
     ✓ rewrites a near-copy that closes a sentence opened by local text 1ms
     ✓ rewrites retired wording continued with ; and keeps the ; 0ms
     ✓ rewrites a near-copy continued with ; and keeps the ; 1ms
     ✓ is idempotent and leaves fenced examples alone 0ms
   ✓ issue-less workflow clauses (7)
     ✓ workflow-issue-id-missing leads into the branch recovery without a STOP 0ms
     ✓ the fids parse routes: hit, no issue, non-slug STOP 0ms
     ✓ Step 1 reads the issue and FID from the prompt file, and resolves FID in the engine 0ms
     ✓ changed issue clauses keep their old text in retired 1ms
     ✓ the issue-less gate clauses read as the issue-less behaviour 0ms
     ✓ the warning, the final-message line and the skip line are clauses 0ms
     ✓ the diff reaches each reader as a file written just before its step, not a guard rule 0ms
   ✓ the Template Instructions tables match the prompts (2)
     ✓ every row's bullet is byte-identical across its carriers 398ms
     ✓ every label's rows list exactly the prompts that carry it 130ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (195 tests) 376033ms
   ✓ branches rebase: behaviour (17)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1143ms
     ✓ refuses a code conflict and aborts the rebase on the spot 1095ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1379ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 904ms
     ✓ produces byte-identical output to merge=union 2290ms
     ✓ restores a trailing newline so the next append starts on its own line 1193ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 860ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1967ms
     ✓ refuses a union that leaves a line which is not JSON 1364ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1804ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 2322ms
     ✓ refuses a lockfile whose regenerate command fails 2323ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 1436ms
     ✓ removes a stale sentinel when the rebase succeeds 2523ms
     ✓ exits 4 when no rebase is in progress 645ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 2440ms
     ✓ resolves a conflict in each of two replayed commits across rounds 2749ms
   ✓ branches anchor-stamp (19)
     ✓ records the bkit release, and warns visibly under the block when it is outdated 457ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 591ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 1277ms
       ✓ skips (12) with no anchor 1840ms
       ✓ skips (12) when the base is unreachable in this clone 1185ms
       ✓ skips (12) when nothing landed since the base 1067ms
       ✓ runs (0) with the landed path count once dev moved 2026ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 1185ms
   ✓ branches push (17)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 2695ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 1392ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1948ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 4457ms
     ✓ runs exactly one git push 2375ms
     ✓ --set-upstream records the upstream 1665ms
     ✓ refuses with no branch checked out 1365ms
     ✓ --mode=dev refuses a feature checkout 1210ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 3072ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 1674ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 2638ms
     ✓ --mode=abort pushes when the branch has no open PR 1997ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 2279ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 977ms
     ✓ --open-pr carries the MCP answer and skips gh 1610ms
     ✓ --mode=abort on dev pushes plainly without probing 2978ms
     ✓ rejects an unknown mode 1987ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3508ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 3572ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 6342ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 7038ms
     ✓ skip-ci HEAD on the replay is refused 3638ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 6289ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 5866ms
     ✓ a level local dev is a plain push, recording nothing extra 2375ms
     ✓ a record with no commits pushes nothing 1998ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 1309ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 2550ms
     ✓ a rewritten branch is refused, never forced 2490ms
     ✓ refuses dev and main with exit 21 and pushes nothing 2728ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 13619ms
     ✓ refuses a detached HEAD (exit 5) 3235ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 4202ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 2351ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 2795ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 2267ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 991ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 3139ms
     ✓ an up-to-date branch is a no-op 1821ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2821ms
     ✓ a fetch that fails exits 10 1027ms
   ✓ branches scan-diff (24)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1420ms
     ✓ --paths with no match exits 1 2035ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 1219ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 2164ms
     ✓ --marker reads a diff over 1 MiB 1367ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1919ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 2489ms
     ✓ scan-diff finds an added skip 2537ms
     ✓ scan-diff ignores a skip predating the base 1708ms
     ✓ scan-diff reports a disabled test with its line 1863ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1367ms
     ✓ scan-diff ignores a removed comment in a test file 1777ms
     ✓ scan-diff ignores an assertion moved within the file 1343ms
     ✓ scan-diff still reports a removed assertion 1289ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1124ms
     ✓ scan-diff finds an added pytest mark skip 1667ms
     ✓ scan-diff finds an added unittest skip 1326ms
     ✓ scan-diff finds an added bare skip call 2024ms
     ✓ scan-diff ignores a quoted skip in a documentation file 3207ms
     ✓ scan-diff ignores a marker literal in a non-test source file 2388ms
     ✓ scan-diff ignores an assertion whose expectation changed 1533ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 1239ms
     ✓ scan-diff reports a deleted test file 1991ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 1497ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 2549ms
     ✓ a title that already carries the marker is left alone 1981ms
     ✓ with no open PR: pushes the marker commit and edits no title 1893ms
     ✓ a re-run is deduped: no second marker commit 2386ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 3873ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 1064ms
     ✓ --title-set skips gh entirely 1225ms
     ✓ refuses dev and main (exit 21) 947ms
   ✓ branches sync (11)
     ✓ Path A when origin/dev is an ancestor of HEAD 1148ms
     ✓ Path B once dev moved; --head checks a given commit 2560ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 2507ms
     ✓ --merge-docs merges dev when docs/ is behind 3012ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 2149ms
     ✓ --merge-docs never merges on dev itself 2184ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 4183ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 4186ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 3190ms
     ✓ exits 10 when the fetch fails 1907ms
     ✓ refuses --merge-docs with --head, and an unknown --head 1622ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 3608ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 3584ms
     ✓ a failed install stops ship (16) 2437ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 2615ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 4463ms
     ✓ exits 10 when the fetch fails 2058ms
   ✓ branches land (27)
     ✓ refuses a workflow other than design or plan 1048ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 1082ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 4042ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 6334ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 4868ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 8324ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 12690ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 8328ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 3740ms
     ✓ local: names unpushed dev as the cause when the branch carries it 3380ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 4125ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 4998ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 4182ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 2976ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 3696ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2749ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 3166ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1085ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3310ms
     ✓ land removes the worktree when only the copied .env is untracked 2513ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 3611ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 4659ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 4850ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 2825ms
     ✓ landPr refuses a main-based PR without retrying 992ms
     ✓ landPr refuses when the PR base is unknown 1068ms
     ✓ PR not open (closed): stops (17) at once, no retry 1699ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

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

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/tools/instructions.test.ts > the corpus matches the instructions store > sync has nothing left to rewrite
Error: Test timed out in 60000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/tools/instructions.test.ts:221:3
    219|   });
    220|
    221|   it("sync has nothing left to rewrite", { timeout: 60_000 }, () => {
       |   ^
    222|     expect([...syncClauses(CLAUSES, CORPUS).keys()]).toEqual([]);
    223|     expect(syncStore(STORE, CORPUS) === STORE, "run pnpm instructions:…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed | 156 passed (157)
      Tests  2 failed | 6493 passed | 1 skipped (6496)
   Start at  11:44:47
   Duration  379.01s (tests 94%, setup 3%, import 1%, transform 1%, worker 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/699-engine-run-completeness/build-group-gate-3-5.log.reports/vitest-33679.xml
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
> [bkit] TRUNCATED — kept 1745 of 3588 lines (120 KB of 274 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
