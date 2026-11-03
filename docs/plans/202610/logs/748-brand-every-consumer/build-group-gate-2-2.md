
> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/167 files need formatting

> @cbartens/bkit@6.0.0 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
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

> @cbartens/bkit@6.0.0 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
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

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 23415ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 462ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 420ms
     ✓ brand-new untracked ledger is staged and committed 319ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 347ms
     ✓ path containing a space is staged and committed 384ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 327ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 315ms
     ✓ --mode=stage stages the sweep but creates no commit 317ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 725ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 452ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 387ms
     ✓ --root defaults to the working directory 307ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 535ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 415ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 407ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 373ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 606ms
     ✓ --path records its commit on the run's record, like every other commit mode 465ms
     ✓ a recorded ledger commits only the rows the run appended 568ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 832ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 689ms
     ✓ commitBookkeeping refuses when a recorded path changed 406ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 495ms
     ✓ under --mode=commit counts the squashed paths as something to commit 622ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 339ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 331ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 355ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 434ms
     ✓ a source file in the range: exit 7, path listed 413ms
     ✓ another FID's plan file in the range: exit 7 398ms
     ✓ from not an ancestor of to: exit 7 319ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps an own-cycle deferral exempt 387ms
     ✓ triage refuses a plan with no task blocks 324ms
     ✓ triage refuses a plan whose task blocks do not parse 301ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 31112ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 1109ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 755ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 741ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 1122ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 727ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 461ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 774ms
     ✓ counts commits behind origin/dev and the divergence age 1065ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 681ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1342ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 891ms
     ✓ from a worktree, still names the main checkout and its outbox 1560ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 1494ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 1253ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 1131ms
     ✓ prints the Jira site and project under jira 1152ms
     ✓ prints the board under github 1232ms
     ✓ prints the github progress and review states, defaults for a key left unset 514ms
     ✓ prints the linear progress and review states, defaults for a key left unset 531ms
     ✓ prints the jira progress and review states, defaults for a key left unset 530ms
     ✓ prints the linear progress and review states, defaults for a key left unset 540ms
     ✓ prints null progress and review states under none 663ms
     ✓ prints buildPublishRemote and buildPublishLocal 510ms
     ✓ prints the publish defaults when package.json omits them 629ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 529ms
     ✓ prints nulls under github without a board, and for keys left unset 1135ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 768ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 1075ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 796ms
     ✓ an unpinned repo reports nulls and asks no registry 1464ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 463ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 920ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 675ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 885ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (60 tests) 44183ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1069ms
     ✓ names each net-new and worsened finding in the log and the JSON 950ms
     ✓ fails on a net score rise with no net count change 922ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1377ms
     ✓ treats a net score at or below 0.001 as float noise 1041ms
     ✓ passes when the change only resolves findings 944ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 755ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base resolves to HEAD 305ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1192ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 494ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1250ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1556ms
     ✓ exits 4 on a dropped net field instead of silently passing 1524ms
     ✓ exits 4 on no summary instead of silently passing 1410ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1146ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1518ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1060ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1153ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1259ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1062ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1549ms
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 1137ms
     ✓ fails (exit 1) when vale reports alerts 854ms
     ✓ exits 6 on a vale runtime error 1303ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 865ms
     ✓ falls back to vale sync when the main worktree has none 1172ms
     ✓ fails when vale sync cannot restore the required styles 884ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 690ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 558ms
     ✓ is a usage error when the commit cannot be read 451ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 530ms
     ✓ exits 1 naming the code file, whatever the commit message says 474ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 779ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 471ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 1210ms
     ✓ exits 7 when a commit cannot be read 411ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 777ms
     ✓ exits 1 naming the files outside, whatever the commit message says 783ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1141ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 742ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 626ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 1247ms
     ✓ a top-level glob in the setting does not reach into folders 694ms
     ✓ a push that changes no files is not proven a min push 655ms
     ✓ exits 7 when a commit or its base cannot be read 648ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 44784ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 624ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1076ms
     ✓ always writes the marker, even with no plan 551ms
     ✓ writes the linear marker shape, taking the tracker from package.json 751ms
     ✓ writes the jira marker shape, taking the tracker from package.json 946ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 904ms
     ✓ refuses a PR from dev, main, or the base itself 350ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 687ms
     ✓ retries a failed create once, and exits 5 when it fails twice 815ms
     ✓ exits 5 when the open-PR probe errors 823ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 829ms
     ✓ prs open still opens against any other base 1201ms
     ✓ exits 6 when the created PR's base is not --base 1172ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 1348ms
     ✓ exits 1 with found=false when there is none 1007ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1195ms
     ✓ --number reads one PR, mergeable included 1083ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 1345ms
     ✓ exits 4 when gh errors and 80 when it needs auth 509ms
   ✓ bkit prs scan-body (10)
     ✓ passes a token-free body 398ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 546ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 699ms
     ✓ drops the force-build marker from the title subject 674ms
     ✓ takes an explicit --subject 619ms
     ✓ runs no merge when the PR is already MERGED 1047ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1008ms
     ✓ prs merge refuses a PR whose base is main 1149ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 680ms
     ✓ prs merge refuses when the PR base is unknown 644ms
     ✓ prs merge reads the base from the one pr view it already makes 763ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 1017ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 746ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 483ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 451ms
     ✓ never reads dev's required checks without --only-if-required 462ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 459ms
     ✓ updates when a dev ruleset requires status checks 1151ms
     ✓ updates when dev's branch protection requires status checks 516ms
     ✓ ignores dev rulesets that require no checks 953ms
     ✓ updates when the repo cannot be resolved 443ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 685ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 394ms
     ✓ is not green when a check failed, naming it (exit 1) 432ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 992ms
     ✓ is not green on an empty rollup (total 0) 523ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 428ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 980ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 438ms
     ✓ is a no-op when the title already says so 430ms
     ✓ strips the marker, with or without its bkit prefix 731ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 821ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ scans a clean landed body and records the close-transport row 303ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (133 tests) 46306ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 819ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 750ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 568ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 753ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 1051ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 778ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 495ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 553ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 568ms
     ✓ PASS is 0 failures with or without reports 599ms
     ✓ clears a previous attempt's reports before the gate runs 710ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 758ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 846ms
     ✓ a log under the outbox is named main-checkout relative in the record 1269ms
     ✓ a log small enough is copied whole: not clamped, raw null 1108ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1135ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1052ms
     ✓ numbers runs within the workflow's active run and per step 1136ms
     ✓ without --file no row is written and the output carries row null 1089ms
   ✓ bkit tests plan-check (28)
     ✓ plan-check refuses a Task cell naming an undefined task 306ms
   ✓ bkit tests red / green (31)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 679ms
     ✓ a planned test that passes is a vacuous gap, exit 1 579ms
     ✓ a planned test absent from a loaded report is a missing gap 649ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1355ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1309ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 588ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 861ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 954ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 867ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1108ms
     ✓ per-test proof (3)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 781ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1509ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 883ms
     ✓ green: a passed-accepted test is already landed, not a gap 747ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 588ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 413ms
     ✓ green refuses a plan with no task markers 362ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 764ms
     ✓ green: --group audits only that group's tasks 918ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 772ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 724ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 865ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 745ms
     ✓ green: lists each gap kind, with the runner output 665ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1244ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 765ms
       ✓ green clears an exception-only task from a human commit 707ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (109 tests) 47988ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 440ms
     ✓ done --group writes group on the row 322ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 479ms
     ✓ carries extra fields, parsed as JSON when they are JSON 351ms
     ✓ reports a failed commit with exit 8 without writing the row 1121ms
     ✓ a failed commit leaves no row staged in the index 1134ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1202ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1053ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 921ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 763ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1289ms
   ✓ bkit steps gate (8)
     ✓ fails when the row does not list the artifact, or carries another attempt 375ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 348ms
   ✓ bkit steps finish (15)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 394ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 378ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 631ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 907ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 640ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 944ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1119ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 690ms
     ✓ --post needs --number; without --post there is no tracker key 317ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 323ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 551ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 443ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 352ms
     ✓ --attempt-of checks the row carries the derived counter 322ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1011ms
     ✓ writeStepRow refuses when a recorded path changed 2259ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 865ms
     ✓ writeStepRow appends its commit sha to the record 1527ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1988ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (9)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 591ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 1173ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 1134ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 698ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1808ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 1134ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 695ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1751ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 320ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 640ms
     ✓ does not count an artifact the run found committed when it started 768ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 466ms
     ✓ commits a package.json change outside bkit.workflows 1019ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1619ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (64 tests) 38744ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ design and plan in place on main are refused 310ms
   ✓ bkit worktrees setup — debug (4)
     ✓ may debug in place on dev 634ms
     ✓ never in place on main 368ms
     ✓ refuses a detached HEAD before anything else 317ms
     ✓ adopts in place when the session is already on feat/{fid} 556ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 2051ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1605ms
     ✓ a new run of the same FID rewrites startSha 2284ms
     ✓ a resume of the same FID reuses the record 2319ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1563ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1449ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1703ms
     ✓ a stale record without a lock is replaced 2156ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1448ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 351ms
     ✓ fails with a fetch error when there is no origin to rebase onto 603ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 470ms
