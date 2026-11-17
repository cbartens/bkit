
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/166 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
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

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> bkit ci slop

[bkit-ci] base b8f96ad08c888820932e1c558f4c357fc91c50e1 (b8f96ad08c888820932e1c558f4c357fc91c50e1) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: b8f96ad08c888820932e1c558f4c357fc91c50e1
base: b8f96ad08c888820932e1c558f4c357fc91c50e1
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 2.5 on 10 cores: unit limits 5750ms per test, 11500ms per hook (x1.15)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
      Coverage enabled with v8

[feat/test 03e15e1] gate
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 13344ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 1190ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 1330ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 1436ms
     ✓ does not fall back through a malformed later success receipt 877ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 520ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 580ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 956ms
     ✓ requires proof even when the pushed increment changes no files 461ms
     ✓ ignores malformed receipts 535ms
     ✓ does not record a mutated tree 313ms
     ✓ does not record a committed tree 378ms
     ✓ records no proof for a failed gate or lighter gate 527ms
     ✓ requires integration proof when integration is declared 856ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 1310ms
     ✓ invalidates proof when the gate definition changes 628ms
     ✓ keeps whole-branch docs-only classification and rejects mixed argument modes 342ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 22501ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 849ms
     ✓ names each net-new and worsened finding in the log and the JSON 827ms
     ✓ fails on a net score rise with no net count change 502ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 839ms
     ✓ treats a net score at or below 0.001 as float noise 621ms
     ✓ passes when the change only resolves findings 742ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 389ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 569ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 337ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 451ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 500ms
     ✓ exits 4 on a dropped net field instead of silently passing 876ms
     ✓ exits 4 on no summary instead of silently passing 671ms
     ✓ exits 4 on output that is not JSON instead of silently passing 541ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 706ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 620ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 591ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 621ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 641ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1118ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 581ms
     ✓ explicit globs can select ignored prose and nested checkout files 338ms
     ✓ fails (exit 1) when vale reports alerts 348ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 418ms
     ✓ falls back to vale sync when the main worktree has none 544ms
     ✓ fails when vale sync cannot restore the required styles 763ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 427ms
   ✓ bkit ci min-push (9)
     ✓ checks every --ref: one code ref among min-push refs fails the push 441ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 395ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 23746ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 433ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1122ms
     ✓ always writes the marker, even with no plan 369ms
     ✓ writes the linear marker shape, taking the tracker from package.json 513ms
     ✓ writes the jira marker shape, taking the tracker from package.json 942ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 315ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 346ms
     ✓ retries a failed create once, and exits 5 when it fails twice 367ms
     ✓ exits 5 when the open-PR probe errors 365ms
     ✓ prs open still opens against any other base 354ms
     ✓ exits 6 when the created PR's base is not --base 319ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 656ms
     ✓ exits 1 with found=false when there is none 314ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 619ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 511ms
     ✓ exits 4 when gh errors and 80 when it needs auth 657ms
   ✓ bkit prs merge (11)
     ✓ appends the auto-route marker on an exact bkit:auto label only 304ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 492ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 483ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 340ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 384ms
     ✓ updates when the repo cannot be resolved 643ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 787ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 548ms
     ✓ is not green when a check failed, naming it (exit 1) 526ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 351ms
     ✓ is not green on an empty rollup (total 0) 439ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 362ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 511ms
     ✓ is a no-op when the title already says so 855ms
     ✓ strips the marker, with or without its bkit prefix 626ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 444ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (101 tests) 26348ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 15862ms
     ✓ sync has nothing left to rewrite 8793ms
     ✓ every clause reaches the cut-off of one surface it applies to 1151ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests) 27768ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 1238ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 563ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 919ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 317ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 526ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 317ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 324ms
     ✓ PASS is 0 failures with or without reports 480ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 380ms
     ✓ a log under the outbox is named main-checkout relative in the record 758ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 543ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 552ms
     ✓ numbers runs within the workflow's active run and per step 315ms
     ✓ without --file no row is written and the output carries row null 542ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 521ms
     ✓ a planned test that passes is a vacuous gap, exit 1 354ms
     ✓ a planned test absent from a loaded report is a missing gap 533ms
     ✓ a file that fails to load is a red of kind red-not-loaded 476ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 601ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 539ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 656ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 760ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 989ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 482ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 682ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 442ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1073ms
     ✓ green: a passed-accepted test is already landed, not a gap 641ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 369ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 543ms
     ✓ green: --group audits only that group's tasks 350ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 438ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 487ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 367ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 625ms
     ✓ green: lists each gap kind, with the runner output 370ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 755ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 31436ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 762ms
     ✓ runs code.ts through its declared gate in the built checkout 858ms
     ✓ runs code.ts through its declared gate in the built checkout 901ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 620ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 770ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 925ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 508ms
     ✓ runs the full gate for replayed debug code 854ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1006ms
     ✓ installs local dependencies against the built target tree 992ms
     ✓ runs the configured frozen install even without root dependencies 838ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 905ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1085ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1107ms
     ✓ never pushes local dev commits missing from origin/dev 1095ms
     ✓ dev moved: rebuilds on the new dev and pushes again 1996ms
     ✓ dev moved before every push: exhausted, nothing landed 2700ms
     ✓ any other refusal is returned, not retried 1345ms
     ✓ pushToDev replays a commit range onto origin/dev 1102ms
     ✓ a replay retries on the new dev when dev moved 1758ms
     ✓ pushToDev log line names what it lands 1040ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1118ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1206ms
     ✓ a push that fails without a server answer is returned once, never retried 1085ms
     ✓ a failed fetch is returned before anything is built 341ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1589ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1260ms
     ✓ lands from a clone whose fetch refspec omits dev 1273ms
     ✓ build throwing stops the landing and removes the throwaway checkout 387ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 14709ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 487ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 301ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 329ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 330ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 351ms
     ✓ counts commits behind origin/dev and the divergence age 453ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 610ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ from a worktree, still names the main checkout and its outbox 333ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 363ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 302ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the jira progress and review states, defaults for a key left unset 311ms
     ✓ prints null progress and review states under none 435ms
     ✓ prints buildPublishRemote and buildPublishLocal 562ms
     ✓ prints the publish defaults when package.json omits them 673ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 534ms
     ✓ prints nulls under github without a board, and for keys left unset 887ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 451ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 701ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 339ms
     ✓ an unpinned repo reports nulls and asks no registry 540ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 490ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 554ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 372ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 558ms
