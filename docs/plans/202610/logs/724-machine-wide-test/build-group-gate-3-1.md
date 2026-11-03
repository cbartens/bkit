
> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta


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

> @cbartens/bkit@6.0.0 lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
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
 600:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 822:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 991:108   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1093:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1254:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1312:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 372:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 412:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 483:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/templates/context/bkit-serena.md
 6:78  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/deployments.md
 126:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 245:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 372:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 412:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 483:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 46 warnings and 0 suggestions in 149 files.
passed: true
skipped: null
files: 149

> @cbartens/bkit@6.0.0 slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> bkit ci slop

[bkit-ci] base 9fe3aaf590bf743321b7d6671880959e4b3ec94f (9fe3aaf590bf743321b7d6671880959e4b3ec94f) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 9fe3aaf590bf743321b7d6671880959e4b3ec94f
base: 9fe3aaf590bf743321b7d6671880959e4b3ec94f
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 13.9 on 10 cores: unit limits 6941ms per test, 13882ms per hook (x1.39)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 28503ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 834ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 917ms
     ✓ resolves config from the repo root when run from a subdirectory 2074ms
     ✓ exits 6 when the PUT fails 1900ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 2916ms
   ✓ bkit setup protect-main — pre-flight (6)
     ✓ exits 4 when the CI workflow file is missing, before any write 2031ms
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 3184ms
     ✓ asks a human to log in when gh is not authenticated 2251ms
     ✓ exits 3 when gh repo view names no repository 2010ms
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 2095ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 2536ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 3009ms
     ✓ exits 6 when the api answer is not JSON 2642ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (96 tests) 55317ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 31655ms
     ✓ every prompt, workflow and utility agent has the three header blocks 364ms
     ✓ sync has nothing left to rewrite 16795ms
     ✓ every clause reaches the cut-off of one surface it applies to 1887ms
   ✓ fully retired clauses (6)
     ✓ output-cap's sentence stays inline in the abort handover prompt 4047ms
   ✓ the Template Instructions tables match the prompts (2)
     ✓ every row's bullet is byte-identical across its carriers 417ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (60 tests) 67565ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1977ms
     ✓ names each net-new and worsened finding in the log and the JSON 2404ms
     ✓ fails on a net score rise with no net count change 2906ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 2641ms
     ✓ treats a net score at or below 0.001 as float noise 3180ms
     ✓ passes when the change only resolves findings 2618ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 2452ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 2435ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 343ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 2994ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 3229ms
     ✓ exits 4 on a dropped net field instead of silently passing 2787ms
     ✓ exits 4 on no summary instead of silently passing 3150ms
     ✓ exits 4 on output that is not JSON instead of silently passing 3436ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 2741ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 747ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 682ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 712ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1128ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 3914ms
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 2974ms
     ✓ fails (exit 1) when vale reports alerts 2061ms
     ✓ exits 6 on a vale runtime error 2370ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 3049ms
     ✓ falls back to vale sync when the main worktree has none 2662ms
     ✓ fails when vale sync cannot restore the required styles 3100ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 303ms
   ✓ bkit ci min-push (9)
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 326ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (109 tests) 42802ms
   ✓ bkit steps done (24)
     ✓ --attempt=next advances with each row, so the next parentSha differs 364ms
     ✓ reports a failed commit with exit 8 without writing the row 3074ms
     ✓ a failed commit leaves no row staged in the index 3475ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 2295ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 3590ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 2562ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 2703ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 2536ms
   ✓ bkit steps gate (8)
     ✓ --ref reads the status file as committed on that ref, not from disk 314ms
     ✓ --ref exits 3 when the ref does not carry the status file 301ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 380ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 357ms
   ✓ bkit steps finish (15)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 383ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 335ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 404ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 336ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 451ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 332ms
     ✓ writeStepRow refuses when a recorded path changed 365ms
     ✓ writeStepRow appends its commit sha to the record 340ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 4058ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (9)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 321ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 308ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 547ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 615ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 561ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ commits a package.json change outside bkit.workflows 305ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 690ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 15643ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 7392ms
     ✓ every fence parses under zsh -n 8143ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 16418ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 542ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 321ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 356ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 323ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 363ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 415ms
     ✓ --path records its commit on the run's record, like every other commit mode 400ms
     ✓ a recorded ledger commits only the rows the run appended 619ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 687ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 574ms
     ✓ commitBookkeeping refuses when a recorded path changed 341ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 512ms
     ✓ under --mode=commit counts the squashed paths as something to commit 456ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 302ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 350ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (152 tests) 87269ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 713ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1342ms
   ✓ bkit workflows fail (19)
     ✓ aborts a rebase only when one is in progress 468ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 414ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 431ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 370ms
       ✓ counts subagents of an earlier chat the run's session rows name 415ms
       ✓ records no context block, and still closes, outside a Claude Code session 336ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 350ms
     ✓ records ending held and publish false on the workflow-done row 374ms
     ✓ defaults the close row to ending done 454ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 529ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 468ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 469ms
     ✓ always writes the telemetry, whatever the runtime 485ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 346ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 397ms
     ✓ an unwritable stats path is logged and never fails the close 497ms
     ✓ appends the completeness row before the workflow-done row 514ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 495ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 546ms
     ✓ writes one completeness row per close 803ms
     ✓ leaves out the previous run's rows that share a second with this run's start 511ms
     ✓ still closes when the completeness check throws 412ms
     ✓ still closes when the completeness row write throws 434ms
     ✓ ship: run.pr, size of the squash commit, and coverage 585ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 730ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 508ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 367ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 645ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 655ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 511ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 443ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 454ms
     ✓ --record-step writes the close step's row before workflow-done 348ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 455ms
     ✓ --number without --outbox is a usage error 311ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 617ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 607ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 643ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 665ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 418ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 986ms
     ✓ --flush with nothing to record commits and pushes nothing 704ms
     ✓ --flush carries the named worktree's logs into the dev commit 1126ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 4353ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1357ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1345ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1068ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1513ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1322ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1114ms
     ✓ --push on dev never carries a row whose references name another feature 1125ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1213ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 2295ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3147ms
     ✓ --push commits in the named worktree, not the checkout it runs from 985ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1730ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1091ms
     ✓ a close that landed releases the lock 1154ms
     ✓ removes the worktree before it releases the lock 1082ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 7326ms
       ✓ closePr refuses when the PR base is unknown 8974ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1210ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 479ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 308ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 797ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 402ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 408ms
     ✓ a second run's record does not let this FID's close commit 515ms
     ✓ record is present after workflows close and before the push 767ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1105ms
   ✓ bkit workflows input (7)
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 325ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 497ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 489ms
     ✓ puts each --line after the summary, in flag order 516ms
     ✓ --summary prints the file and keeps a copy in --outbox 457ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 416ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 13541ms
   ✓ gateguard opencode plugin — advisory mode (default) (7)
     ✓ emits reuse checklist on first write to a NEW (nonexistent) file 389ms
     ✓ warns again for a different file in the same session 470ms
   ✓ gateguard opencode plugin — gate-config advisory (9)
     ✓ flags vitest.config.ts as gate config 300ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 938ms
     ✓ patch (v1 driver): checks every Add / Update / Move-to / Delete target 883ms
     ✓ apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target 870ms
     ✓ apply_patch (v1 driver): checks every Add / Update / Move-to / Delete target 875ms
     ✓ deny mode blocks when any patch target is a first touch, and records all of them 907ms
     ✓ deny mode still blocks when only one of several patch targets is new to the session 382ms
   ✓ dual driver shape (OpenCode 1.x server() + 2.0 setup()) (6)
     ✓ both drivers emit the same advisory for the same edit 447ms
     ✓ deny mode blocks the first touch on BOTH drivers 386ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (64 tests) 12889ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 578ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 551ms
     ✓ a new run of the same FID rewrites startSha 722ms
     ✓ a resume of the same FID reuses the record 782ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 500ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 537ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 581ms
     ✓ a stale record without a lock is replaced 640ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 476ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 418ms
   ✓ bkit worktrees remove (12)
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 400ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 315ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 417ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 8473ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 379ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 114124ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 2056ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 1869ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 2531ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 2450ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 3192ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 2406ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 2420ms
     ✓ counts commits behind origin/dev and the divergence age 2266ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 3062ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 2956ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 2851ms
     ✓ from a worktree, still names the main checkout and its outbox 3017ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 3242ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 2939ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 2443ms
     ✓ prints the Jira site and project under jira 3044ms
     ✓ prints the board under github 3216ms
     ✓ prints the github progress and review states, defaults for a key left unset 2905ms
     ✓ prints the linear progress and review states, defaults for a key left unset 2257ms
     ✓ prints the jira progress and review states, defaults for a key left unset 2364ms
     ✓ prints the linear progress and review states, defaults for a key left unset 2092ms
     ✓ prints null progress and review states under none 3292ms
     ✓ prints buildPublishRemote and buildPublishLocal 2924ms
     ✓ prints the publish defaults when package.json omits them 4178ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 3945ms
     ✓ prints nulls under github without a board, and for keys left unset 4812ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 4250ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 4704ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 4819ms
     ✓ an unpinned repo reports nulls and asks no registry 4509ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 5240ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 4680ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 4549ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 5060ms
 ✓ .bkit/core/engine/commands/land.test.ts (30 tests) 13754ms
   ✓ pushToDev (16)
     ✓ lands the commit on origin/dev and leaves the main checkout alone 491ms
     ✓ never pushes local dev commits missing from origin/dev 543ms
     ✓ dev moved: rebuilds on the new dev and pushes again 892ms
     ✓ dev moved before every push: exhausted, nothing landed 1211ms
     ✓ any other refusal is returned, not retried 4933ms
     ✓ pushToDev replays a commit range onto origin/dev 574ms
     ✓ a replay retries on the new dev when dev moved 817ms
     ✓ pushToDev log line names what it lands 463ms
     ✓ runs no git hooks in the throwaway checkout, and says so 414ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 447ms
     ✓ a push that fails without a server answer is returned once, never retried 318ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 766ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 896ms
     ✓ lands from a clone whose fetch refspec omits dev 530ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 4417ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 305ms
     ✓ keeps each context's own section banner and drops every other context's 644ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 8885ms
   ✓ bkit roadmap mirror (8)
     ✓ writes the row in the worktree, then commits and pushes the same row on dev 503ms
     ✓ lands the same docs/roadmap.md bytes on dev as it writes on the branch, a second apart 526ms
     ✓ appends the branch's row byte for byte on dev when dev lacks the feature's earlier rows 579ms
     ✓ never touches the main checkout and never pushes its local dev commits 656ms
     ✓ run from a checkout on dev writes the row once and mirrors nothing 310ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 611ms
     ✓ a refused dev push is logged, never fails the close 5314ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 3269ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 4143ms
     ✓ counts files committed since --base 4832ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 4564ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 4821ms
     ✓ runs the --fallback gate even when no file changed, as it did before 4909ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 1935ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 2506ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 2807ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 2407ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 2829ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 2183ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 2083ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 2493ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 2844ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 2648ms
     ✓ PASS is 0 failures with or without reports 2665ms
     ✓ clears a previous attempt's reports before the gate runs 2977ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 3154ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 2983ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 2534ms
     ✓ numbers runs within the workflow's active run and per step 2259ms
     ✓ without --file no row is written and the output carries row null 2395ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 3135ms
     ✓ a planned test absent from a loaded report is a missing gap 3937ms
     ✓ a file that fails to load is a red of kind red-not-loaded 4027ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 5194ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 4087ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 4028ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 4781ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 4464ms
     ✓ green: lists each gap kind, with the runner output 5023ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 5586ms
 ✓ .bkit/core/engine/commands/lib.test.ts (69 tests) 1810ms
   ✓ runGit / runTool output limit (5)
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 4595ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 4104ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 4573ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 5160ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 4226ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 5512ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 5496ms
     ✓ --file into a missing directory is refused, not created 5377ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 9274ms
       ✓ falls back to event.before when gh prints unparseable output 4622ms
       ✓ reports last-green-run as the source when the green head is an ancestor 10247ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 8761ms
         ✓ tests ancestry against --head, not HEAD 10707ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 10406ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 1181ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (42 tests) 1070ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 5355ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 4701ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 4658ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 5034ms
     ✓ fetches the issue and its comments as GitHub returns them 4769ms
   ✓ postCommentOnce (4)
     ✓ records an engine-action row and skips the same key + body on a re-run 4458ms
     ✓ a recent identical comment counts as done (the final close comment) 3984ms
     ✓ a failed post reports done false with the reason and never leaks a token 5102ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 5427ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 5035ms
     ✓ a different marker hash posts 5458ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 5532ms
 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (50 tests) 839ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (58 tests) 1181ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ has no coverage findings 535ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 261ms
 ❯ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests | 6 failed) 40560ms
   ❯ bkit skills prune (10)
     × uninstalls unlisted skills from the union of folders and lock keys, never bkit-* 5669ms
     ✓ matches whole names only: a listed name inside a longer one does not keep it 3939ms
     × treats regex characters in a skill name literally 5282ms
     ✓ skips the prune with a warning without .agents/skills.md, uninstalling nothing (exit 0) 10ms
     × prunes by folders alone when skills-lock.json is unreadable, and says so 5066ms
     × reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 5361ms
     × stops calling a CLI that could not run (127) and lists what is left installed 5329ms
     ✓ runs from the checkout top even when called from a subfolder 4661ms
     ✓ does nothing when no skills are installed 11ms
     × keeps bkit-* skills, from folders or the lock, even when .agents/skills.md does not list them 5222ms
   ✓ helpers (2)
     ✓ listedIn treats - as part of a name 1ms
