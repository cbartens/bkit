
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


0/165 files need formatting

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
 182:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 245:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 96:383    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 101:488   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 138:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 164:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 620:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 859:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1036:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1144:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1305:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1363:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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

[bkit-ci] base ecf4264b3ba63bcc1464b9f20b43b4db79cfe924 (ecf4264b3ba63bcc1464b9f20b43b4db79cfe924) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: ecf4264b3ba63bcc1464b9f20b43b4db79cfe924
base: ecf4264b3ba63bcc1464b9f20b43b4db79cfe924
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 3.7 on 10 cores: unit limits 6350ms per test, 12700ms per hook (x1.27)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
      Coverage enabled with v8

 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 484ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 4829ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 4820ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 12378ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 6658ms
     ✓ every fence parses under zsh -n 5637ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 27443ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 851ms
     ✓ runs code.ts through its declared gate in the built checkout 1039ms
     ✓ runs code.ts through its declared gate in the built checkout 925ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 872ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 941ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 770ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 342ms
     ✓ runs the full gate for replayed debug code 626ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 867ms
     ✓ installs local dependencies against the built target tree 943ms
     ✓ runs the configured frozen install even without root dependencies 834ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 867ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 951ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1185ms
     ✓ never pushes local dev commits missing from origin/dev 1008ms
     ✓ dev moved: rebuilds on the new dev and pushes again 1739ms
     ✓ dev moved before every push: exhausted, nothing landed 2605ms
     ✓ any other refusal is returned, not retried 1736ms
     ✓ pushToDev replays a commit range onto origin/dev 648ms
     ✓ a replay retries on the new dev when dev moved 1171ms
     ✓ pushToDev log line names what it lands 633ms
     ✓ runs no git hooks in the throwaway checkout, and says so 579ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 779ms
     ✓ a push that fails without a server answer is returned once, never retried 642ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1191ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1011ms
     ✓ lands from a clone whose fetch refspec omits dev 1097ms
     ✓ build throwing stops the landing and removes the throwaway checkout 388ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 24609ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 616ms
     ✓ names each net-new and worsened finding in the log and the JSON 849ms
     ✓ fails on a net score rise with no net count change 655ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1097ms
     ✓ treats a net score at or below 0.001 as float noise 790ms
     ✓ passes when the change only resolves findings 546ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 525ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 504ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 320ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 393ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 624ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 569ms
     ✓ exits 4 on a dropped net field instead of silently passing 419ms
     ✓ exits 4 on no summary instead of silently passing 419ms
     ✓ exits 4 on output that is not JSON instead of silently passing 600ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 735ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 606ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 799ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 743ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 517ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1100ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 1124ms
     ✓ explicit globs can select ignored prose and nested checkout files 1188ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 641ms
     ✓ fails (exit 1) when vale reports alerts 502ms
     ✓ exits 6 on a vale runtime error 390ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 491ms
     ✓ falls back to vale sync when the main worktree has none 973ms
     ✓ fails when vale sync cannot restore the required styles 753ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 394ms
   ✓ bkit ci min-push (9)
     ✓ checks every --ref: one code ref among min-push refs fails the push 371ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 552ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 30280ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 522ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1182ms
     ✓ always writes the marker, even with no plan 439ms
     ✓ writes the linear marker shape, taking the tracker from package.json 611ms
     ✓ writes the jira marker shape, taking the tracker from package.json 668ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 621ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 862ms
     ✓ retries a failed create once, and exits 5 when it fails twice 530ms
     ✓ exits 5 when the open-PR probe errors 609ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1059ms
     ✓ prs open still opens against any other base 582ms
     ✓ exits 6 when the created PR's base is not --base 515ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 422ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 588ms
     ✓ --number reads one PR, mergeable included 423ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 370ms
     ✓ exits 4 when gh errors and 80 when it needs auth 597ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 310ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 702ms
     ✓ drops the force-build marker from the title subject 584ms
     ✓ takes an explicit --subject 307ms
     ✓ runs no merge when the PR is already MERGED 330ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 542ms
     ✓ prs merge refuses a PR whose base is main 388ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 466ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 421ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 545ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 648ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 1048ms
     ✓ never reads dev's required checks without --only-if-required 1130ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 752ms
     ✓ updates when a dev ruleset requires status checks 514ms
     ✓ updates when dev's branch protection requires status checks 539ms
     ✓ ignores dev rulesets that require no checks 784ms
     ✓ updates when the repo cannot be resolved 600ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 758ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 550ms
     ✓ is not green when a check failed, naming it (exit 1) 301ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 308ms
     ✓ is not green on an empty rollup (total 0) 466ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 463ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 373ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 753ms
     ✓ is a no-op when the title already says so 435ms
     ✓ strips the marker, with or without its bkit prefix 360ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 477ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (101 tests) 31335ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 20378ms
     ✓ sync has nothing left to rewrite 9064ms
     ✓ every clause reaches the cut-off of one surface it applies to 1297ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests) 34479ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 600ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 610ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 572ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 622ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 731ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 645ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 795ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 692ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 684ms
     ✓ PASS is 0 failures with or without reports 767ms
     ✓ clears a previous attempt's reports before the gate runs 509ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 531ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 454ms
     ✓ a log small enough is copied whole: not clamped, raw null 495ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 313ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 559ms
     ✓ numbers runs within the workflow's active run and per step 579ms
     ✓ without --file no row is written and the output carries row null 404ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 505ms
     ✓ a planned test that passes is a vacuous gap, exit 1 399ms
     ✓ a planned test absent from a loaded report is a missing gap 460ms
     ✓ a file that fails to load is a red of kind red-not-loaded 556ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 540ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 969ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 1206ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1185ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1186ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 600ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1090ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 840ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 982ms
     ✓ green: a passed-accepted test is already landed, not a gap 640ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 451ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 539ms
     ✓ green: --group audits only that group's tasks 832ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 621ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1243ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 883ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1027ms
     ✓ green: lists each gap kind, with the runner output 719ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1055ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 22437ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 764ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 663ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 373ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 420ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 322ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 533ms
     ✓ counts commits behind origin/dev and the divergence age 568ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 362ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 672ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 802ms
     ✓ from a worktree, still names the main checkout and its outbox 1078ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 1201ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 834ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 384ms
     ✓ prints the Jira site and project under jira 544ms
     ✓ prints the board under github 957ms
     ✓ prints the github progress and review states, defaults for a key left unset 601ms
     ✓ prints the linear progress and review states, defaults for a key left unset 588ms
     ✓ prints the jira progress and review states, defaults for a key left unset 600ms
     ✓ prints the linear progress and review states, defaults for a key left unset 308ms
     ✓ prints null progress and review states under none 453ms
     ✓ prints buildPublishRemote and buildPublishLocal 463ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 858ms
     ✓ prints nulls under github without a board, and for keys left unset 599ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 553ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 945ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 767ms
     ✓ an unpinned repo reports nulls and asks no registry 945ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 510ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 704ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 572ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1237ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (185 tests) 41374ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1509ms
   ✓ preserves the requested event for selected-workflow verification 853ms
   ✓ requires selected other-workflow success at the exact pushed head 1943ms
   ✓ bkit runs locate (11)
     ✓ locates CI evidence using prompt saved issue and local precedence 1940ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1166ms
     ✓ freezes explicit workflow run attempt and all failed job pages 688ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1085ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1417ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 413ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 580ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 400ms
     ✓ rejects a workflow result count smaller than its returned records 346ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 829ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 1399ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1061ms
   ✓ bkit runs dispatch (16)
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 339ms
     ✓ a failed re-trigger push names the cause in the log 887ms
     ✓ a failed re-trigger push leaves no orphan commit behind 923ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 688ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 395ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 370ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 377ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 456ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 357ms
     ✓ CLI: verdict JSON, body scan, exit codes 589ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 615ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 1484ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 1156ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1034ms
     ✓ re-trigger on dev only uses the record of its own FID 314ms
   ✓ bkit runs context (12)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 343ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 304ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 632ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 301ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 414ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 343ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 467ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 374ms
     ✓ --file and --step go together 324ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 12853ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 638ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 563ms
     ✓ CI=true -> GITHUB_ACTION 695ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 915ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 701ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 554ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 704ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 1115ms
     ✓ LOCAL -> runtimeHeadless=false 642ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 480ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 368ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 422ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 496ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 681ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 404ms
     ✓ --file into a missing directory is refused, not created 320ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (60 tests) 13466ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 889ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 701ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 560ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 701ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 902ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 984ms
     ✓ fetches the issue and its comments as GitHub returns them 670ms
     ✓ github fetch marks a closed issue terminal and an open one not 626ms
   ✓ postCommentOnce (4)
     ✓ records an engine-action row and skips the same key + body on a re-run 463ms
     ✓ a recent identical comment counts as done (the final close comment) 614ms
     ✓ a failed post reports done false with the reason and never leaks a token 435ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 413ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 868ms
     ✓ a board the token cannot see is scope 316ms
     ✓ an HTTP 403 from gh is scope 339ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 433ms
     ✓ github: no block, no blockers and no further reads 307ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 325ms
     ✓ a different marker hash posts 387ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 302ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (65 tests) 14174ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 416ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 400ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 325ms
     ✓ a new run of the same FID rewrites startSha 512ms
     ✓ a resume of the same FID reuses the record 484ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 549ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 14457ms
   ✓ bkit fids parse --prompt-file (68)
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 808ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 1139ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 1524ms
     ✓ exits 6 when the api answer is not JSON 1055ms
 ✓ .bkit/core/engine/audits/templates/context-templates.test.ts (89 tests) 872ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (115 tests) 27823ms
   ✓ bkit steps done (24)
     ✓ reports a failed commit with exit 8 without writing the row 910ms
     ✓ a failed commit leaves no row staged in the index 1029ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 803ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 825ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 902ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 943ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 676ms
   ✓ bkit steps gate (8)
     ✓ fails on a placeholder left in the artifact 398ms
     ✓ fails on a missing artifact 604ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 302ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 310ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 361ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 633ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 301ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1811ms
     ✓ counts files committed since --base 1215ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 983ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1007ms
     ✓ runs the --fallback gate even when no file changed, as it did before 805ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 390ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1564ms
     ✓ a refused dev push is logged, never fails the close 2271ms
     ✓ an unreachable remote is logged, never fails the close 557ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (4 tests) 7ms
 ✓ .bkit/core/engine/commands/lib.test.ts (69 tests) 2929ms
