
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
 668:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


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
 983:108   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1083:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1244:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1302:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 35962ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 792ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 919ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 1273ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 880ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 1127ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 635ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 861ms
     ✓ counts commits behind origin/dev and the divergence age 1174ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 1045ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1705ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1262ms
     ✓ from a worktree, still names the main checkout and its outbox 1550ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 1766ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 1456ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 1390ms
     ✓ prints the Jira site and project under jira 1012ms
     ✓ prints the board under github 1014ms
     ✓ prints the github progress and review states, defaults for a key left unset 752ms
     ✓ prints the linear progress and review states, defaults for a key left unset 668ms
     ✓ prints the jira progress and review states, defaults for a key left unset 684ms
     ✓ prints the linear progress and review states, defaults for a key left unset 568ms
     ✓ prints null progress and review states under none 787ms
     ✓ prints buildPublishRemote and buildPublishLocal 549ms
     ✓ prints the publish defaults when package.json omits them 851ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 984ms
     ✓ prints nulls under github without a board, and for keys left unset 1162ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 818ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 730ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 922ms
     ✓ an unpinned repo reports nulls and asks no registry 1012ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 820ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 1172ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 1034ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 938ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (93 tests) 37139ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 876ms
     ✓ done --group writes group on the row 661ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 800ms
     ✓ carries extra fields, parsed as JSON when they are JSON 305ms
     ✓ reports a failed commit with exit 8 without writing the row 800ms
     ✓ a failed commit leaves no row staged in the index 1156ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1256ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1137ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1136ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1245ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1731ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 334ms
     ✓ --ref reads the status file as committed on that ref, not from disk 684ms
     ✓ --ref exits 3 when the ref does not carry the status file 359ms
     ✓ fails on a placeholder left in the artifact 328ms
     ✓ fails when the row's verdict differs from the artifact's 353ms
     ✓ fails when the row does not list the artifact, or carries another attempt 335ms
     ✓ fails on a missing artifact 637ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 419ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 352ms
     ✓ fails a run-tests row missing its scope, and an empty scope 581ms
   ✓ bkit steps finish (14)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 459ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 557ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 426ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 937ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 904ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 679ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 685ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1358ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 636ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 340ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 428ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 752ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 477ms
       ✓ gate --issue="" under none keeps today's check 310ms
     ✓ --attempt-of checks the row carries the derived counter 421ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1134ms
     ✓ writeStepRow refuses when a recorded path changed 1054ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 517ms
     ✓ writeStepRow appends its commit sha to the record 855ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1563ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (53 tests) 41996ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1073ms
     ✓ names each net-new and worsened finding in the log and the JSON 1542ms
     ✓ fails on a net score rise with no net count change 1085ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1282ms
     ✓ treats a net score at or below 0.001 as float noise 1086ms
     ✓ passes when the change only resolves findings 985ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1155ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base resolves to HEAD 347ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1101ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 471ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1794ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1696ms
     ✓ exits 4 on a dropped net field instead of silently passing 1852ms
     ✓ exits 4 on no summary instead of silently passing 1761ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1440ms
     ✓ exits 5 when the base worktree cannot be created 391ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1377ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1305ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1597ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1231ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1217ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 2341ms
   ✓ bkit ci prose — file selection (3)
     ✓ defaults to every markdown file outside node_modules 348ms
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 888ms
     ✓ fails (exit 1) when vale reports alerts 1232ms
     ✓ exits 6 on a vale runtime error 965ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1512ms
     ✓ falls back to vale sync when the main worktree has none 1012ms
     ✓ fails when vale sync cannot restore the required styles 1361ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 584ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 319ms
   ✓ bkit ci min-push (8)
     ✓ exits 0 when every changed file is a plan log or a ledger 417ms
     ✓ exits 1 naming the files outside, whatever the commit message says 440ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 896ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 521ms
     ✓ reads bkit.testing.minPushPaths from package.json; an explicit [] turns it off 626ms
     ✓ a top-level glob does not reach into folders 370ms
     ✓ a push that changes no files is not proven a min push 417ms
     ✓ exits 7 when a commit or its base cannot be read 555ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 54458ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 602ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1071ms
     ✓ always writes the marker, even with no plan 965ms
     ✓ writes the linear marker shape, taking the tracker from package.json 683ms
     ✓ writes the jira marker shape, taking the tracker from package.json 1260ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 1096ms
     ✓ refuses a PR from dev, main, or the base itself 314ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1072ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1056ms
     ✓ exits 5 when the open-PR probe errors 1332ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1538ms
     ✓ prs open still opens against any other base 1435ms
     ✓ exits 6 when the created PR's base is not --base 1615ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 1282ms
     ✓ exits 1 with found=false when there is none 1363ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1385ms
     ✓ --number reads one PR, mergeable included 866ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 730ms
     ✓ exits 4 when gh errors and 80 when it needs auth 745ms
     ✓ refuses a bad --state or --number 313ms
   ✓ bkit prs scan-body (10)
     ✓ flags [skip ci] in the landed commit body (exit 1) 347ms
     ✓ flags [ci skip] in the landed commit body (exit 1) 382ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 765ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 1119ms
     ✓ drops the force-build marker from the title subject 581ms
     ✓ takes an explicit --subject 785ms
     ✓ runs no merge when the PR is already MERGED 447ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 939ms
     ✓ prs merge refuses a PR whose base is main 755ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 1260ms
     ✓ prs merge refuses when the PR base is unknown 957ms
     ✓ prs merge reads the base from the one pr view it already makes 1195ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 1027ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 1326ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 946ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 1208ms
     ✓ never reads dev's required checks without --only-if-required 868ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 1411ms
     ✓ updates when a dev ruleset requires status checks 765ms
     ✓ updates when dev's branch protection requires status checks 983ms
     ✓ ignores dev rulesets that require no checks 753ms
     ✓ updates when the repo cannot be resolved 738ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 778ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 690ms
     ✓ is not green when a check failed, naming it (exit 1) 754ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 571ms
     ✓ is not green on an empty rollup (total 0) 774ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 503ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1022ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 831ms
     ✓ is a no-op when the title already says so 750ms
     ✓ strips the marker, with or without its bkit prefix 900ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1352ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 21275ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 889ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 1202ms
     ✓ CI=true -> GITHUB_ACTION 738ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 705ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 1388ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 743ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 993ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 747ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 393ms
     ✓ LOCAL -> runtimeHeadless=false 721ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 1001ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 567ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 509ms
     ✓ UNKNOWN -> runtimeHeadless=false 775ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 533ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 731ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 579ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 667ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 502ms
     ✓ re-derives per call: one run's answer does not leak into the next 628ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 1204ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 683ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1150ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 767ms
     ✓ --file into a missing directory is refused, not created 931ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (125 tests) 59617ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 502ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 623ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 944ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1275ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 776ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1188ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 668ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 915ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 954ms
     ✓ PASS is 0 failures with or without reports 1136ms
     ✓ clears a previous attempt's reports before the gate runs 1006ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1286ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1594ms
     ✓ a log under the outbox is named main-checkout relative in the record 1411ms
     ✓ a log small enough is copied whole: not clamped, raw null 1445ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1359ms
   ✓ bkit tests plan-check (27)
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 343ms
   ✓ bkit tests red / green (38)
     ✓ records a red: the named test failed; row, log and test snapshot written, path passed whole 607ms
     ✓ refuses a run that is not a red: exit 1, reason printed, no red row 880ms
     ✓ a red refused as passed notes HEAD and the uncommitted files for green 860ms
     ✓ lints the test before its red when bkit:lint:file is declared; a lint failure records nothing 1067ms
     ✓ an undeclared bkit:lint:file is skipped with a note, and the red still runs 619ms
     ✓ a red already recorded for the unchanged test stands on resume; a changed test runs again 1328ms
     ✓ refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2) 663ms
     ✓ a script that cannot run is exit 4, not a rejected red 911ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1167ms
     ✓ green: --group audits only that group's tasks 935ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1451ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 934ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1336ms
     ✓ green prints a verdict and a fixable per gap 1586ms
     ✓ green verdict is FAIL when a gap is unfixable 1015ms
     ✓ green leaves a diff-reading kind fixable null 1408ms
     ✓ green prints verdict null when a gap needs a diff read 801ms
     ✓ green: lists each gap kind, with the diff for a test changed since its red 993ms
     ✓ green: a red recorded for a different test than the plan names is a red-mismatch 689ms
     ✓ green: a planned test that moved is a red-mismatch saying whether the recorded test passes now 779ms
     ✓ green: every test a task names needs its own red and its own pass 821ms
     ✓ test order (13)
       ✓ green finds the code commit for DONE — TASK N 1754ms
       ✓ a red recorded before the task's code commit stands, across a resumed execute 1315ms
       ✓ a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked 1216ms
       ✓ a test found by name in its file is judged on its own lines and the code it runs (3)
         ✓ another test's edit 613ms
         ✓ its own body's edit 829ms
         ✓ its helper's edit 1016ms
       ✓ a red run refused as passed (3)
         ✓ on another task's committed code that shares its file is already landed, not no-red 1564ms
         ✓ with the task's own files uncommitted then stays no-red, naming them 1693ms
         ✓ with no other task's code sharing a file stays no-red, saying so 1556ms
       ✓ green emits a test-changed gap for a red whose test gained added lines only 737ms
       ✓ green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green 1170ms
       ✓ green refuses an exception-only task from a workflow step commit 580ms
       ✓ green clears an exception-only task from a human commit 456ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (64 tests) 28862ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 316ms
     ✓ adopts the main checkout even when called from a linked worktree 394ms
     ✓ still adopts a cloud session branch whose upstream is main 311ms
   ✓ bkit worktrees setup — debug (4)
     ✓ may debug in place on dev 606ms
     ✓ adopts in place when the session is already on feat/{fid} 303ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 1254ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1211ms
     ✓ a new run of the same FID rewrites startSha 1601ms
     ✓ a resume of the same FID reuses the record 1628ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1117ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1185ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1398ms
     ✓ a stale record without a lock is replaced 1392ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 983ms
     ✓ ship names a missing feat branch 304ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1106ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 345ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 458ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 342ms
       ✓ checks no disk when there are no cleanup step files 507ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 480ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 513ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 425ms
     ✓ never commits an entry only the main checkout's copy list names 431ms
   ✓ bkit worktrees remove (12)
     ✓ removes a marked worktree with uncommitted changes and clears the marker 402ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 377ms
     ✓ tells a caller inside the removed worktree where to cd 355ms
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 1037ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 595ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 600ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 475ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 349ms
     ✓ staging failure: exit 4 and no commit is created, no false success 347ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 346ms
     ✓ --mode=stage stages the sweep but creates no commit 349ms
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 730ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 852ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 900ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 836ms
     ✓ fetches the issue and its comments as GitHub returns them 759ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ records an engine-action row and skips the same key + body on a re-run 809ms
     ✓ a recent identical comment counts as done (the final close comment) 667ms
     ✓ a failed post reports done false with the reason and never leaks a token 841ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 972ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 965ms
     ✓ a different marker hash posts 930ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1102ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (96 tests) 79915ms
   ✓ the corpus matches the instructions store (8)
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 882ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 958ms
     ✓ a push that fails without a server answer is returned once, never retried 802ms
     ✓ a failed fetch is returned before anything is built 543ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1644ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1749ms
     ✓ lands from a clone whose fetch refspec omits dev 1277ms
     ✓ build throwing stops the landing and removes the throwaway checkout 637ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (161 tests) 84776ms
   ✓ bkit runs gate (58)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 576ms
       ✓ a source change past the validated head refuses (17) and names the path 473ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 522ms
       ✓ --validated without --month / --fid is a usage error (2) 485ms
       ✓ a validated sha that is not an ancestor refuses (17) 518ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 2877ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 1566ms
     ✓ CLI: a failed gh workflow run exits 5 1536ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 2513ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 670ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1280ms
     ✓ a failed re-trigger push names the cause in the log 1652ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1215ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2472ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1281ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 662ms
     ✓ gh-error: every poll errored 496ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 769ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1075ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1037ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 865ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2388ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2203ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 736ms
     ✓ re-trigger on dev only uses the record of its own FID 954ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1085ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 951ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 718ms
     ✓ a refused capstone records FAIL with its reason 671ms
     ✓ an unreadable PR is an API error (20) with no head 997ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 816ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 1660ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 893ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 697ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1367ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1405ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 2023ms
     ✓ --file and --step go together 2222ms
