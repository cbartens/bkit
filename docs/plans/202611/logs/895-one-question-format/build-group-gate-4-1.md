
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-4 is waiting for tests (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 48754, since 11:14:07), last run took 2m53s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-4 is waiting for tests (still, 1 min so far) (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 48754, since 11:14:07), last run took 2m53s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-4 is waiting for tests (still, 2 min so far) (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 48754, since 11:14:07), last run took 2m53s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-4 is waiting for tests (still, 3 min so far) (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 48754, since 11:14:07), last run took 2m53s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-4 is waiting for tests (still, 4 min so far) (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 48754, since 11:14:07), last run took 2m53s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-4 is waiting for tests (still, 5 min so far) (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 48754, since 11:14:07), last run took 2m53s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-4 is waiting for tests (still, 6 min so far) (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 48754, since 11:14:07), last run took 2m53s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-4 is waiting for tests (still, 7 min so far) (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 48754, since 11:14:07), last run took 2m53s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-4 is waiting for tests (still, 8 min so far) (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 48754, since 11:14:07), last run took 2m53s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-4 is waiting for tests (still, 9 min so far) (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 48754, since 11:14:07), last run took 2m53s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-4 is waiting for tests (still, 10 min so far) (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 48754, since 11:14:07), last run took 2m53s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-4 is waiting for tests (still, 11 min so far) (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 48754, since 11:14:07), last run took 2m53s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-4 is waiting for tests (still, 12 min so far) (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 48754, since 11:14:07), last run took 2m53s

> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


 .bkit/core/.bkit/README.md
 342:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/cloud.md
 467:178  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/install.md
 19:1     warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 135:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 359:290  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 367:1    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


 .bkit/core/.bkit/jsonl.md
 196:3    warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 265:4    warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 434:106  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/pipeline.md
 146:227  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/providers.md
 47:301   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 177:787  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 184:120  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 186:172  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 495:97   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 871:80   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/templates.md
 518:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 640:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 723:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 203:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 277:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 104:383   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 109:488   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 146:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 172:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 633:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 872:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1053:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1163:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1255:74   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1497:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1557:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-ci-performance.md
 127:16  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-database.md
 143:224  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-dependencies.md
 313:16  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/prompts/bkit-utility-update-tracker.md
 124:6  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/templates/context/bkit-serena.md
 6:78  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/templates/docs/testing.md
 254:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 345:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 396:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 467:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 docs/deployments.md
 122:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 251:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 384:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 424:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 495:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 47 warnings and 0 suggestions in 152 files.
passed: true
skipped: null
files: 152

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> bkit ci slop

[bkit-ci] base dd8b4390c4bbba6cc0bffdd59303832b8dc6d826 (dd8b4390c4bbba6cc0bffdd59303832b8dc6d826) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: dd8b4390c4bbba6cc0bffdd59303832b8dc6d826
base: dd8b4390c4bbba6cc0bffdd59303832b8dc6d826
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 12.9 on 10 cores: unit limits 10950ms per test, 21900ms per hook (x2.19)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 26053ms
   ✓ resolveBkitBinary (3)
     ✓ names the pinned location when neither exists 381ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 712ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 702ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 998ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 540ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 916ms
     ✓ gh not on PATH at all also falls back to the remote 307ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 401ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 693ms
     ✓ counts commits behind origin/dev and the divergence age 1263ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 736ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1125ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1177ms
     ✓ from a worktree, still names the main checkout and its outbox 963ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 900ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 790ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 817ms
     ✓ prints the Jira site and project under jira 632ms
     ✓ prints the board under github 846ms
     ✓ prints the github progress and review states, defaults for a key left unset 611ms
     ✓ prints the linear progress and review states, defaults for a key left unset 508ms
     ✓ prints the jira progress and review states, defaults for a key left unset 676ms
     ✓ prints the linear progress and review states, defaults for a key left unset 729ms
     ✓ prints null progress and review states under none 598ms
     ✓ prints buildPublishRemote and buildPublishLocal 643ms
     ✓ prints the publish defaults when package.json omits them 487ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 557ms
     ✓ prints nulls under github without a board, and for keys left unset 1135ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 694ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 688ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 538ms
     ✓ an unpinned repo reports nulls and asks no registry 511ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 349ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 338ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 491ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 399ms
