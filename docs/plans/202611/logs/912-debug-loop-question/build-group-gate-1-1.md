
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
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
 631:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 870:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1049:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1161:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1253:74   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1495:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1555:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
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

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 4.2 on 10 cores: unit limits 6600ms per test, 13200ms per hook (x1.32)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
      Coverage enabled with v8

pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 8866ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 635ms
     ✓ keeps each context's own section banner and drops every other context's 1487ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ clamps a ci block with the ci profile and a runtime block without it 310ms
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 430ms
   ✓ bkit context diff (10)
     ✓ --base narrows the range to the commits after a group's start sha 349ms
     ✓ diff from a group start covers only the group's commits 392ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 361ms
     ✓ --reset-log empties the step's clamp log before the record lands 358ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (101 tests) 9559ms
   ✓ bkit issues comment (33)
     ✓ renders header fields in the order the flags were given 336ms
   ✓ bkit issues comment --post (7)
     ✓ renders audit comments from validated result and preserves tracker adapters 436ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 627ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (299 tests) 643ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (107 tests) 25605ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 350ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 317ms
     ✓ brand-new untracked ledger is staged and committed 310ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 364ms
     ✓ path containing a space is staged and committed 448ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 824ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 479ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 414ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 381ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 401ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 318ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 439ms
     ✓ --path records its commit on the run's record, like every other commit mode 517ms
     ✓ a recorded ledger commits only the rows the run appended 669ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 718ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 671ms
     ✓ commitBookkeeping refuses when a recorded path changed 535ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 595ms
     ✓ under --mode=commit counts the squashed paths as something to commit 615ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 323ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 409ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 416ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 565ms
     ✓ a source file in the range: exit 7, path listed 390ms
     ✓ another FID's plan file in the range: exit 7 489ms
     ✓ from not an ancestor of to: exit 7 418ms
     ✓ unknown commit exits 3; a missing flag exits 2 314ms
   ✓ bkit ledgers append --invocation (5)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 688ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 362ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 494ms
     ✓ issues the same operation for rows whose keys are reordered 365ms
   ✓ bkit ledgers append --operation (3)
     ✓ keeps ledger operation intents and receipts out of committed book paths 463ms
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
> [bkit] TRUNCATED HERE — 382 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 321 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 747ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 541ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 379ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 384ms
     ✓ fetches the issue and its comments as GitHub returns them 467ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 488ms
     ✓ invalidates missing corrupt and unsupported progress cache 996ms
     ✓ contains cache read and write failures as standalone degradation 626ms
     ✓ uses legacy receipts and contains receipt failures 499ms
     ✓ records an engine-action row and skips the same key + body on a re-run 576ms
     ✓ a recent identical comment counts as done (the final close comment) 535ms
     ✓ a failed post reports done false with the reason and never leaks a token 553ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 432ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 1042ms
     ✓ a different marker hash posts 796ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 528ms