(node:46927) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 934ms
     ✓ resolves config from the repo root when run from a subdirectory 681ms
     ✓ exits 6 when the PUT fails 939ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1079ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 1141ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 951ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 1162ms
     ✓ exits 6 when the api answer is not JSON 967ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (102 tests) 11844ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ treats regex characters in a skill name literally 1145ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 936ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 1165ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 930ms
     ✓ runs from the checkout top even when called from a subfolder 870ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 2644ms
       ✓ falls back to event.before when gh prints unparseable output 1314ms
       ✓ reports last-green-run as the source when the green head is an ancestor 2464ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 2069ms
         ✓ tests ancestry against --head, not HEAD 1611ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 1435ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (41 tests) 8413ms
   ✓ bkit roadmap mirror (6)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 659ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1775ms
     ✓ a refused dev push is logged, never fails the close 1814ms
     ✓ an unreachable remote is logged, never fails the close 986ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 6859ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 6846ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (19 tests) 3813ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 305ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 314ms
   ✓ bkit locks release (5)
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 735ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1395ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 467ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 3789ms
   ✓ gradeCompliance — the grade bkit workflows close runs before its report (7)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 867ms
     ✓ passes every rule on a clean head 336ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 465ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (40 tests) 3069ms
   ✓ runLines (5)
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
   ✓ guardRepoConfig (6)
     ✓ passes when nothing changed 313ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 554ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 470ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 412ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (22 tests) 1766ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (19 tests) 2823ms