> [bkit] TRUNCATED HERE — 54 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 63 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 59 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 970ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 1105ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1602ms
     ✓ reports excluded intervals as unread even when pagination finishes 1005ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 1388ms
     ✓ reports an unread remainder at the page cap 910ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 1269ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 558ms
     ✓ rejects missing summaries instead of treating them as empty results 942ms
     ✓ reports a failed first page as unavailable 584ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 486ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 496ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 457ms
     ✓ follows summary cursors even when the first page is shorter than the limit 519ms
     ✓ reports excluded intervals as unread even when pagination finishes 459ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 476ms
     ✓ reports an unread remainder at the page cap 469ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 555ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 433ms
     ✓ rejects missing summaries instead of treating them as empty results 459ms
     ✓ reports a failed first page as unavailable 520ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 319ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 188ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 541ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 616ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 314ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > writes plugin.json, hooks.json, both hook scripts, and emits the setup advisory
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 889 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 136 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 451ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 52ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 99ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 14ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 79ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (100 tests) 283ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 88ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 36ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 302ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 23ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (252 tests) 115ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 148ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-7JC86m/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 159ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 65ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 131ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 113ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 29ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-4MDECU/nonexistent.md — skipping .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > block-merge skip is seedable even though disk carries consumer prose outside the block
[bkit-upgrade] upgrade (merge): docs/foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > a consumer edit survives a no-op upgrade and is a conflict on the next template change
[bkit-upgrade] conflict: .bkit/scripts/bkit-foo.sh — consumer drift detected, NOT overwriting

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > template with a slash-prefixed HTML marker (// <!-- bkit:start -->) is classified html-comment, not slash-comment (site-9 mis-classification trap)
[bkit-upgrade] upgrade (merge): weird.js

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > a marker-less consumer file gets the block appended, its own content kept
[bkit-upgrade] upgrade (merge): .claude/hooks/gateguard.cjs

 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 109ms
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

 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 36ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 99ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 158ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 42ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 59ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 50ms
(node:11616) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:11616) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (68 tests) 264ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 71ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 245ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 248ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 124ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 302ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 12ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 177ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 28ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 98ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 67ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 73ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 32ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 94ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 36ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 130ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 87ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 57ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 27ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793864872367.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793864872370.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793864872371.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793864872382.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 30ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 119ms
 ✓ .bkit/core/engine/audits/repo/ledger-read-idiom.test.ts (11 tests) 1506ms
 ✓ .bkit/core/engine/install/manifest.test.ts (49 tests) 136ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (40 tests) 137ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 58ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 70ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 41ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 113ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (54 tests) 172ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 10ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 59ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 48ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 49ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 51ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 51ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 26ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 11ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (154 tests) 76298ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 739ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 365ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 311ms
       ✓ counts subagents of an earlier chat the run's session rows name 356ms
       ✓ records no context block, and still closes, outside a Claude Code session 327ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 325ms
     ✓ records ending held and publish false on the workflow-done row 310ms
     ✓ defaults the close row to ending done 400ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 360ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 748ms
     ✓ always writes the telemetry, whatever the runtime 402ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 312ms
     ✓ an unwritable stats path is logged and never fails the close 416ms
     ✓ appends the completeness row before the workflow-done row 441ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 531ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 301ms
     ✓ writes one completeness row per close 434ms
     ✓ leaves out the previous run's rows that share a second with this run's start 316ms
     ✓ still closes when the completeness check throws 345ms
     ✓ still closes when the completeness row write throws 452ms
     ✓ ship: run.pr, size of the squash commit, and coverage 419ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 627ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 303ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 401ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 372ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 335ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 400ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 429ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 393ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 333ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 381ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 929ms
     ✓ --flush with nothing to record commits and pushes nothing 512ms
     ✓ --flush carries the named worktree's logs into the dev commit 935ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 1429ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1301ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1567ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1220ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1623ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1075ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1003ms
     ✓ --push on dev never carries a row whose references name another feature 936ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 868ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 2609ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2241ms
     ✓ --push commits in the named worktree, not the checkout it runs from 837ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1896ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1665ms
     ✓ a close that landed releases the lock 1725ms
     ✓ removes the worktree before it releases the lock 1793ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4045ms
       ✓ closePr refuses when the PR base is unknown 3815ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1933ms
   ✓ bkit workflows promote (7)
     ✓ stamps the anchor from the runtime-resolved base commit 485ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 364ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 364ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 616ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 407ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1207ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 594ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 588ms
     ✓ a second run's record does not let this FID's close commit 641ms
     ✓ record is present after workflows close and before the push 1145ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2096ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 413ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 527ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 1007ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 647ms
     ✓ puts each --line after the summary, in flag order 746ms
     ✓ --summary prints the file and keeps a copy in --outbox 1081ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 808ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 156ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 36ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 15ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (13 tests) 35ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 15ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 16ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 14ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 38ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 33ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 41ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 35ms