[feat/test 1a2f1a1] gate
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (23 tests) 36566ms
   ✓ verified incremental push gates (23)
     ✓ keeps the later failure when two full gates overlap on the same commit 3935ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 3627ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 642ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 559ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 543ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 429ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 3233ms
     ✓ does not fall back through a malformed later success receipt 1835ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1038ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1133ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2696ms
     ✓ a full-gate receipt carries an audit template's project-section increment to the minimum gate 2281ms
     ✓ requires proof even when the pushed increment changes no files 1572ms
     ✓ ignores malformed receipts 1334ms
     ✓ does not record a tracked tree 584ms
     ✓ does not record a untracked tree 613ms
     ✓ does not record a mutated tree 940ms
     ✓ does not record a committed tree 939ms
     ✓ records no proof for a failed gate or lighter gate 1956ms
     ✓ requires integration proof when integration is declared 1647ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 3007ms
     ✓ invalidates proof when the gate definition changes 1340ms
     ✓ keeps whole-branch docs-only classification and rejects mixed argument modes 674ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (154 tests) 50680ms
   ✓ CI evidence test rounds (4)
     ✓ runs local gates only after current-generation remediation or soak 1182ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 533ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 728ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 569ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 799ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 416ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 388ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 578ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 647ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 446ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 593ms
     ✓ PASS is 0 failures with or without reports 839ms
     ✓ clears a previous attempt's reports before the gate runs 907ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 603ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 775ms
     ✓ a log under the outbox is named main-checkout relative in the record 756ms
     ✓ a log small enough is copied whole: not clamped, raw null 448ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 461ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1032ms
     ✓ numbers runs within the workflow's active run and per step 805ms
     ✓ without --file no row is written and the output carries row null 593ms
   ✓ bkit tests plan-check (35)
     ✓ plan-check refuses a matrix header with no closing pipe 357ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 715ms
     ✓ a planned test that passes is a vacuous gap, exit 1 707ms
     ✓ a planned test absent from a loaded report is a missing gap 770ms
     ✓ a file that fails to load is a red of kind red-not-loaded 966ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1172ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 454ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1140ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 570ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 544ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1605ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 900ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1140ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 932ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1241ms
     ✓ green: a passed-accepted test is already landed, not a gap 1235ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1105ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 939ms
     ✓ green: --group audits only that group's tasks 760ms
     ✓ green: a code fence never closed is the reason, not missing task markers 355ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 883ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1276ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1047ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 948ms
     ✓ green: lists each gap kind, with the runner output 708ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1917ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 527ms
       ✓ green clears an exception-only task from a human commit 420ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 54216ms
   ✓ bkit worktrees setup — usage (9)
     ✓ refuses ["--workflow=ship","--fid=42-thing","--month=202610","--branch=a..b"] 407ms
     ✓ refuses ["--workflow=build","--month=202610"] 304ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 380ms
     ✓ adopts the main checkout even when called from a linked worktree 729ms
     ✓ design refuses to work in place on dev 314ms
     ✓ design and plan in place on main are refused 410ms
     ✓ still adopts a cloud session branch whose upstream is main 592ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1691ms
     ✓ may debug in place on dev 789ms
     ✓ adopts in place when the session is already on feat/{fid} 481ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 1156ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 995ms
     ✓ a new run of the same FID rewrites startSha 1995ms
     ✓ a resume of the same FID reuses the record 1712ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1101ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1304ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1786ms
     ✓ a stale record without a lock is replaced 1674ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1247ms
     ✓ refuses inherited unpublished dev commits in every ship mode 4975ms
     ✓ names inherited commits and ship recovery in the refusal 1354ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1734ms
     ✓ ship names a missing feat branch 435ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1348ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 568ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 394ms
     ✓ fails with a fetch error when there is no origin to rebase onto 442ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 337ms
       ✓ checks no disk when there are no cleanup step files 470ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 552ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 517ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 395ms
     ✓ never commits an entry only the main checkout's copy list names 553ms
   ✓ bkit worktrees remove (18)
     ✓ leaves a worktree without the marker in place 318ms
     ✓ preserves a marked worktree with uncommitted changes and its marker 727ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 564ms
     ✓ tells a caller inside the removed worktree where to cd 496ms
     ✓ fails with its own exit code when git cannot remove a marked path 376ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1331ms
       ✓ preserves staged-only mode during landed cleanup 1691ms
       ✓ preserves staged-only type during landed cleanup 1465ms
       ✓ preserves staged-only deletion during landed cleanup 1414ms
       ✓ removes landed staged content when both index and working contents are on dev 1494ms
       ✓ deletes the proved local and remote branch at their landed tips 1829ms
       ✓ retains the remote branch when origin refuses its conditional deletion 2080ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 465ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 517ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 612ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 949ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (131 tests) 60699ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 1179ms
     ✓ finishes a CI round only with its own failed job count 1073ms
     ✓ preserves local clamp enforcement when completing test rounds 344ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 617ms
     ✓ done --group writes group on the row 446ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 942ms
     ✓ carries extra fields, parsed as JSON when they are JSON 448ms
     ✓ reports a failed commit with exit 8 without writing the row 958ms
     ✓ a failed commit leaves no row staged in the index 1258ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1061ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 803ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 966ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 831ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 866ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 632ms
     ✓ --ref reads the status file as committed on that ref, not from disk 641ms
     ✓ --ref exits 3 when the ref does not carry the status file 636ms
     ✓ fails on a placeholder left in the artifact 453ms
     ✓ fails when the row's verdict differs from the artifact's 459ms
     ✓ fails when the row does not list the artifact, or carries another attempt 430ms
     ✓ fails on a missing artifact 380ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 448ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 374ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 393ms
     ✓ fails a run-tests row missing its scope, and an empty scope 565ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 625ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 607ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 559ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 908ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 994ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 712ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 872ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1544ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 791ms
     ✓ --post needs --number; without --post there is no tracker key 314ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 433ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 804ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 607ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 428ms
     ✓ --attempt-of checks the row carries the derived counter 647ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1359ms
     ✓ writeStepRow refuses when a recorded path changed 1471ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 915ms
     ✓ writeStepRow appends its commit sha to the record 1484ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1909ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (12)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 431ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 943ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 830ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 1040ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 664ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1269ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 754ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 629ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 390ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1116ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 569ms
     ✓ does not count an artifact the run found committed when it started 851ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 484ms
     ✓ commits a package.json change outside bkit.workflows 597ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1168ms
   ✓ bkit steps stub --result-file (12)
     ✓ derives a fresh audit key when the ledger already holds it 301ms
     ✓ keeps the audit key when the same finding is rendered again after its append 479ms
     ✓ reads held audit keys from the linked worktree's own ledger 327ms
