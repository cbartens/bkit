
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-1 is waiting for tests (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load (pid 28947, since 16:46:19), last run took 21m34s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-1 is waiting for tests (still, 1 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load (pid 28947, since 16:46:19), last run took 21m34s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-1 is waiting for tests (still, 2 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load (pid 28947, since 16:46:19), last run took 21m34s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-1 is waiting for tests (still, 3 min so far) (up to 1200s): in use by verify-holistic-4 rerun — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 99893, since 16:50:23), last run took 20m21s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-1 is waiting for tests (still, 4 min so far) (up to 1200s): in use by verify-holistic-4 rerun — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 99893, since 16:50:23), last run took 20m21s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-1 is waiting for tests (still, 5 min so far) (up to 1200s): in use by verify-holistic-4 rerun — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 99893, since 16:50:23), last run took 20m21s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-1 is waiting for tests (still, 6 min so far) (up to 1200s): in use by verify-holistic-4 rerun — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 99893, since 16:50:23), last run took 20m21s

> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


 .bkit/core/.bkit/README.md
 342:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/cloud.md
 467:178  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/install.md
 19:1     warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 135:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 358:290  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 366:1    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 448:97   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 824:80   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/templates.md
 515:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 637:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 720:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 203:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 277:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 104:383   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 109:488   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 146:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 172:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 629:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 868:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1047:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1159:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1251:74   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1493:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1553:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 385:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 456:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 docs/deployments.md
 122:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 251:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 380:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 420:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 491:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 47 warnings and 0 suggestions in 152 files.
passed: true
skipped: null
files: 152

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> bkit ci slop

[bkit-ci] base 263f04b7c30c06833042d1dbb5031941bfb77b3d (263f04b7c30c06833042d1dbb5031941bfb77b3d) vs working tree
[bkit-ci] added 3, resolved 3, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 263f04b7c30c06833042d1dbb5031941bfb77b3d
base: 263f04b7c30c06833042d1dbb5031941bfb77b3d
added: 3
resolved: 3
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 3.0 on 10 cores: unit limits 6000ms per test, 12000ms per hook (x1.20)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
      Coverage enabled with v8

pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 12316ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 1196ms
     ✓ keeps each context's own section banner and drops every other context's 1753ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ clamps a ci block with the ci profile and a runtime block without it 422ms
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 488ms
   ✓ bkit context diff (10)
     ✓ --base narrows the range to the commits after a group's start sha 403ms
     ✓ diff from a group start covers only the group's commits 449ms
     ✓ an empty range writes a one-line note and zero numbers 345ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 482ms
     ✓ --reset-log empties the step's clamp log before the record lands 527ms
     ✓ partial: prints and writes the files not shown whole, and keeps the whole diff in the outbox 328ms
     ✓ whole: nothing omitted and no copy kept 318ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (93 tests) 8947ms
   ✓ bkit issues comment --post (7)
     ✓ renders audit comments from validated result and preserves tracker adapters 363ms
     ✓ a failed post exits 0 with done false and the reason 306ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 1444ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (265 tests) 1521ms
   ✓ issue-less runs (68)
     ✓ build: fids resolve and steps gate carry --issue in every workflow 381ms
stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > strips only the managed blocks of .agents/context.md and .agents/skills.md, marker included
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
[bkit-uninstall-test] strip-block: .agents/context.md
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] strip-block: .agents/skills.md
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > strips a managed lite.md block and keeps the consumer section
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
[bkit-uninstall-test] strip-block: .bkit/lite.md

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > docs/ > leaves the project docs and their wrapper text alone, because the project owns them
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

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > docs/ > deletes the owned docs/templates/bkit-*.md and keeps the consumer's own templates
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
[bkit-uninstall-test] delete: docs/templates/bkit-audit-security.md
[bkit-uninstall-test] delete: docs/templates/bkit-plan.md

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > docs/ > prunes docs/templates when only bkit's files were in it
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
[bkit-uninstall-test] delete: docs/templates/bkit-plan.md
[bkit-uninstall-test] prune empty dir: docs/templates

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > docs/ > leaves docs/ alone on a targeted (non-core) uninstall, and on a dry run
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
AGENTS.md                                        | skip-absent            | file not found — nothing to do
.gitignore                                       | skip-absent            | file not found — nothing to do
.gitattributes                                   | skip-absent            | file not found — nothing to do
.bkit/version                                    | skip-absent            | file not found — nothing to do
.bkit/allowlist.json                             | skip-absent            | file not found — nothing to do
.bkit/authoring.md                               | skip-absent            | file not found — nothing to do
.bkit/cloud.md                                   | skip-absent            | file not found — nothing to do
.bkit/cli.md                                     | skip-absent            | file not found — nothing to do
.bkit/comparison.md                              | skip-absent            | file not found — nothing to do
.bkit/install.md                                 | skip-absent            | file not found — nothing to do
.bkit/jsonl.md                                   | skip-absent            | file not found — nothing to do
.bkit/LICENSE.md                                 | skip-absent            | file not found — nothing to do
.bkit/pipeline.md                                | skip-absent            | file not found — nothing to do
.bkit/providers.md                               | skip-absent            | file not found — nothing to do
.bkit/prompts.md                                 | skip-absent            | file not found — nothing to do
.bkit/router.md                                  | skip-absent            | file not found — nothing to do
.bkit/templates.md                               | skip-absent            | file not found — nothing to do
.bkit/trackers.md                                | skip-absent            | file not found — nothing to do
.bkit/workflows.md                               | skip-absent            | file not found — nothing to do
.bkit/README.md                                  | skip-absent            | file not found — nothing to do
.agents/context.md                               | skip-absent            | file not found — nothing to do
.agents/docs.md                                  | skip-absent            | file not found — nothing to do
.agents/rules.md                                 | skip-absent            | file not found — nothing to do
.agents/skills.md                                | skip-absent            | file not found — nothing to do
.agents/shortcuts.md                             | skip-absent            | file not found — nothing to do
.bkit/lite.md                                    | skip-absent            | file not found — nothing to do
docs/templates/bkit-plan.md                      | delete                 | bkit-owned docs template — removed on full/core uninstall


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > formatDecisionTable — P2.T7 > dry-run snapshot: decision table is printed, nothing deleted
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
CLAUDE.md                                        | skip-absent            | file not found — nothing to do
.claude/settings.json                            | strip-block            | json (deep-containment) — strip bkit-owned scope, preserve consumer keys
.claude/hooks/bkit-preflight.sh                  | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-gateguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-readguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-guardrails.cjs                | skip-absent            | file not found — nothing to do
.mcp.json                                        | skip-absent            | file not found — nothing to do
.bkit/.env.example                               | skip-absent            | file not found — nothing to do
AGENTS.md                                        | strip-block            | markered-text — strip bkit block, preserve consumer content
.gitignore                                       | skip-absent            | file not found — nothing to do
.gitattributes                                   | skip-absent            | file not found — nothing to do
.bkit/version                                    | skip-absent            | file not found — nothing to do
.bkit/allowlist.json                             | skip-absent            | file not found — nothing to do
.bkit/authoring.md                               | skip-absent            | file not found — nothing to do
.bkit/cloud.md                                   | skip-absent            | file not found — nothing to do
.bkit/cli.md                                     | skip-absent            | file not found — nothing to do
.bkit/comparison.md                              | skip-absent            | file not found — nothing to do
.bkit/install.md                                 | skip-absent            | file not found — nothing to do
.bkit/jsonl.md                                   | skip-absent            | file not found — nothing to do
.bkit/LICENSE.md                                 | skip-absent            | file not found — nothing to do
.bkit/pipeline.md                                | skip-absent            | file not found — nothing to do
.bkit/providers.md                               | skip-absent            | file not found — nothing to do
.bkit/prompts.md                                 | skip-absent            | file not found — nothing to do
.bkit/router.md                                  | skip-absent            | file not found — nothing to do
.bkit/templates.md                               | skip-absent            | file not found — nothing to do
.bkit/trackers.md                                | skip-absent            | file not found — nothing to do
.bkit/workflows.md                               | skip-absent            | file not found — nothing to do
.bkit/README.md                                  | skip-absent            | file not found — nothing to do
.agents/context.md                               | skip-absent            | file not found — nothing to do
.agents/docs.md                                  | skip-absent            | file not found — nothing to do
.agents/rules.md                                 | skip-absent            | file not found — nothing to do
.agents/skills.md                                | skip-absent            | file not found — nothing to do
.agents/shortcuts.md                             | skip-absent            | file not found — nothing to do
.bkit/lite.md                                    | skip-absent            | file not found — nothing to do


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > strips bkit block from markered-text file, preserving consumer content
[bkit-uninstall-test] strip-block: AGENTS.md
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

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > deletes markered-text file when stripping leaves only whitespace
[bkit-uninstall-test] delete (empty after strip): AGENTS.md
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

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > preserves markered-text file when no bkit markers present (100% consumer)
[bkit-uninstall-test] preserve: AGENTS.md (markered-text but no bkit markers found — 100% consumer content)
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
> [bkit] TRUNCATED HERE — 347 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 300 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 396ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 322ms
     ✓ staging failure: exit 4 and no commit is created, no false success 307ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 330ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 358ms