(node:16195) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:16195) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:16195) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:16195) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 147ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 13ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 20ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 15ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 27ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 23ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 12ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 11ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (6 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 13ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 7ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 11ms
[feat/test d957d80] gate
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 15659ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 2864ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 3304ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 534ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 485ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 321ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 377ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 1415ms
     ✓ does not fall back through a malformed later success receipt 552ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 309ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 339ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 557ms
     ✓ requires proof even when the pushed increment changes no files 325ms
     ✓ ignores malformed receipts 527ms
     ✓ does not record a mutated tree 319ms
     ✓ records no proof for a failed gate or lighter gate 566ms
     ✓ requires integration proof when integration is declared 635ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 833ms
     ✓ invalidates proof when the gate definition changes 410ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (259 tests) 133166ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 349ms
   ✓ branches rebase: behaviour (30)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 468ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 481ms
     ✓ refuses a code conflict and aborts the rebase on the spot 301ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 843ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 349ms
     ✓ produces byte-identical output to merge=union 948ms
     ✓ restores a trailing newline so the next append starts on its own line 402ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 393ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 495ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 349ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1123ms
     ✓ refuses a lockfile whose regenerate command fails 951ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 542ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 507ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 587ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 417ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 775ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 617ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 344ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 531ms
     ✓ refuses and aborts when a side deleted the install record 457ms
     ✓ refuses a conflicted doc the repo's script does not list 426ms
     ✓ removes a stale sentinel when the rebase succeeds 333ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 525ms
     ✓ resolves a conflict in each of two replayed commits across rounds 562ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 313ms
       ✓ runs (0) with the landed path count once dev moved 481ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 443ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 326ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 526ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1595ms
     ✓ runs exactly one git push 1139ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 610ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 990ms
     ✓ --require-ci pushes as-is when dev has not moved 449ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 795ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1318ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 340ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 985ms
     ✓ --mode=abort pushes when the branch has no open PR 997ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 653ms
     ✓ --open-pr carries the MCP answer and skips gh 625ms
     ✓ --mode=abort on dev pushes plainly without probing 412ms
     ✓ rejects an unknown mode 304ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1056ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 569ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 582ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3163ms
     ✓ skip-ci HEAD on the replay is refused 652ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2116ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2519ms
     ✓ a level local dev is a plain push, recording nothing extra 851ms
     ✓ a record with no commits pushes nothing 701ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 425ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1040ms
     ✓ a rewritten branch is refused, never forced 626ms
     ✓ refuses dev and main with exit 21 and pushes nothing 391ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 991ms
     ✓ refuses a detached HEAD (exit 5) 485ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 808ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 791ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 748ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 774ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 452ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 660ms
     ✓ an up-to-date branch is a no-op 482ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 945ms
     ✓ a fetch that fails exits 10 453ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 468ms
     ✓ scan-diff still reports a new skip when its test … 460ms
     ✓ scan-diff reports a skip moved onto a different t… 566ms
     ✓ scan-diff does not cancel a skip moved between am… 465ms
     ✓ scan-diff does not spend an unchanged duplicate t… 490ms
     ✓ scan-diff recognizes a renamed test file 539ms
     ✓ scan-diff recognizes a suite moved into a differe… 696ms
     ✓ scan-diff does not let unrelated additions hide a… 804ms
     ✓ scan-diff attributes deletion to its old test ins… 1018ms
     ✓ scan-diff consumes each moved assertion once and … 771ms
     ✓ scan-diff does not match identical assertions fro… 697ms
     ✓ scan-diff does not match the same leaf test name … 655ms
     ✓ scan-diff does not match a same-named test with d… 694ms
     ✓ scan-diff does not match a same-named test with c… 759ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 782ms
     ✓ --paths with no match exits 1 781ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 530ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 972ms
     ✓ --marker reads a diff over 1 MiB 726ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 798ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 784ms
     ✓ scan-diff finds an added skip 878ms
     ✓ scan-diff ignores a skip predating the base 734ms
     ✓ scan-diff reports a disabled test with its line 929ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 784ms
     ✓ scan-diff ignores a removed comment in a test file 705ms
     ✓ scan-diff ignores an assertion moved within the file 901ms
     ✓ scan-diff still reports a removed assertion 996ms
     ✓ scan-diff reports an assertion re-added only outside the test file 922ms
     ✓ scan-diff finds an added pytest mark skip 1003ms
     ✓ scan-diff finds an added unittest skip 1088ms
     ✓ scan-diff finds an added bare skip call 821ms
     ✓ scan-diff ignores a quoted skip in a documentation file 689ms
     ✓ scan-diff ignores a marker literal in a non-test source file 360ms
     ✓ scan-diff ignores an assertion whose expectation changed 302ms
     ✓ scan-diff reports a deleted test file 310ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 786ms
     ✓ a title that already carries the marker is left alone 523ms
     ✓ with no open PR: pushes the marker commit and edits no title 708ms
     ✓ a re-run is deduped: no second marker commit 823ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 971ms
     ✓ --title-set skips gh entirely 401ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 325ms
     ✓ Path B once dev moved; --head checks a given commit 463ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 465ms
     ✓ --merge-docs merges dev when docs/ is behind 479ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 387ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 501ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 524ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 420ms
     ✓ --merge-docs skips an empty bkit:generate script 374ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 327ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 416ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 428ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 389ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 432ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 541ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 640ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 663ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 604ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 534ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 703ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 654ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 941ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 608ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 389ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 593ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 770ms
     ✓ a failed install stops ship (16) 562ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 380ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 349ms
   ✓ branches land (27)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1201ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1296ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1179ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 861ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 1988ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 3086ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 834ms
     ✓ local: names unpushed dev as the cause when the branch carries it 699ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 758ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1878ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1182ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 838ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 756ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 911ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 994ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 716ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1653ms
     ✓ land removes the worktree when only the copied .env is untracked 1121ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 826ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 824ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2186ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1113ms
     ✓ landPr refuses a main-based PR without retrying 522ms
     ✓ landPr refuses when the PR base is unknown 502ms
     ✓ PR not open (closed): stops (17) at once, no retry 593ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 391ms
     ✓ --attempt names the merge round in a fix commit 480ms
     ✓ commits a rewritten and a deleted tracked file 536ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 462ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 333ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 351ms

 Test Files  173 passed (173)
      Tests  7279 passed | 2 skipped (7281)
   Start at  17:46:36
   Duration  134.93s (tests 94%, import 2%, transform 2%, setup 1%, worker 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/719-cloud-variants-add/build-group-gate-2-1.log.reports/vitest-11043.xml
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.91 |    83.21 |    95.2 |   91.27 |                   
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
 engine/commands   |   89.65 |    84.07 |   93.25 |    90.4 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...82,195,197,204 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   94.55 |    89.41 |   97.05 |   97.28 | ...49,485,537-540 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   80.95 |    68.75 |   71.42 |      80 | ...18-231,257-258 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   95.78 |    86.92 |   90.41 |   97.88 |                   
  ci.ts            |   97.38 |    88.56 |   95.34 |    98.8 | 271,719,798,973   
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
  push-gate.ts     |   93.22 |    81.74 |     100 |   99.03 | 210               
 ...mmands/install |   47.86 |    45.74 |   58.75 |   48.22 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |      20 |     26.5 |      50 |   17.77 | ...42-146,217-613 
  uninstall.ts     |   67.79 |    64.46 |      70 |   68.92 | ...1101,1124-1291 
  upgrade.ts       |   32.34 |    30.88 |   33.33 |   33.45 | 350-378,560-1066  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |    92.6 |    84.54 |   96.53 |   94.09 |                   
  branches.ts      |   90.28 |    83.51 |   98.22 |   92.02 | ...3018,3043,3186 
  challenge.ts     |   96.95 |    84.84 |     100 |   98.02 | 178,368-370,656   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.28 |    93.96 |     100 |   98.72 | 217,516           
  decisions.ts     |   95.32 |    80.72 |   97.72 |   98.36 | 195,300,369       
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   97.87 |    91.54 |   98.24 |   98.79 | 195,436-437,771   
  ledgers.ts       |   91.28 |    80.25 |   97.08 |   95.23 | ...1692-1693,1721 
  locks.ts         |   93.75 |    85.91 |   95.45 |   95.49 | ...09-210,379-380 
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
  steps.ts         |   89.89 |    83.04 |   90.82 |   91.09 | ...1952,1957,1959 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   96.11 |    88.92 |   93.44 |   95.19 | ...93-499,511,534 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-changed.ts |   92.95 |     75.8 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.65 |    88.76 |   96.73 |   97.94 | ...2340,2436-2438 
  tracker.ts       |   92.96 |    73.63 |     100 |   96.75 | ...53,865,948,996 
  workflows.ts     |   93.45 |    82.55 |   97.38 |   95.07 | ...1761,1935,2658 
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
Statements   : 89.91% ( 18475/20548 )
Branches     : 83.21% ( 13597/16340 )
Functions    : 95.2% ( 3015/3167 )
Lines        : 91.27% ( 16183/17729 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 765 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 237 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 224 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 235 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 225 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 219 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 92 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 283 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 259 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 257 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 370 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 393 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 377 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 367 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 894 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 559 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 13 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 14 ms
ok 19 stub: the response selector is cleared before running its body # in 14 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 19 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 19 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 17 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 13 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 18 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 12 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 30 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 45 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 543 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 345 ms
ok 30 refresh drops a file deleted in the index from the build # in 326 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 427 ms
ok 32 a key removed from the env file is unset on the next run # in 213 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 180 ms
ok 34 non-BKIT_ keys are skipped # in 167 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 176 ms
ok 36 a failed unsetenv is retried on the next run # in 211 ms
ok 37 logs key names only, never values # in 171 ms
ok 38 missing env file exits 0 without calling launchctl # in 28 ms
ok 39 the sweep prints the summary line the lane greps for # in 315 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 10 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (122.417125ms)
✔ shell cancellation waits for SIGTERM cleanup (179.359375ms)
✔ direct cancellation waits for SIGINT cleanup (118.766875ms)
✔ shell cancellation waits for SIGINT cleanup (177.865667ms)
✔ direct cancellation waits for SIGHUP cleanup (123.940833ms)
✔ shell cancellation waits for SIGHUP cleanup (181.5855ms)
✔ shell cancellation follows a worker orphaned by a nested shell (252.635541ms)
✔ direct cancellation preserves a nested machine-lock owner (435.979542ms)
✔ shell cancellation preserves a nested machine-lock owner (478.179667ms)
✔ nested shell cancellation preserves a nested machine-lock owner (494.755708ms)
✔ a hard process-group timeout reaches a shell command during cleanup (87.356458ms)
✔ ships a command-scoped sleep prevention wrapper (0.090709ms)
✔ preserves arguments, output and nonzero exit status (61.178916ms)
✔ runs an entire shell chain and retains its failure (35.549959ms)
✔ reports a missing command as 127 (34.320459ms)
✔ requires a command (27.724041ms)
✔ non-macOS platform selection runs commands without sleep prevention (51.053041ms)
✔ hard timeout escalation reaches a command that ignores TERM (154.29875ms)
✔ forwards POSIX cancellation to the command and releases the assertion (54.950833ms)
✔ holds a real macOS assertion only while the command runs (76.718917ms)
ℹ tests 20
ℹ suites 0
ℹ pass 20
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3191.238667
> [bkit] TRUNCATED — kept 1662 of 3156 lines (117 KB of 244 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