(node:73025) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ prMarker writes a FID-only marker with github wired and no issue 666ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 546ms
     ✓ retries a failed create once, and exits 5 when it fails twice 747ms
     ✓ exits 5 when the open-PR probe errors 594ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1090ms
     ✓ prs open still opens against any other base 783ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 302ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 541ms
     ✓ exits 4 when gh errors and 80 when it needs auth 463ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 347ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 337ms
     ✓ runs no merge when the PR is already MERGED 343ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 673ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 630ms
     ✓ prs merge refuses when the PR base is unknown 330ms
     ✓ prs merge reads the base from the one pr view it already makes 570ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 396ms
   ✓ bkit prs update-branch (5)
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 368ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 581ms
     ✓ never reads dev's required checks without --only-if-required 508ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 330ms
     ✓ is not green when a check failed, naming it (exit 1) 837ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 1017ms
     ✓ is not green on an empty rollup (total 0) 565ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 849ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 569ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 493ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ done --group writes group on the row 404ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 506ms
     ✓ reports a failed commit with exit 8 without writing the row 653ms
     ✓ a failed commit leaves no row staged in the index 840ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 704ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 645ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1231ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 846ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1174ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 334ms
     ✓ --ref reads the status file as committed on that ref, not from disk 354ms
     ✓ --ref exits 3 when the ref does not carry the status file 335ms
     ✓ fails on a placeholder left in the artifact 304ms
     ✓ fails when the row's verdict differs from the artifact's 324ms
     ✓ fails on a missing artifact 311ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 340ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 411ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 455ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 632ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 844ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 506ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 505ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 366ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 310ms
     ✓ --attempt-of checks the row carries the derived counter 336ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 627ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 661ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 324ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 688ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 331ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 444ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 898ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 572ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 345ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 679ms
     ✓ PASS is 0 failures with or without reports 1280ms
     ✓ clears a previous attempt's reports before the gate runs 657ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 945ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 505ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 866ms
     ✓ numbers runs within the workflow's active run and per step 519ms
     ✓ without --file no row is written and the output carries row null 574ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 610ms
     ✓ a planned test absent from a loaded report is a missing gap 538ms
     ✓ a file that fails to load is a red of kind red-not-loaded 812ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 713ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 785ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 442ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 554ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 798ms
     ✓ green: lists each gap kind, with the runner output 597ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1331ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 472ms
       ✓ green clears an exception-only task from a human commit 324ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 254ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 18546ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 809ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 480ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1031ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 731ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 426ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 449ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 398ms
     ✓ an unpinned repo reports nulls and asks no registry 430ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 480ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 360ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 347ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 324ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 35599ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1165ms
     ✓ names each net-new and worsened finding in the log and the JSON 991ms
     ✓ fails on a net score rise with no net count change 894ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1219ms
     ✓ treats a net score at or below 0.001 as float noise 1379ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 963ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 644ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 659ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 665ms
     ✓ exits 4 on a dropped net field instead of silently passing 639ms
     ✓ exits 4 on no summary instead of silently passing 703ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 901ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 2351ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1951ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 919ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 544ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 356ms
     ✓ fails (exit 1) when vale reports alerts 388ms
     ✓ exits 6 on a vale runtime error 470ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 414ms
     ✓ falls back to vale sync when the main worktree has none 464ms
     ✓ fails when vale sync cannot restore the required styles 467ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 422ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 365ms
     ✓ exits 1 naming the files outside, whatever the commit message says 395ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 786ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 501ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 398ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 974ms
     ✓ counts files committed since --base 737ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 841ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 541ms
     ✓ runs the --fallback gate even when no file changed, as it did before 1255ms
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 402ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 367ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 361ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ preserves a marked worktree with uncommitted changes and its marker 449ms
     ✓ tells a caller inside the removed worktree where to cd 375ms
     ✓ fails with its own exit code when git cannot remove a marked path 318ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1057ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 440ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 801ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 405ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 658ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1774ms
     ✓ a refused dev push is logged, never fails the close 1864ms
     ✓ an unreachable remote is logged, never fails the close 657ms
 ✓ .bkit/core/engine/commands/lib.test.ts (73 tests) 4820ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1346ms
     ✓ runGit names ENOBUFS when output passes the limit 1003ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 849ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ locates CI evidence using prompt saved issue and local precedence 1638ms
     ✓ filters branch and PR discovery by configured workflow and exact head 803ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1223ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1329ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1968ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1504ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2180ms
     ✓ checks the named repository base and fails closed on missing evidence 995ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 873ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 858ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 418ms
       ✓ a source change past the validated head refuses (17) and names the path 327ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 505ms
       ✓ --validated without --month / --fid is a usage error (2) 322ms
       ✓ a validated sha that is not an ancestor refuses (17) 411ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 543ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 930ms
     ✓ a failed re-trigger push names the cause in the log 1332ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1111ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1831ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 958ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 465ms
     ✓ gh-error: every poll errored 466ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 879ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 857ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1111ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1002ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2533ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2674ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 671ms
     ✓ re-trigger on dev only uses the record of its own FID 797ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 938ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 308ms
   ✓ bkit runs context (12)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 520ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 427ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 386ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 514ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 683ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 660ms
     ✓ --file and --step go together 537ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 188 lines omitted. Dropped content was NOT read.
     ✓ runs code.ts through its declared gate in the built checkout 1743ms
     ✓ runs code.ts through its declared gate in the built checkout 1574ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1568ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1415ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1471ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 891ms
     ✓ runs the full gate for replayed debug code 1399ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1732ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 1567ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1726ms
     ✓ a push that fails without a server answer is returned once, never retried 1478ms
     ✓ a failed fetch is returned before anything is built 492ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2101ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1652ms
     ✓ lands from a clone whose fetch refspec omits dev 1797ms
     ✓ build throwing stops the landing and removes the throwaway checkout 532ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ PUTs the policy requiring the default capstone check 506ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 640ms
     ✓ exits 6 when the PUT fails 396ms
   ✓ bkit setup protect-main — pre-flight (6)
     ✓ exits 4 when the CI workflow file is missing, before any write 332ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
   ✓ bkit setup protect-main --print (4)
     ✓ reports an unprotected main (GitHub's 404) as protected: false 455ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 309ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 59ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > repeat harvest of same rows does not duplicate (idempotent)
> [bkit] TRUNCATED HERE — 195 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (6 tests) 8ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 39ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (52 tests) 38ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 119ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 18ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (11 tests) 7732ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > writes plugin prompts + workflow skills, and stamps the managed version
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

 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 29ms
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

 ✓ .bkit/core/engine/audits/repo/vitest-repo-config-guard.test.ts (12 tests) 1663ms
   ✓ repoConfigFile (3)
     ✓ answers for the cwd, not an inherited GIT_DIR 300ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 81ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 133ms
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

 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 16ms
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

 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 24ms
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

(node:68445) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:68445) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:68445) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:68445) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 59ms
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

 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 1787ms
   ✓ renderAntigravityAgentsSkills (3)
     ✓ is idempotent — a second render writes nothing 473ms
   ✓ runAntigravityModule (3)
     ✓ warns when Codex is also installed (skill-overlap advisory) 303ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 24ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 838ms
   ✓ shipped hook templates (5)
     ✓ every generated hook parses: node --check for JS, bash -n for shell 809ms