> [bkit] TRUNCATED HERE — 46 lines omitted. Dropped content was NOT read.
   ✓ routine publication policy (8)
     ✓ classifies attention and terminal reports from structured purpose 340ms
     ✓ uses exact new comment after a failed eligibility read 315ms
   ✓ bounded nonfatal publication (10)
     ✓ falls back to a new comment after failed or uncertain append 347ms
     ✓ preserves a human correction after lost append recognition and a later report 431ms
     ✓ contains exhausted append and create failures without fabricated success 388ms
     ✓ reserves new comment opportunity within total delivery budget 678ms
   ✓ trackerTarget (3)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1053ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1275ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1073ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 841ms
     ✓ fetches the issue and its comments as GitHub returns them 622ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 655ms
     ✓ invalidates missing corrupt and unsupported progress cache 1301ms
     ✓ contains cache read and write failures as standalone degradation 610ms
     ✓ uses legacy receipts and contains receipt failures 570ms
     ✓ records an engine-action row and skips the same key + body on a re-run 867ms
     ✓ a recent identical comment counts as done (the final close comment) 1383ms
     ✓ a failed post reports done false with the reason and never leaks a token 1098ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1310ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 1754ms
     ✓ a different marker hash posts 1361ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 865ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (128 tests) 48675ms
   ✓ test-round completion evidence (2)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --attempt=next advances with each row, so the next parentSha differs 531ms
     ✓ carries extra fields, parsed as JSON when they are JSON 429ms
     ✓ reports a failed commit with exit 8 without writing the row 985ms
     ✓ a failed commit leaves no row staged in the index 1199ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1666ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1309ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1723ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1388ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1540ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 336ms
     ✓ --ref reads the status file as committed on that ref, not from disk 361ms
     ✓ --ref exits 3 when the ref does not carry the status file 573ms
     ✓ fails on a placeholder left in the artifact 471ms
     ✓ fails when the row's verdict differs from the artifact's 397ms
     ✓ fails when the row does not list the artifact, or carries another attempt 380ms
     ✓ fails on a missing artifact 373ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 359ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 304ms
     ✓ fails a run-tests row missing its scope, and an empty scope 369ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 507ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 811ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1203ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 733ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 397ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 760ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 505ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 319ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 907ms
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 552ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1264ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 399ms
 ✓ .bkit/core/engine/commands/lib.test.ts (73 tests) 4863ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1356ms
     ✓ runGit names ENOBUFS when output passes the limit 931ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 843ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 321ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1502ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1142ms
     ✓ exits 5 when the open-PR probe errors 1228ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1533ms
     ✓ prs open still opens against any other base 1353ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 496ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 756ms
     ✓ exits 4 when gh errors and 80 when it needs auth 623ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 622ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 772ms
     ✓ runs no merge when the PR is already MERGED 1101ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1387ms
     ✓ prs merge refuses a PR whose base is main 862ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 1343ms
     ✓ prs merge refuses when the PR base is unknown 1129ms
     ✓ prs merge reads the base from the one pr view it already makes 945ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 1493ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 1395ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 1103ms
     ✓ never reads dev's required checks without --only-if-required 1090ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 692ms
     ✓ is not green when a check failed, naming it (exit 1) 742ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 407ms
     ✓ is not green on an empty rollup (total 0) 680ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 743ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 767ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 533ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 770ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 990ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 998ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 556ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 501ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 967ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1288ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 934ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 826ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1404ms
     ✓ PASS is 0 failures with or without reports 1792ms
     ✓ clears a previous attempt's reports before the gate runs 1270ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1646ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1035ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1417ms
     ✓ numbers runs within the workflow's active run and per step 1086ms
     ✓ without --file no row is written and the output carries row null 620ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 1347ms
     ✓ a planned test absent from a loaded report is a missing gap 1076ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1390ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1231ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 335ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1789ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 1063ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1302ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1940ms
     ✓ green: lists each gap kind, with the runner output 1350ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1930ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 529ms
       ✓ green clears an exception-only task from a human commit 453ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.
> [bkit] TRUNCATED HERE — 53 lines omitted. Dropped content was NOT read.
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 341ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 327ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 444ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 313ms
     ✓ tells a caller inside the removed worktree where to cd 476ms
     ✓ fails with its own exit code when git cannot remove a marked path 348ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1162ms
> [bkit] TRUNCATED HERE — 88 lines omitted. Dropped content was NOT read.
   ✓ gateguard opencode plugin — deny mode (2)
     ✓ throws with advisory text on first write (blocks edit) 304ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 301ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 724ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 46788ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1724ms
     ✓ names each net-new and worsened finding in the log and the JSON 1323ms
     ✓ fails on a net score rise with no net count change 1125ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1303ms
     ✓ treats a net score at or below 0.001 as float noise 1218ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1896ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 433ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1571ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1131ms
     ✓ exits 4 on a dropped net field instead of silently passing 1233ms
     ✓ exits 4 on no summary instead of silently passing 1054ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1218ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1122ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1075ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1019ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 1326ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 624ms
     ✓ fails (exit 1) when vale reports alerts 628ms
     ✓ exits 6 on a vale runtime error 979ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 615ms
     ✓ falls back to vale sync when the main worktree has none 637ms
     ✓ fails when vale sync cannot restore the required styles 525ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 538ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 411ms
     ✓ is a usage error when the commit cannot be read 339ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 668ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 556ms
     ✓ exits 1 naming the files outside, whatever the commit message says 590ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1215ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 695ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 566ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 909ms
     ✓ passes every rule on a clean head 350ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 368ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (38 tests) 5504ms
   ✓ bkit disk prune — notes (5)
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 682ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2085ms
     ✓ a refused dev push is logged, never fails the close 2450ms
     ✓ an unreachable remote is logged, never fails the close 857ms
 ✓ .bkit/core/engine/render/trackers.test.ts (105 tests) 14714ms
   ✓ real workflow sources (37)
