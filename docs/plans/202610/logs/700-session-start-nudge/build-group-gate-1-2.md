
> @cbartens/bkit@6.0.0 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge
> pnpm bkit:gate:static-unit && pnpm test:integration


> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs


0/148 files need formatting

> @cbartens/bkit@6.0.0 lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'

✔ 0 errors, 0 warnings and 0 suggestions in 147 files.
passed: true
skipped: null
files: 147

> @cbartens/bkit@6.0.0 slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge
> bkit ci slop

[bkit-ci] base f8c67d9ab66de0c133922aad3959793b2bc2377f (f8c67d9ab66de0c133922aad3959793b2bc2377f) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: f8c67d9ab66de0c133922aad3959793b2bc2377f
base: f8c67d9ab66de0c133922aad3959793b2bc2377f
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge
      Coverage enabled with v8

 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 4630ms
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 376ms
     ✓ is null when pnpm fails or prints something that is not a version 4240ms
(node:6245) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:6245) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:6245) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:6245) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:6245) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:6245) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:6245) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (29 tests) 18814ms
   ✓ shipped copy-and-own test files (5)
     ✓ ci/lanes/resolve-push-base.test.mjs passes when run on its own 18244ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (56 tests) 24893ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 1953ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 1335ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 983ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1704ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1999ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 1506ms
     ✓ fetches the issue and its comments as GitHub returns them 1129ms
   ✓ postCommentOnce (4)
     ✓ records an engine-action row and skips the same key + body on a re-run 768ms
     ✓ a recent identical comment counts as done (the final close comment) 1149ms
     ✓ a failed post reports done false with the reason and never leaks a token 1460ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1277ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 1039ms
     ✓ a board the token cannot see is scope 827ms
     ✓ an HTTP 403 from gh is scope 868ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 1174ms
     ✓ github: no block, no blockers and no further reads 804ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 1289ms
     ✓ a different marker hash posts 1000ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1868ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (47 tests) 30905ms
   ✓ bkit ci slop — gate decision (6)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1010ms
     ✓ fails on a net score rise with no net count change 2452ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1409ms
     ✓ treats a net score at or below 0.001 as float noise 1984ms
     ✓ passes when the change only resolves findings 1359ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 978ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1662ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1925ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1927ms
     ✓ exits 4 on a dropped net field instead of silently passing 1025ms
     ✓ exits 4 on no summary instead of silently passing 1128ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1487ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1390ms
   ✓ bkit ci slop — real slop-scan (3)
     ✓ a genuinely new finding fails the gate 341ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 316ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1221ms
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 1104ms
     ✓ fails (exit 1) when vale reports alerts 959ms
     ✓ exits 6 on a vale runtime error 842ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1309ms
     ✓ falls back to vale sync when the main worktree has none 1030ms
     ✓ skips loudly with exit 0 when vale sync cannot restore it either 1887ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 32417ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 1219ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 2153ms
     ✓ CI=true -> GITHUB_ACTION 1404ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 1986ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 1356ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 983ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 1610ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 2005ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 1867ms
     ✓ LOCAL -> runtimeHeadless=false 683ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 848ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 1148ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 1474ms
     ✓ UNKNOWN -> runtimeHeadless=false 1236ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 1048ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 543ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 1103ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 1177ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 935ms
     ✓ re-derives per call: one run's answer does not leak into the next 1343ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 1040ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1460ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1315ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1158ms
     ✓ --file into a missing directory is refused, not created 914ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (42 tests) 42125ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 1847ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 1638ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 1676ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 1999ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 1068ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 1265ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 1909ms
     ✓ counts commits behind origin/dev and the divergence age 1895ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 1599ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 973ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1077ms
     ✓ from a worktree, still names the main checkout and its outbox 1494ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 994ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 821ms
   ✓ bkit repo info — where the wired tracker's issues live (10)
     ✓ prints the Linear team and project under linear 1049ms
     ✓ prints the Jira site and project under jira 800ms
     ✓ prints the board under github 876ms
     ✓ prints the github progress and review states, defaults for a key left unset 1148ms
     ✓ prints the linear progress and review states, defaults for a key left unset 841ms
     ✓ prints the jira progress and review states, defaults for a key left unset 1348ms
     ✓ prints the linear progress and review states, defaults for a key left unset 1032ms
     ✓ prints null progress and review states under none 1891ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 807ms
     ✓ prints nulls under github without a board, and for keys left unset 1258ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 926ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 1138ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1394ms
     ✓ an unpinned repo reports nulls and asks no registry 1343ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 1311ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 1241ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 1495ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1630ms
 ✓ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests) 10854ms
   ✓ bkit skills prune (10)
     ✓ uninstalls unlisted skills from the union of folders and lock keys, never bkit-* 1062ms
     ✓ matches whole names only: a listed name inside a longer one does not keep it 1378ms
     ✓ treats regex characters in a skill name literally 1341ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 1331ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 1249ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 1481ms
     ✓ runs from the checkout top even when called from a subfolder 1589ms
     ✓ keeps bkit-* skills, from folders or the lock, even when .agents/skills.md does not list them 1409ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 15430ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 1026ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 945ms
     ✓ resolves config from the repo root when run from a subdirectory 813ms
     ✓ exits 6 when the PUT fails 819ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1071ms
   ✓ bkit setup protect-main — pre-flight (6)
     ✓ exits 4 when the CI workflow file is missing, before any write 1367ms
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 1437ms
     ✓ asks a human to log in when gh is not authenticated 1326ms
     ✓ exits 3 when gh repo view names no repository 1471ms
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 1703ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 1325ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 1455ms
     ✓ exits 6 when the api answer is not JSON 641ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (104 tests) 46248ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 2546ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 1799ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1209ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1953ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 982ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1810ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1984ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1423ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1199ms
     ✓ PASS is 0 failures with or without reports 920ms
     ✓ clears a previous attempt's reports before the gate runs 1175ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1429ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 995ms
     ✓ a log under the outbox is named main-checkout relative in the record 851ms
     ✓ a log small enough is copied whole: not clamped, raw null 1028ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1096ms
   ✓ bkit tests red / green (25)
     ✓ records a red: the named test failed; row, log and test snapshot written, path passed whole 933ms
     ✓ refuses a run that is not a red: exit 1, reason printed, no row 835ms
     ✓ a red already recorded for the unchanged test stands on resume; a changed test runs again 1427ms
     ✓ refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2) 1461ms
     ✓ a script that cannot run is exit 4, not a rejected red 1379ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1026ms
     ✓ green: --group audits only that group's tasks 938ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 870ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1128ms
     ✓ green: red recorded, test unchanged, named test passing -> no gaps 1372ms
     ✓ green: lists each gap kind, with the diff for a test changed since its red 1353ms
     ✓ green: a red recorded for a different test than the plan names is a red-mismatch 1331ms
     ✓ green: a planned test that moved is a red-mismatch saying whether the recorded test passes now 1565ms
     ✓ green: every test a task names needs its own red and its own pass 1630ms
     ✓ test order (7)
       ✓ green finds the code commit for DONE — TASK N 1315ms
       ✓ a red recorded before the task's code commit stands, across a resumed execute 1640ms
       ✓ a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked 598ms
       ✓ a test file that only gained lines since its red is no gap; the diff stays in the report 693ms
       ✓ green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green 668ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (62 tests) 8126ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 314ms
     ✓ a new run of the same FID rewrites startSha 471ms
     ✓ a resume of the same FID reuses the record 388ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 343ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 373ms
     ✓ a stale record without a lock is replaced 437ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 338ms
   ✓ bkit worktrees remove (12)
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 331ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 339ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (96 tests) 19477ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 10075ms
     ✓ sync has nothing left to rewrite 7866ms
     ✓ every clause reaches the cut-off of one surface it applies to 302ms
   ✓ fully retired clauses (6)
     ✓ output-cap's sentence stays inline in the abort handover prompt 960ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (132 tests) 31637ms
   ✓ bkit workflows handover (22)
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 364ms
     ✓ --flush carries the named worktree's logs into the dev commit 345ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2178ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 492ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 577ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 438ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 590ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 492ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 478ms
     ✓ --push on dev never carries a row whose references name another feature 487ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 430ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 742ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1726ms
   ✓ bkit workflows close --flush (ship) (6)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 481ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 341ms
     ✓ a close that landed releases the lock 472ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3607ms
       ✓ closePr refuses when the PR base is unknown 2865ms
     ✓ leaves a worktree no workflow created, and its branch, in place 536ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 425ms
     ✓ record is present after workflows close and before the push 411ms
     ✓ failed handover from dev removes the record and keeps recorded paths 679ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 7734ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 3745ms
     ✓ every fence parses under zsh -n 3948ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 52722ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 588ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 2745ms
     ✓ always writes the marker, even with no plan 1352ms
     ✓ writes the linear marker shape, taking the tracker from package.json 1574ms
     ✓ writes the jira marker shape, taking the tracker from package.json 1576ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 1078ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1660ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1886ms
     ✓ exits 5 when the open-PR probe errors 1900ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 709ms
     ✓ prs open still opens against any other base 777ms
     ✓ exits 6 when the created PR's base is not --base 1158ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 1465ms
     ✓ exits 1 with found=false when there is none 1236ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 960ms
     ✓ --number reads one PR, mergeable included 823ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 836ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1221ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 749ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 1440ms
     ✓ drops the force-build marker from the title subject 1431ms
     ✓ takes an explicit --subject 1404ms
     ✓ runs no merge when the PR is already MERGED 912ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1003ms
     ✓ prs merge refuses a PR whose base is main 868ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 1147ms
     ✓ prs merge refuses when the PR base is unknown 1384ms
     ✓ prs merge reads the base from the one pr view it already makes 1351ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 1350ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 1545ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 1604ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 1193ms
     ✓ never reads dev's required checks without --only-if-required 1249ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 1065ms
     ✓ updates when a dev ruleset requires status checks 744ms
     ✓ updates when dev's branch protection requires status checks 524ms
     ✓ ignores dev rulesets that require no checks 671ms
     ✓ updates when the repo cannot be resolved 477ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 946ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 475ms
     ✓ is not green when a check failed, naming it (exit 1) 537ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 424ms
     ✓ is not green on an empty rollup (total 0) 535ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 428ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 522ms
   ✓ bkit prs verbose-ci (4)
     ✓ is a no-op when the title already says so 458ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 554ms
 ✓ .bkit/core/engine/commands/land.test.ts (25 tests) 6350ms
   ✓ pushToDev (13)
     ✓ lands the commit on origin/dev and leaves the main checkout alone 371ms
     ✓ never pushes local dev commits missing from origin/dev 354ms
     ✓ dev moved: rebuilds on the new dev and pushes again 650ms
     ✓ dev moved before every push: exhausted, nothing landed 1017ms
     ✓ any other refusal is returned, not retried 530ms
     ✓ pushToDev replays a commit range onto origin/dev 482ms
     ✓ a replay retries on the new dev when dev moved 678ms
     ✓ pushToDev log line names what it lands 406ms
     ✓ runs no git hooks in the throwaway checkout, and says so 395ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 515ms
     ✓ a push that fails without a server answer is returned once, never retried 337ms
     ✓ build throwing stops the landing and removes the throwaway checkout 336ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (159 tests) 53429ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 1886ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 1647ms
   ✓ bkit runs wait (10)
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 2930ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 1806ms
     ✓ CLI: a failed gh workflow run exits 5 1423ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 3017ms
   ✓ bkit runs dispatch (14)
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 376ms
     ✓ CLI: verdict JSON, body scan, exit codes 1268ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 1378ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 1627ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 548ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 439ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 456ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 1168ms
     ✓ --pr refuses a title carrying a skip token (18) and --record writes the refusal row 1335ms
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 1103ms
     ✓ --snapshot scopes its run list and dev lookups to --repo 1446ms
     ✓ --snapshot without --repo leaves its run list unscoped 1310ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 1149ms
     ✓ a refused capstone records FAIL with its reason 925ms
     ✓ an unreadable PR is an API error (20) with no head 882ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 1129ms
       ✓ without --repo no call gains a --repo flag 1390ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 1418ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 2792ms
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 1644ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 2795ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 629ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 724ms
     ✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 671ms
     ✓ CI_DEV refuses the slug "a/b" (exit 9) 473ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 992ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 511ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 920ms
     ✓ an unknown phase exits 3; gh needing auth exits 80 523ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 881ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 687ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 756ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 733ms
     ✓ --file and --step go together 698ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 4393ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 979ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (87 tests) 10622ms
   ✓ bkit steps done (18)
     ✓ reports a failed commit with exit 8 without writing the row 835ms
   ✓ bkit steps finish --post (4)
     ✓ a re-run of the same step and body is deduped: nothing posted again 375ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 433ms
     ✓ writeStepRow refuses when a recorded path changed 436ms
     ✓ writeStepRow appends its commit sha to the record 319ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 907ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (40 tests) 3209ms
   ✓ bkit roadmap mirror (6)
     ✓ writes the row in the worktree, then commits and pushes the same row on dev 576ms
     ✓ never touches the main checkout and never pushes its local dev commits 525ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 443ms
     ✓ a refused dev push is logged, never fails the close 1035ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (97 tests) 4595ms
   ✓ bkit context clamp — per-context profiles (#697) (4)
     ✓ keeps each context's own section header and drops every other context's 341ms
     ✓ keeps each context's own section banner and drops every other context's 771ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (31 tests) 1725ms
   ✓ bkit challenge gate (5)
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 507ms
 ✓ .bkit/core/engine/audits/repo/resolve-push-base.test.ts (17 tests) 4448ms
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 498ms
       ✓ falls back to event.before when gh prints unparseable output 440ms
       ✓ reports last-green-run as the source when the green head is an ancestor 1466ms
       ✓ CI mode: falls back to event.before and says so when the run list is unreadable 363ms
       ✓ local mode (3)
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 530ms
         ✓ tests ancestry against --head, not HEAD 516ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 629ms
 ✓ .bkit/core/engine/commands/lib.test.ts (62 tests) 1618ms
   ✓ runGit / runTool output limit (5)
     ✓ runGit names ENOBUFS when output passes the limit 594ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 613ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 8005ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 505ms
     ✓ patch (v1 driver): checks every Add / Update / Move-to / Delete target 465ms
     ✓ apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target 434ms
     ✓ apply_patch (v1 driver): checks every Add / Update / Move-to / Delete target 436ms
     ✓ deny mode blocks when any patch target is a first touch, and records all of them 512ms
   ✓ dual driver shape (OpenCode 1.x server() + 2.0 setup()) (6)
     ✓ deny mode blocks the first touch on BOTH drivers 338ms
> [bkit] TRUNCATED HERE — 157 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 806 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 313 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 73 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 7ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (20 tests) 3ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 4ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 4ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (6 tests) 2ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 2ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 2ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 6ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (173 tests) 68835ms
   ✓ branches rebase: behaviour (17)
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 2761ms
     ✓ produces byte-identical output to merge=union 314ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1705ms
     ✓ refuses a lockfile whose regenerate command fails 1731ms
   ✓ branches push (17)
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 2215ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1101ms
     ✓ --mode=abort pushes when the branch has no open PR 1307ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1420ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 456ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 308ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 436ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2549ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 469ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 1355ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ fast-forwards local dev without checking it out 405ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1151ms
     ✓ a failed install stops ship (16) 774ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 555ms
     ✓ exits 10 when the fetch fails 369ms
   ✓ branches land (23)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1002ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 848ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 805ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 798ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 625ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 710ms
> [bkit] TRUNCATED HERE — 102 lines omitted. Dropped content was NOT read.
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |     100 |    99.06 |     100 |     100 | 247               
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   90.71 |    85.83 |    95.4 |   91.43 |                   
  instructions.ts  |   90.71 |    85.83 |    95.4 |   91.43 | ...1662-1744,1749 
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
ok 17 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 18 ms
ok 18 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 14 ms
ok 19 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 11 ms
ok 20 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 17 ms
ok 21 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 11 ms
ok 22 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 26 ms
ok 23 stub: --paginate emits one document per page; --slurp collapses them into an array # in 42 ms
ok 24 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 415 ms
ok 25 a key removed from the env file is unset on the next run # in 181 ms
ok 26 an empty value unsets the key instead of setting an empty string # in 147 ms
ok 27 non-BKIT_ keys are skipped # in 146 ms
ok 28 one failing key does not stop the others and the exit status is non-zero # in 147 ms
ok 29 a failed unsetenv is retried on the next run # in 171 ms
ok 30 logs key names only, never values # in 149 ms
ok 31 missing env file exits 0 without calling launchctl # in 24 ms
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
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
[bkit-install] write version pin: .bkit/version (6.0.0)

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > P4.T7 — upgrade integration: heavy-customised-consumer scenario > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

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
> [bkit] TRUNCATED HERE — 172 lines omitted. Dropped content was NOT read.
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 1066ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 867ms
     ✓ stops the step when the command crashed or was misused 2412ms
 ✓ .bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts (16 tests) 13973ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ a runner started by the holder does not wait on its parent 1081ms
     ✓ a stack named by BKIT_LOCAL_STACK never waits on the shared one 1132ms
     ✓ a holder that stops before it answers fails the take at once instead of hanging 1041ms
     ✓ `run` holds the lock for the command and passes its exit status on 1068ms
stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > .gitignore — consumer secret-protection rules survive; bkit block is updated (the #129 case)
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 1514ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 1564ms
     ✓ malformed .mcp.json fails install instead of being overwritten 322ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 1375ms
> [bkit] TRUNCATED HERE — 88 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 44 lines omitted. Dropped content was NOT read.
     ✓ consumer-added extra key in opencode.json → check exits 0 (deep-contain, not drift) 821ms
     ✓ opencode installed but no provider recorded → check exits 1 and names the fix 707ms
     ✓ a consumer with no opencode host at all is not failed for a missing provider 798ms
   ✓ bkit check — antigravity detected from any plugin file (1)
     ✓ deleted plugin.json + neutered guardrails command + deleted guardrails hook → check exits 1 naming each 1948ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ bkit check with stale consumer prompts.md does not emit Missing model lookup 335ms
   ✓ Scenario: bkit check stale-marker gate is branch-scoped (#256) (2)
     ✓ on main: hard-fails (exit 1) and names the bkit-managed-stale BLOCKER 356ms
     ✓ on a feature branch: surfaces a non-blocking ADVISORY, no marker-drift hard-fail line 366ms
npm warn Unknown env config "npm-globalconfig". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "verify-deps-before-run". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 177 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 194 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 149 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 168 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 149 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 165 lines omitted. Dropped content was NOT read.
[bkit-test] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-gates.md
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
> [bkit] TRUNCATED HERE — 177 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 162 lines omitted. Dropped content was NOT read.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

stderr | scripts/harvest/ledgers.integration.test.ts > Harvest boundary: stats copy-only, friction moved (WS4-T1, #343) > count-only aggregates deferrals.jsonl and failures.jsonl without copying prose
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-xaRRkV/bkit
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 159 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 163 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 168 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 63 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 165 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 65 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 166 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 46 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 153 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 153 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 163 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 170 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 165 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 165 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 341 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (37 tests) 43947ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (32)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 3354ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 1442ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone 1819ms
     ✓ T16: a Jira-shaped commit scope with a digit in the key (ab1-123-slug) no-ops — no dispatch 1247ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 1204ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 1596ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 1478ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 1869ms
     ✓ fix/** is not a routed surface (3)
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 1593ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 2454ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 1472ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 1364ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 1124ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 1354ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 1338ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 2076ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 1824ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 1642ms
       ✓ a branch with no status.jsonl dispatches as before 1169ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 1214ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 2630ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 909ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 958ms
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 134 lines omitted. Dropped content was NOT read.
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
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 134 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1234ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1461ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 1819ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 995ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 730ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 1028ms
     ✓ plan installs dependencies like build and debug 784ms
     ✓ design stops on a failed install (5) 1058ms
     ✓ plan stops on a failed install (5) 935ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1369ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1092ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1134ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1623ms
   ✓ bkit worktrees setup — mint (resume) (14)
     ✓ rebases onto origin/dev and clears a stale sentinel 1461ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 1214ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 1436ms
     ✓ debug: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 1455ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 1583ms
     ✓ never commits the entries setup copies in from the main checkout 1315ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 1301ms
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
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-uninstall-surgical-test] absent: docs/security.md (file not found — nothing to do)
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

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > uninstall(opencode) strips bkit-managed scope from opencode.json; deletes when empty after strip
[bkit-uninstall-surgical-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] prune empty dir: .opencode

stdout | .bkit/core/engine/install/modules/claude.integration.test.ts > bkit-gateguard.cjs / bkit-gateguard.js markered-text — install engine (#422) > install generates each hook from its template plus the shared hook parts
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

 ✓ .bkit/core/engine/install/modules/cloud.integration.test.ts (9 tests) 135ms
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

stdout | .bkit/core/engine/install/modules/claude.integration.test.ts > bkit-gateguard.cjs / bkit-gateguard.js markered-text — install engine (#422) > an existing hook gets the shared parts in its managed block; the driver below it stays
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

 ✓ .bkit/core/engine/install/placeholders.integration.test.ts (6 tests) 355ms
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

stdout | .bkit/core/engine/install/modules/claude.integration.test.ts > Scenario: .bkit/.env.example (owned) and .envrc (template) > first install writes .bkit/.env.example when template exists
[bkit-test] write: .claude/commands/bkit-auto.md
[bkit-test] write: .claude/commands/bkit-build.md
[bkit-test] write: .claude/commands/bkit-debug.md
[bkit-test] write: .claude/commands/bkit-design.md
[bkit-test] write: .claude/commands/bkit-plan.md
[bkit-test] write: .claude/commands/bkit-ship.md
[bkit-test] write: .claude/agents/bkit-audit-generate.md
[bkit-test] write: .claude/agents/bkit-build-challenge-1.md
[bkit-test] write: .claude/agents/bkit-build-challenge-2.md
[bkit-test] write: .claude/agents/bkit-build-install-skills.md
[bkit-test] write: .claude/agents/bkit-build-plan-convert.md
[bkit-test] write: .claude/agents/bkit-build-plan-current.md
[bkit-test] write: .claude/agents/bkit-build-plan-execute.md
[bkit-test] write: .claude/agents/bkit-build-plan-gaps-remediate.md
[bkit-test] write: .claude/agents/bkit-build-plan-verify.md
[bkit-test] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-test] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-test] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-test] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-test] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-3.md
[bkit-test] write: .claude/agents/bkit-design-generate.md
[bkit-test] write: .claude/agents/bkit-design-organise.md
[bkit-test] write: .claude/agents/bkit-design-review-1.md
[bkit-test] write: .claude/agents/bkit-design-review-2.md
[bkit-test] write: .claude/agents/bkit-design-spike.md
[bkit-test] write: .claude/agents/bkit-design-update.md
[bkit-test] write: .claude/agents/bkit-plan-generate.md
[bkit-test] write: .claude/agents/bkit-plan-review-1.md
[bkit-test] write: .claude/agents/bkit-plan-review-2.md
[bkit-test] write: .claude/agents/bkit-plan-scope-check.md
[bkit-test] write: .claude/agents/bkit-plan-update.md
[bkit-test] write: .claude/agents/bkit-ship-conflict-resolve.md
[bkit-test] write: .claude/agents/bkit-ship-deferred-sweep.md
[bkit-test] write: .claude/agents/bkit-ship-update-docs.md
[bkit-test] write: .claude/agents/bkit-utility-compress-markdown.md
[bkit-test] write: .claude/agents/bkit-utility-update-decisions.md
[bkit-test] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-test] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-test] write: .claude/agents/bkit-utility-update-failures.md
[bkit-test] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-test] write: .claude/agents/bkit-utility-update-roadmap.md
[bkit-test] write: .claude/agents/bkit-utility-update-tracker.md
[bkit-test] claude: CLAUDE.md
[bkit-test] claude: .claude/settings.json
[bkit-test] claude: .claude/hooks/bkit-preflight.sh
[bkit-test] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-test] claude: .claude/hooks/bkit-readguard.cjs
[bkit-test] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-test] claude: .mcp.json
[bkit-test] claude: .bkit/.env.example
[bkit-test] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)

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

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > targeted uninstall drops the module's bkit.* keys > --auto resets bkit.cloud.agent to unset and keeps every other key
[bkit-uninstall-surgical-test] package.json: reset bkit.cloud.agent to unset

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > targeted uninstall drops the module's bkit.* keys > --opencode resets bkit.providers.opencode.default and .installed to unset
[bkit-uninstall-surgical-test] absent: .opencode/opencode.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] package.json: reset bkit.providers.opencode.default, bkit.providers.opencode.installed to unset

stdout | .bkit/core/engine/install/modules/claude.integration.test.ts > Scenario: .bkit/.env.example (owned) and .envrc (template) > install never writes .envrc (a template the consumer copies)
[bkit-test] write: .claude/commands/bkit-auto.md
[bkit-test] write: .claude/commands/bkit-build.md
[bkit-test] write: .claude/commands/bkit-debug.md
[bkit-test] write: .claude/commands/bkit-design.md
[bkit-test] write: .claude/commands/bkit-plan.md
[bkit-test] write: .claude/commands/bkit-ship.md
[bkit-test] write: .claude/agents/bkit-audit-generate.md
[bkit-test] write: .claude/agents/bkit-build-challenge-1.md
[bkit-test] write: .claude/agents/bkit-build-challenge-2.md
[bkit-test] write: .claude/agents/bkit-build-install-skills.md
[bkit-test] write: .claude/agents/bkit-build-plan-convert.md
[bkit-test] write: .claude/agents/bkit-build-plan-current.md
[bkit-test] write: .claude/agents/bkit-build-plan-execute.md
[bkit-test] write: .claude/agents/bkit-build-plan-gaps-remediate.md
[bkit-test] write: .claude/agents/bkit-build-plan-verify.md
[bkit-test] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-test] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-test] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-test] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-test] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-3.md
[bkit-test] write: .claude/agents/bkit-design-generate.md
[bkit-test] write: .claude/agents/bkit-design-organise.md
[bkit-test] write: .claude/agents/bkit-design-review-1.md
[bkit-test] write: .claude/agents/bkit-design-review-2.md
[bkit-test] write: .claude/agents/bkit-design-spike.md
[bkit-test] write: .claude/agents/bkit-design-update.md
[bkit-test] write: .claude/agents/bkit-plan-generate.md
[bkit-test] write: .claude/agents/bkit-plan-review-1.md
[bkit-test] write: .claude/agents/bkit-plan-review-2.md
[bkit-test] write: .claude/agents/bkit-plan-scope-check.md
[bkit-test] write: .claude/agents/bkit-plan-update.md
[bkit-test] write: .claude/agents/bkit-ship-conflict-resolve.md
[bkit-test] write: .claude/agents/bkit-ship-deferred-sweep.md
[bkit-test] write: .claude/agents/bkit-ship-update-docs.md
[bkit-test] write: .claude/agents/bkit-utility-compress-markdown.md
[bkit-test] write: .claude/agents/bkit-utility-update-decisions.md
[bkit-test] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-test] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-test] write: .claude/agents/bkit-utility-update-failures.md
[bkit-test] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-test] write: .claude/agents/bkit-utility-update-roadmap.md
[bkit-test] write: .claude/agents/bkit-utility-update-tracker.md
[bkit-test] claude: CLAUDE.md
[bkit-test] claude: .claude/settings.json
[bkit-test] claude: .claude/hooks/bkit-preflight.sh
[bkit-test] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-test] claude: .claude/hooks/bkit-readguard.cjs
[bkit-test] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-test] claude: .mcp.json
[bkit-test] claude: .bkit/.env.example
[bkit-test] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > targeted uninstall drops the module's bkit.* keys > a dry run lists the keys and writes nothing
[bkit-uninstall-surgical-test] [dry-run] Decision table:
[bkit-uninstall] No files to process.

[bkit-uninstall-surgical-test] [dry-run] package.json: reset bkit.cloud.agent to unset

 ✓ .bkit/core/engine/commands/install/uninstall.integration.test.ts (20 tests) 142ms
stdout | .bkit/core/engine/install/modules/claude.integration.test.ts > Scenario: .bkit/.env.example (owned) and .envrc (template) > re-install overwrites a consumer-edited .bkit/.env.example (owned), in dry-run and live alike
[bkit-test] write: .claude/commands/bkit-auto.md
[bkit-test] write: .claude/commands/bkit-build.md
[bkit-test] write: .claude/commands/bkit-debug.md
[bkit-test] write: .claude/commands/bkit-design.md
[bkit-test] write: .claude/commands/bkit-plan.md
[bkit-test] write: .claude/commands/bkit-ship.md
[bkit-test] write: .claude/agents/bkit-audit-generate.md
[bkit-test] write: .claude/agents/bkit-build-challenge-1.md
[bkit-test] write: .claude/agents/bkit-build-challenge-2.md
[bkit-test] write: .claude/agents/bkit-build-install-skills.md
[bkit-test] write: .claude/agents/bkit-build-plan-convert.md
[bkit-test] write: .claude/agents/bkit-build-plan-current.md
[bkit-test] write: .claude/agents/bkit-build-plan-execute.md
[bkit-test] write: .claude/agents/bkit-build-plan-gaps-remediate.md
[bkit-test] write: .claude/agents/bkit-build-plan-verify.md
[bkit-test] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-test] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-test] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-test] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-test] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-3.md
[bkit-test] write: .claude/agents/bkit-design-generate.md
[bkit-test] write: .claude/agents/bkit-design-organise.md
[bkit-test] write: .claude/agents/bkit-design-review-1.md
[bkit-test] write: .claude/agents/bkit-design-review-2.md
[bkit-test] write: .claude/agents/bkit-design-spike.md
[bkit-test] write: .claude/agents/bkit-design-update.md
[bkit-test] write: .claude/agents/bkit-plan-generate.md
[bkit-test] write: .claude/agents/bkit-plan-review-1.md
[bkit-test] write: .claude/agents/bkit-plan-review-2.md
[bkit-test] write: .claude/agents/bkit-plan-scope-check.md
[bkit-test] write: .claude/agents/bkit-plan-update.md
[bkit-test] write: .claude/agents/bkit-ship-conflict-resolve.md
[bkit-test] write: .claude/agents/bkit-ship-deferred-sweep.md
[bkit-test] write: .claude/agents/bkit-ship-update-docs.md
[bkit-test] write: .claude/agents/bkit-utility-compress-markdown.md
[bkit-test] write: .claude/agents/bkit-utility-update-decisions.md
[bkit-test] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-test] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-test] write: .claude/agents/bkit-utility-update-failures.md
[bkit-test] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-test] write: .claude/agents/bkit-utility-update-roadmap.md
[bkit-test] write: .claude/agents/bkit-utility-update-tracker.md
[bkit-test] claude: CLAUDE.md
[bkit-test] claude: .claude/settings.json
[bkit-test] claude: .claude/hooks/bkit-preflight.sh
[bkit-test] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-test] claude: .claude/hooks/bkit-readguard.cjs
[bkit-test] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-test] claude: .mcp.json
[bkit-test] claude: .bkit/.env.example
[bkit-test] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-test] [dry-run] claude: .bkit/.env.example
[bkit-test] claude: .bkit/.env.example
[bkit-test] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)

 ✓ .bkit/core/engine/install/modules/claude.integration.test.ts (31 tests) 312ms
 ✓ .bkit/core/engine/audits/templates/telemetry-gitattributes.integration.test.ts (18 tests) 131ms
 ✓ .bkit/core/engine/checks/after/managed.integration.test.ts (1 test) 82ms
 ✓ .bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts (13 tests) 956ms
 ✓ .bkit/core/engine/checks/before/files.integration.test.ts (12 tests) 15ms
 ✓ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts (22 tests) 52ms
 ✓ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts (11 tests) 219ms
 ✓ .bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts (11 tests) 314ms
 ✓ .bkit/core/engine/install/write.integration.test.ts (5 tests) 5ms
 ✓ .bkit/core/engine/install/version-file.integration.test.ts (5 tests) 6ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts (14 tests) 1673ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-claude.integration.test.ts (31 tests) 5010ms
   ✓ gateguard hook — advisory (default mode) (4)
     ✓ matches Write and MultiEdit too 319ms
     ✓ warns again for a different file in the same session 350ms
   ✓ gateguard hook — no-op / fail-open cases (7)
     ✓ a subagent sharing its parent's session_id gets its own checklist, once 356ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts (320 tests) 40729ms
 ✓ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts (72 tests) 53479ms
   ✓ .husky/pre-push delete-only push (6)
     ✓ .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run 363ms
     ✓ .bkit/templates/.husky/pre-push: empty stdin → gates still run 1292ms
     ✓ .husky/pre-push: a delete mixed with an update → gates still run 1819ms
     ✓ .husky/pre-push: empty stdin → gates still run 711ms
   ✓ .husky/pre-push already-tested push (bkit repo only) (12)
     ✓ tag on a commit no origin branch holds → gates run 851ms
     ✓ tag pushed with a branch → gates run 1051ms
     ✓ branch with files no origin dev / main tip has → gates run 1057ms
     ✓ dev push with the files origin/dev already has → gates run 848ms
     ✓ main push with the files origin/main already has → gates run 1098ms
     ✓ no origin dev / main ref fetched → a branch push gates 890ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a release branch push 972ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push 1004ms
   ✓ .husky/pre-push CI-suppressor guard (8)
     ✓ .bkit/templates/.husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 1622ms
     ✓ .bkit/templates/.husky/pre-push: HEAD without a token → the gates run 1224ms
     ✓ .bkit/templates/.husky/pre-push: no integration gate declared → the unit gate runs 1158ms
     ✓ .bkit/templates/.husky/pre-push: integration gate declared → it runs in place of the unit gate 1167ms
     ✓ .husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 1924ms
     ✓ .husky/pre-push: HEAD without a token → the gates run 1225ms
     ✓ .husky/pre-push: no integration gate declared → the unit gate runs 936ms
     ✓ .husky/pre-push: integration gate declared → it runs in place of the unit gate 820ms
   ✓ .husky/pre-push tmp/ prune (6)
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 488ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 824ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 543ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 874ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 488ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 645ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 737ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 501ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 896ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 450ms
     ✓ .husky/pre-push: a gate fails → no disk prune 835ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 907ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 1224ms
     ✓ a stale register stops the push before any gate runs 913ms
     ✓ bkit check fails → the push stops before any gate runs 423ms
     ✓ the dependency audit runs before any gate, when its script is present 849ms
     ✓ no dependency-audit script → skipped, the gates still run 392ms
     ✓ no register script → skipped, the gates still run 758ms
   ✓ .husky/pre-push slop base (8)
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 488ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 735ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 493ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 730ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 934ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 775ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 607ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 959ms
   ✓ graphify register pre-push gate (8)
     ✓ .husky/pre-push: push to dev → the register gate checks the pushed commit and blocks 833ms
     ✓ .husky/pre-push: push to a feature branch → the register gate does not run 709ms
   ✓ .husky/pre-push min push (12)
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 1708ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 1020ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 913ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 800ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 642ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 744ms
     ✓ .husky/pre-push: a code file in the push → the full gate 786ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 885ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 868ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 757ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 779ms
     ✓ .husky/pre-push: a code push still runs them 689ms

 Test Files  47 passed (47)
      Tests  1598 passed (1598)
   Start at  23:48:30
   Duration  53.63s (tests 99%, transform 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/700-session-start-nudge/build-group-gate-1-2.log.reports/vitest-78923.xml
> [bkit] TRUNCATED — kept 2582 of 17088 lines (181 KB of 1.2 MB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