[feat/test db2d6d9] gate
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 13ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 33ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 8ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 31ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 72ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 27ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 37ms
(node:43179) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:43179) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:43179) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:43179) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:43179) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:43179) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:43179) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (24 tests) 14038ms
   ✓ shipped copy-and-own test files (6)
     ✓ ci/bkit-check-capstone.test.mjs passes when run on its own 303ms
     ✓ ci/bkit-test-awake.test.mjs passes when run on its own 6041ms
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 6624ms
   ✓ bkit-check-capstone (10)
     ✓ passes its own copy-and-own test file (bkit's own copy) 341ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 8ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/ledger-read-idiom.test.ts (11 tests) 1106ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 79ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 23ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 93ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 8ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 44ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 11ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 6ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (2 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 11ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 19ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 25ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 23ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 10ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 16ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/context-vercel-block.test.ts (22 tests) 10803ms
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 624ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 378ms
     ✓ follows summary cursors even when the first page is shorter than the limit 788ms
     ✓ reports excluded intervals as unread even when pagination finishes 391ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 591ms
     ✓ reports an unread remainder at the page cap 577ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 408ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 453ms
     ✓ rejects missing summaries instead of treating them as empty results 658ms
     ✓ reports a failed first page as unavailable 615ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 323ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 821ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 404ms
     ✓ follows summary cursors even when the first page is shorter than the limit 718ms
     ✓ reports excluded intervals as unread even when pagination finishes 407ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 447ms
     ✓ reports an unread remainder at the page cap 456ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 402ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 306ms
     ✓ rejects missing summaries instead of treating them as empty results 354ms
     ✓ reports a failed first page as unavailable 361ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 321ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 4ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 21241ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 2161ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2120ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 360ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 336ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 2287ms
     ✓ does not fall back through a malformed later success receipt 1338ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 875ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 821ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1408ms
     ✓ requires proof even when the pushed increment changes no files 849ms
     ✓ ignores malformed receipts 830ms
     ✓ does not record a tracked tree 382ms
     ✓ does not record a untracked tree 394ms
     ✓ does not record a mutated tree 484ms
     ✓ does not record a committed tree 545ms
     ✓ records no proof for a failed gate or lighter gate 944ms
     ✓ requires integration proof when integration is declared 1351ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2064ms
     ✓ invalidates proof when the gate definition changes 785ms
     ✓ keeps whole-branch docs-only classification and rejects mixed argument modes 361ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 6437ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 6421ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 14517ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 10911ms
     ✓ every fence parses under zsh -n 3547ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (161 tests) 121243ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 300ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1183ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 348ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 353ms
       ✓ a new run in the same chat gets its own session row 303ms
     ✓ opens the next run after a finished one, and after another workflow's run 307ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 309ms
     ✓ design / plan / build / debug book in the current worktree 310ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 396ms
   ✓ bkit workflows fail (19)
     ✓ aborts a rebase only when one is in progress 530ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 443ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 433ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 312ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 672ms
       ✓ counts subagents of an earlier chat the run's session rows name 779ms
       ✓ records no context block, and still closes, outside a Claude Code session 612ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 774ms
     ✓ records ending held and publish false on the workflow-done row 769ms
     ✓ defaults the close row to ending done 928ms
     ✓ refuses an unknown ending 322ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1058ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 747ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 779ms
     ✓ always writes the telemetry, whatever the runtime 751ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 529ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 611ms
     ✓ an unwritable stats path is logged and never fails the close 575ms
     ✓ appends the completeness row before the workflow-done row 710ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 685ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 625ms
     ✓ writes one completeness row per close 1152ms
     ✓ leaves out the previous run's rows that share a second with this run's start 627ms
     ✓ still closes when the completeness check throws 656ms
     ✓ still closes when the completeness row write throws 663ms
     ✓ ship: run.pr, size of the squash commit, and coverage 712ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 889ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 561ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 635ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 830ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 717ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1175ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1006ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1002ms
     ✓ --record-step writes the close step's row before workflow-done 792ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 903ms
     ✓ --number without --outbox is a usage error 884ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 917ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1005ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 973ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 936ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 748ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 381ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 344ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2401ms
     ✓ --flush with nothing to record commits and pushes nothing 1170ms
     ✓ --flush carries the named worktree's logs into the dev commit 2387ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2423ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2344ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2978ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2325ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2997ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2788ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2455ms
     ✓ --push on dev never carries a row whose references name another feature 2408ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2125ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 4240ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2461ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1106ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 2799ms
     ✓ preserves unlanded file deletions and ledger additions on close 5226ms
     ✓ preserves dirty work and uncertain branch evidence during close 4979ms
     ✓ preserves a local feature ref changed after its cleanup proof 4723ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2610ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1918ms
     ✓ a close that landed releases the lock 2640ms
     ✓ removes the worktree before it releases the lock 2945ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2665ms
       ✓ closePr refuses when the PR base is unknown 1595ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1095ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 403ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 631ms
     ✓ record is present after workflows close and before the push 483ms
     ✓ failed handover from dev removes the record and keeps recorded paths 904ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 360ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 301ms
     ✓ puts each --line after the summary, in flag order 310ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 191361ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 389ms
     ✓ rejects missing explicit and ambiguous existing branch selections 368ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 838ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 770ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 476ms
     ✓ a refused --continue carries git's own reason 613ms
     ✓ --file records nothing for a refused rebase 451ms
     ✓ refuses a code conflict and aborts the rebase on the spot 515ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 984ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 462ms
     ✓ produces byte-identical output to merge=union 1073ms
     ✓ restores a trailing newline so the next append starts on its own line 562ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 486ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 823ms
     ✓ refuses a union that leaves a line which is not JSON 471ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 594ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1132ms
     ✓ refuses a lockfile whose regenerate command fails 1113ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1046ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1063ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1048ms
     ✓ refuses and aborts when both sides changed the hand-written region 688ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 916ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1145ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1251ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 690ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 849ms
     ✓ refuses and aborts when a side deleted the install record 605ms
     ✓ refuses a conflicted doc the repo's script does not list 500ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 482ms
     ✓ removes a stale sentinel when the rebase succeeds 749ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 894ms
     ✓ resolves a conflict in each of two replayed commits across rounds 871ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 440ms
       ✓ skips (12) with no anchor 443ms
       ✓ skips (12) when the base is unreachable in this clone 480ms
       ✓ skips (12) when nothing landed since the base 509ms
       ✓ runs (0) with the landed path count once dev moved 846ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 400ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 781ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 604ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 763ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1567ms
     ✓ runs exactly one git push 1525ms
     ✓ --set-upstream records the upstream 675ms
     ✓ refuses with no branch checked out 647ms
     ✓ --mode=dev refuses a feature checkout 542ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1496ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2334ms
     ✓ --require-ci pushes as-is when dev has not moved 978ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1515ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2553ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 760ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 865ms
     ✓ --mode=abort pushes when the branch has no open PR 959ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 856ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 619ms
     ✓ --open-pr carries the MCP answer and skips gh 734ms
     ✓ --mode=abort on dev pushes plainly without probing 766ms
     ✓ rejects an unknown mode 604ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 2406ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1280ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1571ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3360ms
     ✓ skip-ci HEAD on the replay is refused 1063ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2769ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3304ms
     ✓ a level local dev is a plain push, recording nothing extra 1170ms
     ✓ a record with no commits pushes nothing 791ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 687ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1724ms
     ✓ a rewritten branch is refused, never forced 849ms
     ✓ refuses dev and main with exit 21 and pushes nothing 545ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1364ms
     ✓ refuses a detached HEAD (exit 5) 621ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1293ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1183ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1290ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1484ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 609ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1364ms
     ✓ an up-to-date branch is a no-op 810ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1402ms
     ✓ a fetch that fails exits 10 572ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 760ms
     ✓ scan-diff still reports a new skip when its test … 732ms
     ✓ scan-diff reports a skip moved onto a different t… 747ms
     ✓ scan-diff does not cancel a skip moved between am… 749ms
     ✓ scan-diff does not spend an unchanged duplicate t… 782ms
     ✓ scan-diff recognizes a renamed test file 718ms
     ✓ scan-diff recognizes a suite moved into a differe… 750ms
     ✓ scan-diff does not let unrelated additions hide a… 706ms
     ✓ scan-diff attributes deletion to its old test ins… 786ms
     ✓ scan-diff consumes each moved assertion once and … 718ms
     ✓ scan-diff does not match identical assertions fro… 603ms
     ✓ scan-diff does not match the same leaf test name … 745ms
     ✓ scan-diff does not match a same-named test with d… 703ms
     ✓ scan-diff does not match a same-named test with c… 602ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 659ms
     ✓ --paths with no match exits 1 565ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 510ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 936ms
     ✓ --marker reads a diff over 1 MiB 725ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 811ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 750ms
     ✓ scan-diff finds an added skip 706ms
     ✓ scan-diff ignores a skip predating the base 659ms
     ✓ scan-diff reports a disabled test with its line 753ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 619ms
     ✓ scan-diff ignores a removed comment in a test file 651ms
     ✓ scan-diff ignores an assertion moved within the file 626ms
     ✓ scan-diff still reports a removed assertion 753ms
     ✓ scan-diff reports an assertion re-added only outside the test file 705ms
     ✓ scan-diff finds an added pytest mark skip 922ms
     ✓ scan-diff finds an added unittest skip 748ms
     ✓ scan-diff finds an added bare skip call 753ms
     ✓ scan-diff ignores a quoted skip in a documentation file 736ms
     ✓ scan-diff ignores a marker literal in a non-test source file 611ms
     ✓ scan-diff ignores an assertion whose expectation changed 538ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 448ms
     ✓ scan-diff reports a deleted test file 407ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 716ms
     ✓ a title that already carries the marker is left alone 591ms
     ✓ with no open PR: pushes the marker commit and edits no title 752ms
     ✓ a re-run is deduped: no second marker commit 818ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 914ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 312ms
     ✓ --title-set skips gh entirely 489ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 925ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 1335ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 772ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 1630ms
     ✓ continues only the explicitly recorded target through the public merge command 1138ms
     ✓ fetches the unseen feature head before classifying the base 695ms
     ✓ fast forwards the feature before either base path is chosen 1294ms
     ✓ merges divergent feature tips without rebasing either side 799ms
     ✓ continues the feature merge before starting a dev merge 1244ms
     ✓ publishes local code with a CI running head before bookkeeping 1691ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2473ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1540ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1072ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 303ms
     ✓ Path B once dev moved; --head checks a given commit 435ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 450ms
     ✓ --merge-docs merges dev when docs/ is behind 524ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 516ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 754ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 756ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 621ms
     ✓ --merge-docs skips an empty bkit:generate script 537ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 495ms
     ✓ --merge-docs never merges on dev itself 486ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 790ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 581ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 478ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 480ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 590ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 901ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 740ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 641ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 598ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 760ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 557ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 655ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 439ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 306ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 402ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 615ms
     ✓ a failed install stops ship (16) 526ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 406ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 388ms
     ✓ exits 10 when the fetch fails 302ms
   ✓ branches land (28)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1376ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 2179ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1586ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1572ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 3013ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 3401ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 573ms
     ✓ local: names unpushed dev as the cause when the branch carries it 638ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 688ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1719ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1515ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1090ms
     ✓ uses tree entry equivalence for design and plan land cleanup 4590ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1170ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1122ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1006ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 657ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1528ms
     ✓ land removes the worktree when only the copied .env is untracked 1207ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1045ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1123ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1812ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1142ms
     ✓ landPr refuses a main-based PR without retrying 540ms
     ✓ landPr refuses when the PR base is unknown 588ms
     ✓ PR not open (closed): stops (17) at once, no retry 655ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 421ms
     ✓ --attempt names the merge round in a fix commit 425ms
     ✓ commits a rewritten and a deleted tracked file 437ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 367ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 339ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 382ms

 Test Files  176 passed (176)
      Tests  7606 passed | 2 skipped (7608)
   Start at  21:38:50
   Duration  192.62s (tests 97%, import 1%, transform 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/912-debug-loop-question/build-group-gate-1-1.log.reports/vitest-57894.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |    88.5 |    82.27 |   94.39 |   89.94 |                   
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
 ...mands/workflow |   90.09 |    82.91 |   95.18 |   91.59 |                   
  branches.ts      |    89.6 |     83.5 |   98.82 |   91.24 | ...3265,3290,3433 
  challenge.ts     |   96.28 |    85.36 |     100 |   97.43 | ...80,412-414,700 
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.47 |    95.98 |     100 |   99.11 | 314,735           
  decisions.ts     |   94.38 |    83.15 |      98 |   97.21 | ...63,368,445,633 
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   94.11 |    86.99 |   97.43 |   95.62 | ...1300,1320-1330 
  junit.ts         |   93.75 |    73.84 |     100 |   93.33 | 35-36,39          
  ledgers.ts       |   88.42 |    79.07 |   95.26 |   91.36 | ...2357-2358,2386 
  locks.ts         |   94.01 |    89.47 |   96.15 |    95.8 | ...96-198,461-462 
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
  summary.ts       |   96.03 |    90.27 |    94.2 |   96.33 | ...32-638,661,684 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-base.ts    |   24.39 |    26.61 |   22.22 |    21.8 | 121-130,157-319   
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.82 |    89.88 |   96.53 |    98.2 | ...2240,2336-2338 
  tracker.ts       |   89.49 |    81.22 |   96.77 |   91.56 | ...2159,2185-2190 
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
Statements   : 88.5% ( 20658/23341 )
Branches     : 82.27% ( 16045/19501 )
Functions    : 94.39% ( 3284/3479 )
Lines        : 89.94% ( 18133/20159 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 454 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 277 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 212 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 370 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 199 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 204 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 94 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 227 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 240 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 223 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 222 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 260 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 248 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 230 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 1014 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 473 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 14 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 16 ms
ok 19 stub: the response selector is cleared before running its body # in 15 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 19 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 22 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 18 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 17 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 23 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 17 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 39 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 64 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 591 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 452 ms
ok 30 refresh drops a file deleted in the index from the build # in 311 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 426 ms
ok 32 a key removed from the env file is unset on the next run # in 174 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 158 ms
ok 34 non-BKIT_ keys are skipped # in 157 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 274 ms
ok 36 a failed unsetenv is retried on the next run # in 202 ms
ok 37 logs key names only, never values # in 159 ms
ok 38 missing env file exits 0 without calling launchctl # in 29 ms
ok 39 the sweep prints the summary line the lane greps for # in 303 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 11 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (118.545125ms)
✔ shell cancellation waits for SIGTERM cleanup (167.967167ms)
✔ direct cancellation waits for SIGINT cleanup (116.06525ms)
✔ shell cancellation waits for SIGINT cleanup (167.143667ms)
✔ direct cancellation waits for SIGHUP cleanup (114.069875ms)
✔ shell cancellation waits for SIGHUP cleanup (164.637167ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (380.001291ms)
✔ shell cancellation follows a worker orphaned by a nested shell (228.078083ms)
✔ direct cancellation preserves a nested machine-lock owner (409.275334ms)
✔ shell cancellation preserves a nested machine-lock owner (472.793875ms)
✔ nested shell cancellation preserves a nested machine-lock owner (469.923333ms)
✔ a hard process-group timeout reaches a shell command during cleanup (87.8495ms)
✔ ships a command-scoped sleep prevention wrapper (0.065667ms)
✔ preserves arguments, output and nonzero exit status (46.915708ms)
✔ runs an entire shell chain and retains its failure (29.984875ms)
✔ reports a missing command as 127 (27.824916ms)
✔ requires a command (26.090708ms)
✔ non-macOS platform selection runs commands without sleep prevention (45.657792ms)
✔ hard timeout escalation reaches a command that ignores TERM (150.094709ms)
✔ forwards POSIX cancellation to the command and releases the assertion (49.358458ms)
✔ holds a real macOS assertion only while the command runs (72.411292ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3382.940375
> [bkit] TRUNCATED — kept 1793 of 3258 lines (131 KB of 251 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