> [bkit] TRUNCATED HERE — 43 lines omitted. Dropped content was NOT read.
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 547ms
     ✓ source file is not treated as gate config 449ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 384ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 1345ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 1416ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1688ms
     ✓ a push that fails without a server answer is returned once, never retried 1192ms
     ✓ a failed fetch is returned before anything is built 821ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2183ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2250ms
     ✓ lands from a clone whose fetch refspec omits dev 1862ms
     ✓ build throwing stops the landing and removes the throwaway checkout 940ms
> [bkit] TRUNCATED HERE — 60 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
(node:85209) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1123ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 482ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 758ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 986ms
     ✓ fetches the issue and its comments as GitHub returns them 825ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ records an engine-action row and skips the same key + body on a re-run 929ms
     ✓ a recent identical comment counts as done (the final close comment) 1422ms
     ✓ a failed post reports done false with the reason and never leaks a token 1193ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1318ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 1966ms
     ✓ a different marker hash posts 2070ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1536ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (106 tests) 13865ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ treats regex characters in a skill name literally 1650ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 1297ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 1998ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 1570ms
     ✓ runs from the checkout top even when called from a subfolder 1962ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 576ms
       ✓ a source change past the validated head refuses (17) and names the path 463ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 548ms
       ✓ --validated without --month / --fid is a usage error (2) 361ms
       ✓ a validated sha that is not an ancestor refuses (17) 391ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 2302ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 1159ms
     ✓ CLI: a failed gh workflow run exits 5 1145ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 2008ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 616ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1092ms
     ✓ a failed re-trigger push names the cause in the log 1544ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1214ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1743ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 797ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 508ms
     ✓ gh-error: every poll errored 435ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 762ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1372ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1714ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1318ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 3245ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3271ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1092ms
     ✓ re-trigger on dev only uses the record of its own FID 1251ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1173ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 688ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 1010ms
     ✓ a refused capstone records FAIL with its reason 734ms
     ✓ an unreadable PR is an API error (20) with no head 839ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 982ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 1764ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1025ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 743ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 2286ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 2088ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 2448ms
     ✓ --file and --step go together 1871ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 11998ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 717ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1592ms
     ✓ a refused dev push is logged, never fails the close 2358ms
     ✓ an unreachable remote is logged, never fails the close 855ms
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (11 tests) 10240ms
   ✓ changedFiles (2)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1259ms
     ✓ counts files committed since --base 1503ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1077ms
     ✓ runs nothing and exits 0 when no file changed 411ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1376ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 3573ms
       ✓ falls back to event.before when gh prints unparseable output 1708ms
       ✓ reports last-green-run as the source when the green head is an ancestor 2079ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 2344ms
         ✓ tests ancestry against --head, not HEAD 2274ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 2329ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 11187ms
   ✓ bkit issues labels (25)
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 305ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 319ms
   ✓ bkit issues comment (33)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 1035ms
     ✓ resolves config from the repo root when run from a subdirectory 793ms
     ✓ exits 6 when the PUT fails 1254ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1071ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 1815ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 844ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 515ms
     ✓ exits 6 when the api answer is not JSON 1004ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (96 tests) 76213ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (19 tests) 5142ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 344ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 454ms
   ✓ bkit locks acquire --kind=workflow — ship (1)
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1793ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 797ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 871ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 380ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 365ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 390ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 414ms
     ✓ --file into a missing directory is refused, not created 370ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 1075ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1640ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 526ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (42 tests) 3836ms
   ✓ runLines (5)
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
   ✓ guardRepoConfig (6)
     ✓ passes when only another key changed, such as a branch's upstream 390ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 543ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 474ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 462ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 4376ms
   ✓ gradeCompliance — the grade bkit workflows close runs before its report (7)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 1050ms
     ✓ passes every rule on a clean head 361ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 564ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 924ms
   ✓ lookupLatestPublished (3)
     ✓ is null when pnpm fails or prints something that is not a version 556ms
 ✓ .bkit/core/engine/checks/tips/index.test.ts (26 tests) 1915ms
   ✓ tipsBase (4)
