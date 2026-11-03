
> @cbartens/bkit@6.0.0 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static-unit && pnpm test:integration'


> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats'


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/165 files need formatting

> @cbartens/bkit@6.0.0 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


 .bkit/core/.bkit/README.md
 342:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


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
 483:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 603:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 676:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 182:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 245:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 94:383    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 99:488    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 136:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 162:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 603:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 842:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1017:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1125:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1286:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1344:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 373:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 413:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 484:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/templates/context/bkit-serena.md
 6:78  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/deployments.md
 126:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 245:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 373:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 413:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 484:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 47 warnings and 0 suggestions in 149 files.
passed: true
skipped: null
files: 149

> @cbartens/bkit@6.0.0 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> bkit ci slop

[bkit-ci] base 38102970a8a3a542798cc320c9691dced676efa2 (38102970a8a3a542798cc320c9691dced676efa2) vs working tree
[bkit-ci] added 1, resolved 1, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 38102970a8a3a542798cc320c9691dced676efa2
base: 38102970a8a3a542798cc320c9691dced676efa2
added: 1
resolved: 1
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 9.1 on 10 cores: unit limits 9050ms per test, 18100ms per hook (x1.81)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
      Coverage enabled with v8

pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 20223ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 1092ms
     ✓ keeps each context's own section banner and drops every other context's 2290ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 667ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 363ms
     ✓ clamps a ci block with the ci profile and a runtime block without it 469ms
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 770ms
   ✓ bkit context diff (10)
     ✓ writes origin/dev...HEAD without docs/plans/** and prints the numstat numbers 506ms
     ✓ --base narrows the range to the commits after a group's start sha 996ms
     ✓ diff from a group start covers only the group's commits 1122ms
     ✓ a base that is not a commit exits 5 and writes nothing 529ms
     ✓ an empty range writes a one-line note and zero numbers 1249ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 2137ms
     ✓ --reset-log empties the step's clamp log before the record lands 889ms
     ✓ partial: prints and writes the files not shown whole, and keeps the whole diff in the outbox 764ms
     ✓ whole: nothing omitted and no copy kept 483ms
     ✓ the budget honours topFiles and totalLines and says when the ceiling cut a file 497ms
 ✓ .bkit/core/engine/audits/templates/context-github-ci-block.test.ts (4 tests) 10194ms
   ✓ GitHub selected-evidence context blocks (4)
     ✓ fetches pinned attempts without branch discovery and filters unpinned discovery 2976ms
     ✓ emits complete receipts only after all selected job logs succeed 3859ms
     ✓ ends pinned diffs at selected commits with ancestral same-workflow baselines 3346ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 40270ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 1495ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 726ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 1584ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 885ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 1532ms
     ✓ gh not on PATH at all also falls back to the remote 318ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 578ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 769ms
     ✓ counts commits behind origin/dev and the divergence age 1219ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 1097ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1982ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1470ms
     ✓ from a worktree, still names the main checkout and its outbox 2387ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 1171ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 711ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 760ms
     ✓ prints the Jira site and project under jira 1085ms
     ✓ prints the board under github 916ms
     ✓ prints the github progress and review states, defaults for a key left unset 1326ms
     ✓ prints the linear progress and review states, defaults for a key left unset 994ms
     ✓ prints the jira progress and review states, defaults for a key left unset 814ms
     ✓ prints the linear progress and review states, defaults for a key left unset 795ms
     ✓ prints null progress and review states under none 558ms
     ✓ prints buildPublishRemote and buildPublishLocal 739ms
     ✓ prints the publish defaults when package.json omits them 876ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 864ms
     ✓ prints nulls under github without a board, and for keys left unset 2051ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 1171ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 1256ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1253ms
     ✓ an unpinned repo reports nulls and asks no registry 1032ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 1205ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 1271ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 1149ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1116ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 48290ms
   ✓ gateguard opencode plugin — advisory mode (default) (7)
     ✓ emits reuse checklist on first write to a NEW (nonexistent) file 491ms
     ✓ keeps the reuse checklist when the write CREATES the file (pre-write snapshot) 505ms
     ✓ (V1) keeps the reuse checklist when the write CREATES the file (pre-write snapshot) 385ms
     ✓ emits investigation checklist on a write to an EXISTING file 590ms
     ✓ emits investigation checklist on first edit to a file 502ms
     ✓ dedups: second write to the same file in the same session emits nothing 623ms
     ✓ warns again for a different file in the same session 913ms
   ✓ gateguard opencode plugin — deny mode (2)
     ✓ throws with advisory text on first write (blocks edit) 499ms
     ✓ allows retry (second call is a no-op after dedup marked) 544ms
   ✓ gateguard opencode plugin — subagents are NOT exempt (3)
     ✓ a subagent session editing a file DOES get the advisory (exemption removed) 666ms
     ✓ orchestrator session gets the advisory too — same treatment either way 495ms
   ✓ gateguard opencode plugin — gate-config advisory (9)
     ✓ tsconfig.json triggers config advisory 757ms
     ✓ flags vitest.config.ts as gate config 594ms
     ✓ flags eslint.config.mjs as gate config 559ms
     ✓ flags .prettierrc as gate config 520ms
     ✓ flags slop-scan.config.json as gate config 454ms
     ✓ flags .vale.ini as gate config 489ms
     ✓ flags .lintstagedrc.json as gate config 632ms
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 507ms
     ✓ source file is not treated as gate config 619ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 1148ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 5471ms
     ✓ patch (v1 driver): checks every Add / Update / Move-to / Delete target 1916ms
     ✓ apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target 1970ms
     ✓ apply_patch (v1 driver): checks every Add / Update / Move-to / Delete target 2341ms
     ✓ deny mode blocks when any patch target is a first touch, and records all of them 2036ms
     ✓ deny mode still blocks when only one of several patch targets is new to the session 2370ms
   ✓ managed-block boundary (3)
     ✓ bkit:end precedes the driver + exported plugin declaration 364ms
     ✓ does NOT import a plugin package — @opencode/plugin only exists on 2.0 419ms
   ✓ dual driver shape (OpenCode 1.x server() + 2.0 setup()) (6)
     ✓ default export carries id + setup + server 522ms
     ✓ both drivers emit the same advisory for the same edit 3633ms
     ✓ V1 driver reads the real 1.x arg key `filePath` 3714ms
     ✓ deny mode blocks the first touch on BOTH drivers 2724ms
   ✓ gateguard plugin — docs/*.md density advisory (#422) (6)
     ✓ appends the density advisory for a docs/ markdown file 688ms
     ✓ does NOT match a Documents/ ancestor (segment match, not substring) 1414ms
     ✓ excludes docs/plans/ (plan template governs those, not the docs register) 1628ms
     ✓ does NOT match docs/knowledge.jsonl (gated on .md) 1190ms
     ✓ matches a nested docs/ tree via segment match (.bkit/shared/docs/architecture.md) 1012ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 60893ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 841ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1414ms
     ✓ always writes the marker, even with no plan 560ms
     ✓ writes the linear marker shape, taking the tracker from package.json 1012ms
     ✓ writes the jira marker shape, taking the tracker from package.json 1465ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 1218ms
     ✓ refuses a PR from dev, main, or the base itself 367ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1161ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1648ms
     ✓ exits 5 when the open-PR probe errors 729ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1401ms
     ✓ prs open refuses --base=main 605ms
     ✓ prs open refuses --base=refs/heads/main, the same branch as main 319ms
     ✓ prs open still opens against any other base 1371ms
     ✓ exits 6 when the created PR's base is not --base 1136ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 817ms
     ✓ exits 1 with found=false when there is none 737ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1158ms
     ✓ --number reads one PR, mergeable included 881ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 1863ms
     ✓ exits 4 when gh errors and 80 when it needs auth 931ms
   ✓ bkit prs scan-body (10)
     ✓ passes a token-free body 333ms
     ✓ passes a deliberate token in the SUBJECT with a clean body (docs-only close) 343ms
     ✓ exits 2 on an empty or option-like sha, 3 on an unreadable one 319ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 591ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 641ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 2060ms
     ✓ drops the force-build marker from the title subject 1038ms
     ✓ takes an explicit --subject 1018ms
     ✓ runs no merge when the PR is already MERGED 867ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1250ms
     ✓ prs merge refuses a PR whose base is main 985ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 1306ms
     ✓ prs merge refuses when the PR base is unknown 1541ms
     ✓ prs merge reads the base from the one pr view it already makes 1167ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 923ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 551ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 748ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 534ms
     ✓ never reads dev's required checks without --only-if-required 497ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 985ms
     ✓ updates when a dev ruleset requires status checks 793ms
     ✓ updates when dev's branch protection requires status checks 736ms
     ✓ ignores dev rulesets that require no checks 971ms
     ✓ updates when the repo cannot be resolved 696ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 727ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 778ms
     ✓ is not green when a check failed, naming it (exit 1) 711ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 644ms
     ✓ is not green on an empty rollup (total 0) 515ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 1075ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1035ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 1597ms
     ✓ is a no-op when the title already says so 1571ms
     ✓ strips the marker, with or without its bkit prefix 1221ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1948ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests) 70961ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 1229ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 1003ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1262ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 816ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1100ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 493ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 487ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 587ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 695ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 824ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1202ms
     ✓ PASS is 0 failures with or without reports 499ms
     ✓ clears a previous attempt's reports before the gate runs 711ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 586ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1516ms
     ✓ a log under the outbox is named main-checkout relative in the record 637ms
     ✓ a log small enough is copied whole: not clamped, raw null 1000ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 568ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1206ms
     ✓ numbers runs within the workflow's active run and per step 799ms
     ✓ without --file no row is written and the output carries row null 689ms
   ✓ bkit tests plan-check (28)
     ✓ plan-check refuses an UPDATE symbol missing from its file 439ms
     ✓ plan-check matches a Markdown heading symbol 525ms
     ✓ plan-check follows bkit.workflows.tasks 445ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1319ms
     ✓ a planned test that passes is a vacuous gap, exit 1 807ms
     ✓ a planned test absent from a loaded report is a missing gap 1315ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1815ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1279ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 663ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 2532ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 1842ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 986ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 307ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1688ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1228ms
       ✓ a later unproven result never replaces a proven red of the same lines 562ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1899ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1278ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1517ms
     ✓ green: a passed-accepted test is already landed, not a gap 1108ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1078ms
     ✓ green refuses a plan with no task markers 396ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 972ms
     ✓ green: --group audits only that group's tasks 2329ms
     ✓ green: --group naming a group with no tasks is refused 911ms
     ✓ green: a code fence never closed is the reason, not missing task markers 572ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1841ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1843ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 908ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1812ms
     ✓ green: lists each gap kind, with the runner output 1448ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 2830ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 943ms
       ✓ green clears an exception-only task from a human commit 2092ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 25254ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 673ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 833ms
     ✓ CI=true -> GITHUB_ACTION 787ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 1291ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 1293ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 798ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 524ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 1694ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 1590ms
     ✓ LOCAL -> runtimeHeadless=false 942ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 1249ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 980ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 1405ms
     ✓ UNKNOWN -> runtimeHeadless=false 1397ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 971ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 440ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 859ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 1307ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 637ms
     ✓ re-derives per call: one run's answer does not leak into the next 428ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 426ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 378ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 382ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 771ms
     ✓ --file into a missing directory is refused, not created 363ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (56 tests) 22627ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 1491ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 1393ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1826ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1308ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 825ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 1167ms
     ✓ fetches the issue and its comments as GitHub returns them 1192ms
   ✓ linear client (4)
     ✓ posts through GraphQL commentCreate with the API key as Authorization 484ms
   ✓ postCommentOnce (4)
     ✓ skips issue-less runs and tracker none 301ms
     ✓ records an engine-action row and skips the same key + body on a re-run 858ms
     ✓ a recent identical comment counts as done (the final close comment) 755ms
     ✓ a failed post reports done false with the reason and never leaks a token 987ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 974ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 1092ms
     ✓ a board the token cannot see is scope 512ms
     ✓ an HTTP 403 from gh is scope 505ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 568ms
     ✓ github: no block, no blockers and no further reads 827ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 644ms
     ✓ a different marker hash posts 577ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 532ms
(node:92613) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:92613) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:92613) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:92613) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:92613) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:92613) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:92613) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (23 tests) 16492ms
   ✓ bkit-check-dependency-audit (5)
     ✓ exits 1 on a missing acceptance, 0 when clean, and 1 on a report with no advisories 603ms
   ✓ shipped copy-and-own test files (5)
     ✓ ci/bkit-check-capstone.test.mjs passes when run on its own 854ms
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 8731ms
   ✓ bkit-check-capstone (10)
     ✓ passes its own copy-and-own test file (bkit's own copy) 2162ms
     ✓ the repo capstone calls the script, with every lane it needs wired in 502ms
     ✓ the template's step (5)
       ✓ never skips itself: a missing script reds even when every lane is green 500ms
       ✓ passes with the script present and the lanes green 1374ms
       ✓ reds with the script present when the unit lane ran 0 tests 753ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (60 tests) 69522ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 2081ms
     ✓ names each net-new and worsened finding in the log and the JSON 3105ms
     ✓ fails on a net score rise with no net count change 2190ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1036ms
     ✓ treats a net score at or below 0.001 as float noise 1042ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 1259ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 322ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1326ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1524ms
     ✓ exits 4 on a dropped net field instead of silently passing 2216ms
     ✓ exits 4 on no summary instead of silently passing 2010ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1649ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1117ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1337ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 2695ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ a one-level glob does not descend; ** does; each file once across globs 361ms
   ✓ bkit ci prose — gate (5)
     ✓ fails when vale is not installed 351ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 786ms
     ✓ fails (exit 1) when vale reports alerts 649ms
     ✓ exits 6 on a vale runtime error 606ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 814ms
     ✓ falls back to vale sync when the main worktree has none 1051ms
     ✓ fails when vale sync cannot restore the required styles 616ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 566ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 510ms
     ✓ is a usage error when the commit cannot be read 319ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 500ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 905ms
     ✓ exits 1 naming the files outside, whatever the commit message says 1567ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 3684ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 1323ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 824ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ carries extra fields, parsed as JSON when they are JSON 1030ms
     ✓ rejects ["--field=verdict=PASS"] 318ms
     ✓ reports a failed commit with exit 8 without writing the row 1061ms
     ✓ a failed commit leaves no row staged in the index 1943ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 2431ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1810ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1258ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1244ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1838ms
   ✓ bkit steps verdict (10)
     ✓ empty artifact exits 0 389ms
     ✓ bad failures artifact exits 4 418ms
     ✓ a required field that is absent is invalid (re-prompt) 667ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 332ms
     ✓ only reads above the marker 458ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 698ms
     ✓ fails when no row was written for the step 351ms
     ✓ --ref reads the status file as committed on that ref, not from disk 1827ms
     ✓ --ref exits 3 when the ref does not carry the status file 1243ms
     ✓ fails on a placeholder left in the artifact 595ms
     ✓ fails when the row's verdict differs from the artifact's 530ms
     ✓ fails when the row does not list the artifact, or carries another attempt 1016ms
     ✓ fails on a missing artifact 474ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 484ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 641ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 421ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 303ms
     ✓ fails a diagnose row missing its strategy, passes with it 500ms
     ✓ fails a run-tests row missing its scope, and an empty scope 840ms
   ✓ bkit steps finish (15)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 526ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 906ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 2472ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 2036ms
     ✓ --post needs --number; without --post there is no tracker key 2282ms
   ✓ bkit steps stub (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ checks the FID's shape for the wired tracker 412ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 647ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 2989ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 2746ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 574ms
     ✓ --attempt-of checks the row carries the derived counter 520ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
> [bkit] TRUNCATED HERE — 55 lines omitted. Dropped content was NOT read.
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 1004ms
     ✓ fails with a fetch error when there is no origin to rebase onto 795ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 464ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 2352ms
     ✓ tells a caller inside the removed worktree where to cd 2473ms
     ✓ fails with its own exit code when git cannot remove a marked path 913ms
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 2282ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 473ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 352ms
     ✓ staging failure: exit 4 and no commit is created, no false success 374ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 1025ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 444ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 1623ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 653ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 3211ms
> [bkit] TRUNCATED HERE — 46 lines omitted. Dropped content was NOT read.
     ✓ rejects ambiguous cross-repository and malformed attempt references 794ms
     ✓ filters branch and PR discovery by configured workflow and exact head 2449ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1891ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2918ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 3830ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ runs?head_sha=green-capstone returns the captured workflow_runs list 740ms
   ✓ bkit runs gate (68)
     ✓ rejects a failed run (12) 423ms
     ✓ --fetch refreshes origin/<branch> before gating 2074ms
     ✓ without --branch a superseded head is 10, not 14 (no invented attribution) 413ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ rejects a green run whose capstone concluded 'timed_out' (12) 333ms
     ✓ rejects a green run whose capstone concluded 'neutral' (12) 477ms
     ✓ exit 12 failed steps (10)
       ✓ a stale register alone is regenerable; the capstone is left out 447ms
       ✓ both floor steps failing is regenerable 730ms
       ✓ any failed step off the list makes the whole result unregenerable 340ms
       ✓ a job that concluded 'failure' with no failed step is {job}/ and unregenerable 705ms
       ✓ a job that concluded 'timed_out' with no failed step is {job}/ and unregenerable 456ms
       ✓ a job that concluded 'cancelled' with no failed step is {job}/ and unregenerable 864ms
       ✓ a timed-out step counts as failed 462ms
       ✓ bkit.testing.ciGenerated adds steps to the floor 890ms
       ✓ a step name alone does not match a {job}/{step} entry in another job 365ms
     ✓ --repo scopes --pr resolution (2)
       ✓ reads the head from the named repo, not the checkout's own PR 329ms
     ✓ tells an API error (20) from no run (10) 381ms
     ✓ BKIT_SHIP_GATE_OVERRIDE (4)
       ✓ pinned to the refused head turns the refusal into 0 and appends the audit row 451ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 686ms
     ✓ --event (5)
       ✓ --event push reds on a failed push run even when a newer pull_request run is green 379ms
       ✓ without --event the newer green pull_request run masks the failed push run 398ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 733ms
       ✓ a run still in progress whose capstone already passed passes 384ms
       ✓ a capstone still running is in progress (11) 451ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 947ms
       ✓ a source change past the validated head refuses (17) and names the path 694ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 631ms
       ✓ --validated without --month / --fid is a usage error (2) 902ms
       ✓ a validated sha that is not an ancestor refuses (17) 2353ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 693ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 808ms
     ✓ a failed re-trigger push names the cause in the log 2293ms
     ✓ a failed re-trigger push leaves no orphan commit behind 2604ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 4202ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1630ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 740ms
     ✓ gh-error: every poll errored 1246ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1186ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1135ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 963ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1713ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 7622ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3711ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1254ms
     ✓ re-trigger on dev only uses the record of its own FID 2382ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 2237ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 399ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 1072ms
     ✓ a refused capstone records FAIL with its reason 1328ms
     ✓ an unreadable PR is an API error (20) with no head 400ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 905ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 1141ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 766ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 435ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1800ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 2006ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1558ms
     ✓ --file and --step go together 951ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 8993ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 783ms
     ✓ resolves config from the repo root when run from a subdirectory 463ms
     ✓ exits 6 when the PUT fails 736ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 541ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 514ms
     ✓ asks a human to log in when gh is not authenticated 438ms
     ✓ is a missing-dependency error when gh is not installed 468ms
     ✓ exits 3 when gh repo view names no repository 444ms
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 800ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 1028ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 645ms
     ✓ exits 6 when the api answer is not JSON 644ms
 ✓ .bkit/core/engine/commands/land.test.ts (30 tests) 50641ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 1446ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 3160ms
     ✓ a push that fails without a server answer is returned once, never retried 2781ms
     ✓ a failed fetch is returned before anything is built 1029ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 3967ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 3401ms
     ✓ lands from a clone whose fetch refspec omits dev 2702ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1589ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1180ms
     ✓ counts files committed since --base 1614ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 795ms
     ✓ runs nothing and exits 0 when no file changed 304ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1082ms
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 18185ms
   ✓ bkit issues labels (25)
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 629ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 442ms
     ✓ board is null with a reason for {"tracker":{"default":"jira","github":{"project":"https://github.com/orgs/acme/projects/3/views/1"}}} 897ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ renders header fields in the order the flags were given 595ms
     ✓ close: tree, PR and run links, then Artifacts and Telemetry sections 447ms
     ✓ failure: step, sub-step, error, and the last 20 stderr lines fenced 498ms
   ✓ bkit issues comment --post (6)
     ✓ skips tracker none and an issue-less FID 399ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 1015ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2282ms
     ✓ a refused dev push is logged, never fails the close 2211ms
     ✓ an unreachable remote is logged, never fails the close 1019ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 73243ms
   ✓ workflow shell fences (4)
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 957ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 2703ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 1003ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (20 tests) 5569ms
   ✓ bkit tasks currency (6)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ passes when nothing changed 589ms
     ✓ passes when only another key changed, such as a branch's upstream 468ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 549ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 569ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 558ms
 ✓ .bkit/core/engine/commands/lib.test.ts (69 tests) 10000ms
   ✓ repo facts on a real repository (4)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --month is used as given 608ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 503ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 392ms
     ✓ reads the feature worktree's status copy before the main checkout's 304ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 1576ms
     ✓ passes every rule on a clean head 877ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 772ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 48278ms
   ✓ readIssueTracker (5)
> [bkit] TRUNCATED HERE — 60 lines omitted. Dropped content was NOT read.
     ✓ a bare number with no issue prints a hint to write #N 441ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 3129ms
     ✓ a missing prompt file exits 7; --prompt-file with --branch is a usage error 329ms
   ✓ bkit fids resolve (12)
     ✓ 1. a FID the prompt names wins 360ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ 4. a stopword-only title falls back to the prompt; non-ASCII titles fold 409ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 595ms
     ✓ 6. a FID that fails the format check exits 1 480ms
     ✓ a missing title or prompt file exits 7 604ms
   ✓ bkit fids plans (2)
> [bkit] TRUNCATED HERE — 681 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 72 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 246 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 356 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 185 lines omitted. Dropped content was NOT read.
No outcome row records a duration.

### Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
No outcome row records a duration.

### Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |
> [bkit] TRUNCATED HERE — 104 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 10ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 11ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 13ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 8ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 10ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ an OPEN decision mid-build prints its header fields 370ms
     ✓ reads Test attempt from a tests pause 560ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 1016ms
     ✓ writes no row when status.jsonl does not exist 664ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 1262ms
     ✓ aborts a rebase only when one is in progress 2578ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 891ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1087ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 448ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 552ms
     ✓ --max-exceeded says a handover is due without any sentinel 599ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 349ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 498ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 433ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 703ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 572ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 328ms
     ✓ a debug run in SOAK mode always needs a handover 408ms
   ✓ bkit workflows close (26)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 1486ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1776ms
     ✓ an unwritable stats path is logged and never fails the close 2382ms
     ✓ appends the completeness row before the workflow-done row 1384ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 989ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 864ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1186ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 636ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 633ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 991ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1518ms
     ✓ --number without --outbox is a usage error 834ms
     ✓ --flush is ship only 980ms
   ✓ bkit workflows handover (23)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 475ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 570ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2651ms
     ✓ --flush with nothing to record commits and pushes nothing 4332ms
     ✓ --flush carries the named worktree's logs into the dev commit 4815ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3186ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 4695ms
     ✓ a close that landed releases the lock 3846ms
     ✓ removes the worktree before it releases the lock 3324ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 697ms
     ✓ names the branch, not the remote-tracking ref, in each URL 707ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 446ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 381ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1108ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 641ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a second run's record does not let this FID's close commit 773ms
     ✓ record is present after workflows close and before the push 1752ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2025ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 410ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 984ms
     ✓ refuses a code conflict and aborts the rebase on the spot 1109ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1631ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 698ms
     ✓ produces byte-identical output to merge=union 1713ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1182ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1765ms
     ✓ refuses a lockfile whose regenerate command fails 2181ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1464ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1674ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 1944ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 2980ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 2906ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 4635ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 1160ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 738ms
       ✓ runs (0) with the landed path count once dev moved 1266ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 478ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1213ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2591ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 8240ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 1691ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 2853ms
     ✓ --mode=abort pushes when the branch has no open PR 3989ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1285ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 1113ms
     ✓ --open-pr carries the MCP answer and skips gh 1778ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 4134ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 3403ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 6575ms
     ✓ skip-ci HEAD on the replay is refused 5582ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3254ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 1494ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2630ms
     ✓ a fetch that fails exits 10 1633ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 2172ms
     ✓ --paths with no match exits 1 1395ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 1046ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1410ms
     ✓ --marker reads a diff over 1 MiB 1220ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 931ms
     ✓ scan-diff ignores a removed comment in a test file 894ms
     ✓ scan-diff ignores an assertion moved within the file 953ms
     ✓ scan-diff still reports a removed assertion 864ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1098ms
     ✓ scan-diff finds an added pytest mark skip 941ms
     ✓ scan-diff finds an added unittest skip 871ms
     ✓ scan-diff finds an added bare skip call 935ms
     ✓ scan-diff ignores a quoted skip in a documentation file 957ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1053ms
     ✓ scan-diff ignores an assertion whose expectation changed 801ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 730ms
     ✓ scan-diff reports a deleted test file 452ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 846ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1148ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1695ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1114ms
     ✓ --merge-docs skips an empty bkit:generate script 784ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 592ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1434ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1444ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1105ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1527ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 2219ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 814ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 496ms
     ✓ exits 10 when the fetch fails 301ms
     ✓ refuses --merge-docs with --head, and an unknown --head 359ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 657ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 928ms
     ✓ a failed install stops ship (16) 780ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 661ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 716ms
     ✓ exits 10 when the fetch fails 667ms
   ✓ branches land (27)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 411ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1032ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1421ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1417ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 882ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1441ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 301ms
     ✓ reports undeclared and runs nothing with an empty script 308ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 790ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 785ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 439ms
> [bkit] TRUNCATED HERE — 103 lines omitted. Dropped content was NOT read.
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |   99.06 |    98.51 |     100 |     100 | 267,318           
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   89.92 |    85.46 |   95.47 |   90.53 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 350 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 1429 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 822 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 26 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 31 ms
ok 19 stub: the response selector is cleared before running its body # in 27 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 32 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 39 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 29 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 26 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 37 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 21 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 55 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 88 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 768 ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
ok 33 an empty value unsets the key instead of setting an empty string # in 272 ms
ok 34 non-BKIT_ keys are skipped # in 255 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 270 ms
ok 36 a failed unsetenv is retried on the next run # in 351 ms
ok 37 logs key names only, never values # in 248 ms
ok 38 missing env file exits 0 without calling launchctl # in 46 ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
> vitest run integration.test

[test-timeout-budget] load average 10.6 on 10 cores: unit limits 9800ms per test, 19600ms per hook (x1.96)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
     ✓ tests run with an unwritable lock dir exits 4 naming the path 3489ms
     ✓ tests run with --lock-wait-s=0 exits 81 at once against a held lock 2467ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 2411ms
     ✓ the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 2378ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-dogfood.integration.test.ts (39 tests) 72837ms
> [bkit] TRUNCATED HERE — 50 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 148 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 148 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 148 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 148 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 136 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ consumer-added extra key in opencode.json → check exits 0 (deep-contain, not drift) 3660ms
     ✓ opencode installed but no provider recorded → check exits 1 and names the fix 4054ms
     ✓ a consumer with no opencode host at all is not failed for a missing provider 3409ms
   ✓ bkit check — antigravity detected from any plugin file (1)
     ✓ deleted plugin.json + neutered guardrails command + deleted guardrails hook → check exits 1 naming each 7278ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ bkit check with stale consumer prompts.md does not emit Missing model lookup 960ms
   ✓ Scenario: bkit check stale-marker gate is branch-scoped (#256) (2)
     ✓ on main: hard-fails (exit 1) and names the bkit-managed-stale BLOCKER 788ms
     ✓ on a feature branch: surfaces a non-blocking ADVISORY, no marker-drift hard-fail line 1125ms
stdout | .bkit/core/engine/install/modules/index.integration.test.ts
[test] core: .bkit/allowlist.json
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 135 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 135 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 158 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 157 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (37 tests) 64974ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (32)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 2956ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 499ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 1551ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone 3187ms
     ✓ T16: a Jira-shaped commit scope with a digit in the key (ab1-123-slug) no-ops — no dispatch 1294ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 1199ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 2270ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 2051ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 3047ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 1431ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 1413ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 2523ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 3054ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 1964ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 1432ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 1738ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 1826ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 2225ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 2144ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 2179ms
       ✓ a branch with no status.jsonl dispatches as before 1953ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 1540ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 5702ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 1817ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 2372ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ .husky/pre-push: empty stdin → gates still run 885ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 756ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 518ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 742ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 617ms
     ✓ .husky/pre-push: first and last lines name the log 936ms
     ✓ .husky/pre-push: the hook body runs once 539ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 1044ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 900ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 853ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 935ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 1064ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 1281ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 786ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 796ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 826ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 1100ms
     ✓ .husky/pre-push: a gate fails → no disk prune 818ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 878ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 701ms
     ✓ a stale register stops the push before any gate runs 697ms
     ✓ bkit check fails → the push stops before any gate runs 623ms
     ✓ the dependency audit runs before any gate, when its script is present 807ms
     ✓ no dependency-audit script → skipped, the gates still run 883ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 851ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 965ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1316ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 765ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1034ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 933ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1660ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 891ms
   ✓ graphify register pre-push gate (18)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ branch with no open PR → no check, push goes on 1932ms
     ✓ branch push, gh not installed → loud NOT-checked warning, push goes on 535ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 950ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 583ms
     ✓ a push that does not update the checked-out branch → no PR lookup, no check 368ms
> [bkit] TRUNCATED HERE — 60 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 2525ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 3454ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 4859ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1567ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 675ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 1244ms
     ✓ plan installs dependencies like build and debug 1817ms
     ✓ design stops on a failed install (5) 2200ms
     ✓ plan stops on a failed install (5) 1668ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 2186ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1919ms
     ✓ fails without minting when origin cannot be reached 371ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 2073ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1631ms
   ✓ bkit worktrees setup — mint (resume) (24)
     ✓ rebases onto origin/dev and clears a stale sentinel 4734ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 3202ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 2819ms
     ✓ debug: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 3509ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 3704ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 3252ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 4568ms
> [bkit] TRUNCATED HERE — 47 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 277 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 153 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 148 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 198 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 168 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 172 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 450 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 226 lines omitted. Dropped content was NOT read.
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 1565ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 777ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 1443ms
     ✓ explicit `bkit help` prints the same usage and exits 0 1631ms
     ✓ `bkit check --claude` (stray module flag) errors 1280ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 927ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 1993ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 1959ms
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
   ✓ cloud install script pieces, run by bash (7)
     ✓ Codex: the dependency install runs in the repo after a download step leaves it 1170ms
     ✓ names each failing provision block with its last error line, keeps going, and never fails the install 533ms
     ✓ Claude session hook: context-fetch provisioning (3)
       ✓ runs every recipe through bkit context provision and tells the agent on stdout what failed 3898ms
       ✓ prints nothing to stdout when every recipe succeeds 5312ms
       ✓ logs and carries on when the installed bkit has no provision verb 1926ms
> [bkit] TRUNCATED HERE — 116 lines omitted. Dropped content was NOT read.
     ✓ Antigravity denies a repeat read once with the note; the identical retry passes 1673ms
     ✓ OpenCode reads the whole file when neither offset nor limit is given 1573ms
     ✓ CJS hooks fail open on malformed stdin 8303ms
 ✓ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts (10 tests) 97438ms
   ✓ the push of a debug run in place on dev sends only the run's commits (4)
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
     ✓ a stack named by BKIT_LOCAL_STACK never waits on the shared one 2855ms
     ✓ every worktree of one repo resolves the main checkout's lock, and waits on it 1657ms
     ✓ a holder that stops before it answers fails the take at once instead of hanging 2318ms
     ✓ `run` holds the lock for the command and passes its exit status on 393ms
     ✓ a named lock is machine-wide: checkouts of two different repos wait on the same named lock 5398ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other 2699ms
     ✓ run --lock holds the named lock for the command and passes its exit status on 1168ms
     ✓ run exits 75 when the wait gives up, distinct from the command's own failure 9059ms
     ✓ run exits 73 naming the path when the lock dir cannot be written 727ms
     ✓ run exits 73 naming /usr/bin/perl when perl is missing 2528ms
> [bkit] TRUNCATED HERE — 44 lines omitted. Dropped content was NOT read.
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 7543ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 3576ms
     ✓ stops the step when the command crashed or was misused 2173ms
   ✓ deferred landing of a held build (ship, matrix: held → landed) (2)
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
   ✓ bkit status — integration (4)
     ✓ exits 0 and prints [bkit-status] prefix 3119ms
     ✓ writes zero files (purely read-only — write-set assertion) 10836ms
     ✓ reports installed hosts (at minimum claude and cursor on a fresh consumer) 8402ms
     ✓ reports opencode as absent when .opencode/ does not exist 3310ms
> [bkit] TRUNCATED HERE — 190 lines omitted. Dropped content was NOT read.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

stderr | scripts/harvest/ledgers.integration.test.ts > Harvest boundary: stats copy-only, friction moved (WS4-T1, #343) > count-only aggregates deferrals.jsonl and failures.jsonl without copying prose
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-0DXXhj/bkit
> [bkit] TRUNCATED HERE — 92 lines omitted. Dropped content was NOT read.
   ✓ cursor gateguard — modes (2)
     ✓ deny mode routes the checklist to agent_message, not user_message alone 1490ms
   ✓ cursor gateguard — no-op and fail-open cases (2)
     ✓ malformed and empty stdin still emit one allow 309ms
   ✓ cursor gateguard — subagents are NOT exempt (1)
> [bkit] TRUNCATED HERE — 57 lines omitted. Dropped content was NOT read.
npm warn Unknown env config "strict-dep-builds". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown env config "trust-policy". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
stderr | scripts/harvest/ledgers.integration.test.ts > Harvest: a friction row the dispatch seam wrote > keeps a seam-written tool-failure row through commit and harvest
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-BUF19r/bkit
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ keeps every pruned row across re-runs when same-key rows carry legacy ts 303ms
   ✓ Harvest: a friction row the dispatch seam wrote (1)
     ✓ keeps a seam-written tool-failure row through commit and harvest 4324ms
 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (7 tests) 5701ms
   ✓ the dispatch seam on a real worktree (7)
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-test] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 162 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 180 lines omitted. Dropped content was NOT read.
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 47 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 183 lines omitted. Dropped content was NOT read.
docs/templates/bkit-audit-documentation.md       | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-duplication.md         | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-failures.md            | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-flakes.md              | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-gates.md               | delete                 | bkit-owned docs template — removed on full/core uninstall
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 180 lines omitted. Dropped content was NOT read.
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
     ✓ CONTROL — without it, a temp repo's `git -C` init under the hook's GIT_DIR flips core.bare 1034ms
     ✓ clears every GIT_* variable, so the same init stays in the temp dir 1113ms
     ✓ fails the run when a test writes an identity into the checkout, and removes it 1376ms
     ✓ fails the run when a test sets core.bare in the checkout, and puts it back 1443ms
stdout | .bkit/core/engine/install/modules/claude.integration.test.ts > runClaudeModule preserves consumer settings through deep-containment > writes template scope and preserves the consumer Stop hook without __bkit__
[bkit-install] write: .claude/commands/bkit-auto.md
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 166 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 158 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 180 lines omitted. Dropped content was NOT read.
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 204 lines omitted. Dropped content was NOT read.
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
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
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
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
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
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
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
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
[bkit-uninstall-surgical-test] delete mirror: .opencode/agents/bkit-build-plan-tasks.md
[bkit-uninstall-surgical-test] delete mirror: .opencode/commands/bkit-build.md
[bkit-uninstall-surgical-test] prune empty dir: .opencode/commands

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > opencode round-trip: zero footprint — no bkit-prefix .opencode/ files remain after uninstall
[bkit-uninstall-surgical-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-surgical-test] strip-block: .opencode/plugin/bkit-gateguard.js
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete mirror: .opencode/agents/bkit-build-plan-tasks.md
[bkit-uninstall-surgical-test] delete mirror: .opencode/commands/bkit-build.md
[bkit-uninstall-surgical-test] prune empty dir: .opencode/agents
[bkit-uninstall-surgical-test] prune empty dir: .opencode/commands

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > targeted uninstall does NOT cross-delete other hosts' bkit-prefix mirrors (#255 P0-1)
[bkit-uninstall-surgical-test] absent: .opencode/opencode.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete mirror: .opencode/agents/bkit-build-plan-tasks.md
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
[bkit-uninstall-surgical-test] delete mirror: .claude/agents/bkit-build-plan-tasks.md
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
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
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
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
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

 ✓ .bkit/core/engine/install/placeholders.integration.test.ts (6 tests) 785ms
stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical --opencode=<provider> removal (#281 Task 4) > re-points bkit.providers.opencode.default when the active provider is removed
[bkit-uninstall] removed provider block "openrouter" from opencode.json
[bkit-uninstall] updated package.json: bkit.providers.opencode.installed=[ollama] bkit.providers.opencode.default=ollama
[bkit-uninstall] write: .opencode/agents/bkit-audit-generate.md
[bkit-uninstall] write: .opencode/agents/bkit-build-challenge-1.md
[bkit-uninstall] write: .opencode/agents/bkit-build-challenge-2.md
[bkit-uninstall] write: .opencode/agents/bkit-build-install-skills.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-convert.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-current.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-gaps-remediate.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-tasks.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-tests.md
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
[bkit-uninstall] active provider switched to "ollama" — re-rendered 46 .opencode/ agent/command file(s) to its model pins.

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical --opencode=<provider> removal (#281 Task 4) > falls through to full teardown when the last provider is removed
[bkit-uninstall] removed provider block "openrouter" from opencode.json
[bkit-uninstall] updated package.json: bkit.providers.opencode.installed=[] bkit.providers.opencode.default=(removed)
[bkit-uninstall] no providers remain — triggering full opencode host teardown...
[bkit-uninstall] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall] delete mirror: .opencode/agents/bkit-build-plan-tasks.md
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

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > targeted uninstall drops the module's bkit.* keys > a dry run lists the keys and writes nothing
[bkit-uninstall-surgical-test] [dry-run] Decision table:
[bkit-uninstall] No files to process.

[bkit-uninstall-surgical-test] [dry-run] package.json: reset bkit.cloud.agent to unset

 ✓ .bkit/core/engine/commands/install/uninstall.integration.test.ts (20 tests) 333ms
 ✓ .bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts (16 tests) 1483ms
   ✓ codex hook — the rules-read advisory (4)
     ✓ codex hook writes the rules advisory as additionalContext once per session 343ms
     ✓ an unwritable state dir returns the advisory once per session, not on every call 364ms
 ✓ .bkit/core/engine/audits/templates/telemetry-gitattributes.integration.test.ts (18 tests) 462ms
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
[bkit-install] core: .bkit/cli.md
[bkit-install] core: .bkit/comparison.md
[bkit-install] core: .bkit/install.md
[bkit-install] core: .bkit/jsonl.md
[bkit-install] core: .bkit/LICENSE.md
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
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-install] template added: .bkit/templates/.graphifyignore
[bkit-install] template added: .bkit/templates/.husky/pre-commit
[bkit-install] template added: .bkit/templates/.husky/pre-push
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
[bkit-install] template added: .bkit/templates/.serena/project.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
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
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
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
[bkit-install] write: .claude/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .claude/agents/bkit-build-plan-tasks.md
[bkit-install] write: .claude/agents/bkit-build-plan-tests.md
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

 ✓ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts (12 tests) 737ms
 ✓ .bkit/core/engine/install/modules/cloud.integration.test.ts (9 tests) 388ms
   ✓ runCloudModule — opt-in cloud agents (post-CI auto-routing) (9)
     ✓ the default module set does NOT ship cloud scaffolding 356ms
 ✓ .bkit/core/engine/checks/after/managed.integration.test.ts (1 test) 289ms
 ✓ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts (22 tests) 134ms
 ✓ .bkit/core/engine/commands/workflow/branches-lock.integration.test.ts (2 tests) 3435ms
   ✓ branches push through a real pre-push lock (2)
     ✓ branches push exits 81 naming the holder when the pre-push hook's gate gave up on the tests lock 1790ms
     ✓ branches push passes LOCAL_STACK_LOCK_WAIT_S and LOCAL_STACK_LOCK_WHO to git push 1642ms
 ✓ .bkit/core/engine/checks/before/files.integration.test.ts (12 tests) 46ms
 ✓ .bkit/core/engine/install/write.integration.test.ts (4 tests) 45ms
 ✓ .bkit/core/engine/install/version-file.integration.test.ts (5 tests) 16ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-claude.integration.test.ts (31 tests) 24814ms
   ✓ gateguard hook — advisory (default mode) (4)
     ✓ injects an investigation checklist on first edit, never blocks 1761ms
     ✓ matches Write and MultiEdit too 2920ms
     ✓ dedups: second edit of the same file in the same session is a no-op 1769ms
     ✓ warns again for a different file in the same session 1890ms
   ✓ gateguard hook — reuse advisory (new-file Write) (3)
     ✓ emits a reuse/anti-duplicate checklist for a Write to a new (nonexistent) path 640ms
     ✓ a Write to an EXISTING path gets the investigation checklist, not reuse 778ms
     ✓ an Edit to a nonexistent path stays on the investigation checklist (reuse is Write-only) 1543ms
   ✓ gateguard hook — config protection (item D) (10)
     ✓ emits the gate-config advisory for tsconfig.json 640ms
     ✓ tells agents inside /bkit-* workflows to record the block, never self-approve 721ms
     ✓ flags vitest.config.ts as a gate config 902ms
     ✓ flags eslint.config.mjs as a gate config 626ms
     ✓ flags .prettierrc as a gate config 558ms
     ✓ flags slop-scan.config.json as a gate config 766ms
     ✓ flags .vale.ini as a gate config 552ms
     ✓ flags .lintstagedrc.json as a gate config 737ms
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a config edit to the normal checklist 704ms
     ✓ a normal source file is not treated as a gate config 833ms
   ✓ gateguard hook — deny flip (BKIT_GATEGUARD=deny) (2)
     ✓ denies the first touch with the checklist as the reason 641ms
     ✓ allows the retry (dedup) after the first deny 859ms
   ✓ gateguard hook — no-op / fail-open cases (7)
     ✓ subagents are NOT exempt — an agent_id payload still gets the checklist 645ms
     ✓ a subagent sharing its parent's session_id gets its own checklist, once 1481ms
   ✓ gateguard hook — docs/*.md density advisory (#422) (5)
     ✓ appends the density advisory for a docs/ markdown file 566ms
     ✓ does NOT match a Documents/ ancestor (segment match, not substring) 589ms
     ✓ excludes docs/plans/ (plan template governs those, not the docs register) 566ms
     ✓ does NOT match docs/knowledge.jsonl (gated on .md) 389ms
 ✓ .bkit/core/engine/audits/repo/test-file-script.integration.test.ts (12 tests) 40801ms
   ✓ bkit:test:file runs every test file kind into a JUnit report (7)
     ✓ bats — tests/shell/bkit-gh-stub.bats reports its named test passed 9434ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs reports its named test passed 9096ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… reports its named test passed 4037ms
     ✓ bats — with no report path the test file is left as it was 6408ms
     ✓ node — with no report path the test file is left as it was 3954ms
     ✓ vitest — with no report path the test file is left as it was 2488ms
     ✓ a run naming files of two kinds is refused as a usage error 1328ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 1178ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 1040ms
   ✓ bkit:lint:file passes a test file its linter does not cover (3)
     ✓ bats — tests/shell/bkit-gh-stub.bats lints clean 508ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs lints clean 658ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… lints clean 668ms
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

 ✓ .bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts (339 tests) 288178ms
   ✓ gateguard behaviour parity — advisory content (210)
     ✓ claude (42)
       ✓ first edit to an existing file gets the investigation checklist 642ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 767ms
       ✓ a gate-config path gets the weaken-the-gate advisory 1537ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 1334ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 746ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 617ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 712ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 769ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 634ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 644ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 661ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 595ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 855ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 1474ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 1232ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 833ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 699ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 699ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 1529ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 1216ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 1119ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 614ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 617ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 723ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 735ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 825ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 735ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 758ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 760ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 938ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 1122ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 572ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 961ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 793ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 769ms
       ✓ ordinary file README.md is not treated as a gate config 1412ms
       ✓ ordinary file src/index.ts is not treated as a gate config 1344ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 854ms
       ✓ mixed-purpose package.json is not treated as a gate config 785ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 968ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 981ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 697ms
     ✓ cursor (42)
       ✓ first edit to an existing file gets the investigation checklist 839ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 1175ms
       ✓ a gate-config path gets the weaken-the-gate advisory 1233ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 681ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 761ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 1076ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 748ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 1351ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 850ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 528ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 621ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 528ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 509ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 625ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 1097ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 757ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 1269ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 791ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 1016ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 538ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 658ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 752ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 663ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 582ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 636ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 726ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 725ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 579ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 624ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 628ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 469ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 643ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 730ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 579ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 507ms
       ✓ ordinary file README.md is not treated as a gate config 521ms
       ✓ ordinary file src/index.ts is not treated as a gate config 463ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 706ms
       ✓ mixed-purpose package.json is not treated as a gate config 552ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 486ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 444ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 530ms
     ✓ opencode (42)
       ✓ first edit to an existing file gets the investigation checklist 683ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 629ms
       ✓ a gate-config path gets the weaken-the-gate advisory 491ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 622ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 381ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 469ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 537ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 377ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 384ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 396ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 419ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 421ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 365ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 355ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 309ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 408ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 405ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 518ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 392ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 440ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 344ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 370ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 424ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 328ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 321ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 317ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 341ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 361ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 337ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 461ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 378ms
       ✓ ordinary file README.md is not treated as a gate config 390ms
       ✓ ordinary file src/index.ts is not treated as a gate config 386ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 493ms
       ✓ mixed-purpose package.json is not treated as a gate config 476ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 457ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 603ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 430ms
     ✓ codex (42)
       ✓ first edit to an existing file gets the investigation checklist 524ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 602ms
       ✓ a gate-config path gets the weaken-the-gate advisory 662ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 561ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 477ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 515ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 482ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 452ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 449ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 594ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 1726ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 665ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 515ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 560ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 840ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 619ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 1518ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 529ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 565ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 680ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 695ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 642ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 714ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 843ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 484ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 715ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 1074ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 808ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 1404ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 1405ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 618ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 625ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 489ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 718ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 1014ms
       ✓ ordinary file README.md is not treated as a gate config 1138ms
       ✓ ordinary file src/index.ts is not treated as a gate config 978ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 1110ms
       ✓ mixed-purpose package.json is not treated as a gate config 633ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 542ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 1011ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 610ms
     ✓ antigravity (42)
       ✓ first edit to an existing file gets the investigation checklist 938ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 728ms
       ✓ a gate-config path gets the weaken-the-gate advisory 1279ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 1275ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 719ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 562ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 443ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 608ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 879ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 869ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 1189ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 2358ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 1325ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 1188ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 1376ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 1029ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 1482ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 1705ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 893ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 1340ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 1155ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 2131ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 1316ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 870ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 605ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 940ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 932ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 656ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 1707ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 1375ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 3065ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 2450ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 2192ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 2672ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 2073ms
       ✓ ordinary file README.md is not treated as a gate config 1586ms
       ✓ ordinary file src/index.ts is not treated as a gate config 1909ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 1367ms
       ✓ mixed-purpose package.json is not treated as a gate config 1104ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 1502ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 1679ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 1639ms
   ✓ gateguard behaviour parity — template copies (25)
     ✓ claude: a consumer's .bkit/templates/.vale.ini is not a gate config 4566ms
     ✓ claude: a consumer's root .vale.ini is a gate config 2559ms
     ✓ claude: bkit's own .bkit/templates/.vale.ini is a gate config 2643ms
     ✓ claude: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 1474ms
     ✓ claude: a folder that merely ends in .bkit/templates is not a template copy 803ms
     ✓ cursor: a consumer's .bkit/templates/.vale.ini is not a gate config 1627ms
     ✓ cursor: a consumer's root .vale.ini is a gate config 1893ms
     ✓ cursor: bkit's own .bkit/templates/.vale.ini is a gate config 1106ms
     ✓ cursor: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 1528ms
     ✓ cursor: a folder that merely ends in .bkit/templates is not a template copy 1594ms
     ✓ opencode: a consumer's .bkit/templates/.vale.ini is not a gate config 1519ms
     ✓ opencode: a consumer's root .vale.ini is a gate config 1319ms
     ✓ opencode: bkit's own .bkit/templates/.vale.ini is a gate config 3104ms
     ✓ opencode: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 1199ms
     ✓ opencode: a folder that merely ends in .bkit/templates is not a template copy 862ms
     ✓ codex: a consumer's .bkit/templates/.vale.ini is not a gate config 1318ms
     ✓ codex: a consumer's root .vale.ini is a gate config 1735ms
     ✓ codex: bkit's own .bkit/templates/.vale.ini is a gate config 2870ms
     ✓ codex: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 1192ms
     ✓ codex: a folder that merely ends in .bkit/templates is not a template copy 1455ms
     ✓ antigravity: a consumer's .bkit/templates/.vale.ini is not a gate config 1021ms
     ✓ antigravity: a consumer's root .vale.ini is a gate config 1847ms
     ✓ antigravity: bkit's own .bkit/templates/.vale.ini is a gate config 1641ms
     ✓ antigravity: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 1837ms
     ✓ antigravity: a folder that merely ends in .bkit/templates is not a template copy 1230ms
   ✓ gateguard behaviour parity — docs density advisory (25)
     ✓ claude: fires on docs/architecture.md (a docs markdown file) 2135ms
     ✓ claude: fires on .bkit/shared/docs/architecture.md (nested docs tree) 1745ms
     ✓ claude: does not fire on Documents/architecture.md (segment match, not substring) 2050ms
     ✓ claude: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 2332ms
     ✓ claude: does not fire on docs/knowledge.jsonl (gated on .md) 7330ms
     ✓ cursor: fires on docs/architecture.md (a docs markdown file) 4592ms
     ✓ cursor: fires on .bkit/shared/docs/architecture.md (nested docs tree) 3542ms
     ✓ cursor: does not fire on Documents/architecture.md (segment match, not substring) 2035ms
     ✓ cursor: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 1834ms
     ✓ cursor: does not fire on docs/knowledge.jsonl (gated on .md) 1100ms
     ✓ opencode: fires on docs/architecture.md (a docs markdown file) 1137ms
     ✓ opencode: fires on .bkit/shared/docs/architecture.md (nested docs tree) 1316ms
     ✓ opencode: does not fire on Documents/architecture.md (segment match, not substring) 1388ms
     ✓ opencode: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 703ms
     ✓ opencode: does not fire on docs/knowledge.jsonl (gated on .md) 582ms
     ✓ codex: fires on docs/architecture.md (a docs markdown file) 900ms
     ✓ codex: fires on .bkit/shared/docs/architecture.md (nested docs tree) 1161ms
     ✓ codex: does not fire on Documents/architecture.md (segment match, not substring) 1743ms
     ✓ codex: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 1699ms
     ✓ codex: does not fire on docs/knowledge.jsonl (gated on .md) 2566ms
     ✓ antigravity: fires on docs/architecture.md (a docs markdown file) 1684ms
     ✓ antigravity: fires on .bkit/shared/docs/architecture.md (nested docs tree) 1747ms
     ✓ antigravity: does not fire on Documents/architecture.md (segment match, not substring) 1392ms
     ✓ antigravity: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 1563ms
     ✓ antigravity: does not fire on docs/knowledge.jsonl (gated on .md) 1194ms
   ✓ gateguard behaviour parity — dedup (10)
     ✓ claude: second touch of the same file in the same session is silent 960ms
     ✓ claude: a different file in the same session warns again 1694ms
     ✓ cursor: second touch of the same file in the same session is silent 1586ms
     ✓ cursor: a different file in the same session warns again 1666ms
     ✓ opencode: second touch of the same file in the same session is silent 684ms
     ✓ opencode: a different file in the same session warns again 1105ms
     ✓ codex: second touch of the same file in the same session is silent 944ms
     ✓ codex: a different file in the same session warns again 1420ms
     ✓ antigravity: second touch of the same file in the same session is silent 780ms
     ✓ antigravity: a different file in the same session warns again 1382ms
   ✓ gateguard behaviour parity — modes (15)
     ✓ claude: BKIT_GATEGUARD=deny blocks the first touch with the checklist 792ms
     ✓ claude: deny mode allows the retry (dedup lets the second call through) 596ms
     ✓ cursor: BKIT_GATEGUARD=deny blocks the first touch with the checklist 709ms
     ✓ cursor: deny mode allows the retry (dedup lets the second call through) 612ms
     ✓ opencode: BKIT_GATEGUARD=deny blocks the first touch with the checklist 485ms
     ✓ opencode: deny mode allows the retry (dedup lets the second call through) 484ms
     ✓ codex: BKIT_GATEGUARD=deny blocks the first touch with the checklist 501ms
     ✓ codex: deny mode allows the retry (dedup lets the second call through) 431ms
     ✓ antigravity: BKIT_GATEGUARD=deny blocks the first touch with the checklist 329ms
     ✓ antigravity: deny mode allows the retry (dedup lets the second call through) 306ms
   ✓ gateguard structural parity (21)
     ✓ codex advises on the *** Move to: target of a renaming patch 396ms
   ✓ gateguard parity — documented deviations (4)
     ✓ blocking is expressed differently per host but means the same thing 425ms
     ✓ Antigravity delivers the checklist by denying the first edit once; the retry passes 328ms
 ✓ .bkit/core/engine/commands/install/upgrade.integration.test.ts (63 tests) 309195ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (5)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 1937ms
     ✓ install --claude does not write Serena or graphify examples 3071ms
     ✓ upgrade does not rewrite a consumer-owned bkit-graphify.sh 1485ms
     ✓ does not rewrite a consumer-owned .github/renovate.json5 1227ms
     ✓ preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6) 1260ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 5869ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 5856ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 4656ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 11364ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 10539ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 8641ms
     ✓ malformed .mcp.json fails install instead of being overwritten 1377ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 6013ms
     ✓ an adopted copy of every template survives upgrade and check 6464ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 5447ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 4812ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 1986ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 10059ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 7100ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (11)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 8336ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 10735ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 8963ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 14195ms
     ✓ branded script migration is idempotent and dry-run writes nothing 25170ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 23309ms
     ✓ a dry-run hook and CI token migration writes nothing 9392ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 19928ms
     ✓ a second check-name migration writes nothing 34171ms
     ✓ a dry-run check-name migration writes and moves nothing 10299ms
     ✓ a second Vale migration and a dry run write nothing 10862ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 5845ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 3763ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 2268ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 1412ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 1200ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 1245ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 1319ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 1212ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 1239ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 1223ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 1502ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 5286ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 1907ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 975ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ starts the package runner for the install and the re-exec 785ms
     ✓ rejects --to=<version> with --latest (mutually exclusive) at exit 1 320ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 2225ms

 Test Files  55 passed (55)
      Tests  1796 passed (1796)
   Start at  19:57:45
   Duration  309.92s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/724-machine-wide-test/run-tests-3.log.reports/vitest-79343.xml
> [bkit] TRUNCATED — kept 3175 of 20370 lines (228 KB of 1.4 MB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