(node:74086) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:74086) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:74086) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:74086) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:74086) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:74086) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:74086) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (24 tests) 11872ms
   ✓ shipped copy-and-own test files (6)
     ✓ ci/bkit-test-awake.test.mjs passes when run on its own 4695ms
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 6201ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 7459ms
   ✓ bkit roadmap mirror (8)
     ✓ writes the row in the worktree, then commits and pushes the same row on dev 971ms
     ✓ lands the same docs/roadmap.md bytes on dev as it writes on the branch, a second apart 1026ms
     ✓ appends the branch's row byte for byte on dev when dev lacks the feature's earlier rows 1053ms
     ✓ never touches the main checkout and never pushes its local dev commits 1047ms
     ✓ run from a checkout on dev writes the row once and mirrors nothing 361ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1076ms
     ✓ a refused dev push is logged, never fails the close 1317ms
     ✓ an unreachable remote is logged, never fails the close 438ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (115 tests) 25665ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 343ms
   ✓ bkit steps done (24)
     ✓ --attempt=next advances with each row, so the next parentSha differs 340ms
     ✓ reports a failed commit with exit 8 without writing the row 613ms
     ✓ a failed commit leaves no row staged in the index 781ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 820ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 740ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 544ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 469ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 647ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 306ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 357ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 477ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 329ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 410ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 636ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 364ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 361ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 557ms
     ✓ writeStepRow refuses when a recorded path changed 567ms
     ✓ writeStepRow appends its commit sha to the record 508ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 972ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (9)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 412ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 365ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 614ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 477ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 616ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ does not count an artifact the run found committed when it started 334ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ commits a package.json change outside bkit.workflows 344ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 606ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (185 tests) 43201ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1260ms
   ✓ preserves the requested event for selected-workflow verification 663ms
   ✓ requires selected other-workflow success at the exact pushed head 1379ms
   ✓ bkit runs locate (11)
     ✓ locates CI evidence using prompt saved issue and local precedence 1269ms
     ✓ filters branch and PR discovery by configured workflow and exact head 530ms
     ✓ freezes explicit workflow run attempt and all failed job pages 420ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1066ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1356ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 552ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 440ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 333ms
     ✓ rejects a workflow result count smaller than its returned records 657ms
   ✓ bkit runs gate (68)
     ✓ --fetch refreshes origin/<branch> before gating 396ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 347ms
       ✓ a source change past the validated head refuses (17) and names the path 362ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 387ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 833ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 777ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1074ms
   ✓ bkit runs dispatch (16)
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 505ms
     ✓ a failed re-trigger push names the cause in the log 1106ms
     ✓ a failed re-trigger push leaves no orphan commit behind 823ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 999ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 566ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 314ms
     ✓ gh-error: every poll errored 341ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 502ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 560ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 591ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 563ms
     ✓ CLI: verdict JSON, body scan, exit codes 507ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 347ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 886ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 1706ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 1419ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1423ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 414ms
     ✓ re-trigger on dev only uses the record of its own FID 494ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 518ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 427ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
       ✓ without --repo no call gains a --repo flag 347ms
   ✓ bkit runs context (12)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 339ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 428ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 367ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 323ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 401ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 501ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 394ms
     ✓ --file and --step go together 306ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 15890ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ preserves records and reports an unread remainder when no continuation is available 566ms
     ✓ follows summary cursors even when the first page is shorter than the limit 423ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 303ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 356ms
     ✓ rejects missing summaries instead of treating them as empty results 304ms
     ✓ reports a failed first page as unavailable 312ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 348ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 399ms
     ✓ follows summary cursors even when the first page is shorter than the limit 321ms
     ✓ reports excluded intervals as unread even when pagination finishes 509ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 305ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 568ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 302ms
     ✓ rejects missing summaries instead of treating them as empty results 403ms
     ✓ reports a failed first page as unavailable 588ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 313ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 23780ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 547ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 547ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 555ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 352ms
     ✓ fetches the issue and its comments as GitHub returns them 590ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 362ms
     ✓ invalidates missing corrupt and unsupported progress cache 872ms
     ✓ contains cache read and write failures as standalone degradation 337ms
     ✓ records an engine-action row and skips the same key + body on a re-run 365ms
     ✓ a recent identical comment counts as done (the final close comment) 337ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 769ms
     ✓ a different marker hash posts 321ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 972ms
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (12 tests) 5045ms
   ✓ tests changed (10)
     ✓ runs bkit:gate:changed with the changed files as its arguments 903ms
     ✓ counts files committed since --base 594ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1102ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 453ms
     ✓ runs the --fallback gate even when no file changed, as it did before 598ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 14394ms
   ✓ bkit fids parse --prompt-file (68)