> [bkit] TRUNCATED HERE — 146 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 501 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] preserve: .bkit/.env.example (byte-equal-text: content differs from install-time hash — consumer modified, preserve)

 ❯ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests | 1 failed) 14358ms
   ✓ compareSemver (11)
     ✓ 5.9.0 vs 5.10.0 -> -1 4ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ BKIT_NO_UPDATE_CHECK skips the registry; 0 does not 5ms
     ✓ asks once, then reuses the answer for a day 4ms
     ✓ remembers a failed lookup for an hour, so an offline run does not wait every call 3ms
     ✓ a corrupt or future-dated cache is ignored and rewritten 5ms
     ✓ no git dir: no cache, the check still runs 1ms
   ❯ lookupLatestPublished (3)
     ✓ returns the registry's version 4602ms
     × is null when pnpm fails or prints something that is not a version 9700ms
     ✓ is null when pnpm is not on PATH 11ms
stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > removes bkit's github entry and keeps a consumer server and top-level key
> [bkit] TRUNCATED HERE — 354 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 367 lines omitted. Dropped content was NOT read.
     ✓ writes the jira marker shape, taking the tracker from package.json 2633ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 3189ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1850ms
     ✓ retries a failed create once, and exits 5 when it fails twice 2178ms
     ✓ exits 5 when the open-PR probe errors 2201ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 3092ms
     ✓ prs open still opens against any other base 2879ms
     ✓ exits 6 when the created PR's base is not --base 2626ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 3511ms
     ✓ exits 1 with found=false when there is none 3205ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 2324ms
     ✓ --number reads one PR, mergeable included 2815ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 2701ms
     ✓ exits 4 when gh errors and 80 when it needs auth 3237ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 2224ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 2603ms
     ✓ drops the force-build marker from the title subject 2233ms
     ✓ takes an explicit --subject 2576ms
     ✓ runs no merge when the PR is already MERGED 2582ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 3564ms
     ✓ prs merge refuses a PR whose base is main 3454ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 4360ms
     ✓ prs merge refuses when the PR base is unknown 5045ms
     ✓ prs merge reads the base from the one pr view it already makes 4463ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 4733ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 4310ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 4771ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 4641ms
     ✓ never reads dev's required checks without --only-if-required 4757ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 5013ms
     ✓ updates when a dev ruleset requires status checks 4179ms
     ✓ updates when dev's branch protection requires status checks 4956ms
     ✓ ignores dev rulesets that require no checks 4555ms
     ✓ updates when the repo cannot be resolved 4763ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 5065ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 4843ms
     ✓ is not green when a check failed, naming it (exit 1) 5760ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 4634ms
     ✓ is not green on an empty rollup (total 0) 5071ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 4825ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 5810ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 4595ms
     ✓ is a no-op when the title already says so 4719ms
     ✓ strips the marker, with or without its bkit prefix 5453ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 4977ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 111ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 176ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (283 tests) 175ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 172ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (41 tests) 106ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 237ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 95ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 142ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 317ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 92ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 42ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 94ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (66 tests) 40ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 70ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 105ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 99ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 103ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 132ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 106ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 106ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 140ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 81ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 127ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (49 tests) 57ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 35ms
 ✓ .bkit/core/engine/install/manifest.test.ts (48 tests) 104ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 122ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 13ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 86ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 92ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 74ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

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

stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 55ms
 ✓ .bkit/core/engine/render/hosts.test.ts (125 tests) 93ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 57ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 54ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (23 tests) 78ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 73ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 84ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 83ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 30ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (29 tests | 2 skipped) 41ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 46ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 27ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 52ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 40ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 44ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 152ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (32 tests) 46ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 25ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 38ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 25ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 26ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 46ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793661981377.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793661981380.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793661981382.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793661981390.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 39ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 22ms
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
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 30ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 34ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 26ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 26ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 26ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 11ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 39ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 23ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 19ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 18ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 102ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (27 tests) 33ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 26ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 76ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 87ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 42ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 13ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (7 tests) 6ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 11ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 6ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 12ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 25ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 22ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 6ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 10ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 6ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 6ms
(node:35019) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:35019) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:35019) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:35019) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:35019) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:35019) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:35019) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ❯ .bkit/core/engine/audits/templates/ci-scripts.test.ts (29 tests | 1 failed) 57654ms
   ✓ bkit-check-accepted-divergences (6)
     ✓ collects event-keyed sites with their job and step 3ms
     ✓ collects the workflow-level concurrency block and steps whose first key is not name/uses 1ms
     ✓ reports an unregistered site as missing 0ms
     ✓ reports a registry row that no longer exists as stale 0ms
     ✓ flags an unknown decision or a missing reason 0ms
     ✓ is clean when a live site is registered with a known decision and a reason 0ms
   ✓ bkit-check-dependency-audit (5)
     ✓ blocks high and critical by default, not moderate 0ms
     ✓ reports an unaccepted advisory as missing and an accepted one as clean 0ms
     ✓ flags an expired, over-long or stale acceptance 0ms
     ✓ exits 1 on a missing acceptance, 0 when clean, and 1 on a report with no advisories 88ms
     ✓ rejects an --unreachable value that is neither fail nor warn 30ms
   ❯ shipped copy-and-own test files (5)
     ✓ finds the shipped .test.mjs files 0ms
     ✓ ci/bkit-check-accepted-divergences.test.mjs passes when run on its own 31ms
     ✓ ci/bkit-check-capstone.test.mjs passes when run on its own 169ms
     ✓ ci/bkit-check-dependency-audit.test.mjs passes when run on its own 36ms
     × ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 56881ms
   ✓ capstone env wiring checks (3)
     ✓ flag a lane whose result is not wired to its job 0ms
     ✓ flag a wrongly wired optional lane variable but accept an absent one 0ms
     ✓ require PLAN and SCOPE_RESULT only when the capstone needs the scope job 0ms
   ✓ bkit-check-capstone (10)
     ✓ passes its own copy-and-own test file (bkit's own copy) 215ms
     ✓ the template capstone calls the script, with every lane it needs wired in 24ms
     ✓ the repo capstone calls the script, with every lane it needs wired in 8ms
     ✓ the template capstone fetches the script with an ungated checkout before it runs 8ms
     ✓ the repo capstone fetches the script with an ungated checkout before it runs 7ms
     ✓ the template's step (5)
       ✓ sets exactly the variables this test supplies 7ms
       ✓ reds with a copy-the-script message when scripts/ci/bkit-check-capstone.mjs is missing 15ms
       ✓ never skips itself: a missing script reds even when every lane is green 17ms
       ✓ passes with the script present and the lanes green 57ms
       ✓ reds with the script present when the unit lane ran 0 tests 54ms
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts (171 tests | 4 failed) 197759ms
   ✓ fixture gh stub (10)
     ✓ runs?head_sha=green-capstone returns the captured workflow_runs list 59ms
     ✓ runs/<id>/jobs returns the captured jobs list, --paginate is accepted 134ms
     ✓ runs?head_sha=<unknown> returns total_count 0 (no-run shape) 67ms
     ✓ BKIT_FAKE_GH_API_ERROR=1: every api call exits 1 with stderr 47ms
     ✓ rate_limit returns the requested fixture state 61ms
     ✓ non-api argv exits non-zero (loud on an unmocked boundary) 28ms
     ✓ BKIT_FAKE_RATELIMITED=1: the run list fails rate-limit-shaped, rate_limit still answers 119ms
     ✓ --paginate emits one document per page; --slurp collapses them into an array 179ms
     ✓ rejects a '../'-laden SHA (no path traversal out of the runs dir) 44ms
     ✓ pr view is keyed by --repo; without it the checkout fixture is read 239ms
   ✓ bkit runs gate (68)
     ✓ accepts a green capstone at the head (exit 0) and says so 184ms
     ✓ rejects a failed run (12) 145ms
     ✓ rejects no run at the head (10) 89ms
     ✓ rejects runs that have not completed (11) 66ms
     ✓ rejects a green run at a superseded head (14), given --branch 75ms
     ✓ --fetch refreshes origin/<branch> before gating 580ms
     ✓ --fetch needs --branch (2) 1ms
     ✓ without --branch a superseded head is 10, not 14 (no invented attribution) 47ms
     ✓ rejects a run without the capstone job (13) 88ms
     ✓ rejects a cancelled run (15) 46ms
     ✓ rejects a green run whose capstone concluded 'cancelled' (12) 217ms
     ✓ rejects a green run whose capstone concluded 'skipped' (12) 125ms
     ✓ rejects a green run whose capstone concluded 'timed_out' (12) 87ms
     ✓ rejects a green run whose capstone concluded 'neutral' (12) 89ms
     ✓ rejects a green run whose capstone concluded 'action_required' (12) 160ms
     ✓ rejects a green run whose capstone concluded 'stale' (12) 125ms
     ✓ rejects a green run whose capstone concluded 'startup_failure' (12) 80ms
     ✓ exit 12 failed steps (10)
       ✓ a stale register alone is regenerable; the capstone is left out 87ms
       ✓ both floor steps failing is regenerable 104ms
       ✓ any failed step off the list makes the whole result unregenerable 87ms
       ✓ a job that concluded 'failure' with no failed step is {job}/ and unregenerable 97ms
       ✓ a job that concluded 'timed_out' with no failed step is {job}/ and unregenerable 77ms
       ✓ a job that concluded 'cancelled' with no failed step is {job}/ and unregenerable 72ms
       ✓ a timed-out step counts as failed 68ms
       ✓ bkit.testing.ciGenerated adds steps to the floor 141ms
       ✓ a step name alone does not match a {job}/{step} entry in another job 79ms
       ✓ refusals other than a failed run carry no failed steps 39ms
     ✓ --repo scopes --pr resolution (2)
       ✓ reads the head from the named repo, not the checkout's own PR 88ms
       ✓ logs the disagreement when the resolved repo differs from --repo 61ms
     ✓ skipped lanes (16 is opt-in) (5)
       ✓ a skipped lane alone does not refuse — the capstone's green settles it — but is reported 75ms
       ✓ refuses a skipped lane named in bkit.testing.ciRequired (16) 73ms
       ✓ a required lane naming a different lane does not refuse 75ms
       ✓ refuses when any of several required lanes was skipped 71ms
       ✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 76ms
     ✓ a newer in-flight re-dispatch does not mask a completed green at the head 65ms
     ✓ tells an API error (20) from no run (10) 108ms
     ✓ shapes a rate-limit refusal from rate_limit (20) 44ms
     ✓ stderr noise on a successful gh call does not corrupt the JSON read 60ms
     ✓ an unparseable jobs response is an API error (20), not a missing capstone (13) 61ms
     ✓ gh missing from PATH exits 80 (use the MCP fallback), not an API error 3ms
     ✓ BKIT_SHIP_GATE_OVERRIDE (4)
       ✓ pinned to the refused head turns the refusal into 0 and appends the audit row 60ms
       ✓ a different SHA is ignored — the refusal stands 65ms
       ✓ honoured with no status file (no crash), the row goes to stderr 55ms
       ✓ an unwritable status file still exits 0 and emits the row to stderr (never invisible) 55ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 123ms
       ✓ bkit.testing.ciRequired resolves from package.json 60ms
       ✓ absent ciRequired means no refusal 57ms
       ✓ a malformed ciRequired falls back to none, never crashes 58ms
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 160ms
     ✓ missing --head is a usage error (2) 1ms
     ✓ an empty --head= is a usage error (2), not a gate refusal 11ms
     ✓ --event (5)
       ✓ --event push ignores a pull_request run: no push run is 10, not 11 33ms
       ✓ without --event the in-flight pull_request run reads as in progress (11) 35ms
       ✓ --event push selects the green push run beside an in-flight pull_request run 59ms
       ✓ --event push reds on a failed push run even when a newer pull_request run is green 52ms
       ✓ without --event the newer green pull_request run masks the failed push run 68ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 122ms
       ✓ a run still in progress whose capstone already passed passes 110ms
       ✓ a capstone still running is in progress (11) 69ms
       ✓ a failed capstone fails (12) even when every other job passed 76ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 163ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 164ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 370ms
       ✓ a source change past the validated head refuses (17) and names the path 294ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 448ms
       ✓ --validated equal to --head is the plain head check 75ms
       ✓ --validated without --month / --fid is a usage error (2) 271ms
       ✓ a validated sha that is not an ancestor refuses (17) 320ms
   ✓ bkit runs mirror (18)
     ✓ green push run capstone -> 0 1ms
     ✓ waits through in-progress polls, then mirrors green 0ms
     ✓ waits through in-progress polls, then mirrors red (1) 0ms
     ✓ gate 12 (red) -> 1 with the gate's reason 0ms
     ✓ gate 15 (cancelled) -> 1 with the gate's reason 0ms
     ✓ gate 13 (capstone absent) -> 1 with the gate's reason 0ms
     ✓ gate 16 (required lane skipped) -> 1 with the gate's reason 0ms
     ✓ gate 7 (unknown gate exit (never a pass)) -> 1 with the gate's reason 0ms
     ✓ no push run past the absent window -> 3 naming [skip ci]; a superseded answer (14) counts as absent 0ms
     ✓ no push run yet inside the absent window keeps waiting 0ms
     ✓ still in progress at --max-minutes -> 4 0ms
     ✓ two API errors are retried; the third in a row -> 20 0ms
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 2349ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 2860ms
     ✓ e2e: green push run beside the PR's own in-flight run -> 0 69ms
     ✓ e2e: a red push run is not masked by a newer green PR run -> 1 90ms
     ✓ e2e: only the PR's own run exists -> absent, not in progress (3) 80ms
     ✓ usage: missing --head or a non-numeric minute value exits 2 2ms
   ✓ bkit runs wait (10)
     ✓ the dispatch probe matches the capstone's lane namespace, case-insensitive, by name or context 1ms
     ✓ is bounded: ceil(budget / interval) attempts, no sleep after the last 0ms
     ✓ found stops polling; every poll erroring is err with allErrored 0ms
     ✓ a sleep that overruns its window is blocked: hand the poll to the agent 0ms
     ✓ PR completed = no open checks; run targets are head-anchored 0ms
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 4221ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 2605ms
     ✓ CLI: a failed gh workflow run exits 5 2784ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 3650ms
     ✓ CLI: usage errors exit 2 13ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 338ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 505ms
     ✓ a failed re-trigger push names the cause in the log 2632ms
     ✓ a failed re-trigger push leaves no orphan commit behind 2957ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 873ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 443ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 350ms
     ✓ gh-error: every poll errored 274ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 525ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 533ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 707ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 638ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 320ms
     ✓ CLI: verdict JSON, body scan, exit codes 3830ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 2142ms
     ✓ CLI: --poll-result is validated, --attempts needs it 256ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 3370ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 1574ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 1508ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1370ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 562ms
     ✓ re-trigger on dev only uses the record of its own FID 752ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 846ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 648ms
   ✓ bkit runs declared (2)
     ✓ exit 0 when .github/workflows/<bkit.testing.ciWorkflow> exists, 1 when not 36ms
     ✓ the default bkit-ci.yml counts when no bkit.testing.ciWorkflow is configured 10ms
   ✓ scanBody (8)
     ✓ flags [skip ci] inherited into the landed commit body 70ms
     ✓ flags [ci skip] inherited into the landed commit body 98ms
     ✓ flags [no ci] inherited into the landed commit body 89ms
     ✓ flags [skip actions] inherited into the landed commit body 94ms
     ✓ flags [actions skip] inherited into the landed commit body 103ms
     ✓ flags [SKIP CI] inherited into the landed commit body 90ms
     ✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 168ms
     ✓ an empty or unreadable sha is an error, not a clean result 92ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 2957ms
     ✓ --pr refuses a title carrying a skip token (18) and --record writes the refusal row 2820ms
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 3286ms
     ✓ --snapshot scopes its run list and dev lookups to --repo 3538ms
     ✓ --snapshot without --repo leaves its run list unscoped 5111ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 4797ms
     ✓ a refused capstone records FAIL with its reason 4483ms
     ✓ an unreadable PR is an API error (20) with no head 4621ms
     ✓ takes exactly one of --head, --pr, --squash-of 11ms
   ❯ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 4428ms
       ✓ without --repo no call gains a --repo flag 5398ms
       ✓ repoScopedGh appends --repo to workflow run, leaves gh api alone, and is a no-op without a repo 0ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 4631ms
     × exits 1 when the PR head cannot be read, 80 when gh needs auth 9567ms
     ✓ refuses an unknown --reason 121ms
   ❯ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 4483ms
     × prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 9277ms
     ✓ ref uppercases a Linear or Jira key 0ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 5045ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 5358ms
     ✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 4964ms
     ✓ CI_DEV refuses the slug "a/b" (exit 9) 5472ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 3982ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 5466ms
     × CI refuses a PR that is not open (7) and a head with no CI run (8) 10604ms
     ✓ an unknown phase exits 3; gh needing auth exits 80 5168ms
     × runs context refuses an issue-less marker and branch naming the missing issue 9952ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 4739ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 4494ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 3655ms
     ✓ --file and --step go together 3457ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (224 tests) 245298ms
   ✓ branches rebase: behaviour (19)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1297ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 931ms
     ✓ --file records nothing for a refused rebase 502ms
     ✓ refuses a code conflict and aborts the rebase on the spot 545ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 2937ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 361ms
     ✓ produces byte-identical output to merge=union 867ms
     ✓ restores a trailing newline so the next append starts on its own line 518ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 503ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 782ms
     ✓ refuses a union that leaves a line which is not JSON 405ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 473ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 3249ms
     ✓ refuses a lockfile whose regenerate command fails 2363ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 375ms
     ✓ removes a stale sentinel when the rebase succeeds 630ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 760ms
     ✓ resolves a conflict in each of two replayed commits across rounds 722ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 444ms
       ✓ skips (12) with no anchor 321ms
       ✓ skips (12) when the base is unreachable in this clone 380ms
       ✓ skips (12) when nothing landed since the base 354ms
       ✓ runs (0) with the landed path count once dev moved 797ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 388ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 850ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 439ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 762ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 3434ms
     ✓ runs exactly one git push 3429ms
     ✓ --set-upstream records the upstream 493ms
     ✓ refuses with no branch checked out 366ms
     ✓ --mode=dev refuses a feature checkout 386ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1142ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1525ms
     ✓ --require-ci pushes as-is when dev has not moved 506ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1183ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2024ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 474ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 3497ms
     ✓ --mode=abort pushes when the branch has no open PR 2536ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 2711ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 413ms
     ✓ --open-pr carries the MCP answer and skips gh 649ms
     ✓ --mode=abort on dev pushes plainly without probing 628ms
     ✓ rejects an unknown mode 456ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1320ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 929ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1223ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 6270ms
     ✓ skip-ci HEAD on the replay is refused 489ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 781ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3900ms
     ✓ a level local dev is a plain push, recording nothing extra 530ms
     ✓ a record with no commits pushes nothing 408ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 3916ms
     ✓ a rewritten branch is refused, never forced 625ms
     ✓ refuses dev and main with exit 21 and pushes nothing 454ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1055ms
     ✓ refuses a detached HEAD (exit 5) 359ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 716ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 712ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 679ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 864ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 423ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1094ms
     ✓ an up-to-date branch is a no-op 741ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1019ms
     ✓ a fetch that fails exits 10 433ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 566ms
     ✓ --paths with no match exits 1 478ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 370ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 758ms
     ✓ --marker reads a diff over 1 MiB 673ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 627ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 550ms
     ✓ scan-diff finds an added skip 642ms
     ✓ scan-diff ignores a skip predating the base 501ms
     ✓ scan-diff reports a disabled test with its line 572ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 558ms
     ✓ scan-diff ignores a removed comment in a test file 473ms
     ✓ scan-diff ignores an assertion moved within the file 658ms
     ✓ scan-diff still reports a removed assertion 604ms
     ✓ scan-diff reports an assertion re-added only outside the test file 533ms
     ✓ scan-diff finds an added pytest mark skip 552ms
     ✓ scan-diff finds an added unittest skip 484ms
     ✓ scan-diff finds an added bare skip call 421ms
     ✓ scan-diff ignores a quoted skip in a documentation file 434ms
     ✓ scan-diff ignores a marker literal in a non-test source file 484ms
     ✓ scan-diff ignores an assertion whose expectation changed 443ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 419ms
     ✓ scan-diff reports a deleted test file 478ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 374ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 5921ms
     ✓ a title that already carries the marker is left alone 5221ms
     ✓ with no open PR: pushes the marker commit and edits no title 4991ms
     ✓ a re-run is deduped: no second marker commit 5468ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 5271ms
     ✓ --title-set skips gh entirely 401ms
   ✓ branches sync (24)
     ✓ Path B once dev moved; --head checks a given commit 470ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 522ms
     ✓ --merge-docs merges dev when docs/ is behind 626ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 655ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1430ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1149ms
     ✓ --merge-docs skips an empty bkit:generate script 568ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 549ms
     ✓ --merge-docs never merges on dev itself 489ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 613ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 706ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 573ms
     ✓ --merge merges dev into the feature branch with a skip-ci merge commit, never a rebase 602ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 323ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 831ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 5681ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 580ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 5492ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output with skip ci 1376ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 720ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 608ms
     ✓ refuses --merge-docs with --head, and an unknown --head 313ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 512ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 4794ms
     ✓ a failed install stops ship (16) 5699ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 603ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 522ms
     ✓ exits 10 when the fetch fails 395ms
   ✓ branches land (27)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 969ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1053ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1325ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1308ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 7759ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 7575ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 828ms
     ✓ local: names unpushed dev as the cause when the branch carries it 1015ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 991ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 9889ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 7259ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 3955ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1060ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 4617ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 4112ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 3277ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1737ms
     ✓ land removes the worktree when only the copied .env is untracked 1574ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1344ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1677ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 4816ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1627ms
     ✓ landPr refuses a main-based PR without retrying 2889ms
     ✓ landPr refuses when the PR base is unknown 2612ms
     ✓ PR not open (closed): stops (17) at once, no retry 3600ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 1154ms
     ✓ --attempt names the merge round in a fix commit 1226ms
     ✓ commits a rewritten and a deleted tracked file 1435ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 1380ms
     ✓ reports undeclared and runs nothing with no scripts 557ms
     ✓ reports undeclared and runs nothing with an empty script 460ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 972ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 1095ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 538ms

⎯⎯⎯⎯⎯⎯ Failed Tests 12 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/shared/bkit-latest.test.ts > lookupLatestPublished > is null when pnpm fails or prints something that is not a version
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/shared/bkit-latest.test.ts:157:3
    155|   });
    156|
    157|   it("is null when pnpm fails or prints something that is not a versio…
       |   ^
    158|     fakePnpm("echo 'ERR_PNPM_FETCH_404' >&2; exit 1");
    159|     expect(lookupLatestPublished(root)).toBeNull();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/12]⎯

 FAIL  .bkit/core/engine/audits/templates/ci-scripts.test.ts > shipped copy-and-own test files > ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own