> [bkit] TRUNCATED HERE — 55 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1360ms
     ✓ counts files committed since --base 900ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1185ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 686ms
     ✓ runs the --fallback gate even when no file changed, as it did before 904ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ locates CI evidence using prompt saved issue and local precedence 3438ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1623ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1791ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1956ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 3538ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1911ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2466ms
     ✓ checks the named repository base and fails closed on missing evidence 1138ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1025ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1275ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 563ms
       ✓ a source change past the validated head refuses (17) and names the path 500ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 494ms
       ✓ --validated without --month / --fid is a usage error (2) 354ms
       ✓ a validated sha that is not an ancestor refuses (17) 409ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 520ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1235ms
     ✓ a failed re-trigger push names the cause in the log 1776ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1708ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2241ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1249ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 531ms
     ✓ gh-error: every poll errored 565ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 995ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 873ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 957ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1150ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 3920ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3768ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 863ms
     ✓ re-trigger on dev only uses the record of its own FID 1248ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1030ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 373ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 671ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 385ms
     ✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 313ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 572ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 826ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 711ms
     ✓ --file and --step go together 576ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 585ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 833ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 533ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 567ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 642ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 634ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 680ms
     ✓ --file into a missing directory is refused, not created 568ms
> [bkit] TRUNCATED HERE — 43 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 1401ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 590ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1076ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1459ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 578ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 642ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 620ms
     ✓ an unpinned repo reports nulls and asks no registry 678ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 795ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 772ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 654ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 939ms
> [bkit] TRUNCATED HERE — 80 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 573ms
     ✓ resolves config from the repo root when run from a subdirectory 999ms
     ✓ exits 6 when the PUT fails 603ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 396ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 520ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 410ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 397ms
     ✓ exits 6 when the api answer is not JSON 1176ms
stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > skips a half-written trailing line without throwing
> [bkit] TRUNCATED HERE — 124 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 55 lines omitted. Dropped content was NOT read.
   ✓ guardRepoConfig (6)
     ✓ passes when only another key changed, such as a branch's upstream 471ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 349ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 395ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 344ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 24ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 1076ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 772ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 823ms
     ✓ follows summary cursors even when the first page is shorter than the limit 901ms
     ✓ reports excluded intervals as unread even when pagination finishes 976ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 982ms
     ✓ reports an unread remainder at the page cap 732ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 541ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 744ms
     ✓ rejects missing summaries instead of treating them as empty results 623ms
     ✓ reports a failed first page as unavailable 890ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 352ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 472ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 453ms
     ✓ follows summary cursors even when the first page is shorter than the limit 654ms
     ✓ reports excluded intervals as unread even when pagination finishes 499ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 779ms
     ✓ reports an unread remainder at the page cap 536ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 543ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 420ms
     ✓ rejects missing summaries instead of treating them as empty results 462ms
     ✓ reports a failed first page as unavailable 469ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 341ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > writes plugin prompts + workflow skills, and stamps the managed version
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
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

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > never writes Codex's `.agents/skills/`
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
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

 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 127ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 38ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > is idempotent — a second render writes nothing
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 29ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > writes plugin.json, hooks.json, both hook scripts, and emits the setup advisory
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
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

 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 10ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > warns when Codex is also installed (skill-overlap advisory)
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
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

 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 33ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > stays silent about the overlap when Codex is absent
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
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

 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 2550ms
   ✓ renderAntigravityAgentsSkills (3)
     ✓ never writes Codex's `.agents/skills/` 363ms
     ✓ is idempotent — a second render writes nothing 705ms
   ✓ runAntigravityModule (3)
     ✓ writes plugin.json, hooks.json, both hook scripts, and emits the setup advisory 397ms
     ✓ warns when Codex is also installed (skill-overlap advisory) 465ms
     ✓ stays silent about the overlap when Codex is absent 318ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 14ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 87ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 11ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 9ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 9ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 28595ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 3068ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2746ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 469ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 442ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 444ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 465ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 3090ms
     ✓ does not fall back through a malformed later success receipt 1859ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1075ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 872ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1786ms
     ✓ requires proof even when the pushed increment changes no files 1020ms
     ✓ ignores malformed receipts 986ms
     ✓ does not record a tracked tree 575ms
     ✓ does not record a untracked tree 464ms
     ✓ does not record a mutated tree 626ms
     ✓ does not record a committed tree 682ms
     ✓ records no proof for a failed gate or lighter gate 1496ms
     ✓ requires integration proof when integration is declared 1746ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2707ms
     ✓ invalidates proof when the gate definition changes 1257ms
     ✓ keeps whole-branch docs-only classification and rejects mixed argument modes 713ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/ledger-read-idiom.test.ts (11 tests) 1219ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 21ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 65ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 47ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 11ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 9ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 15ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 93ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 19ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 25ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 11ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 22ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 113ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 9ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 34ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 11ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 17ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (2 tests) 16ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 10ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 14ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 64123ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 2067ms
     ✓ runs code.ts through its declared gate in the built checkout 2065ms
     ✓ runs code.ts through its declared gate in the built checkout 1902ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1754ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1699ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1922ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 997ms
     ✓ runs the full gate for replayed debug code 1730ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1976ms
     ✓ installs local dependencies against the built target tree 2244ms
     ✓ runs the configured frozen install even without root dependencies 1815ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1860ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1992ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 2289ms
     ✓ never pushes local dev commits missing from origin/dev 2340ms
     ✓ dev moved: rebuilds on the new dev and pushes again 4530ms
     ✓ dev moved before every push: exhausted, nothing landed 5721ms
     ✓ any other refusal is returned, not retried 2634ms
     ✓ pushToDev replays a commit range onto origin/dev 2300ms
     ✓ a replay retries on the new dev when dev moved 3454ms
     ✓ pushToDev log line names what it lands 1750ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1769ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1802ms
     ✓ a push that fails without a server answer is returned once, never retried 2076ms
     ✓ a failed fetch is returned before anything is built 614ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2984ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2082ms
     ✓ lands from a clone whose fetch refspec omits dev 2675ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1049ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 8369ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 8359ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (103 tests) 77716ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 34626ms
     ✓ every prompt, workflow and utility agent has the three header blocks 518ms
     ✓ sync has nothing left to rewrite 20433ms
     ✓ every clause reaches the cut-off of one surface it applies to 1874ms
   ✓ the recovery precedence contract (1)
     ✓ renders one recovery precedence contract for all hosts and tracker adapters 19758ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 20908ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 16020ms
     ✓ every fence parses under zsh -n 4801ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (161 tests) 154942ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 610ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1969ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 325ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 512ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 397ms
       ✓ a new run in the same chat gets its own session row 392ms
       ✓ writes none outside Claude Code 409ms
     ✓ opens the next run after a finished one, and after another workflow's run 529ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 560ms
     ✓ design / plan / build / debug book in the current worktree 445ms
     ✓ --lock-held checks the lock is ours 352ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 415ms
   ✓ bkit workflows start — resume facts (8)
     ✓ an OPEN decision of an earlier run never resurfaces 342ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 369ms
     ✓ aborts a rebase only when one is in progress 622ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 540ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 597ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 387ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 363ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 339ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 374ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 743ms
       ✓ counts subagents of an earlier chat the run's session rows name 897ms
       ✓ records no context block, and still closes, outside a Claude Code session 906ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 819ms
     ✓ records ending held and publish false on the workflow-done row 710ms
     ✓ defaults the close row to ending done 764ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 745ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 791ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 739ms
     ✓ always writes the telemetry, whatever the runtime 832ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 880ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1025ms
     ✓ an unwritable stats path is logged and never fails the close 815ms
     ✓ appends the completeness row before the workflow-done row 1030ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 928ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 885ms
     ✓ writes one completeness row per close 1595ms
     ✓ leaves out the previous run's rows that share a second with this run's start 862ms
     ✓ still closes when the completeness check throws 785ms
     ✓ still closes when the completeness row write throws 691ms
     ✓ ship: run.pr, size of the squash commit, and coverage 826ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1319ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 931ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 791ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 937ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 811ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1074ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 834ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 796ms
     ✓ --record-step writes the close step's row before workflow-done 499ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 586ms
     ✓ --number without --outbox is a usage error 509ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 811ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 783ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 913ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1066ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 823ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 485ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 490ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2405ms
     ✓ --flush with nothing to record commits and pushes nothing 1370ms
     ✓ --flush carries the named worktree's logs into the dev commit 2725ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3476ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2578ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 3750ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 3312ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 4220ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3622ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 3250ms
     ✓ --push on dev never carries a row whose references name another feature 2959ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2789ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 5100ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3139ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1320ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 3070ms
     ✓ preserves unlanded file deletions and ledger additions on close 7344ms
     ✓ preserves dirty work and uncertain branch evidence during close 6917ms
     ✓ preserves a local feature ref changed after its cleanup proof 6888ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3359ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2397ms
     ✓ a close that landed releases the lock 3242ms
     ✓ removes the worktree before it releases the lock 3929ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 5366ms
       ✓ closePr refuses when the PR base is unknown 3548ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1612ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 556ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 314ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 840ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 403ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 356ms
     ✓ a second run's record does not let this FID's close commit 417ms
     ✓ record is present after workflows close and before the push 804ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1392ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 508ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 406ms
     ✓ puts each --line after the summary, in flag order 404ms
     ✓ --summary prints the file and keeps a copy in --outbox 400ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 416ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 256520ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 799ms
     ✓ rejects missing explicit and ambiguous existing branch selections 614ms
   ✓ branches rebase: classification (31)
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 311ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1170ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 844ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 735ms
     ✓ a refused --continue carries git's own reason 791ms
     ✓ --file records nothing for a refused rebase 831ms
     ✓ refuses a code conflict and aborts the rebase on the spot 885ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1908ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 582ms
     ✓ produces byte-identical output to merge=union 1315ms
     ✓ restores a trailing newline so the next append starts on its own line 709ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 668ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1040ms
     ✓ refuses a union that leaves a line which is not JSON 639ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 789ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 2084ms
     ✓ refuses a lockfile whose regenerate command fails 1805ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1423ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1090ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1027ms
     ✓ refuses and aborts when both sides changed the hand-written region 718ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 777ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1050ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1646ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 920ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1074ms
     ✓ refuses and aborts when a side deleted the install record 832ms
     ✓ refuses a conflicted doc the repo's script does not list 734ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 686ms
     ✓ removes a stale sentinel when the rebase succeeds 1005ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1312ms
     ✓ resolves a conflict in each of two replayed commits across rounds 886ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 500ms
       ✓ skips (12) with no anchor 545ms
       ✓ skips (12) when the base is unreachable in this clone 626ms
       ✓ skips (12) when nothing landed since the base 600ms
       ✓ runs (0) with the landed path count once dev moved 1163ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 624ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1003ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 663ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 888ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 2235ms
     ✓ runs exactly one git push 2231ms
     ✓ --set-upstream records the upstream 667ms
     ✓ refuses with no branch checked out 543ms
     ✓ --mode=dev refuses a feature checkout 601ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1621ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2622ms
     ✓ --require-ci pushes as-is when dev has not moved 980ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2001ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2865ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 878ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 2208ms
     ✓ --mode=abort pushes when the branch has no open PR 1479ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1280ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 718ms
     ✓ --open-pr carries the MCP answer and skips gh 952ms
     ✓ --mode=abort on dev pushes plainly without probing 964ms
     ✓ rejects an unknown mode 761ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3441ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 2070ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2268ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4144ms
     ✓ skip-ci HEAD on the replay is refused 1323ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2981ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3889ms
     ✓ a level local dev is a plain push, recording nothing extra 1467ms
     ✓ a record with no commits pushes nothing 1061ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 821ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1533ms
     ✓ a rewritten branch is refused, never forced 1085ms
     ✓ refuses dev and main with exit 21 and pushes nothing 719ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1548ms
     ✓ refuses a detached HEAD (exit 5) 685ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1406ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1347ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1434ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1871ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 828ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1940ms
     ✓ an up-to-date branch is a no-op 1434ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1887ms
     ✓ a fetch that fails exits 10 887ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 1160ms
     ✓ scan-diff still reports a new skip when its test … 966ms
     ✓ scan-diff reports a skip moved onto a different t… 898ms
     ✓ scan-diff does not cancel a skip moved between am… 819ms
     ✓ scan-diff does not spend an unchanged duplicate t… 957ms
     ✓ scan-diff recognizes a renamed test file 1072ms
     ✓ scan-diff recognizes a suite moved into a differe… 1050ms
     ✓ scan-diff does not let unrelated additions hide a… 937ms
     ✓ scan-diff attributes deletion to its old test ins… 894ms
     ✓ scan-diff consumes each moved assertion once and … 867ms
     ✓ scan-diff does not match identical assertions fro… 882ms
     ✓ scan-diff does not match the same leaf test name … 1149ms
     ✓ scan-diff does not match a same-named test with d… 954ms
     ✓ scan-diff does not match a same-named test with c… 807ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 819ms
     ✓ --paths with no match exits 1 780ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 597ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1081ms
     ✓ --marker reads a diff over 1 MiB 802ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1049ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 874ms
     ✓ scan-diff finds an added skip 900ms
     ✓ scan-diff ignores a skip predating the base 1196ms
     ✓ scan-diff reports a disabled test with its line 1022ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1016ms
     ✓ scan-diff ignores a removed comment in a test file 931ms
     ✓ scan-diff ignores an assertion moved within the file 1008ms
     ✓ scan-diff still reports a removed assertion 948ms
     ✓ scan-diff reports an assertion re-added only outside the test file 980ms
     ✓ scan-diff finds an added pytest mark skip 1115ms
     ✓ scan-diff finds an added unittest skip 988ms
     ✓ scan-diff finds an added bare skip call 1032ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1155ms
     ✓ scan-diff ignores a marker literal in a non-test source file 632ms
     ✓ scan-diff ignores an assertion whose expectation changed 547ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 439ms
     ✓ scan-diff reports a deleted test file 540ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 381ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1282ms
     ✓ a title that already carries the marker is left alone 886ms
     ✓ with no open PR: pushes the marker commit and edits no title 951ms
     ✓ a re-run is deduped: no second marker commit 1070ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1197ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 386ms
     ✓ --title-set skips gh entirely 633ms
     ✓ refuses dev and main (exit 21) 319ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1074ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 1899ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1056ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2336ms
     ✓ continues only the explicitly recorded target through the public merge command 1715ms
     ✓ fetches the unseen feature head before classifying the base 1238ms
     ✓ fast forwards the feature before either base path is chosen 2390ms
     ✓ merges divergent feature tips without rebasing either side 1402ms
     ✓ continues the feature merge before starting a dev merge 2228ms
     ✓ publishes local code with a CI running head before bookkeeping 2425ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 3205ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 2118ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1498ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 410ms
     ✓ Path B once dev moved; --head checks a given commit 626ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 626ms
     ✓ --merge-docs merges dev when docs/ is behind 733ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 701ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1000ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1012ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 924ms
     ✓ --merge-docs skips an empty bkit:generate script 762ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 710ms
     ✓ --merge-docs never merges on dev itself 588ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 845ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 844ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 795ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 823ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 445ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1059ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1153ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1295ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1077ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1054ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1493ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 967ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1156ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 768ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 551ms
     ✓ exits 10 when the fetch fails 335ms
     ✓ refuses --merge-docs with --head, and an unknown --head 373ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 692ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 965ms
     ✓ a failed install stops ship (16) 846ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 713ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 672ms
     ✓ exits 10 when the fetch fails 509ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 367ms
     ✓ preserves unlanded file type changes in the shared landed comparison 361ms
   ✓ branches land (28)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 448ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1711ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1690ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1689ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1710ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 3510ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 4137ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 640ms
     ✓ local: names unpushed dev as the cause when the branch carries it 743ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 779ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2077ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2024ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1381ms
     ✓ uses tree entry equivalence for design and plan land cleanup 5975ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1595ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1547ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1439ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 912ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2314ms
     ✓ land removes the worktree when only the copied .env is untracked 1905ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1608ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1751ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2708ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1807ms
     ✓ landPr refuses a main-based PR without retrying 717ms
     ✓ landPr refuses when the PR base is unknown 716ms
     ✓ PR not open (closed): stops (17) at once, no retry 915ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 677ms
     ✓ --attempt names the merge round in a fix commit 641ms
     ✓ commits a rewritten and a deleted tracked file 663ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 555ms
     ✓ reports undeclared and runs nothing with no scripts 433ms
     ✓ reports undeclared and runs nothing with an empty script 402ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 509ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 588ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 401ms

 Test Files  176 passed (176)
      Tests  7584 passed | 2 skipped (7586)
   Start at  16:55:05
   Duration  258.50s (tests 96%, import 1%, transform 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/903-build-owner-s/build-group-gate-1-1.log.reports/vitest-59244.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   88.46 |    82.21 |   94.35 |   89.91 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   91.03 |    86.68 |   95.57 |   94.48 |                   
  auth.ts          |   98.09 |    93.93 |     100 |   98.85 | 71                
  ci-yml.ts        |   90.74 |    82.83 |     100 |   93.01 | ...09,422-424,435 
  github.ts        |   95.48 |    92.36 |     100 |   97.03 | 264-265,276-277   
  index.ts         |   85.58 |    71.42 |     100 |    97.2 | ...01,321,418-419 
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
 engine/commands   |    88.6 |     83.2 |   93.29 |    90.1 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...82,195,197,204 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |    90.7 |    86.06 |   96.42 |   94.53 | ...18-821,868-883 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   80.95 |    68.75 |   71.42 |      80 | ...18-231,257-258 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   95.78 |    86.92 |   90.41 |   97.88 |                   
  ci.ts            |   97.38 |    88.56 |   95.34 |    98.8 | 271,719,798,973   
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
  push-gate.ts     |   93.22 |    81.74 |     100 |   99.03 | 210               
 ...mmands/install |    47.2 |    44.69 |   57.14 |   47.59 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |   18.35 |    22.15 |      50 |   16.48 | ...30-134,205-616 
  uninstall.ts     |    67.6 |    64.34 |   67.56 |   68.58 | ...1081,1104-1271 
  upgrade.ts       |   32.02 |    30.65 |   33.33 |   33.21 | 355-383,565-1078  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   90.03 |    82.82 |   95.13 |   91.54 |                   
  branches.ts      |    89.6 |     83.5 |   98.82 |   91.24 | ...3265,3290,3433 
  challenge.ts     |   96.28 |    85.36 |     100 |   97.43 | ...80,412-414,700 
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.34 |    96.18 |     100 |   99.06 | 314,694           
  decisions.ts     |   94.38 |    83.15 |      98 |   97.21 | ...63,368,445,632 
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   94.09 |    86.93 |   97.43 |    95.6 | ...1299,1314-1324 
  junit.ts         |   93.75 |    73.84 |     100 |   93.33 | 35-36,39          
  ledgers.ts       |   88.42 |    79.07 |   95.26 |   91.36 | ...2357-2358,2386 
  locks.ts         |   92.21 |    86.84 |    92.3 |    94.4 | ...91-292,461-462 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   91.01 |    88.42 |     100 |   93.01 | ...1444,1460-1461 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 494-495           
  runs.ts          |      82 |    74.45 |   92.64 |   83.42 | ...3087,3119-3123 
  runtime.ts       |   97.84 |    86.66 |   94.44 |     100 | ...55,301,321-326 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   94.73 |    92.96 |     100 |   95.61 | ...87,703,720,861 
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 263,374           
  steps.ts         |   88.97 |    81.85 |    92.3 |   90.78 | ...2357,2359,2403 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   96.07 |    90.24 |   94.28 |   96.38 | ...47-653,676,699 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-base.ts    |   24.39 |    26.61 |   22.22 |    21.8 | 121-130,157-319   
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.82 |    89.88 |   96.53 |    98.2 | ...2240,2336-2338 
  tracker.ts       |   89.02 |    80.61 |   96.69 |   91.11 | ...2097,2123-2128 
  workflows.ts     |   93.49 |    82.65 |    97.4 |    95.1 | ...1773,1947,2679 
  worktrees.ts     |   67.22 |    65.59 |   74.28 |   68.69 | ...1388,1391-1392 
 engine/install    |    91.8 |    83.22 |   93.29 |   94.81 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |    97.4 |    90.14 |     100 |     100 | ...19,324,330-331 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |   58.53 |    38.46 |      40 |   65.62 | ...18-134,147-164 
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,294            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   95.44 |    91.83 |   98.29 |   96.89 |                   
  status.ts        |   94.08 |    92.63 |    97.7 |   97.92 | 851,877-883,917   
  telemetry.ts     |   96.09 |    91.45 |   98.64 |   96.42 | ...1858,2016,2377 
 engine/render     |   90.61 |    82.85 |   98.36 |   92.72 |                   
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
 engine/tools      |   89.93 |    85.49 |   95.47 |   90.54 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
  instructions.ts  |   90.65 |    85.99 |   95.62 |   91.41 | ...1717-1799,1804 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 88.46% ( 20605/23292 )
Branches     : 82.21% ( 15987/19445 )
Functions    : 94.35% ( 3279/3475 )
Lines        : 89.91% ( 18090/20119 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 597 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 350 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 376 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 351 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 369 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 354 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 126 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 352 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 357 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 346 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 451 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 350 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 378 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 386 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 1212 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 945 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 29 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 29 ms
ok 19 stub: the response selector is cleared before running its body # in 29 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 37 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 39 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 30 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 27 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 38 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 24 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 60 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 87 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 779 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 560 ms
ok 30 refresh drops a file deleted in the index from the build # in 525 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 488 ms
ok 32 a key removed from the env file is unset on the next run # in 309 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 272 ms
ok 34 non-BKIT_ keys are skipped # in 253 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 280 ms
ok 36 a failed unsetenv is retried on the next run # in 294 ms
ok 37 logs key names only, never values # in 251 ms
ok 38 missing env file exits 0 without calling launchctl # in 42 ms
ok 39 the sweep prints the summary line the lane greps for # in 472 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 16 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (148.561708ms)
✔ shell cancellation waits for SIGTERM cleanup (226.722917ms)
✔ direct cancellation waits for SIGINT cleanup (147.780167ms)
✔ shell cancellation waits for SIGINT cleanup (219.291916ms)
✔ direct cancellation waits for SIGHUP cleanup (145.465375ms)
✔ shell cancellation waits for SIGHUP cleanup (223.549875ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (482.103417ms)
✔ shell cancellation follows a worker orphaned by a nested shell (324.896ms)
✔ direct cancellation preserves a nested machine-lock owner (600.766833ms)
✔ shell cancellation preserves a nested machine-lock owner (638.534417ms)
✔ nested shell cancellation preserves a nested machine-lock owner (646.764375ms)
✔ a hard process-group timeout reaches a shell command during cleanup (111.235333ms)
✔ ships a command-scoped sleep prevention wrapper (0.13725ms)
✔ preserves arguments, output and nonzero exit status (84.406875ms)
✔ runs an entire shell chain and retains its failure (48.283ms)
✔ reports a missing command as 127 (46.331875ms)
✔ requires a command (44.336208ms)
✔ non-macOS platform selection runs commands without sleep prevention (70.450166ms)
✔ hard timeout escalation reaches a command that ignores TERM (180.141125ms)
✔ forwards POSIX cancellation to the command and releases the assertion (84.584875ms)
✔ holds a real macOS assertion only while the command runs (118.1835ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4651.12225
> [bkit] TRUNCATED — kept 1852 of 3399 lines (136 KB of 263 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