> [bkit] TRUNCATED HERE — 142 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 875ms
   ✓ lookupLatestPublished (3)
     ✓ is null when pnpm fails or prints something that is not a version 534ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (5 tests) 989ms
   ✓ catalog parity — retired plan agents (1)
> [bkit] TRUNCATED HERE — 310 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 225 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 66 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 253 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 208 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (53 tests) 330ms
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 559ms
 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 565ms
 ✓ .bkit/core/engine/audits/workflows/question-option-format.test.ts (22 tests) 465ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-IDc2NX/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 338ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 200ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 222ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 417ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 387ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (255 tests) 381ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 162ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 150ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 209ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 155ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 105ms
 ✓ .bkit/core/engine/shared/settings.test.ts (31 tests) 161ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 335ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 92ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 124ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 176ms
 ✓ .bkit/core/engine/render/trackers.test.ts (102 tests) 189ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 117ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-JCCA4Y/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 133ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 96ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 214ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 96ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 139ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 126ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 192ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (41 tests) 115ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 100ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 86ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 90ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 97ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 75ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 80ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 121ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 92ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 99ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (48 tests) 87ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (38 tests) 101ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 71ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 135ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (125 tests) 123ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (23 tests) 79ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 53ms
 ✓ .bkit/core/engine/install/manifest.test.ts (48 tests) 93ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 35ms
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

 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 24ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > is idempotent — a second run finds nothing to migrate
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 42ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 48ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (65 tests) 46ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 122ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 43ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 48ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 51ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (28 tests | 2 skipped) 76ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 127ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 38ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 46ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (26 tests) 26ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 37ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 23ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793507544271.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793507544276.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793507544278.md — skipping (expected exactly one of each)

 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 37ms
stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793507544290.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 36ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 36ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (60 tests) 31ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 33ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 23ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 53ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 31ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 36ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (32 tests) 41ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 27ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 25ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 24ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 24ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 15ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 40ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 19ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 24ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 26ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 23ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 22ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 24ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 16ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 16ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 27ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 12ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 13ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 10ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 15ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 7ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (139 tests) 112904ms
   ✓ bkit workflows start (13)
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 492ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 534ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 801ms
       ✓ writes none outside Claude Code 312ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 301ms
     ✓ design / plan / build / debug book in the current worktree 338ms
     ✓ --lock-held checks the lock is ours 305ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 352ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 385ms
     ✓ writes no row when status.jsonl does not exist 325ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 324ms
     ✓ aborts a rebase only when one is in progress 652ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 572ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 369ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 447ms
     ✓ --max-exceeded says a handover is due without any sentinel 334ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 349ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 359ms
     ✓ a debug run in SOAK mode always needs a handover 383ms
   ✓ bkit workflows close (19)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 500ms
       ✓ counts subagents of an earlier chat the run's session rows name 563ms
       ✓ records no context block, and still closes, outside a Claude Code session 524ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 523ms
     ✓ records ending held and publish false on the workflow-done row 628ms
     ✓ defaults the close row to ending done 894ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 616ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 886ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 697ms
     ✓ always writes the telemetry, whatever the runtime 537ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 582ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 633ms
     ✓ an unwritable stats path is logged and never fails the close 655ms
     ✓ ship: run.pr, size of the squash commit, and coverage 924ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1593ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1046ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 842ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1124ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1484ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1075ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1231ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 857ms
     ✓ --record-step writes the close step's row before workflow-done 543ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 792ms
     ✓ --number without --outbox is a usage error 624ms
     ✓ --flush is ship only 388ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 947ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 980ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 955ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1079ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 741ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 414ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 401ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1763ms
     ✓ --flush with nothing to record commits and pushes nothing 1280ms
     ✓ --flush carries the named worktree's logs into the dev commit 1750ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2534ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2062ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2741ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2126ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2534ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2099ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2272ms
     ✓ --push on dev never carries a row whose references name another feature 2178ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2123ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 3672ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2506ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1441ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2124ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1436ms
     ✓ a close that landed releases the lock 1972ms
     ✓ removes the worktree before it releases the lock 1987ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4197ms
       ✓ closePr refuses when the PR base is unknown 3412ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1789ms
   ✓ bkit workflows promote (7)
     ✓ stamps the anchor from the runtime-resolved base commit 358ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 512ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 461ms
     ✓ names the branch, not the remote-tracking ref, in each URL 623ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 439ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 486ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 985ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 621ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1862ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 859ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 807ms
     ✓ a second run's record does not let this FID's close commit 1056ms
     ✓ record is present after workflows close and before the push 1858ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2516ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 304ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 389ms
     ✓ a run with no issue holds the prompt alone 415ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 765ms
     ✓ --plan is appended when the file exists and skipped when it does not 424ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 699ms
     ✓ a missing prompt file exits 13 330ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 1301ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 875ms
     ✓ puts each --line after the summary, in flag order 1203ms
     ✓ --summary prints the file and keeps a copy in --outbox 1000ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 623ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (198 tests) 152057ms
   ✓ branches rebase: behaviour (19)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1594ms
     ✓ refuses a code conflict and aborts the rebase on the spot 861ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1555ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 508ms
     ✓ --hand-resolve resolves the ledger in a mixed stop and leaves the code path conflicted, the rebase in progress 793ms
     ✓ --hand-resolve stops again at each later commit that conflicts 873ms
     ✓ produces byte-identical output to merge=union 1382ms
     ✓ restores a trailing newline so the next append starts on its own line 725ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 836ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1085ms
     ✓ refuses a union that leaves a line which is not JSON 532ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 789ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1913ms
     ✓ refuses a lockfile whose regenerate command fails 1964ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 504ms
     ✓ removes a stale sentinel when the rebase succeeds 753ms
     ✓ exits 4 when no rebase is in progress 505ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1079ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1036ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 536ms
       ✓ skips (12) with no anchor 642ms
       ✓ skips (12) when the base is unreachable in this clone 852ms
       ✓ skips (12) when nothing landed since the base 996ms
       ✓ runs (0) with the landed path count once dev moved 1485ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 732ms
   ✓ branches push (17)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1932ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 905ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1372ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 2068ms
     ✓ runs exactly one git push 2145ms
     ✓ --set-upstream records the upstream 828ms
     ✓ refuses with no branch checked out 619ms
     ✓ --mode=dev refuses a feature checkout 549ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1424ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 649ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1273ms
     ✓ --mode=abort pushes when the branch has no open PR 1749ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1567ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 689ms
     ✓ --open-pr carries the MCP answer and skips gh 929ms
     ✓ --mode=abort on dev pushes plainly without probing 923ms
     ✓ rejects an unknown mode 595ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1927ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1503ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1873ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3559ms
     ✓ skip-ci HEAD on the replay is refused 1227ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2127ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3135ms
     ✓ a level local dev is a plain push, recording nothing extra 1570ms
     ✓ a record with no commits pushes nothing 1199ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 788ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1778ms
     ✓ a rewritten branch is refused, never forced 1115ms
     ✓ refuses dev and main with exit 21 and pushes nothing 725ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1666ms
     ✓ refuses a detached HEAD (exit 5) 695ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1439ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1164ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1065ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1140ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 626ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1474ms
     ✓ an up-to-date branch is a no-op 977ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1552ms
     ✓ a fetch that fails exits 10 646ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 775ms
     ✓ --paths with no match exits 1 733ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 485ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 894ms
     ✓ --marker reads a diff over 1 MiB 848ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 924ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 907ms
     ✓ scan-diff finds an added skip 764ms
     ✓ scan-diff ignores a skip predating the base 764ms
     ✓ scan-diff reports a disabled test with its line 942ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1049ms
     ✓ scan-diff ignores a removed comment in a test file 999ms
     ✓ scan-diff ignores an assertion moved within the file 1019ms
     ✓ scan-diff still reports a removed assertion 1196ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1062ms
     ✓ scan-diff finds an added pytest mark skip 1164ms
     ✓ scan-diff finds an added unittest skip 1158ms
     ✓ scan-diff finds an added bare skip call 1050ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1102ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1201ms
     ✓ scan-diff ignores an assertion whose expectation changed 1228ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 1167ms
     ✓ scan-diff reports a deleted test file 1030ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 836ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1990ms
     ✓ a title that already carries the marker is left alone 1521ms
     ✓ with no open PR: pushes the marker commit and edits no title 1535ms
     ✓ a re-run is deduped: no second marker commit 1998ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1539ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 459ms
     ✓ --title-set skips gh entirely 520ms
   ✓ branches sync (11)
     ✓ Path A when origin/dev is an ancestor of HEAD 389ms
     ✓ Path B once dev moved; --head checks a given commit 517ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 522ms
     ✓ --merge-docs merges dev when docs/ is behind 580ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 544ms
     ✓ --merge-docs never merges on dev itself 502ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 707ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 704ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 662ms
     ✓ exits 10 when the fetch fails 320ms
     ✓ refuses --merge-docs with --head, and an unknown --head 328ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 629ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 846ms
     ✓ a failed install stops ship (16) 741ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 619ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 588ms
     ✓ exits 10 when the fetch fails 450ms
   ✓ branches land (27)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 324ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1088ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1050ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1037ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1065ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2058ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2636ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 553ms
     ✓ local: names unpushed dev as the cause when the branch carries it 670ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 665ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1241ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1374ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 947ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1023ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1210ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1026ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 704ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1466ms
     ✓ land removes the worktree when only the copied .env is untracked 1242ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1042ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1081ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1814ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1145ms
     ✓ landPr refuses a main-based PR without retrying 667ms
     ✓ landPr refuses when the PR base is unknown 589ms
     ✓ PR not open (closed): stops (17) at once, no retry 751ms

 Test Files  162 passed (162)
      Tests  6752 passed | 2 skipped (6754)
   Start at  14:30:34
   Duration  152.85s (tests 97%, setup 1%, import 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/715-retire-lite-workflows/build-group-gate-6-6.log.reports/vitest-1685.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.77 |    82.74 |   95.27 |   91.04 |                   
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
 ...mands/workflow |   92.82 |     84.3 |      97 |   94.33 |                   
  branches.ts      |   90.04 |     82.7 |   97.43 |   91.68 | ...2101,2106,2131 
  challenge.ts     |   96.24 |    82.42 |     100 |    97.6 | ...67-369,619,643 
  context.ts       |   96.52 |    86.88 |   98.57 |   97.37 | ...1575,1745,1834 
  counters.ts      |   99.15 |     95.1 |     100 |   99.08 | 142               
  decisions.ts     |   95.26 |    80.52 |   97.72 |   98.34 | 193,296,365       
  disk.ts          |   93.83 |    87.55 |   96.07 |   96.17 | ...55,485-493,647 
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
Statements   : 89.77% ( 16390/18257 )
Branches     : 82.74% ( 11574/13988 )
Functions    : 95.27% ( 2682/2815 )
Lines        : 91.04% ( 14332/15742 )
================================================================================

> @cbartens/bkit@6.0.0 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/*.bats

1..32
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 471 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 219 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 233 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 229 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 225 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 231 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 97 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 256 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 230 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 230 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 239 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 238 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 246 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 251 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 967 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 557 ms
ok 17 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 26 ms
ok 18 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 28 ms
ok 19 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 23 ms
ok 20 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 20 ms
ok 21 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 32 ms
ok 22 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 18 ms
ok 23 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 46 ms
ok 24 stub: --paginate emits one document per page; --slurp collapses them into an array # in 75 ms
ok 25 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 404 ms
ok 26 a key removed from the env file is unset on the next run # in 217 ms
ok 27 an empty value unsets the key instead of setting an empty string # in 194 ms
ok 28 non-BKIT_ keys are skipped # in 189 ms
ok 29 one failing key does not stop the others and the exit status is non-zero # in 195 ms
ok 30 a failed unsetenv is retried on the next run # in 232 ms
ok 31 logs key names only, never values # in 201 ms
ok 32 missing env file exits 0 without calling launchctl # in 34 ms
> [bkit] TRUNCATED — kept 1700 of 3232 lines (117 KB of 247 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