(node:19744) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:19744) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:19744) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:19744) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:19744) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:19744) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:19744) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (24 tests) 18595ms
   ✓ bkit-check-dependency-audit (5)
     ✓ exits 1 on a missing acceptance, 0 when clean, and 1 on a report with no advisories 409ms
   ✓ shipped copy-and-own test files (6)
     ✓ ci/bkit-check-capstone.test.mjs passes when run on its own 575ms
     ✓ ci/bkit-test-awake.test.mjs passes when run on its own 9204ms
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 7299ms
   ✓ bkit-check-capstone (10)
     ✓ passes its own copy-and-own test file (bkit's own copy) 422ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 49710ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 814ms
     ✓ names each net-new and worsened finding in the log and the JSON 960ms
     ✓ fails on a net score rise with no net count change 832ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 889ms
     ✓ treats a net score at or below 0.001 as float noise 738ms
     ✓ passes when the change only resolves findings 772ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 787ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 482ms
     ✓ skips (exit 0) when the base resolves to HEAD 538ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 767ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 692ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 394ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 737ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 862ms
     ✓ exits 4 on a dropped net field instead of silently passing 1029ms
     ✓ exits 4 on no summary instead of silently passing 928ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1058ms
     ✓ exits 5 when the base worktree cannot be created 410ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1110ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1606ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1470ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1382ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1187ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1513ms
   ✓ bkit ci prose — file selection (7)
     ✓ keeps tracked ignored prose and unusual filenames, skipping deleted tracked files 318ms
     ✓ does not follow a directory symlink replacing tracked prose 382ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 822ms
     ✓ explicit globs can select ignored prose and nested checkout files 832ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 1126ms
     ✓ fails (exit 1) when vale reports alerts 815ms
     ✓ exits 6 on a vale runtime error 433ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 586ms
     ✓ falls back to vale sync when the main worktree has none 1030ms
     ✓ fails when vale sync cannot restore the required styles 437ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 536ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 574ms
     ✓ exits 1 naming the files outside, whatever the commit message says 520ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1135ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 757ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 567ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 2118ms
     ✓ runs an audit template's project-section change through bkit:gate:min 2066ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1901ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1605ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1980ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 1303ms
     ✓ runs the full gate for replayed debug code 2009ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 2408ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 2677ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2273ms
     ✓ a push that fails without a server answer is returned once, never retried 1840ms
     ✓ a failed fetch is returned before anything is built 559ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 3156ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2181ms
     ✓ lands from a clone whose fetch refspec omits dev 2917ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1048ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 531ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 505ms
     ✓ retries a failed create once, and exits 5 when it fails twice 591ms
     ✓ exits 5 when the open-PR probe errors 462ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 500ms
     ✓ prs open still opens against any other base 542ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 361ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 553ms
     ✓ exits 4 when gh errors and 80 when it needs auth 876ms
   ✓ bkit prs scan-body (10)
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 314ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 447ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 377ms
     ✓ runs no merge when the PR is already MERGED 375ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 623ms
     ✓ prs merge refuses a PR whose base is main 397ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 426ms
     ✓ prs merge refuses when the PR base is unknown 427ms
     ✓ prs merge reads the base from the one pr view it already makes 406ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 503ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 434ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 621ms
     ✓ never reads dev's required checks without --only-if-required 499ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 570ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 626ms
     ✓ is not green when a check failed, naming it (exit 1) 431ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 351ms
     ✓ is not green on an empty rollup (total 0) 344ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 385ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 715ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 496ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 379ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 371ms
     ✓ staging failure: exit 4 and no commit is created, no false success 400ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 497ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 518ms
> [bkit] TRUNCATED HERE — 59 lines omitted. Dropped content was NOT read.
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 423ms
     ✓ continues after friction and diagnostic writes fail without recursion 429ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 563ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 3184ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ classifies attention and terminal reports from structured purpose 341ms
     ✓ rolls over after intervening comments external edits and deletion 384ms
     ✓ uses exact new comment after a failed eligibility read 333ms
   ✓ bounded nonfatal publication (10)
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 493ms
     ✓ keeps positive acknowledgment after receipt cache or postflight failure 308ms
     ✓ reserves new comment opportunity within total delivery budget 1066ms
     ✓ contains preparation state lock and reconciliation exceptions 347ms
     ✓ attempts independent attention after routine uncertainty 357ms
     ✓ seals an acknowledged segment after a postflight intervening comment 400ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 495ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 473ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 568ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 472ms
     ✓ fetches the issue and its comments as GitHub returns them 676ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 578ms
     ✓ invalidates missing corrupt and unsupported progress cache 1407ms
     ✓ contains cache read and write failures as standalone degradation 615ms
     ✓ uses legacy receipts and contains receipt failures 613ms
     ✓ skips issue-less runs and tracker none 386ms
     ✓ records an engine-action row and skips the same key + body on a re-run 565ms
     ✓ a recent identical comment counts as done (the final close comment) 493ms
     ✓ a failed post reports done false with the reason and never leaks a token 492ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 505ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 460ms
     ✓ a different marker hash posts 700ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 536ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 19013ms
   ✓ bkit roadmap mirror (8)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 778ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 3016ms
     ✓ a refused dev push is logged, never fails the close 2320ms
     ✓ an unreachable remote is logged, never fails the close 814ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/audits/templates/context-vercel-block.test.ts (22 tests) 11293ms
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 458ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 487ms
     ✓ follows summary cursors even when the first page is shorter than the limit 547ms
     ✓ reports excluded intervals as unread even when pagination finishes 716ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 711ms
     ✓ reports an unread remainder at the page cap 522ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 678ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 331ms
     ✓ rejects missing summaries instead of treating them as empty results 465ms
     ✓ reports a failed first page as unavailable 488ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 352ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 928ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 440ms
     ✓ follows summary cursors even when the first page is shorter than the limit 690ms
     ✓ reports excluded intervals as unread even when pagination finishes 484ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 629ms
     ✓ reports an unread remainder at the page cap 471ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 465ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 319ms
     ✓ rejects missing summaries instead of treating them as empty results 427ms
     ✓ reports a failed first page as unavailable 381ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 33276ms
   ✓ bkit fids design (3)
> [bkit] TRUNCATED HERE — 44 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 822ms
     ✓ keeps each context's own section banner and drops every other context's 2047ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 306ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped fetch keeps the whole payload in the outbox; the record carries the block body as its source 664ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (15)
     ✓ locates CI evidence using prompt saved issue and local precedence 2782ms
     ✓ saves the failed job count without the capstone job 1259ms
     ✓ counts the capstone job when it is the only failed job 1020ms
     ✓ saves no failed job count when no job failed 815ms
     ✓ counts fallback evidence jobs without the capstone job 371ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 475ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1199ms
     ✓ freezes explicit workflow run attempt and all failed job pages 801ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2114ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2915ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1973ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2854ms
     ✓ checks the named repository base and fails closed on missing evidence 1523ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1092ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1654ms
     ✓ rejects MCP capstone jobs belonging to another run 1761ms
     ✓ --fetch refreshes origin/<branch> before gating 821ms
     ✓ exit 12 failed steps (10)
       ✓ bkit.testing.ciGenerated adds steps to the floor 322ms
     ✓ tells an API error (20) from no run (10) 309ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 452ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 649ms
       ✓ a source change past the validated head refuses (17) and names the path 737ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 774ms
       ✓ --validated without --month / --fid is a usage error (2) 471ms
       ✓ a validated sha that is not an ancestor refuses (17) 779ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 530ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1013ms
     ✓ a failed re-trigger push names the cause in the log 1624ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1368ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2535ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1764ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 768ms
     ✓ gh-error: every poll errored 706ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1340ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1347ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1329ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1146ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 4342ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 4475ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 995ms
     ✓ re-trigger on dev only uses the record of its own FID 1045ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1119ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --snapshot scopes its run list and dev lookups to --repo 518ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 416ms
     ✓ a refused capstone records FAIL with its reason 327ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 379ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 743ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 986ms
     ✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 420ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 969ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1022ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 899ms
     ✓ --file and --step go together 722ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1039ms
     ✓ counts files committed since --base 1058ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1186ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 797ms
     ✓ runs the --fallback gate even when no file changed, as it did before 841ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 1039ms
     ✓ resolves config from the repo root when run from a subdirectory 623ms
     ✓ exits 6 when the PUT fails 448ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 624ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 415ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 627ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 435ms
     ✓ exits 6 when the api answer is not JSON 1192ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 15165ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 352ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 427ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 404ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 358ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1124ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 366ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 382ms
     ✓ --file into a missing directory is refused, not created 318ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 392ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1540ms
     ✓ runGit names ENOBUFS when output passes the limit 2473ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 2066ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 816ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1498ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 444ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (23 tests) 6414ms
   ✓ publication ownership lock (4)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ releases only its delivery token on every exit 435ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 325ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 351ms
   ✓ bkit locks release (5)
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 1748ms
     ✓ passes every rule on a clean head 615ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 973ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (66 tests) 6742ms
   ✓ bkit decisions compose (36)
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ passes when nothing changed 563ms
     ✓ passes when only another key changed, such as a branch's upstream 531ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 457ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 532ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 410ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (47 tests) 5208ms
   ✓ runLines (5)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts (5 tests) 1440ms
   ✓ withChildDeadline (5)
     ✓ stops a spawnSync with no timeout at the remaining time and names it 307ms
     ✓ limits execSync and execFileSync the same way 612ms
     ✓ stops a child that ignores SIGTERM at the remaining time 304ms
> [bkit] TRUNCATED HERE — 136 lines omitted. Dropped content was NOT read.
   ✓ ship gate against the template's job names (2)
     ✓ finds the capstone among the template's jobs and passes when it is green 330ms
     ✓ refuses when the template's capstone job fails 532ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > writes plugin prompts + workflow skills, and stamps the managed version
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
> [bkit] TRUNCATED HERE — 724 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 232 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 728ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 353ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 521ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 467ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 514ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

(node:19519) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:19519) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 329ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 420ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (11 tests) 1407ms
   ✓ rendered workflow comment contracts (7)
     ✓ renders explicit invocation association at fileless and lifecycle posting sites 351ms
     ✓ renders engine progress authority with verbatim create only agent fallback 319ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 318ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 398ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-61pDI0/architecture.md — skipping (expected exactly one start/end)

