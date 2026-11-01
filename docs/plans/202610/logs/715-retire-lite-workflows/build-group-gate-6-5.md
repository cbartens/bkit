
> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/164 files need formatting

> @cbartens/bkit@6.0.0 lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


 .bkit/core/.bkit/README.md
 303:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/cloud.md
 449:178  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/install.md
 19:1     warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 132:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 349:290  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 357:1    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 476:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 596:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 669:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 182:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 245:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 96:488    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 133:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 159:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 595:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 817:184   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 981:108   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1081:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1242:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1300:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 362:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 402:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 473:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/templates/context/bkit-serena.md
 6:78  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/deployments.md
 126:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 245:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 362:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 402:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 473:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 46 warnings and 0 suggestions in 148 files.
passed: true
skipped: null
files: 148

> @cbartens/bkit@6.0.0 slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> bkit ci slop

[bkit-ci] base 2f44b69f1b01c5ef35dd154f705779442e1365aa (2f44b69f1b01c5ef35dd154f705779442e1365aa) vs working tree
[bkit-ci] added 3, resolved 3, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 2f44b69f1b01c5ef35dd154f705779442e1365aa
base: 2f44b69f1b01c5ef35dd154f705779442e1365aa
added: 3
resolved: 3
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 21.5 on 10 cores: unit limits 10762ms per test, 21523ms per hook (x2.15)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (94 tests) 48426ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (23)
     ✓ modified ledger under the FID logdir is staged and committed 1118ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 1041ms
     ✓ brand-new untracked ledger is staged and committed 964ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 723ms
     ✓ path containing a space is staged and committed 682ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 773ms
     ✓ staging failure: exit 4 and no commit is created, no false success 658ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 752ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 628ms
     ✓ --mode=stage stages the sweep but creates no commit 709ms
     ✓ top-level docs/*.md is committed under scope=pr, not under scope=core or scope=full 1894ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 885ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 519ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 547ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 534ms
     ✓ --root defaults to the working directory 585ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 1100ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 1030ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 923ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 829ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 746ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 334ms
     ✓ a path outside the checkout exits 6 with nothing committed 423ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 606ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 325ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 1290ms
     ✓ --path records its commit on the run's record, like every other commit mode 762ms
     ✓ a recorded ledger commits only the rows the run appended 1299ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 1385ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 914ms
     ✓ commitBookkeeping refuses when a recorded path changed 545ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 1105ms
     ✓ under --mode=commit counts the squashed paths as something to commit 704ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 966ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 521ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 978ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 580ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 376ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 394ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 483ms
     ✓ carries untracked ledgers too 534ms
     ✓ keeps rows on separate lines when the destination has no final newline 963ms
   ✓ bkit ledgers only-bookkeeping (5)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 983ms
     ✓ a source file in the range: exit 7, path listed 627ms
     ✓ another FID's plan file in the range: exit 7 1633ms
     ✓ from not an ancestor of to: exit 7 895ms
     ✓ unknown commit exits 3; a missing flag exits 2 648ms
   ✓ bkit ledgers append (20)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 1060ms
     ✓ append keeps a row's own repo 306ms
     ✓ append refuses a supplied schema or bkit 495ms
     ✓ append refuses an empty rows file 580ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 303ms
     ✓ triage marks an unjustified deferral lazy 432ms
     ✓ triage writes an unjustified row with a minted ts 810ms
     ✓ triage writes no row for a closed deferral 316ms
     ✓ triage reports an adjudicated unjustified row outside exempt 360ms
     ✓ triage ignores another feature's deferral rows 326ms
     ✓ triage refuses a plan with no task blocks 419ms
     ✓ triage refuses a plan whose task blocks do not parse 557ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (53 tests) 48991ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1220ms
     ✓ names each net-new and worsened finding in the log and the JSON 1688ms
     ✓ fails on a net score rise with no net count change 1716ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1211ms
     ✓ treats a net score at or below 0.001 as float noise 1292ms
     ✓ passes when the change only resolves findings 1033ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1365ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 605ms
     ✓ skips (exit 0) when the base resolves to HEAD 607ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1166ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 1114ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 517ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1398ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1164ms
     ✓ exits 4 on a dropped net field instead of silently passing 1347ms
     ✓ exits 4 on no summary instead of silently passing 1399ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1488ms
     ✓ exits 5 when the base worktree cannot be created 608ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1563ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1221ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1049ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 910ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1227ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 4038ms
   ✓ bkit ci prose — gate (5)
     ✓ fails when vale is not installed 355ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 1030ms
     ✓ fails (exit 1) when vale reports alerts 1170ms
     ✓ exits 6 on a vale runtime error 583ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 703ms
     ✓ falls back to vale sync when the main worktree has none 1181ms
     ✓ fails when vale sync cannot restore the required styles 847ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 1443ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 1368ms
     ✓ is a usage error when the commit cannot be read 550ms
   ✓ bkit ci min-push (8)
     ✓ exits 0 when every changed file is a plan log or a ledger 883ms
     ✓ exits 1 naming the files outside, whatever the commit message says 1064ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1064ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 855ms
     ✓ reads bkit.testing.minPushPaths from package.json; an explicit [] turns it off 1965ms
     ✓ a top-level glob does not reach into folders 743ms
     ✓ a push that changes no files is not proven a min push 684ms
     ✓ exits 7 when a commit or its base cannot be read 614ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 51734ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 702ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1007ms
     ✓ --file needs --workflow 375ms
     ✓ always writes the marker, even with no plan 849ms
     ✓ writes the linear marker shape, taking the tracker from package.json 620ms
     ✓ writes the jira marker shape, taking the tracker from package.json 1188ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 673ms
     ✓ refuses a github marker with fid "12-x" issue "13" (exit 2) 326ms
     ✓ refuses a jira marker with fid "mba-7-x" issue "mba-7" (exit 2) 308ms
     ✓ refuses a title carrying [actions skip] before calling gh (exit 4) 315ms
     ✓ refuses a PR from dev, main, or the base itself 703ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 989ms
     ✓ retries a failed create once, and exits 5 when it fails twice 874ms
     ✓ exits 5 when the open-PR probe errors 990ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 815ms
     ✓ prs open still opens against any other base 678ms
     ✓ exits 6 when the created PR's base is not --base 762ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 738ms
     ✓ exits 1 with found=false when there is none 518ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 888ms
     ✓ --number reads one PR, mergeable included 500ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 648ms
     ✓ exits 4 when gh errors and 80 when it needs auth 941ms
     ✓ refuses a bad --state or --number 492ms
   ✓ bkit prs scan-body (10)
     ✓ flags [skip ci] in the landed commit body (exit 1) 306ms
     ✓ flags [ci skip] in the landed commit body (exit 1) 323ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 307ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 1316ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 1968ms
     ✓ drops the force-build marker from the title subject 761ms
     ✓ takes an explicit --subject 1402ms
     ✓ runs no merge when the PR is already MERGED 524ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1062ms
     ✓ prs merge refuses a PR whose base is main 662ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 520ms
     ✓ prs merge refuses when the PR base is unknown 617ms
     ✓ prs merge reads the base from the one pr view it already makes 1484ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 1003ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 583ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 834ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 893ms
     ✓ exits 2 on a bad --number 313ms
     ✓ never reads dev's required checks without --only-if-required 778ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 654ms
     ✓ updates when a dev ruleset requires status checks 1427ms
     ✓ updates when dev's branch protection requires status checks 934ms
     ✓ ignores dev rulesets that require no checks 817ms
     ✓ updates when the repo cannot be resolved 810ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 939ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 681ms
     ✓ is not green when a check failed, naming it (exit 1) 474ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 884ms
     ✓ is not green on an empty rollup (total 0) 663ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 732ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1050ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 432ms
     ✓ is a no-op when the title already says so 425ms
     ✓ strips the marker, with or without its bkit prefix 607ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 815ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ scans a clean landed body and records the close-transport row 354ms
     ✓ records a skip token found in the body, then exits 1 332ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (93 tests) 52662ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 1007ms
     ✓ done --group writes group on the row 949ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 1052ms
     ✓ --commit=none writes the row and leaves it uncommitted 355ms
     ✓ build-group-start records parentSha and group 308ms
     ✓ carries extra fields, parsed as JSON when they are JSON 834ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 385ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 337ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 329ms
     ✓ rejects ["--status=SKIPPED"] 332ms
     ✓ needs a message unless --commit=none 400ms
     ✓ reports a failed commit with exit 8 without writing the row 1082ms
     ✓ a failed commit leaves no row staged in the index 818ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1285ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1342ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 960ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 930ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1041ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 336ms
     ✓ empty artifact exits 0 301ms
     ✓ disallowed artifact exits 3 344ms
     ✓ bad failures artifact exits 4 300ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 658ms
     ✓ --ref reads the status file as committed on that ref, not from disk 863ms
     ✓ --ref exits 3 when the ref does not carry the status file 617ms
     ✓ fails on a placeholder left in the artifact 398ms
     ✓ fails when the row's verdict differs from the artifact's 481ms
     ✓ fails when the row does not list the artifact, or carries another attempt 460ms
     ✓ fails on a missing artifact 510ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 510ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 437ms
   ✓ bkit steps finish (14)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 795ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 826ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 615ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 948ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1241ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 1241ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 1632ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 2068ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 1130ms
     ✓ --post needs --number; without --post there is no tracker key 375ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 1093ms
     ✓ --strip-header drops the prior version's own header 532ms
     ✓ exits 4 when the prior version is missing or empty 387ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 560ms
     ✓ checks the FID's shape for the wired tracker 422ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 599ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 740ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 865ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 665ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 478ms
       ✓ gate --issue="" under none keeps today's check 749ms
     ✓ --attempt-of checks the row carries the derived counter 739ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1734ms
     ✓ writeStepRow refuses when a recorded path changed 1743ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 832ms
     ✓ writeStepRow appends its commit sha to the record 1457ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1523ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (125 tests) 60834ms
   ✓ resolveGate (6)
     ✓ no package.json, no scripts, or unparseable -> null 420ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 804ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 656ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 599ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1166ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 341ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 379ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 790ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 374ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 359ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 590ms
     ✓ PASS is 0 failures with or without reports 497ms
     ✓ clears a previous attempt's reports before the gate runs 365ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 464ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 838ms
     ✓ a log under the outbox is named main-checkout relative in the record 578ms
     ✓ a log small enough is copied whole: not clamped, raw null 390ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 679ms
   ✓ bkit tests plan-check (27)
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 306ms
     ✓ plan-check refuses a delete with no supersession row 316ms
     ✓ plan-check follows bkit.workflows.tasks 350ms
   ✓ bkit tests red / green (38)
     ✓ records a red: the named test failed; row, log and test snapshot written, path passed whole 581ms
     ✓ refuses a run that is not a red: exit 1, reason printed, no red row 1466ms
     ✓ a red refused as passed notes HEAD and the uncommitted files for green 1171ms
     ✓ lints the test before its red when bkit:lint:file is declared; a lint failure records nothing 1153ms
     ✓ an undeclared bkit:lint:file is skipped with a note, and the red still runs 1507ms
     ✓ a red already recorded for the unchanged test stands on resume; a changed test runs again 1052ms
     ✓ refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2) 1194ms
     ✓ a script that cannot run is exit 4, not a rejected red 593ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 587ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 987ms
     ✓ green: --group audits only that group's tasks 626ms
     ✓ green: --group naming a group with no tasks is refused 370ms
     ✓ green: a code fence never closed is the reason, not missing task markers 359ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1512ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 983ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1814ms
     ✓ green prints a verdict and a fixable per gap 2595ms
     ✓ green verdict is FAIL when a gap is unfixable 979ms
     ✓ green leaves a diff-reading kind fixable null 790ms
     ✓ green prints verdict null when a gap needs a diff read 1291ms
     ✓ green: lists each gap kind, with the diff for a test changed since its red 1246ms
     ✓ green: a red recorded for a different test than the plan names is a red-mismatch 684ms
     ✓ green: a planned test that moved is a red-mismatch saying whether the recorded test passes now 1182ms
     ✓ green: every test a task names needs its own red and its own pass 1004ms
     ✓ test order (13)
       ✓ green finds the code commit for DONE — TASK N 1945ms
       ✓ a red recorded before the task's code commit stands, across a resumed execute 1430ms
       ✓ a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked 1089ms
       ✓ a test found by name in its file is judged on its own lines and the code it runs (3)
         ✓ another test's edit 645ms
         ✓ its own body's edit 1147ms
         ✓ its helper's edit 861ms
       ✓ a red run refused as passed (3)
         ✓ on another task's committed code that shares its file is already landed, not no-red 1353ms
         ✓ with the task's own files uncommitted then stays no-red, naming them 1475ms
         ✓ with no other task's code sharing a file stays no-red, saying so 1437ms
       ✓ green emits a test-changed gap for a red whose test gained added lines only 580ms
       ✓ green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green 1343ms
       ✓ green refuses an exception-only task from a workflow step commit 630ms
       ✓ green clears an exception-only task from a human commit 513ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 26530ms
   ✓ bkit repo info (11)
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 896ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 532ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1148ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 822ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 531ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 678ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1172ms
     ✓ an unpinned repo reports nulls and asks no registry 1022ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 576ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 699ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 719ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 839ms
> [bkit] TRUNCATED HERE — 52 lines omitted. Dropped content was NOT read.
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 377ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 415ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 377ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/land.test.ts (30 tests) 28042ms
   ✓ pushToDev (16)
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 1255ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1638ms
     ✓ a push that fails without a server answer is returned once, never retried 1173ms
     ✓ a failed fetch is returned before anything is built 712ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2498ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 3115ms
     ✓ lands from a clone whose fetch refspec omits dev 2003ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1185ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 1133ms
     ✓ keeps each context's own section banner and drops every other context's 2730ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 333ms
   ✓ untouched originals (keepRaw) (4)
     ✓ keepRaw copies the original byte-identical to {name}.raw.{ext} in the folder given 469ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 555ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1167ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 681ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 10649ms
   ✓ bkit issues comment (33)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 1811ms
       ✓ falls back to event.before when gh prints unparseable output 1287ms
       ✓ reports last-green-run as the source when the green head is an ancestor 2441ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 2490ms
         ✓ tests ancestry against --head, not HEAD 2408ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 3620ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (161 tests) 107659ms
   ✓ fixture gh stub (10)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ --repo scopes --pr resolution (2)
       ✓ reads the head from the named repo, not the checkout's own PR 344ms
     ✓ tells an API error (20) from no run (10) 395ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 405ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 1319ms
       ✓ a source change past the validated head refuses (17) and names the path 1022ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 1206ms
       ✓ --validated without --month / --fid is a usage error (2) 838ms
       ✓ a validated sha that is not an ancestor refuses (17) 970ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 2032ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 1173ms
     ✓ CLI: a failed gh workflow run exits 5 1136ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 2580ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 1091ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1764ms
     ✓ a failed re-trigger push names the cause in the log 1900ms
     ✓ a failed re-trigger push leaves no orphan commit behind 2745ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 5427ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 2036ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 686ms
     ✓ gh-error: every poll errored 684ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1810ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1330ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1474ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1450ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2791ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2461ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1060ms
     ✓ re-trigger on dev only uses the record of its own FID 1178ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1163ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 1076ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 617ms
     ✓ a refused capstone records FAIL with its reason 706ms
     ✓ an unreadable PR is an API error (20) with no head 693ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 975ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 2265ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1089ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 837ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1935ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 2086ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 2227ms
     ✓ --file and --step go together 1868ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 28046ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1651ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 1400ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 1230ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 988ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1617ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1315ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1198ms
     ✓ --file into a missing directory is refused, not created 1361ms
 ❯ .bkit/core/engine/tools/instructions.test.ts (96 tests | 1 failed) 112764ms
   ❯ the corpus matches the instructions store (8)
     ✓ finds prompts, workflows, both rules files, and every audit template with its adopted copy 123ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ loads every shipped doc master with a bkit block as a doc, never an installed copy 5ms
     ✓ checks a doc inside its bkit block only and pools it with the plan template and AGENTS.md 1ms
     × has no findings 74245ms
     ✓ every prompt, workflow and utility agent has the three header blocks 475ms
     ✓ sync has nothing left to rewrite 34275ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
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
     ✓ an anchored template fails on a line that starts it but does not match 0ms
     ✓ position: first fails when another bullet opens the block 0ms
     ✓ rules files are checked inside the managed block only 0ms
     ✓ a sentence shared by 2 prompts but not listed fails 0ms
     ✓ a sentence shared by 2 docs inside their bkit blocks but not listed fails 0ms
     ✓ a sentence a doc holds below bkit:end never counts toward the doc cut-off 0ms
     ✓ AGENTS.md and the plan template count toward the doc cut-off and take doc modes 0ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ one drifted copy does not hide a sentence the other prompts share 0ms
     ✓ a fragment after ; is its own sentence for the cut-off 0ms
     ✓ a sentence shared by 2 workflows but not listed fails; one workflow fewer passes 0ms
     ✓ each surface keeps its own cut-off: prompts and workflows never pool 0ms
     ✓ headings, HTML comments, and table rows never count toward the cut-off 0ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ a required clause is checked inside the managed block only 1ms
     ✓ a near-copy in an audit template is flagged and sync rewrites the template and its adopted copy alike 1ms
     ✓ a sentence shared by 5 audit templates but not listed fails 1ms
     ✓ an adopted copy never counts twice toward the cut-off 0ms
     ✓ text below `bkit:end` never counts toward the cut-off 0ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
   ✓ templates (3)
     ✓ an anchored line may match any one of several templates 0ms
     ✓ a drifted anchored line fails 0ms
     ✓ a line two overlapping templates both fit counts once 0ms
   ✓ header blocks (7)
     ✓ each clause in its block, in wording-file order, passes; local lines in between allowed 1ms
     ✓ two swapped lines in one block fail 1ms
     ✓ a clause in the wrong block fails 1ms
     ✓ a placed clause in the body fails 1ms
     ✓ a CAUTION box, a missing block and blocks out of order fail 0ms
     ✓ files outside prompts, workflows and repo agents need no blocks 0ms
     ✓ the wording file takes block and position: first, and rejects anything else 2ms
   ✓ rule copies outside the Rules block (2)
     ✓ a rule's copy in Protocol or Contract fails, a cut-short copy included 7ms
     ✓ a line sharing only the rule's label, and the Rules block copy, pass 3ms
   ✓ fully retired clauses (6)
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 1038ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1312ms
     ✓ a refused dev push is logged, never fails the close 2904ms
     ✓ an unreachable remote is logged, never fails the close 709ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (19 tests) 2862ms
   ✓ bkit locks release (5)
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 870ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 818ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 345ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (40 tests) 3070ms
   ✓ runLines (5)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ is null when first is not an ancestor of last, or either is missing 501ms
   ✓ restateOutcome (3)
     ✓ ending is close-failed when the dispatch is unresolved 321ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (19 tests) 2897ms
   ✓ bkit tasks currency (5)
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
   ✓ guardRepoConfig (6)
     ✓ passes when nothing changed 311ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 374ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 402ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 385ms
 ✓ .bkit/core/engine/audits/templates/context-templates.test.ts (74 tests) 1496ms
   ✓ .bkit/templates/context/ (74)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ treats regex characters in a skill name literally 1764ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 1142ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 1682ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 1357ms
     ✓ runs from the checkout top even when called from a subfolder 1546ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1300ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1373ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1224ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 1659ms
     ✓ fetches the issue and its comments as GitHub returns them 1317ms
   ✓ jira client (MCP over HTTP) (5)
     ✓ a tool error maps to a reason; HTTP 401 on initialize is auth 421ms
   ✓ postCommentOnce (4)
     ✓ records an engine-action row and skips the same key + body on a re-run 767ms
     ✓ a recent identical comment counts as done (the final close comment) 1879ms
     ✓ a failed post reports done false with the reason and never leaks a token 1081ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1845ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 2030ms
     ✓ a different marker hash posts 1137ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1168ms
   ✓ jira: HTML comment pages and non-string bodies (2)
     ✓ re-reads an HTML page one comment per call; a body that stays HTML is kept as HTML 416ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 1584ms
     ✓ resolves config from the repo root when run from a subdirectory 1393ms
     ✓ exits 6 when the PUT fails 1779ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1137ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 1398ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 836ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 379ms
     ✓ exits 6 when the api answer is not JSON 420ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 1371ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 881ms
   ✓ lookupLatestPublished (3)
     ✓ is null when pnpm fails or prints something that is not a version 535ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (22 tests) 1857ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > repeat harvest of same rows does not duplicate (idempotent)
> [bkit] TRUNCATED HERE — 130 lines omitted. Dropped content was NOT read.
   ✓ bkit disk prune — step files (10)
     ✓ min runs only min steps; max runs both 323ms
     ✓ a failing or throwing step is reported and the next step still runs 399ms
   ✓ bkit disk prune — lock (6)
     ✓ replaces a lock whose process is gone, or that is an hour old, and releases it 360ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 805 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 478ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 489ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 266ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (100 tests) 460ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 386ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 383ms
 ✓ .bkit/core/engine/render/trackers.test.ts (102 tests) 254ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 160ms
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

 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 243ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 118ms
 ✓ .bkit/core/engine/render/hosts.test.ts (125 tests) 243ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (53 tests) 324ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-wuppGX/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/audits/templates/templates.test.ts (248 tests) 148ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 129ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 213ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 218ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 89ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 101ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 121ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (38 tests) 98ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 231ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 122ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 132ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 124ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 124ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-5y6YvK/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/install/modules/core.test.ts (23 tests) 133ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 224ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 60ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 147ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 233ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 160ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 106ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 178ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 148ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 86ms
 ❯ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests | 1 failed) 226ms
   ❯ rules and Project Rules (10)
     ✓ ruleBullets reads the bkit block and the Project Rules section, in file order 4ms
     ✓ parseRuleEntries reads name, text, retired and refs 3ms
     ✓ the fixture passes 1ms
     ✓ rule entries match rules.md bullets one to one 0ms
     ✓ a rule inserted mid-list needs no edit to any other entry 0ms
     ✓ two rules with one name fail, since names are rule IDs 6ms
     ✓ a reworded rules.md bullet fails until sync retires the old text 1ms
     ✓ a refs section that does not exist fails 0ms
     ✓ refExists finds files, globs and headings in the repo 3ms
     × the repo store matches rules.md 62ms
   ✓ Hook Text (4)
     ✓ hookMessages joins concatenated literals and keeps ${…} holes 38ms
     ✓ the fixture passes 1ms
     ✓ a message without an entry and an entry no longer emitted both fail 1ms
     ✓ every hook message has an entry and every entry is still emitted 13ms
   ✓ Permissions (4)
     ✓ the fixture passes 1ms
     ✓ a pattern missing, extra, doubled or miscounted fails 1ms
     ✓ an opencode permission block that differs fails 0ms
     ✓ shipped permission patterns and store groups match exactly 1ms
   ✓ Special Behaviors and Authoring Rules (5)
     ✓ catalogSection runs to the next heading of the same or a higher level, fences skipped 1ms
     ✓ the fixture passes 1ms
     ✓ an edited row or section fails until sync copies it 1ms
     ✓ a row with no entry fails 0ms
     ✓ each Special Behaviors row and authoring section has one equal entry 81ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 140ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 22ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 52ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 62ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 81ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 78ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 151ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (41 tests) 142ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 87ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (65 tests) 68ms
 ✓ .bkit/core/engine/shared/settings.test.ts (31 tests) 140ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 56ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 34ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 66ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 96ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 32ms
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

 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (48 tests) 65ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 39ms
 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 56ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793497273554.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793497273577.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793497273578.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793497273589.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 58ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (28 tests | 2 skipped) 52ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 22ms
 ✓ .bkit/core/engine/install/manifest.test.ts (48 tests) 84ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 42ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 24ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 80ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 11133ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 11114ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 37ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 59ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 95ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 45ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 91ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 34ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 18ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 36ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (32 tests) 30ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 23ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (60 tests) 37ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (26 tests) 68ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 47ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 20ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 40ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 26ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 11ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 41ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (7 tests) 11ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 19ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 24ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 21ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 22ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 27ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 10ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 22ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 18ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 26ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 73ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 28ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 10ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (3 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (139 tests) 143717ms
   ✓ bkit workflows start (13)
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 820ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 626ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 862ms
       ✓ a new run in the same chat gets its own session row 450ms
       ✓ writes none outside Claude Code 450ms
     ✓ opens the next run after a finished one, and after another workflow's run 498ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 751ms
     ✓ design / plan / build / debug book in the current worktree 794ms
     ✓ refuses when the lock is live, writing no row 615ms
     ✓ --lock-held checks the lock is ours 833ms
     ✓ rejects an unknown workflow 423ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 789ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 759ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 521ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 458ms
     ✓ an OPEN decision of an earlier run never resurfaces 546ms
     ✓ an OPEN decision mid-build prints its header fields 416ms
     ✓ reads Test attempt from a tests pause 579ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 806ms
     ✓ writes no row when status.jsonl does not exist 677ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 730ms
     ✓ aborts a rebase only when one is in progress 1397ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1381ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 746ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 820ms
     ✓ --max-exceeded says a handover is due without any sentinel 553ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 548ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 816ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 675ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 330ms
     ✓ a debug run in SOAK mode always needs a handover 462ms
   ✓ bkit workflows close (19)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 823ms
       ✓ counts subagents of an earlier chat the run's session rows name 654ms
       ✓ records no context block, and still closes, outside a Claude Code session 589ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 632ms
     ✓ records ending held and publish false on the workflow-done row 1075ms
     ✓ defaults the close row to ending done 660ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1373ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1375ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1214ms
     ✓ always writes the telemetry, whatever the runtime 2065ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 977ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1126ms
     ✓ an unwritable stats path is logged and never fails the close 2048ms
     ✓ refuses without status.jsonl and writes nothing 1355ms
     ✓ ship: run.pr, size of the squash commit, and coverage 2135ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 2012ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 981ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1682ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1592ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1175ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1468ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1266ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1073ms
     ✓ --record-step writes the close step's row before workflow-done 827ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 680ms
     ✓ --number without --outbox is a usage error 738ms
     ✓ --flush is ship only 426ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1648ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1239ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1505ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1388ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 973ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 586ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 499ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2037ms
     ✓ --flush with nothing to record commits and pushes nothing 1893ms
     ✓ --flush carries the named worktree's logs into the dev commit 2122ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2841ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2054ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2953ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2758ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3450ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3482ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2873ms
     ✓ --push on dev never carries a row whose references name another feature 2001ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1549ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 3151ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 4797ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1220ms
     ✓ rejects --push with --flush, and --flush outside ship 590ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2532ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2304ms
     ✓ a close that landed releases the lock 2107ms
     ✓ removes the worktree before it releases the lock 1921ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 5770ms
       ✓ closePr refuses when the PR base is unknown 4473ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2614ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 301ms
     ✓ exits 12 when there is no versioned draft 302ms
     ✓ stamps the anchor from the runtime-resolved base commit 471ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 773ms
     ✓ promote copies the plan only 346ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 661ms
     ✓ names the branch, not the remote-tracking ref, in each URL 486ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 519ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 594ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1269ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 754ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1908ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 855ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 894ms
     ✓ a second run's record does not let this FID's close commit 1168ms
     ✓ record is present after workflows close and before the push 1124ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1189ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 312ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 349ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 546ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 450ms
     ✓ puts each --line after the summary, in flag order 471ms
     ✓ --summary prints the file and keeps a copy in --outbox 502ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 450ms
   ✓ --session-dir on fail / close (3)
     ✓ without --session-dir prints no sessionRemoved 568ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (198 tests) 180499ms
   ✓ branches rebase: behaviour (19)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 2019ms
     ✓ refuses a code conflict and aborts the rebase on the spot 1345ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1646ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 1230ms
     ✓ --hand-resolve resolves the ledger in a mixed stop and leaves the code path conflicted, the rebase in progress 1949ms
     ✓ --hand-resolve stops again at each later commit that conflicts 1880ms
     ✓ produces byte-identical output to merge=union 2774ms
     ✓ restores a trailing newline so the next append starts on its own line 1723ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 1493ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 2366ms
     ✓ refuses a union that leaves a line which is not JSON 1173ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1585ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1995ms
     ✓ refuses a lockfile whose regenerate command fails 2320ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 939ms
     ✓ removes a stale sentinel when the rebase succeeds 877ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 2271ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1652ms
   ✓ branches anchor-stamp (19)
     ✓ is idempotent: stamping twice with the same args is byte-identical 402ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 533ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 1070ms
       ✓ skips (12) with no anchor 1881ms
       ✓ skips (12) when the base is unreachable in this clone 1377ms
       ✓ skips (12) when nothing landed since the base 2415ms
       ✓ runs (0) with the landed path count once dev moved 2265ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 795ms
   ✓ branches push (17)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 2494ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 1199ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1447ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1827ms
     ✓ runs exactly one git push 1527ms
     ✓ --set-upstream records the upstream 1182ms
     ✓ refuses with no branch checked out 751ms
     ✓ --mode=dev refuses a feature checkout 824ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2224ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 871ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1226ms
     ✓ --mode=abort pushes when the branch has no open PR 1518ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1120ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 868ms
     ✓ --open-pr carries the MCP answer and skips gh 985ms
     ✓ --mode=abort on dev pushes plainly without probing 950ms
     ✓ rejects an unknown mode 827ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 2590ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1959ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1912ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3369ms
     ✓ skip-ci HEAD on the replay is refused 1548ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2750ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3339ms
     ✓ a level local dev is a plain push, recording nothing extra 2729ms
     ✓ a record with no commits pushes nothing 1489ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 918ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 2030ms
     ✓ a rewritten branch is refused, never forced 1003ms
     ✓ refuses dev and main with exit 21 and pushes nothing 636ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1348ms
     ✓ refuses a detached HEAD (exit 5) 580ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1113ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1245ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 2488ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1257ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 1091ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1672ms
     ✓ an up-to-date branch is a no-op 1643ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1507ms
     ✓ a fetch that fails exits 10 936ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1301ms
     ✓ --paths with no match exits 1 785ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 672ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 999ms
     ✓ --marker reads a diff over 1 MiB 872ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 926ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 884ms
     ✓ scan-diff finds an added skip 974ms
     ✓ scan-diff ignores a skip predating the base 1223ms
     ✓ scan-diff reports a disabled test with its line 963ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1496ms
     ✓ scan-diff ignores a removed comment in a test file 960ms
     ✓ scan-diff ignores an assertion moved within the file 959ms
     ✓ scan-diff still reports a removed assertion 1335ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1205ms
     ✓ scan-diff finds an added pytest mark skip 1284ms
     ✓ scan-diff finds an added unittest skip 1219ms
     ✓ scan-diff finds an added bare skip call 1071ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1578ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1201ms
     ✓ scan-diff ignores an assertion whose expectation changed 1282ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 1143ms
     ✓ scan-diff reports a deleted test file 1187ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 902ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1938ms
     ✓ a title that already carries the marker is left alone 1657ms
     ✓ with no open PR: pushes the marker commit and edits no title 1043ms
     ✓ a re-run is deduped: no second marker commit 917ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1039ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 420ms
     ✓ --title-set skips gh entirely 579ms
     ✓ refuses dev and main (exit 21) 326ms
   ✓ branches sync (11)
     ✓ Path A when origin/dev is an ancestor of HEAD 565ms
     ✓ Path B once dev moved; --head checks a given commit 973ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 840ms
     ✓ --merge-docs merges dev when docs/ is behind 1409ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 645ms
     ✓ --merge-docs never merges on dev itself 543ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 705ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 761ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 748ms
     ✓ exits 10 when the fetch fails 340ms
     ✓ refuses --merge-docs with --head, and an unknown --head 364ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 676ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 921ms
     ✓ a failed install stops ship (16) 817ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 702ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 663ms
     ✓ exits 10 when the fetch fails 518ms
   ✓ branches land (27)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 513ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1286ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1234ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1260ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1256ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2251ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2866ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 611ms
     ✓ local: names unpushed dev as the cause when the branch carries it 708ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 753ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1143ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1010ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 826ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 732ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 922ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 820ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 577ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1242ms
     ✓ land removes the worktree when only the copied .env is untracked 1090ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 808ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 818ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1565ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 923ms
     ✓ landPr refuses a main-based PR without retrying 627ms
     ✓ landPr refuses when the PR base is unknown 560ms
     ✓ PR not open (closed): stops (17) at once, no retry 655ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/tools/instructions-sources.test.ts > rules and Project Rules > the repo store matches rules.md
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "`tracker-next-labels`: ref `.bkit/lite.md` § When to use does not exist",
+ ]

 ❯ .bkit/core/engine/tools/instructions-sources.test.ts:170:48
    168|
    169|   it("the repo store matches rules.md", () => {
    170|     expect(checkRules(STORE, MASTERS, exists)).toEqual([]);
       |                                                ^
    171|   });
    172| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

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

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  2 failed | 160 passed (162)
      Tests  2 failed | 6739 passed | 2 skipped (6743)
   Start at  11:38:58
   Duration  182.29s (tests 96%, setup 1%, import 1%, transform 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/715-retire-lite-workflows/build-group-gate-6-5.log.reports/vitest-61309.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.76 |    82.73 |   95.27 |   91.03 |                   
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
 engine/commands   |   90.67 |     85.5 |   92.25 |   90.32 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   97.46 |    91.11 |     100 |     100 | 87-91,156,162     
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   98.41 |    93.67 |   96.07 |   98.75 | 291-292           
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   80.95 |    68.75 |   71.42 |      80 | ...18-231,257-258 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   96.85 |    86.87 |   87.03 |   97.59 |                   
  ci.ts            |   98.26 |    86.17 |   94.59 |    99.2 | 256,717           
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
 ...mmands/install |    47.9 |    45.74 |   59.49 |   48.26 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |      20 |     26.5 |      50 |   17.77 | ...42-146,217-613 
  uninstall.ts     |   67.79 |    64.46 |      70 |   68.92 | ...1101,1124-1291 
  upgrade.ts       |   32.45 |    30.88 |   35.71 |   33.57 | 350-378,560-1064  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   92.81 |    84.28 |      97 |   94.32 |                   
  branches.ts      |   90.04 |     82.7 |   97.43 |   91.68 | ...2101,2106,2131 
  challenge.ts     |   96.24 |    82.42 |     100 |    97.6 | ...67-369,619,643 
  context.ts       |   96.52 |    86.88 |   98.57 |   97.37 | ...1575,1745,1834 
  counters.ts      |   99.15 |     95.1 |     100 |   99.08 | 142               
  decisions.ts     |   95.26 |    80.52 |   97.72 |   98.34 | 193,296,365       
  disk.ts          |   93.49 |    86.93 |   96.07 |   95.74 | ...48,477-485,638 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   97.87 |    91.54 |   98.24 |   98.79 | 195,436-437,765   
  ledgers.ts       |   91.37 |    80.32 |   97.03 |    95.2 | ...1670-1671,1699 
  locks.ts         |   93.75 |    85.91 |   95.45 |   95.49 | ...09-210,379-380 
  plan-blocks.ts   |    90.9 |    83.57 |     100 |   91.04 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1159,1175-1176 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.69 |    91.66 |     100 |   97.22 | ...86,506-508,512 
  run-facts.ts     |    96.9 |    90.34 |     100 |   98.92 | 498-499           
  runs.ts          |   93.17 |    84.35 |     100 |   94.46 | ...1876,1908-1912 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...55,304,324-329 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   97.48 |    95.53 |     100 |   98.56 | 103,212,452       
  step-table.ts    |     100 |    98.48 |     100 |     100 | 319               
  steps.ts         |   87.35 |    81.41 |   89.55 |   88.46 | ...1453,1458,1460 
  summary.ts       |   95.02 |     86.8 |    91.3 |   93.71 | ...78-379,387-393 
  tasks.ts         |   83.58 |    66.11 |   85.71 |   87.82 | ...39,356,387,391 
  test-blocks.ts   |   95.39 |    88.23 |   96.55 |   96.61 | 23-24,235-236     
  tests.ts         |   96.15 |     87.2 |   96.93 |   97.69 | ...1804,1809-1810 
  tracker.ts       |   92.89 |    73.23 |     100 |   96.73 | ...36,848,931,979 
  workflows.ts     |   93.13 |    82.46 |   97.03 |    94.9 | ...1643,1817,2531 
  worktrees.ts     |   65.61 |    62.82 |   76.74 |   65.99 | ...58-961,964-965 
 engine/install    |   93.16 |    84.64 |   94.15 |   95.95 |                   
  cloud-env.ts     |    96.9 |     91.3 |     100 |   99.64 | 223               
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 587-594           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,293            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   96.87 |    92.93 |   98.87 |   97.24 |                   
  status.ts        |     100 |    98.68 |     100 |     100 | 122               
  telemetry.ts     |   96.41 |     92.3 |    98.6 |   96.85 | ...1776,1819,2265 
 engine/render     |   90.67 |    82.42 |   98.33 |   92.72 |                   
  hosts.ts         |   89.62 |     81.2 |   96.15 |   90.74 | ...45-255,587-588 
  models.ts        |   90.06 |    81.11 |     100 |    94.3 | ...80,266,288,322 
  trackers.ts      |     100 |      100 |     100 |     100 |                   
 engine/shared     |   99.42 |    97.09 |     100 |     100 |                   
  package-json.ts  |     100 |    96.77 |     100 |     100 | 65                
  ...ge-manager.ts |     100 |      100 |     100 |     100 |                   
  package-roots.ts |     100 |       75 |     100 |     100 | 42,105            
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |   99.01 |    98.47 |     100 |     100 | 237,288           
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   89.79 |    85.35 |   95.36 |   90.28 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
  instructions.ts  |   90.53 |    85.85 |    95.5 |   91.16 | ...1671-1753,1758 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.76% ( 16389/18257 )
Branches     : 82.73% ( 11570/13985 )
Functions    : 95.27% ( 2682/2815 )
Lines        : 91.03% ( 14331/15742 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1819 of 3489 lines (124 KB of 262 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