> [bkit] TRUNCATED HERE — 67 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (70 tests) 3267ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1315ms
     ✓ runGit names ENOBUFS when output passes the limit 629ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 553ms
> [bkit] TRUNCATED HERE — 951 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 147 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 172ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 160ms
 ✓ .bkit/core/engine/audits/workflows/question-option-format.test.ts (22 tests) 198ms
 ✓ .bkit/core/engine/ledgers/journal.test.ts (18 tests) 438ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 321ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 812ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (100 tests) 128ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (60 tests) 328ms
 ✓ .bkit/core/engine/commands/workflow/test-blocks.test.ts (14 tests) 335ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 30ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-Sr7z1c/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 55ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 93ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 89ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 96ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 238ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 186ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 67ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 155ms
(node:57636) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:57636) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:57636) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:57636) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 330ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-UusDoV/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 40ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 97ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 95ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 43ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 20ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 78ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 76ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (252 tests) 79ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 58ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 66ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 25ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 117ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 15ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 36ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 89ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 49ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 46ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 50ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 47ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 51ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 30ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 33ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 47ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 67ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (40 tests) 27ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 26ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 43ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (283 tests) 68ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (57 tests) 59ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 17ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 20ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 31ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 31ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 18ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 55ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 21ms
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

 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 7ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > leaves a .cursor/allowlist.json bkit never recorded alone
[test] core: .bkit/allowlist.json

 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 21ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 52ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > is idempotent — a second run finds nothing to migrate
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 23ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 26ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (40 tests) 36ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 14ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 39ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (54 tests) 44ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 43ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 7ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 23ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 46ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 15ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 32ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 16ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 7ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 20ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794105167019.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794105167022.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794105167022.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794105167029.js — skipping

 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 13ms
 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 19ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 16ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 14ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 16ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 17ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 12ms