(node:20370) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:20370) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:20370) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:20370) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (57 tests) 506ms
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 208ms
 ✓ .bkit/core/engine/install/write.test.ts (80 tests) 443ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 361ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-xuaaRY/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 1087ms
   ✓ bkit completeness check (6)
     ✓ always exits 0 on a holey run 351ms
     ✓ renders the contract for the tracker of the repo holding the file 358ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 145ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 548ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (57 tests) 292ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 197ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (105 tests) 463ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 131ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 231ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 271ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 77ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 142ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 218ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 155ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 149ms
stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > migrates the wrapper and registers a row, then repeats as a no-op
[bkit-install] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] register: docs/noise.md in .agents/docs.md (Project Documents)

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > writes nothing on a dry run
[bkit-install] [dry-run] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] [dry-run] register: docs/noise.md in .agents/docs.md (Project Documents)

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > keeps an ambiguous wrapper and reports it
[bkit-install] docs/noise.md: left as it is — one of `bkit:start` / `bkit:end` is missing, so bkit cannot tell its wrapper from your text. Delete any `bkit:start` / `bkit:end` / `bkit:managed` lines by hand; the file is yours.

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > adds no row when an indexed equivalent covers the topic
[bkit-install] skip: docs/noise.md — .agents/docs.md already lists docs/other/noise.md for this topic, so no row was added. Add a row by hand if both documents matter.

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > reports instead of throwing when docs is a regular file
[bkit-install] docs/architecture.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/technology.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/security.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/data-schema.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/testing.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/deployments.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/observability.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/design.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/noise.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/setup.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > registers a present default doc when its only equivalent row points at a missing file
[bkit-install] register: docs/security.md in .agents/docs.md (Project Documents)

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > adds no row and reports a problem when the index has a row it cannot read
[bkit-install] .agents/docs.md: not edited — .agents/docs.md has a Project Documents row bkit cannot read (| **docs/noise.md** | Noise |), so it may already list the document. Add a row for the project documents you copied under a `## Project Documents` table below `<!-- bkit:end -->` by hand.

 ✓ .bkit/core/engine/install/project-docs.test.ts (14 tests) 66ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 216ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 246ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 44ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 145ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 270ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 86ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 118ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (66 tests) 100ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 69ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 18ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 142ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 42ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 39ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 82ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 96ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 80ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 39ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 99ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 99ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 16ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 172ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 160ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 46ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 25ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (72 tests) 176ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 65ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 241ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 61ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 34ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794706275060.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794706275062.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794706275063.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794706275076.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (39 tests) 33ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 119ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 52ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 39ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 40ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 76ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 43ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 38ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 43ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (6 tests) 14ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 94ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 86ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (16 tests) 33ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 41ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 38ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 42ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 26ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 215ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 10ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 38ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 13ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 22ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 31ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 27ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 18ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 116ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 9ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 16ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 10ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/commands/workflow/tests-jump.test.ts (3 tests) 72ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (10 tests) 20ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (3 tests) 18ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 24ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 15ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 18ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 13ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 9ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 6ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (108 tests) 93379ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 50452ms
     ✓ every prompt, workflow and utility agent has the three header blocks 745ms
     ✓ sync has nothing left to rewrite 40235ms
     ✓ every clause reaches the cut-off of one surface it applies to 1348ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (171 tests) 188050ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 690ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 2685ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 426ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 364ms
     ✓ writes no limits for a workflow with no ask point 363ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 479ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 507ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 608ms
       ✓ a new run in the same chat gets its own session row 530ms
       ✓ writes none outside Claude Code 541ms
     ✓ opens the next run after a finished one, and after another workflow's run 597ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 588ms
     ✓ design / plan / build / debug book in the current worktree 640ms
     ✓ --lock-held checks the lock is ours 432ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 585ms
   ✓ bkit workflows start — resume facts (11)
     ✓ a resumed run prints its last DONE step; a closed decision is not open 306ms
     ✓ an OPEN decision of an earlier run never resurfaces 543ms
     ✓ openDecision carries the Gate header 383ms
     ✓ workflows start reports openDecision for a DECIDED decision file that no build-decision row names 395ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 780ms
     ✓ openDecision gate ignores a Gate line below the header 305ms
     ✓ reads Test attempt from a tests pause 311ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 448ms
     ✓ writes no row when status.jsonl does not exist 414ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 390ms
     ✓ aborts a rebase only when one is in progress 968ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 1028ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 997ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 515ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 533ms
     ✓ --max-exceeded says a handover is due without any sentinel 415ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 342ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 514ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 731ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 314ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 312ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 314ms
     ✓ bkit workflows fail refuses a multi-line, non-/bkit- or markdown-carrying --next-step before any write 376ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 514ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 448ms
     ✓ a debug run in SOAK mode always needs a handover 474ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1111ms
       ✓ counts subagents of an earlier chat the run's session rows name 1296ms
       ✓ records no context block, and still closes, outside a Claude Code session 1280ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1012ms
     ✓ records ending held and publish false on the workflow-done row 1007ms
     ✓ defaults the close row to ending done 1236ms
     ✓ refuses an unknown ending 322ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1022ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1031ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 968ms
     ✓ always writes the telemetry, whatever the runtime 964ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 992ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1191ms
     ✓ an unwritable stats path is logged and never fails the close 1032ms
     ✓ appends the completeness row before the workflow-done row 1051ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1410ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1067ms
     ✓ writes one completeness row per close 1554ms
     ✓ leaves out the previous run's rows that share a second with this run's start 914ms
     ✓ still closes when the completeness check throws 959ms
     ✓ still closes when the completeness row write throws 1049ms
     ✓ refuses without status.jsonl and writes nothing 446ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1245ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1231ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 774ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 734ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1075ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1458ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1223ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1080ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1799ms
     ✓ --record-step writes the close step's row before workflow-done 948ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1103ms
     ✓ --number without --outbox is a usage error 975ms
     ✓ --flush is ship only 517ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1383ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1215ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1228ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1179ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 871ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 597ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 421ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3066ms
     ✓ --flush with nothing to record commits and pushes nothing 1917ms
     ✓ --flush carries the named worktree's logs into the dev commit 3179ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 4356ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3792ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 4336ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 3683ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3381ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3537ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 3895ms
     ✓ --push on dev never carries a row whose references name another feature 3642ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 3917ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 6130ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 4594ms
     ✓ --push commits in the named worktree, not the checkout it runs from 2041ms
     ✓ rejects --push with --flush, and --flush outside ship 417ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 4414ms
     ✓ preserves unlanded file deletions and ledger additions on close 10725ms
     ✓ preserves dirty work and uncertain branch evidence during close 11760ms
     ✓ preserves a local feature ref changed after its cleanup proof 8161ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 4173ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1487ms
     ✓ a close that landed releases the lock 1936ms
     ✓ removes the worktree before it releases the lock 1958ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2897ms
       ✓ closePr refuses when the PR base is unknown 1929ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1431ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 434ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 790ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 308ms
     ✓ a second run's record does not let this FID's close commit 407ms
     ✓ record is present after workflows close and before the push 647ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1398ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 495ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 417ms
     ✓ puts each --line after the summary, in flag order 617ms
     ✓ --summary prints the file and keeps a copy in --outbox 487ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 592ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 265100ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 1093ms
     ✓ rejects missing explicit and ambiguous existing branch selections 1208ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1302ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1249ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 949ms
     ✓ a refused --continue carries git's own reason 1114ms
     ✓ --file records nothing for a refused rebase 995ms
     ✓ refuses a code conflict and aborts the rebase on the spot 886ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1274ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 634ms
     ✓ produces byte-identical output to merge=union 1630ms
     ✓ restores a trailing newline so the next append starts on its own line 1193ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 841ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1316ms
     ✓ refuses a union that leaves a line which is not JSON 805ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1415ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1448ms
     ✓ refuses a lockfile whose regenerate command fails 1200ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1831ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1525ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1454ms
     ✓ refuses and aborts when both sides changed the hand-written region 961ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1115ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1539ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1690ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 891ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1338ms
     ✓ refuses and aborts when a side deleted the install record 825ms
     ✓ refuses a conflicted doc the repo's script does not list 778ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 737ms
     ✓ removes a stale sentinel when the rebase succeeds 1065ms
     ✓ exits 4 when no rebase is in progress 340ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1451ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1568ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 674ms
       ✓ skips (12) with no anchor 863ms
       ✓ skips (12) when the base is unreachable in this clone 1020ms
       ✓ skips (12) when nothing landed since the base 728ms
       ✓ runs (0) with the landed path count once dev moved 1354ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 638ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1437ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 960ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1426ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1950ms
     ✓ runs exactly one git push 1702ms
     ✓ --set-upstream records the upstream 1084ms
     ✓ refuses with no branch checked out 961ms
     ✓ --mode=dev refuses a feature checkout 682ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1845ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 3698ms
     ✓ --require-ci pushes as-is when dev has not moved 1324ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2271ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2873ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 695ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1255ms
     ✓ --mode=abort pushes when the branch has no open PR 1385ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1095ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 720ms
     ✓ --open-pr carries the MCP answer and skips gh 1273ms
     ✓ --mode=abort on dev pushes plainly without probing 1030ms
     ✓ rejects an unknown mode 678ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 4204ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 2308ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2318ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4303ms
     ✓ skip-ci HEAD on the replay is refused 1460ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3839ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3672ms
     ✓ a level local dev is a plain push, recording nothing extra 1942ms
     ✓ a record with no commits pushes nothing 1570ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 1004ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1785ms
     ✓ a rewritten branch is refused, never forced 1378ms
     ✓ refuses dev and main with exit 21 and pushes nothing 875ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1963ms
     ✓ refuses a detached HEAD (exit 5) 850ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 2034ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 2045ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1483ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1988ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 735ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1987ms
     ✓ an up-to-date branch is a no-op 1296ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2560ms
     ✓ a fetch that fails exits 10 916ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 1490ms
     ✓ scan-diff still reports a new skip when its test … 1296ms
     ✓ scan-diff reports a skip moved onto a different t… 1235ms
     ✓ scan-diff does not cancel a skip moved between am… 1042ms
     ✓ scan-diff does not spend an unchanged duplicate t… 1142ms
     ✓ scan-diff recognizes a renamed test file 1294ms
     ✓ scan-diff recognizes a suite moved into a differe… 1800ms
     ✓ scan-diff does not let unrelated additions hide a… 1850ms
     ✓ scan-diff attributes deletion to its old test ins… 1152ms
     ✓ scan-diff consumes each moved assertion once and … 1092ms
     ✓ scan-diff does not match identical assertions fro… 1469ms
     ✓ scan-diff does not match the same leaf test name … 1610ms
     ✓ scan-diff does not match a same-named test with d… 2311ms
     ✓ scan-diff does not match a same-named test with c… 3247ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1439ms
     ✓ --paths with no match exits 1 988ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 644ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1239ms
     ✓ --marker reads a diff over 1 MiB 1383ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1350ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 882ms
     ✓ scan-diff finds an added skip 1683ms
     ✓ scan-diff ignores a skip predating the base 1515ms
     ✓ scan-diff reports a disabled test with its line 1153ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1063ms
     ✓ scan-diff ignores a removed comment in a test file 815ms
     ✓ scan-diff ignores an assertion moved within the file 848ms
     ✓ scan-diff still reports a removed assertion 1287ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1119ms
     ✓ scan-diff finds an added pytest mark skip 878ms
     ✓ scan-diff finds an added unittest skip 486ms
     ✓ scan-diff finds an added bare skip call 493ms
     ✓ scan-diff ignores a quoted skip in a documentation file 586ms
     ✓ scan-diff ignores a marker literal in a non-test source file 534ms
     ✓ scan-diff ignores an assertion whose expectation changed 482ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 488ms
     ✓ scan-diff reports a deleted test file 557ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 426ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1238ms
     ✓ a title that already carries the marker is left alone 850ms
     ✓ with no open PR: pushes the marker commit and edits no title 978ms
     ✓ a re-run is deduped: no second marker commit 858ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 969ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 342ms
     ✓ --title-set skips gh entirely 483ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1109ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 2144ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1106ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2379ms
     ✓ continues only the explicitly recorded target through the public merge command 1554ms
     ✓ fetches the unseen feature head before classifying the base 1099ms
     ✓ fast forwards the feature before either base path is chosen 2983ms
     ✓ merges divergent feature tips without rebasing either side 1213ms
     ✓ continues the feature merge before starting a dev merge 1546ms
     ✓ publishes local code with a CI running head before bookkeeping 1488ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2830ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1754ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1485ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 346ms
     ✓ Path B once dev moved; --head checks a given commit 504ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 506ms
     ✓ --merge-docs merges dev when docs/ is behind 502ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 494ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 638ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 614ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 740ms
     ✓ --merge-docs skips an empty bkit:generate script 806ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 927ms
     ✓ --merge-docs never merges on dev itself 585ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 780ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1532ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 2412ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 2028ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 1186ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 2383ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1198ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1071ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1021ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 953ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1132ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 824ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1029ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 766ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 568ms
     ✓ exits 10 when the fetch fails 322ms
     ✓ refuses --merge-docs with --head, and an unknown --head 357ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 612ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 820ms
     ✓ a failed install stops ship (16) 677ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 691ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 685ms
     ✓ exits 10 when the fetch fails 538ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 353ms
     ✓ preserves unlanded file type changes in the shared landed comparison 405ms
   ✓ branches land (28)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 336ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1040ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 990ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1102ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1110ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2272ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2700ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 462ms
     ✓ local: names unpushed dev as the cause when the branch carries it 551ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 573ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1142ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1221ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1021ms
     ✓ uses tree entry equivalence for design and plan land cleanup 4608ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1093ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1169ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 976ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 727ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1334ms
     ✓ land removes the worktree when only the copied .env is untracked 1051ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 921ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1065ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1932ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1177ms
     ✓ landPr refuses a main-based PR without retrying 560ms
     ✓ landPr refuses when the PR base is unknown 547ms
     ✓ PR not open (closed): stops (17) at once, no retry 665ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 408ms
     ✓ --attempt names the merge round in a fix commit 370ms
     ✓ commits a rewritten and a deleted tracked file 432ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 355ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 418ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 469ms

 Test Files  178 passed (178)
      Tests  7773 passed | 2 skipped (7775)
   Start at  11:28:33
   Duration  266.28s (tests 96%, setup 2%, import 1%, transform 1%, worker 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/895-one-question-format/build-group-gate-4-1.log.reports/vitest-77270.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |    88.6 |    82.36 |   94.53 |   90.08 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   91.12 |    86.83 |   95.57 |   94.59 |                   
  auth.ts          |   99.04 |    94.94 |     100 |     100 | ...05,215,228,241 
  ci-yml.ts        |   90.74 |    82.83 |     100 |   93.01 | ...09,422-424,435 
  github.ts        |   95.48 |    92.36 |     100 |   97.03 | 264-265,276-277   
  index.ts         |   85.58 |    71.96 |     100 |    97.2 | ...01,321,419-420 
  managed.ts       |    81.7 |    87.87 |   58.33 |   83.87 | 216-237           
  suppression.ts   |     100 |      100 |     100 |     100 |                   
  tools.ts         |   93.61 |    91.21 |     100 |   93.12 | ...33,550,563,594 
 .../checks/before |   94.55 |    88.63 |   95.55 |   97.81 |                   
  context-fetch.ts |    98.8 |    91.95 |     100 |     100 | ...17,539,553,600 
  env.ts           |   90.16 |    79.62 |     100 |   91.83 | 176-181,188-196   
  files.ts         |   92.64 |    89.74 |   93.75 |   98.11 | 129               
  index.ts         |      84 |    73.33 |     100 |     100 | ...39,147,155-174 
  mcp.ts           |     100 |    96.96 |     100 |     100 | 81                
  repo.ts          |   93.38 |    93.75 |    87.5 |   93.61 | 194-202           
  version.ts       |   96.87 |    82.35 |     100 |     100 | 18-20,34,61-62    
 engine/commands   |    88.6 |    83.24 |   93.29 |    90.1 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...81,194,196,203 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |    90.7 |    86.13 |   96.42 |   94.53 | ...20-823,870-885 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   80.95 |    68.75 |   71.42 |      80 | ...18-231,257-258 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |      96 |    87.42 |    90.9 |   98.16 |                   
  ci.ts            |   97.35 |    88.36 |   95.74 |   98.89 | 273,769,849,1026  
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
  push-gate.ts     |   94.06 |    84.12 |     100 |     100 | ...19,171,173,212 
 ...mmands/install |    47.2 |    44.69 |   57.14 |   47.59 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |   18.35 |    22.15 |      50 |   16.48 | ...30-134,205-616 
  uninstall.ts     |    67.6 |    64.34 |   67.56 |   68.58 | ...1081,1104-1271 
  upgrade.ts       |   32.02 |    30.65 |   33.33 |   33.21 | 355-383,565-1078  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   90.15 |    82.99 |    95.3 |   91.69 |                   
  branches.ts      |    89.6 |     83.5 |   98.82 |   91.24 | ...3265,3290,3433 
  challenge.ts     |   96.28 |    85.36 |     100 |   97.43 | ...80,412-414,700 
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.47 |    95.98 |     100 |   99.11 | 314,735           
  decisions.ts     |   94.81 |    84.24 |   98.27 |   97.54 | ...07,445,522,716 
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   94.11 |    86.99 |   97.43 |   95.62 | ...1300,1320-1330 
  junit.ts         |   94.23 |    73.84 |     100 |   93.75 | 47-48,51          
  ledgers.ts       |   88.42 |    79.07 |   95.26 |   91.36 | ...2357-2358,2386 
  locks.ts         |   92.81 |    87.71 |    92.3 |    94.4 | ...91-292,461-462 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   91.08 |    88.35 |     100 |   93.07 | ...1454,1470-1471 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 494-495           
  runs.ts          |      82 |    74.49 |   92.64 |   83.42 | ...3088,3120-3124 
  runtime.ts       |   97.84 |    86.66 |   94.44 |     100 | ...55,301,321-326 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   94.73 |    92.96 |     100 |   95.61 | ...87,703,720,861 
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 253,364           
  steps.ts         |    88.9 |    81.86 |    92.3 |    90.8 | ...2359,2361,2405 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   95.67 |    90.07 |   95.18 |   96.77 | ...05-711,734,757 
  tasks.ts         |   83.82 |     66.4 |   86.66 |   88.27 | ...47,364,395,399 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-base.ts    |   24.39 |    26.61 |   22.22 |    21.8 | 121-130,157-319   
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests-jump.ts    |   94.73 |    68.18 |     100 |     100 | 17-25,34-36       
  tests.ts         |   96.84 |    90.03 |   96.59 |   98.21 | ...2262,2358-2360 
  tracker.ts       |   89.49 |    81.22 |   96.77 |   91.56 | ...2159,2185-2190 
  workflows.ts     |   93.87 |    83.43 |   98.71 |    95.5 | ...1741,1971,2720 
  worktrees.ts     |   67.22 |    65.59 |   74.28 |   68.69 | ...1391,1394-1395 
 engine/install    |   92.05 |    83.16 |   93.95 |   95.17 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |   97.52 |    90.06 |     100 |     100 | ...35,340,346-347 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |   58.53 |    38.46 |      40 |   65.62 | ...18-134,147-164 
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,294            
  write.ts         |   89.14 |    80.57 |    87.5 |   92.96 | ...26-346,370,589 
 engine/ledgers    |   95.44 |    91.86 |   98.29 |   96.89 |                   
  status.ts        |   94.08 |    92.71 |    97.7 |   97.92 | 855,881-887,921   
  telemetry.ts     |   96.09 |    91.45 |   98.64 |   96.42 | ...1849,2007,2368 
 engine/render     |   90.63 |    82.85 |   98.36 |   92.74 |                   
  hosts.ts         |   89.62 |     81.2 |   96.15 |   90.74 | ...45-255,587-588 
  models.ts        |   90.06 |    81.11 |     100 |    94.3 | ...80,266,288,322 
  trackers.ts      |     100 |      100 |     100 |     100 |                   
 engine/shared     |   99.44 |    97.23 |     100 |     100 |                   
  package-json.ts  |     100 |    96.77 |     100 |     100 | 65                
  ...ge-manager.ts |     100 |      100 |     100 |     100 |                   
  package-roots.ts |     100 |       75 |     100 |     100 | 42,105            
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |   99.06 |    98.51 |     100 |     100 | 267,318           
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   89.88 |    85.41 |   95.85 |   90.67 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
  instructions.ts  |   90.56 |    85.89 |   96.01 |    91.5 | ...1806-1891,1896 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 88.6% ( 20985/23685 )
Branches     : 82.36% ( 16298/19787 )
Functions    : 94.53% ( 3359/3553 )
Lines        : 90.08% ( 18401/20427 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 501 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 277 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 224 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 230 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 268 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 216 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 73 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 249 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 200 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 201 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 217 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 207 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 211 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 228 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 882 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 515 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 15 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 16 ms
ok 19 stub: the response selector is cleared before running its body # in 16 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 20 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 22 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 20 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 18 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 19 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 17 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 41 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 50 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 666 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 371 ms
ok 30 refresh drops a file deleted in the index from the build # in 324 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 491 ms
ok 32 a key removed from the env file is unset on the next run # in 176 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 155 ms
ok 34 non-BKIT_ keys are skipped # in 168 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 155 ms
ok 36 a failed unsetenv is retried on the next run # in 285 ms
ok 37 logs key names only, never values # in 140 ms
ok 38 missing env file exits 0 without calling launchctl # in 26 ms
ok 39 the sweep prints the summary line the lane greps for # in 290 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 9 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (91.207167ms)
✔ shell cancellation waits for SIGTERM cleanup (162.992917ms)
✔ direct cancellation waits for SIGINT cleanup (90.598458ms)
✔ shell cancellation waits for SIGINT cleanup (185.164583ms)
✔ direct cancellation waits for SIGHUP cleanup (88.5675ms)
✔ shell cancellation waits for SIGHUP cleanup (165.951125ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (369.638875ms)
✔ shell cancellation follows a worker orphaned by a nested shell (224.133833ms)
✔ direct cancellation preserves a nested machine-lock owner (417.197583ms)
✔ shell cancellation preserves a nested machine-lock owner (470.6ms)
✔ nested shell cancellation preserves a nested machine-lock owner (460.613084ms)
✔ a hard process-group timeout reaches a shell command during cleanup (66.354458ms)
✔ ships a command-scoped sleep prevention wrapper (0.057958ms)
✔ preserves arguments, output and nonzero exit status (45.665708ms)
✔ runs an entire shell chain and retains its failure (27.879583ms)
✔ reports a missing command as 127 (31.661ms)
✔ requires a command (24.732ms)
✔ non-macOS platform selection runs commands without sleep prevention (41.517458ms)
✔ hard timeout escalation reaches a command that ignores TERM (145.799792ms)
✔ forwards POSIX cancellation to the command and releases the assertion (55.037458ms)
✔ holds a real macOS assertion only while the command runs (63.175375ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3260.721583
> [bkit] TRUNCATED — kept 1855 of 3602 lines (136 KB of 280 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