Error: Test timed out in 30000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/templates/ci-scripts.test.ts:260:29
    258|   });
    259|
    260|   it.each(SHIPPED_TEST_FILES)("%s passes when run on its own", { timeo…
       |                             ^
    261|     const res = spawnSync(process.execPath, [path.join(SHIPPED_SCRIPTS…
    262|       encoding: "utf-8",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/12]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs revalidate > exits 1 when the PR head cannot be read, 80 when gh needs auth
Error: Test timed out in 6941ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:2087:3
    2085|   });
    2086|
    2087|   it("exits 1 when the PR head cannot be read, 80 when gh needs auth",…
       |   ^
    2088|     const { cwd, code, file } = shipRepo();
    2089|     prThenFixtureGh(null);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/12]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs context > prints ref (#N on GitHub) and the labels the engine reads; a failed read is null
Error: Test timed out in 6941ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:2159:3
    2157|   });
    2158|
    2159|   it("prints ref (#N on GitHub) and the labels the engine reads; a fai…
       |   ^
    2160|     const cwd = autoRepo();
    2161|     const unread = await context(cwd, "Design", "12");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/12]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs context > CI refuses a PR that is not open (7) and a head with no CI run (8)
Error: Test timed out in 6941ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:2229:3
    2227|   });
    2228|
    2229|   it("CI refuses a PR that is not open (7) and a head with no CI run (…
       |   ^
    2230|     const cwd = autoRepo();
    2231|     fakeGhBin({ "pr-view": prJson({ state: "MERGED" }) });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/12]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs context > runs context refuses an issue-less marker and branch naming the missing issue