(node:62228) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:62228) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (68 tests) 64ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 11ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 39ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 6ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 6ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 5ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 6ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 26ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 3ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 159ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 5ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 5ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (13 tests) 12ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 4ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (6 tests) 5ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 7ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 4ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 4ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 6ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 4ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 3ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 6ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (8 tests) 1994ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (154 tests) 71989ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 620ms
   ✓ bkit workflows fail (19)
     ✓ aborts a rebase only when one is in progress 391ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 317ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 386ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 336ms
       ✓ counts subagents of an earlier chat the run's session rows name 376ms
       ✓ records no context block, and still closes, outside a Claude Code session 355ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 420ms
     ✓ records ending held and publish false on the workflow-done row 347ms
     ✓ defaults the close row to ending done 430ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 499ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 449ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 439ms
     ✓ always writes the telemetry, whatever the runtime 404ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 321ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 417ms
     ✓ an unwritable stats path is logged and never fails the close 464ms
     ✓ appends the completeness row before the workflow-done row 470ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 416ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 432ms
     ✓ writes one completeness row per close 683ms
     ✓ leaves out the previous run's rows that share a second with this run's start 419ms
     ✓ still closes when the completeness check throws 451ms
     ✓ still closes when the completeness row write throws 435ms
     ✓ ship: run.pr, size of the squash commit, and coverage 390ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 490ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 373ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 324ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 496ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 455ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 508ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 534ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 472ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 330ms
     ✓ --number without --outbox is a usage error 373ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 540ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 605ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 627ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 637ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 529ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1573ms
     ✓ --flush with nothing to record commits and pushes nothing 785ms
     ✓ --flush carries the named worktree's logs into the dev commit 1434ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2094ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1398ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1696ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1375ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1753ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1643ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1794ms
     ✓ --push on dev never carries a row whose references name another feature 1752ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1449ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 2502ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1456ms
     ✓ --push commits in the named worktree, not the checkout it runs from 766ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2036ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1741ms
     ✓ a close that landed releases the lock 1826ms
     ✓ removes the worktree before it releases the lock 1790ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2606ms
       ✓ closePr refuses when the PR base is unknown 2405ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1843ms
   ✓ bkit workflows promote (7)
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 314ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 380ms
   ✓ --post on fail / links (4)
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 310ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 723ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 454ms
     ✓ record is present after workflows close and before the push 462ms
     ✓ failed handover from dev removes the record and keeps recorded paths 844ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 311ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (259 tests) 120500ms
   ✓ branches rebase: behaviour (30)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 378ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 436ms
     ✓ --file records nothing for a refused rebase 339ms
     ✓ refuses a code conflict and aborts the rebase on the spot 314ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1138ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 309ms
     ✓ produces byte-identical output to merge=union 735ms
     ✓ restores a trailing newline so the next append starts on its own line 567ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 442ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 670ms
     ✓ refuses a union that leaves a line which is not JSON 362ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 524ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 949ms
     ✓ refuses a lockfile whose regenerate command fails 693ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 634ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 644ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 623ms
     ✓ refuses and aborts when both sides changed the hand-written region 429ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 537ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 558ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 761ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 440ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 572ms
     ✓ refuses and aborts when a side deleted the install record 455ms
     ✓ refuses a conflicted doc the repo's script does not list 348ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 332ms
     ✓ removes a stale sentinel when the rebase succeeds 497ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 691ms
     ✓ resolves a conflict in each of two replayed commits across rounds 598ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) when nothing landed since the base 306ms
       ✓ runs (0) with the landed path count once dev moved 549ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 330ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 612ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 387ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 558ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1055ms
     ✓ runs exactly one git push 809ms
     ✓ --set-upstream records the upstream 542ms
     ✓ refuses with no branch checked out 380ms
     ✓ --mode=dev refuses a feature checkout 372ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1011ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1562ms
     ✓ --require-ci pushes as-is when dev has not moved 633ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1090ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1610ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 461ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 691ms
     ✓ --mode=abort pushes when the branch has no open PR 899ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 794ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 321ms
     ✓ --open-pr carries the MCP answer and skips gh 449ms
     ✓ --mode=abort on dev pushes plainly without probing 433ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1432ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 779ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 883ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2320ms
     ✓ skip-ci HEAD on the replay is refused 691ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1935ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2321ms
     ✓ a level local dev is a plain push, recording nothing extra 797ms
     ✓ a record with no commits pushes nothing 491ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 378ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1239ms
     ✓ a rewritten branch is refused, never forced 540ms
     ✓ refuses dev and main with exit 21 and pushes nothing 340ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 927ms
     ✓ refuses a detached HEAD (exit 5) 453ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 948ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 919ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 909ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1181ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 435ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 923ms
     ✓ an up-to-date branch is a no-op 592ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 986ms
     ✓ a fetch that fails exits 10 343ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 433ms
     ✓ scan-diff still reports a new skip when its test … 544ms
     ✓ scan-diff reports a skip moved onto a different t… 493ms
     ✓ scan-diff does not cancel a skip moved between am… 575ms
     ✓ scan-diff does not spend an unchanged duplicate t… 564ms
     ✓ scan-diff recognizes a renamed test file 617ms
     ✓ scan-diff recognizes a suite moved into a differe… 563ms
     ✓ scan-diff does not let unrelated additions hide a… 564ms
     ✓ scan-diff attributes deletion to its old test ins… 606ms
     ✓ scan-diff consumes each moved assertion once and … 572ms
     ✓ scan-diff does not match identical assertions fro… 611ms
     ✓ scan-diff does not match the same leaf test name … 596ms
     ✓ scan-diff does not match a same-named test with d… 603ms
     ✓ scan-diff does not match a same-named test with c… 723ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 673ms
     ✓ --paths with no match exits 1 561ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 438ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 584ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 338ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 311ms
     ✓ scan-diff finds an added skip 332ms
     ✓ scan-diff reports a disabled test with its line 312ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 757ms
     ✓ a title that already carries the marker is left alone 472ms
     ✓ with no open PR: pushes the marker commit and edits no title 493ms
     ✓ a re-run is deduped: no second marker commit 564ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 644ms
     ✓ --title-set skips gh entirely 305ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 371ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 365ms
     ✓ --merge-docs merges dev when docs/ is behind 427ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 400ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 587ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 616ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 508ms
     ✓ --merge-docs skips an empty bkit:generate script 442ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 370ms
     ✓ --merge-docs never merges on dev itself 340ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 488ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 510ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 460ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 490ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 618ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 662ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 764ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 663ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 622ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 774ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 578ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 670ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 469ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 322ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 392ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 605ms
     ✓ a failed install stops ship (16) 546ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 423ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 401ms
     ✓ exits 10 when the fetch fails 301ms
   ✓ branches land (27)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 984ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 960ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 959ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 971ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2045ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2453ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 370ms
     ✓ local: names unpushed dev as the cause when the branch carries it 418ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 453ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1367ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1178ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 923ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 926ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1048ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 959ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 682ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1200ms
     ✓ land removes the worktree when only the copied .env is untracked 1018ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 921ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 970ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1601ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 978ms
     ✓ landPr refuses a main-based PR without retrying 536ms
     ✓ landPr refuses when the PR base is unknown 538ms
     ✓ PR not open (closed): stops (17) at once, no retry 641ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 399ms
     ✓ --attempt names the merge round in a fix commit 359ms
     ✓ commits a rewritten and a deleted tracked file 371ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 314ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 335ms

 Test Files  173 passed (173)
      Tests  7325 passed | 2 skipped (7327)
   Start at  12:31:41
   Duration  121.22s (tests 97%, import 1%, setup 1%, transform 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/719-cloud-variants-add/build-group-gate-4-1.log.reports/vitest-56614.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.77 |    83.27 |   95.09 |   91.11 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   90.47 |     85.6 |   95.19 |   94.36 |                   
  auth.ts          |   98.46 |    98.11 |     100 |   97.95 | 69                
  ci-yml.ts        |   90.74 |    82.83 |     100 |   93.01 | ...09,422-424,435 
  github.ts        |   93.15 |    88.61 |     100 |    94.4 | ...76-277,405-407 
  index.ts         |   85.45 |    71.42 |     100 |   97.19 | ...00,320,417-418 
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
 engine/commands   |   89.65 |    84.15 |   93.25 |    90.4 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...82,195,197,204 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   94.55 |    89.53 |   97.05 |   97.28 | ...51,487,539-542 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   80.95 |    68.75 |   71.42 |      80 | ...18-231,257-258 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   95.78 |    86.92 |   90.41 |   97.88 |                   
  ci.ts            |   97.38 |    88.56 |   95.34 |    98.8 | 271,719,798,973   
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
  push-gate.ts     |   93.22 |    81.74 |     100 |   99.03 | 210               
 ...mmands/install |   47.59 |    45.02 |   58.75 |   47.98 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |   18.53 |    22.42 |      50 |   16.57 | ...29-133,204-610 
  uninstall.ts     |   67.79 |    64.46 |      70 |   68.92 | ...1101,1124-1291 
  upgrade.ts       |   32.34 |    30.88 |   33.33 |   33.45 | 350-378,560-1066  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |    92.3 |    84.63 |   96.34 |   93.75 |                   
  branches.ts      |   90.28 |    83.51 |   98.22 |   92.02 | ...3018,3043,3186 
  challenge.ts     |   96.95 |    84.84 |     100 |   98.02 | 178,368-370,656   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.28 |    93.96 |     100 |   98.72 | 217,516           
  decisions.ts     |   95.32 |    80.72 |   97.72 |   98.36 | 195,300,369       
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   96.65 |       90 |   96.55 |   97.39 | ...1066,1081-1091 
  ledgers.ts       |   91.28 |    80.25 |   97.08 |   95.23 | ...1692-1693,1721 
  locks.ts         |   93.22 |    86.44 |   96.29 |   95.36 | ...04-305,474-475 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1159,1175-1176 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 489-490           
  runs.ts          |   91.48 |    84.05 |    99.1 |   92.56 | ...2403,2435-2439 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...55,304,324-329 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   97.25 |    95.25 |     100 |   98.41 | 119,230,502,630   
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 245,356           
  steps.ts         |   89.89 |    83.02 |   90.82 |   91.09 | ...1960,1965,1967 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   96.11 |    88.92 |   93.44 |   95.19 | ...93-499,511,534 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.65 |    88.76 |   96.73 |   97.94 | ...2340,2436-2438 
  tracker.ts       |   89.02 |    80.61 |   96.69 |   91.11 | ...2097,2123-2128 
  workflows.ts     |   93.45 |    82.64 |   97.38 |   95.07 | ...1763,1937,2669 
  worktrees.ts     |   61.87 |    59.85 |   66.66 |   62.87 | ...1107,1110-1111 
 engine/install    |   93.17 |    84.64 |   94.15 |   95.96 |                   
  cloud-env.ts     |    96.9 |     91.3 |     100 |   99.64 | 223               
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,294            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   96.76 |    93.52 |   98.93 |   97.35 |                   
  status.ts        |   98.52 |    98.31 |     100 |     100 | 122,153,266       
  telemetry.ts     |   96.41 |     92.3 |    98.6 |   96.85 | ...1777,1820,2266 
 engine/render     |   90.61 |    82.85 |   98.36 |   92.72 |                   
  hosts.ts         |   89.62 |     81.2 |   96.15 |   90.74 | ...45-255,587-588 
  models.ts        |   90.06 |    81.11 |     100 |    94.3 | ...80,266,288,322 
  trackers.ts      |     100 |      100 |     100 |     100 |                   
 engine/shared     |   99.44 |     97.2 |     100 |     100 |                   
  package-json.ts  |     100 |    96.77 |     100 |     100 | 65                
  ...ge-manager.ts |     100 |      100 |     100 |     100 |                   
  package-roots.ts |     100 |       75 |     100 |     100 | 42,105            
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |   99.06 |    98.51 |     100 |     100 | 267,318           
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   89.93 |    85.49 |   95.47 |   90.54 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
  instructions.ts  |   90.65 |    85.99 |   95.62 |   91.41 | ...1718-1800,1805 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.77% ( 18837/20983 )
Branches     : 83.27% ( 14037/16856 )
Functions    : 95.09% ( 3044/3201 )
Lines        : 91.11% ( 16507/18117 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 442 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 206 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 199 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 193 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 188 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 196 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 72 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 230 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 194 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 194 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 199 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 198 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 200 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 208 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 775 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 498 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 15 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 15 ms
ok 19 stub: the response selector is cleared before running its body # in 15 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 19 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 21 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 22 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 16 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 20 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 13 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 32 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 47 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 569 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 351 ms
ok 30 refresh drops a file deleted in the index from the build # in 318 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 411 ms
ok 32 a key removed from the env file is unset on the next run # in 200 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 150 ms
ok 34 non-BKIT_ keys are skipped # in 142 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 150 ms
ok 36 a failed unsetenv is retried on the next run # in 174 ms
ok 37 logs key names only, never values # in 138 ms
ok 38 missing env file exits 0 without calling launchctl # in 24 ms
ok 39 the sweep prints the summary line the lane greps for # in 257 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 9 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (84.933291ms)
✔ shell cancellation waits for SIGTERM cleanup (138.874584ms)
✔ direct cancellation waits for SIGINT cleanup (85.601125ms)
✔ shell cancellation waits for SIGINT cleanup (139.390041ms)
✔ direct cancellation waits for SIGHUP cleanup (88.3835ms)
✔ shell cancellation waits for SIGHUP cleanup (160.876083ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (383.989458ms)
✔ shell cancellation follows a worker orphaned by a nested shell (228.994334ms)
✔ direct cancellation preserves a nested machine-lock owner (417.061542ms)
✔ shell cancellation preserves a nested machine-lock owner (459.390083ms)
✔ nested shell cancellation preserves a nested machine-lock owner (456.009875ms)
✔ a hard process-group timeout reaches a shell command during cleanup (85.625ms)
✔ ships a command-scoped sleep prevention wrapper (0.063584ms)
✔ preserves arguments, output and nonzero exit status (43.294709ms)
✔ runs an entire shell chain and retains its failure (26.474917ms)
✔ reports a missing command as 127 (25.422709ms)
✔ requires a command (23.438333ms)
✔ non-macOS platform selection runs commands without sleep prevention (39.228334ms)
✔ hard timeout escalation reaches a command that ignores TERM (144.646292ms)
✔ forwards POSIX cancellation to the command and releases the assertion (52.635459ms)
✔ holds a real macOS assertion only while the command runs (59.399167ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3174.4855
> [bkit] TRUNCATED — kept 1641 of 3113 lines (117 KB of 241 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