> [bkit] TRUNCATED HERE — 165 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 816 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 135 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 580ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 437ms
 ✓ .bkit/core/engine/audits/workflows/question-option-format.test.ts (22 tests) 538ms
   ✓ question option format: one layout across the corpus (12)
     ✓ counts the option lines found per directory 361ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 457ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 215ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (100 tests) 239ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 180ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 217ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 389ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 209ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 378ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (53 tests) 360ms
 ✓ .bkit/core/engine/render/trackers.test.ts (102 tests) 335ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-8JBp07/architecture.md — skipping (expected exactly one start/end)

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > upgrades a file with no consumer drift (update action)
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > reports conflict when consumer drift detected (does NOT overwrite)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > creates new files that do not yet exist on disk
[bkit-upgrade] upgrade: .claude/agents/bkit-new.md

 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 128ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 139ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 159ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > dry-run does not write files but reports what would change
[bkit-upgrade] [dry-run] upgrade: .claude/agents/bkit-foo.md

 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (283 tests) 178ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] upgrade: .claude/agents/bkit-update.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] conflict: .claude/agents/bkit-conflict.md — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > skips missing template files without throwing
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-e4NEAc/nonexistent.md — skipping .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > block-merge skip is seedable even though disk carries consumer prose outside the block
[bkit-upgrade] upgrade (merge): docs/foo.md

 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 216ms
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

 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 257ms