Error: Test timed out in 6941ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:2247:3
    2245|   });
    2246|
    2247|   it("runs context refuses an issue-less marker and branch naming the …
       |   ^
    2248|     const cwd = autoRepo();
    2249|     const runs = JSON.stringify([{ databaseId: 5, headSha: "sha12" }]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/12]⎯

 FAIL  .bkit/core/engine/commands/workflow/skills.test.ts > bkit skills prune > uninstalls unlisted skills from the union of folders and lock keys, never bkit-*
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/skills.test.ts:85:3
     83|
     84| describe("bkit skills prune", () => {
     85|   it("uninstalls unlisted skills from the union of folders and lock ke…
       |   ^
     86|     const cwd = checkout({
     87|       folders: ["bkit-build", "find-skills", "react-forms"],

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/12]⎯

 FAIL  .bkit/core/engine/commands/workflow/skills.test.ts > bkit skills prune > treats regex characters in a skill name literally
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/skills.test.ts:111:3
    109|   });
    110|
    111|   it("treats regex characters in a skill name literally", async () => {
       |   ^
    112|     const cwd = checkout({ folders: ["a.b"], registry: "axb\n" });
    113|     expect((await prune(cwd)).json.removed).toEqual(["a.b"]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/12]⎯

 FAIL  .bkit/core/engine/commands/workflow/skills.test.ts > bkit skills prune > prunes by folders alone when skills-lock.json is unreadable, and says so
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/skills.test.ts:126:3
    124|   });
    125|
    126|   it("prunes by folders alone when skills-lock.json is unreadable, and…
       |   ^
    127|     const cwd = checkout({ folders: ["x-skill"], lock: "{not json" });
    128|     const r = await prune(cwd);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/12]⎯

 FAIL  .bkit/core/engine/commands/workflow/skills.test.ts > bkit skills prune > reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/skills.test.ts:134:3
    132|   });
    133|
    134|   it("reports a skill the CLI failed to uninstall, carries on with the…
       |   ^
    135|     const cwd = checkout({ folders: ["a-skill", "b-skill"] });
    136|     process.env.STUB_FAIL = "a-skill";

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/12]⎯

 FAIL  .bkit/core/engine/commands/workflow/skills.test.ts > bkit skills prune > stops calling a CLI that could not run (127) and lists what is left installed
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/skills.test.ts:144:3
    142|   });
    143|
    144|   it("stops calling a CLI that could not run (127) and lists what is l…
       |   ^
    145|     const cwd = checkout({ folders: ["a-skill", "b-skill"] });
    146|     process.env.STUB_EXIT = "127";

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/12]⎯

 FAIL  .bkit/core/engine/commands/workflow/skills.test.ts > bkit skills prune > keeps bkit-* skills, from folders or the lock, even when .agents/skills.md does not list them
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/skills.test.ts:167:3
    165|   });
    166|
    167|   it("keeps bkit-* skills, from folders or the lock, even when .agents…
       |   ^
    168|     const cwd = checkout({
    169|       folders: ["bkit-build", "x-skill"],

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/12]⎯


 Test Files  4 failed | 161 passed (165)
      Tests  12 failed | 6958 passed | 2 skipped (6972)
   Start at  09:23:08
   Duration  249.51s (tests 98%, transform 1%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/724-machine-wide-test/build-group-gate-3-1.log.reports/vitest-31475.xml
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.75 |    82.71 |   94.97 |   91.06 |                   
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
 engine/commands   |   90.24 |    84.49 |   92.45 |   90.94 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   97.46 |    91.11 |     100 |     100 | 87-91,156,162     
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   94.23 |     88.6 |   95.58 |   97.28 | ...48,484,535-538 
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
 ...mands/workflow |   92.53 |    84.13 |   96.36 |   94.03 |                   
  branches.ts      |   89.58 |     82.9 |   97.74 |   90.97 | ...2550,2555,2580 
  challenge.ts     |   96.59 |    83.03 |     100 |      98 | 178,368-370,652   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.44 |    87.09 |   98.03 |   97.34 | ...1661,1832,1921 
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
  runs.ts          |   92.91 |    84.22 |     100 |   94.36 | ...1930,1962-1966 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...55,304,324-329 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   97.39 |    95.19 |     100 |    98.7 | 117,228,468       
  step-table.ts    |     100 |    98.48 |     100 |     100 | 321               
  steps.ts         |   89.43 |    82.35 |    91.3 |   90.34 | ...1711,1716,1718 
  summary.ts       |   95.06 |    86.69 |   91.66 |   93.82 | ...99,407-413,441 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.39 |    88.23 |   96.55 |   96.61 | 23-24,235-236     
  tests-changed.ts |   92.85 |     75.8 |     100 |   95.23 | 81-82,85          
  tests.ts         |   96.87 |    88.61 |   96.72 |   98.11 | ...2217,2313-2315 
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
Statements   : 89.75% ( 17413/19401 )
Branches     : 82.71% ( 12338/14916 )
Functions    : 94.97% ( 2833/2983 )
Lines        : 91.06% ( 15218/16711 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1694 of 3376 lines (112 KB of 254 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