(node:69272) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:69272) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (65 tests) 137ms
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

 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 108ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 144ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 117ms
 ✓ .bkit/core/engine/render/hosts.test.ts (125 tests) 120ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 286ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 143ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 159ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 84ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 95ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 100ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 73ms
 ✓ .bkit/core/engine/install/manifest.test.ts (49 tests) 181ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 98ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 85ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (105 tests) 126ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 123ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 34ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 116ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (25 tests) 102ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 81ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (40 tests) 93ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 104ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 70ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 45ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 66ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 134ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 95ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 138ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (27 tests) 74ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 79ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 61ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (49 tests) 125ms
(node:72207) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:72207) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:72207) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:72207) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 31ms
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (5 tests) 70ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 43ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 54ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (28 tests | 2 skipped) 51ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 41ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 65ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 128ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 28ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 239ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 35ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 22ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793590195856.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793590195862.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793590195867.md — skipping (expected exactly one of each)

 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 40ms
stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793590195885.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 48ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 62ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 62ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 31ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 41ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 20ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 27ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 41ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 28ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 29ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 26ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 69ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 86ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 80ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (32 tests) 114ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 24ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 40ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 25ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 27ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 18ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 22ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 14ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 17ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 10ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 11ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (7 tests) 7ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 9ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 9ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (152 tests) 135355ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 326ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1045ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 332ms
     ✓ --lock-held checks the lock is ours 303ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 501ms
   ✓ bkit workflows start — resume facts (5)
     ✓ an OPEN decision of an earlier run never resurfaces 309ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 382ms
     ✓ writes no row when status.jsonl does not exist 360ms
     ✓ aborts a rebase only when one is in progress 658ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 521ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 542ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 304ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 503ms
       ✓ counts subagents of an earlier chat the run's session rows name 603ms
       ✓ records no context block, and still closes, outside a Claude Code session 577ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 521ms
     ✓ records ending held and publish false on the workflow-done row 587ms
     ✓ defaults the close row to ending done 532ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 568ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 654ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 606ms
     ✓ always writes the telemetry, whatever the runtime 683ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 620ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 774ms
     ✓ an unwritable stats path is logged and never fails the close 946ms
     ✓ appends the completeness row before the workflow-done row 984ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 821ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 839ms
     ✓ writes one completeness row per close 1234ms
     ✓ leaves out the previous run's rows that share a second with this run's start 537ms
     ✓ still closes when the completeness check throws 729ms
     ✓ still closes when the completeness row write throws 639ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1023ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 2137ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1163ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1075ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1290ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1351ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1504ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1580ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1236ms
     ✓ --record-step writes the close step's row before workflow-done 898ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 944ms
     ✓ --number without --outbox is a usage error 805ms
     ✓ --flush is ship only 554ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1511ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1355ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1688ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1719ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1245ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 674ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 490ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2699ms
     ✓ --flush with nothing to record commits and pushes nothing 1844ms
     ✓ --flush carries the named worktree's logs into the dev commit 2714ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3242ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3334ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 3651ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2805ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3129ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2466ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2808ms
     ✓ --push on dev never carries a row whose references name another feature 2394ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2084ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 3788ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3297ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1550ms
     ✓ rejects --push with --flush, and --flush outside ship 350ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2874ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1937ms
     ✓ a close that landed releases the lock 2449ms
     ✓ removes the worktree before it releases the lock 2387ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4770ms
       ✓ closePr refuses when the PR base is unknown 4111ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2760ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 316ms
     ✓ exits 12 when there is no versioned draft 323ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 318ms
     ✓ stamps the anchor from the runtime-resolved base commit 387ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 694ms
     ✓ promote copies the plan only 302ms
     ✓ rejects a workflow other than design or plan 380ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 626ms
     ✓ names the branch, not the remote-tracking ref, in each URL 620ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 646ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 511ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1358ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 740ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 2081ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 1002ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 994ms
     ✓ a second run's record does not let this FID's close commit 1189ms
     ✓ record is present after workflows close and before the push 2055ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1882ms
   ✓ bkit workflows input (7)
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 336ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 514ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 419ms
     ✓ puts each --line after the summary, in flag order 400ms
     ✓ --summary prints the file and keeps a copy in --outbox 415ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 413ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (224 tests) 194582ms
   ✓ branches rebase: behaviour (19)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 802ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 747ms
     ✓ --file records nothing for a refused rebase 538ms
     ✓ refuses a code conflict and aborts the rebase on the spot 595ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1143ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 444ms
     ✓ produces byte-identical output to merge=union 1184ms
     ✓ restores a trailing newline so the next append starts on its own line 799ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 770ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1046ms
     ✓ refuses a union that leaves a line which is not JSON 597ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 789ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1672ms
     ✓ refuses a lockfile whose regenerate command fails 1646ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 430ms
     ✓ removes a stale sentinel when the rebase succeeds 728ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 846ms
     ✓ resolves a conflict in each of two replayed commits across rounds 713ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 430ms
       ✓ skips (12) with no anchor 509ms
       ✓ skips (12) when the base is unreachable in this clone 506ms
       ✓ skips (12) when nothing landed since the base 541ms
       ✓ runs (0) with the landed path count once dev moved 1255ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 683ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1598ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 848ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1085ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1740ms
     ✓ runs exactly one git push 1817ms
     ✓ --set-upstream records the upstream 1456ms
     ✓ refuses with no branch checked out 1154ms
     ✓ --mode=dev refuses a feature checkout 992ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2437ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 3411ms
     ✓ --require-ci pushes as-is when dev has not moved 1704ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2477ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 3856ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 1158ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1376ms
     ✓ --mode=abort pushes when the branch has no open PR 1505ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1207ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 884ms
     ✓ --open-pr carries the MCP answer and skips gh 1071ms
     ✓ --mode=abort on dev pushes plainly without probing 1290ms
     ✓ rejects an unknown mode 1009ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 2701ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 2328ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2595ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4597ms
     ✓ skip-ci HEAD on the replay is refused 1611ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2785ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 4171ms
     ✓ a level local dev is a plain push, recording nothing extra 1725ms
     ✓ a record with no commits pushes nothing 1350ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 1030ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 2125ms
     ✓ a rewritten branch is refused, never forced 1195ms
     ✓ refuses dev and main with exit 21 and pushes nothing 718ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1799ms
     ✓ refuses a detached HEAD (exit 5) 806ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1523ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1609ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1436ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1816ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 869ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1980ms
     ✓ an up-to-date branch is a no-op 1260ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1851ms
     ✓ a fetch that fails exits 10 852ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 905ms
     ✓ --paths with no match exits 1 901ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 626ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1325ms
     ✓ --marker reads a diff over 1 MiB 957ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1571ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1613ms
     ✓ scan-diff finds an added skip 1601ms
     ✓ scan-diff ignores a skip predating the base 1468ms
     ✓ scan-diff reports a disabled test with its line 1454ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1150ms
     ✓ scan-diff ignores a removed comment in a test file 1249ms
     ✓ scan-diff ignores an assertion moved within the file 1245ms
     ✓ scan-diff still reports a removed assertion 1255ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1292ms
     ✓ scan-diff finds an added pytest mark skip 1539ms
     ✓ scan-diff finds an added unittest skip 1273ms
     ✓ scan-diff finds an added bare skip call 1124ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1336ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1170ms
     ✓ scan-diff ignores an assertion whose expectation changed 1235ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 1274ms
     ✓ scan-diff reports a deleted test file 1094ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 1020ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1953ms
     ✓ a title that already carries the marker is left alone 854ms
     ✓ with no open PR: pushes the marker commit and edits no title 876ms
     ✓ a re-run is deduped: no second marker commit 1041ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1159ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 390ms
     ✓ --title-set skips gh entirely 630ms
   ✓ branches sync (24)
     ✓ Path A when origin/dev is an ancestor of HEAD 390ms
     ✓ Path B once dev moved; --head checks a given commit 581ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 588ms
     ✓ --merge-docs merges dev when docs/ is behind 776ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 702ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 2992ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 815ms
     ✓ --merge-docs skips an empty bkit:generate script 719ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 649ms
     ✓ --merge-docs never merges on dev itself 573ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 826ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1120ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 801ms
     ✓ --merge merges dev into the feature branch with a skip-ci merge commit, never a rebase 877ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 441ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1063ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1289ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1267ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1059ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output with skip ci 1154ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 723ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 553ms
     ✓ exits 10 when the fetch fails 317ms
     ✓ refuses --merge-docs with --head, and an unknown --head 378ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 647ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 911ms
     ✓ a failed install stops ship (16) 802ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 647ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 775ms
     ✓ exits 10 when the fetch fails 866ms
   ✓ branches land (27)
     ✓ refuses a workflow other than design or plan 316ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 474ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1098ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1079ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1170ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1201ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2246ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2706ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 466ms
     ✓ local: names unpushed dev as the cause when the branch carries it 517ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 565ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1304ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1082ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1077ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1017ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1331ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1485ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 706ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 997ms
     ✓ land removes the worktree when only the copied .env is untracked 1071ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1088ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1065ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1587ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 990ms
     ✓ landPr refuses a main-based PR without retrying 695ms
     ✓ landPr refuses when the PR base is unknown 694ms
     ✓ PR not open (closed): stops (17) at once, no retry 894ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 777ms
     ✓ --attempt names the merge round in a fix commit 633ms
     ✓ commits a rewritten and a deleted tracked file 654ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 465ms
     ✓ reports undeclared and runs nothing with no scripts 303ms
     ✓ reports undeclared and runs nothing with an empty script 310ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 431ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 529ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 335ms

 Test Files  166 passed (166)
      Tests  6957 passed | 2 skipped (6959)
   Start at  13:27:47
   Duration  195.46s (tests 97%, setup 1%, import 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/748-brand-every-consumer/build-group-gate-2-2.log.reports/vitest-28595.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.73 |    82.71 |   95.01 |   91.02 |                   
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
 engine/commands   |    90.1 |    84.32 |    92.9 |   90.71 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   97.46 |    91.11 |     100 |     100 | 87-91,156,162     
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   94.13 |    88.53 |   96.87 |   97.08 | ...03,439,490-493 
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
 ...mands/workflow |   92.53 |    84.16 |    96.4 |      94 |                   
  branches.ts      |   89.58 |     82.9 |   97.74 |   90.97 | ...2550,2555,2580 
  challenge.ts     |   96.59 |    83.03 |     100 |      98 | 178,368-370,652   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.36 |    86.99 |      98 |   97.28 | ...1622,1793,1882 
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
  tests.ts         |   97.18 |     89.2 |   97.17 |   98.12 | ...2083,2179-2181 
  tracker.ts       |   92.89 |    73.23 |     100 |   96.73 | ...36,848,931,979 
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
Statements   : 89.73% ( 17317/19298 )
Branches     : 82.71% ( 12257/14818 )
Functions    : 95.01% ( 2822/2970 )
Lines        : 91.02% ( 15131/16623 )
================================================================================

> @cbartens/bkit@6.0.0 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/*.bats

1..36
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 510 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 240 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 244 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 285 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 280 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 268 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 95 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 262 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 239 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 242 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 243 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 259 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 262 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 270 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 1123 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 640 ms
ok 17 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 27 ms
ok 18 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 29 ms
ok 19 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 25 ms
ok 20 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 22 ms
ok 21 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 28 ms
ok 22 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 20 ms
ok 23 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 48 ms
ok 24 stub: --paginate emits one document per page; --slurp collapses them into an array # in 69 ms
ok 25 refresh builds the register from the staged files, not HEAD or unstaged edits # in 622 ms
ok 26 refresh drops a file deleted in the index from the build # in 375 ms
ok 27 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 422 ms
ok 28 a key removed from the env file is unset on the next run # in 199 ms
ok 29 an empty value unsets the key instead of setting an empty string # in 166 ms
ok 30 non-BKIT_ keys are skipped # in 169 ms
ok 31 one failing key does not stop the others and the exit status is non-zero # in 182 ms
ok 32 a failed unsetenv is retried on the next run # in 200 ms
ok 33 logs key names only, never values # in 170 ms
ok 34 missing env file exits 0 without calling launchctl # in 32 ms
ok 35 the sweep prints the summary line the lane greps for # in 373 ms
ok 36 the lane's grep pattern rejects output without the summary line # in 13 ms
> [bkit] TRUNCATED — kept 1747 of 3408 lines (124 KB of 262 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
