
> @cbartens/bkit@6.2.0 bkit:gate:changed /Users/christian/Documents/GitHub/bkit/.worktrees/811-publish-dev-refused
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs docs/plans/202611/logs/811-publish-dev-refused/build-plan-gaps-remediate-holistic-1-1-log.md docs/plans/202611/logs/811-publish-dev-refused/build-plan-verify-holistic-1-2.md docs/plans/202611/logs/811-publish-dev-refused/status.jsonl


[bkit:gate:changed] related: vitest related --run --passWithNoTests docs/plans/202611/logs/811-publish-dev-refused/build-plan-gaps-remediate-holistic-1-1-log.md docs/plans/202611/logs/811-publish-dev-refused/build-plan-verify-holistic-1-2.md docs/plans/202611/logs/811-publish-dev-refused/status.jsonl

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/811-publish-dev-refused

No affected test files found, exiting with code 0

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/811-publish-dev-refused/build-holistic-gate-2.log.reports/vitest-77167.xml

[bkit:gate:changed] named: vitest run --passWithNoTests .bkit/core/engine/audits/templates/auto-route-marker.integration.test.ts .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts .bkit/core/engine/audits/workflows/close-squash.integration.test.ts .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts .bkit/core/engine/audits/workflows/ship-invariants.test.ts .bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts .bkit/core/engine/audits/workflows/workflow-archive-snippet.integration.test.ts .bkit/core/engine/audits/workflows/workflow-shape.test.ts .bkit/core/engine/checks/before/repo.test.ts .bkit/core/engine/checks/status-holes.test.ts .bkit/core/engine/commands/ci/ci.test.ts .bkit/core/engine/commands/lib.test.ts .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/challenge.test.ts .bkit/core/engine/commands/workflow/completeness.test.ts .bkit/core/engine/commands/workflow/context.test.ts .bkit/core/engine/commands/workflow/counters.test.ts .bkit/core/engine/commands/workflow/decisions.test.ts .bkit/core/engine/commands/workflow/fids.test.ts .bkit/core/engine/commands/workflow/issues.test.ts .bkit/core/engine/commands/workflow/ledgers.test.ts .bkit/core/engine/commands/workflow/locks.test.ts .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts .bkit/core/engine/commands/workflow/progress.integration.test.ts .bkit/core/engine/commands/workflow/prs.test.ts .bkit/core/engine/commands/workflow/run-facts.test.ts .bkit/core/engine/commands/workflow/runs.test.ts .bkit/core/engine/commands/workflow/runtime.test.ts .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts .bkit/core/engine/commands/workflow/status.test.ts .bkit/core/engine/commands/workflow/ste … [bkit] line shortened, 937 bytes dropped

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/811-publish-dev-refused

 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (61 tests) 188494ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 4871ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 29002ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 1711ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 1600ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 1825ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1950ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 3549ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 5989ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 2620ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1722ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 725ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 1633ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 1174ms
     ✓ design installs dependencies like build and debug 1461ms
     ✓ plan installs dependencies like build and debug 1141ms
     ✓ design stops on a failed install (5) 1286ms
     ✓ plan stops on a failed install (5) 1191ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 2025ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1138ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 980ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1338ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 2258ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 3924ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 4382ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 2968ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 5506ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 4364ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2407ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 2408ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 2008ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1995ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 8720ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 7743ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 6079ms
     ✓ commits leftovers when a copy entry points outside the checkout 3065ms
     ✓ never commits the entries setup copies in from the main checkout 3047ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 3037ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 1486ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 1365ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 1815ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 1703ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 1693ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 1668ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 2174ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 2902ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 3027ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 983ms
     ✓ leaves a clean worktree's history alone 2096ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 3798ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 3524ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 3405ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 3964ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 5174ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 4274ms
     ✓ does not mark a resumed worktree it did not create 1819ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adopts the session branch in place when there is no worktree and no feat/{fid} 672ms
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 1052ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 1831ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 2838ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 1501ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (189 tests) 217056ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 516ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1583ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 508ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 578ms
     ✓ writes no limits for a workflow with no ask point 360ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 512ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 594ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 749ms
       ✓ a new run in the same chat gets its own session row 632ms
       ✓ writes none outside Claude Code 538ms
     ✓ opens the next run after a finished one, and after another workflow's run 558ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 543ms
     ✓ design / plan / build / debug book in the current worktree 572ms
     ✓ refuses when the lock is live, writing no row 636ms
     ✓ --lock-held checks the lock is ours 487ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 1447ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 2054ms
   ✓ bkit workflows start — resume facts (12)
     ✓ a new run has no last step and no open decision 781ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 427ms
     ✓ an OPEN decision of an earlier run never resurfaces 938ms
     ✓ an OPEN decision mid-build prints its header fields 585ms
     ✓ openDecision carries the Gate header 512ms
     ✓ openDecision carries the Source changed header 384ms
     ✓ workflows start reports openDecision for a DECIDED decision file that no build-decision row names 316ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 908ms
     ✓ workflows start does not report openDecision for a DECIDED decision file that a build-decision row names 434ms
     ✓ openDecision gate is null without the header 300ms
     ✓ openDecision gate ignores a Gate line below the header 356ms
     ✓ reads Test attempt from a tests pause 328ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 471ms
     ✓ writes no row when status.jsonl does not exist 365ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 379ms
     ✓ aborts a rebase only when one is in progress 1372ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 814ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 966ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 501ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 785ms
     ✓ --max-exceeded says a handover is due without any sentinel 421ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 373ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 511ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 468ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 379ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 323ms
     ✓ bkit workflows fail refuses a multi-line, non-/bkit- or markdown-carrying --next-step before any write 375ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 470ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 453ms
     ✓ a debug run in SOAK mode always needs a handover 337ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 734ms
       ✓ counts subagents of an earlier chat the run's session rows name 661ms
       ✓ records no context block, and still closes, outside a Claude Code session 651ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 778ms
     ✓ records ending held and publish false on the workflow-done row 668ms
     ✓ defaults the close row to ending done 713ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 613ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 673ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 589ms
     ✓ always writes the telemetry, whatever the runtime 775ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 537ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 810ms
     ✓ an unwritable stats path is logged and never fails the close 692ms
     ✓ appends the completeness row before the workflow-done row 727ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 670ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1058ms
     ✓ writes one completeness row per close 1274ms
     ✓ leaves out the previous run's rows that share a second with this run's start 585ms
     ✓ still closes when the completeness check throws 1352ms
     ✓ still closes when the completeness row write throws 1298ms
     ✓ refuses without status.jsonl and writes nothing 811ms
     ✓ ship: run.pr, size of the squash commit, and coverage 2628ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1790ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1531ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 851ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1046ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1082ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1009ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1070ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 858ms
     ✓ --record-step writes the close step's row before workflow-done 491ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 608ms
     ✓ --number without --outbox is a usage error 715ms
     ✓ --flush is ship only 301ms
   ✓ bkit workflows handover (31)
     ✓ --push commits and pushes the record on the feature branch without a handover 1138ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1093ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 2030ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 855ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 557ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 329ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 303ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1784ms
     ✓ --flush with nothing to record commits and pushes nothing 860ms
     ✓ --flush carries the named worktree's logs into the dev commit 1629ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 2516ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 4012ms
     ✓ closePr titles the PR by the record it carries 3201ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 970ms
       ✓ ship's owner Stop on an open PR: exit 9, push skipped → route stop with the not-pushed line 1023ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 2005ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 1924ms
       ✓ --ref, no push → route stop, no message 913ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 1792ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3488ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 3049ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2460ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2743ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 8011ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 5107ms
     ✓ --push on dev never carries a row whose references name another feature 7231ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2888ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 4813ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2589ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1111ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 2660ms
     ✓ preserves unlanded file deletions and ledger additions on close 4855ms
     ✓ preserves dirty work and uncertain branch evidence during close 5272ms
     ✓ preserves a local feature ref changed after its cleanup proof 5908ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2764ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2221ms
     ✓ a close that landed releases the lock 2835ms
     ✓ removes the worktree before it releases the lock 2858ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4975ms
       ✓ closePr refuses when the PR base is unknown 3841ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2605ms
   ✓ bkit workflows promote (7)
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 396ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 434ms
     ✓ names the branch, not the remote-tracking ref, in each URL 381ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 348ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 409ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 957ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 779ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 1926ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 795ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 702ms
     ✓ a second run's record does not let this FID's close commit 871ms
     ✓ record is present after workflows close and before the push 1386ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 2685ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 3552ms
       ✓ a run closed by workflow-failed keeps no parked copy 2710ms
       ✓ a run closed by workflow-done keeps no parked copy 2574ms
       ✓ a FAILED run gets no row 2694ms
       ✓ a DONE run gets no row 3107ms
     ✓ failed handover from dev removes the record and keeps recorded paths 3253ms
   ✓ bkit workflows input (10)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 397ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 608ms
     ✓ --plan is appended when the file exists and skipped when it does not 481ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 500ms
     ✓ a rebuilt design input keeps the owner-interview record appended after the first build 310ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 1438ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 1217ms
     ✓ puts each --line after the summary, in flag order 867ms
     ✓ --summary prints the file and keeps a copy in --outbox 946ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 793ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 306ms
     ✓ a folder outside the outbox sessions folder is kept 373ms
     ✓ without --session-dir prints no sessionRemoved 300ms
 ✓ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts (134 tests) 247545ms
   ✓ .husky/pre-push delete-only push (6)
     ✓ .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run 672ms
     ✓ .bkit/templates/.husky/pre-push: empty stdin → gates still run 557ms
     ✓ .husky/pre-push: a delete mixed with an update → gates still run 781ms
     ✓ .husky/pre-push: empty stdin → gates still run 633ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 623ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 413ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 470ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 557ms
     ✓ .husky/pre-push: first and last lines name the log 561ms
     ✓ .husky/pre-push: the hook body runs once 533ms
   ✓ .husky/pre-push already-tested push (bkit repo only) (12)
     ✓ annotated tag on a commit origin holds → exits 0 without running a gate 1022ms
     ✓ tag delete alongside that tag → still skipped 747ms
     ✓ tag on a commit no origin branch holds → gates run 1491ms
     ✓ tag pushed with a branch → gates run 1900ms
     ✓ release branch with the files of origin/dev → exits 0 without running a gate 2016ms
     ✓ release branch and a tag, both already tested → still skipped 1195ms
     ✓ branch with files no origin dev / main tip has → gates run 1716ms
     ✓ dev push with the files origin/dev already has → gates run 1209ms
     ✓ main push with the files origin/main already has → gates run 1292ms
     ✓ no origin dev / main ref fetched → a branch push gates 1111ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a release branch push 945ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push 1365ms
   ✓ .husky/pre-push CI-suppressor guard (12)
     ✓ .bkit/templates/.husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 1721ms
     ✓ .bkit/templates/.husky/pre-push: HEAD without a token → the gates run 2006ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 3037ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 1966ms
     ✓ .bkit/templates/.husky/pre-push: no integration gate declared → the unit gate runs 1141ms
     ✓ .bkit/templates/.husky/pre-push: integration gate declared → it runs in place of the unit gate 1146ms
     ✓ .husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 1503ms
     ✓ .husky/pre-push: HEAD without a token → the gates run 1198ms
     ✓ .husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 2044ms
     ✓ .husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 2080ms
     ✓ .husky/pre-push: no integration gate declared → the unit gate runs 1232ms
     ✓ .husky/pre-push: integration gate declared → it runs in place of the unit gate 1619ms
   ✓ .husky/pre-push tmp/ prune (6)
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 784ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 908ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 1263ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 939ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 1983ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 1307ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 741ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 832ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 628ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 1230ms
     ✓ .husky/pre-push: a gate fails → no disk prune 824ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 927ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 1051ms
     ✓ a stale register stops the push before any gate runs 647ms
     ✓ bkit check fails → the push stops before any gate runs 602ms
     ✓ the dependency audit runs before any gate, when its script is present 1100ms
     ✓ no dependency-audit script → skipped, the gates still run 1044ms
     ✓ no register script → skipped, the gates still run 549ms
   ✓ .husky/pre-push slop base (8)
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 968ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 1144ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1283ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 1922ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1219ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 1277ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1084ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 1281ms
   ✓ graphify register pre-push gate (18)
     ✓ push to another branch → no check, push goes on 494ms
     ✓ branch with an open PR into dev, register stale → blocked, check-at on the pushed commit 582ms
     ✓ branch with an open PR into dev, register current → push goes on 578ms
     ✓ branch with no open PR → no check, push goes on 997ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 764ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 829ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 1114ms
     ✓ .husky/pre-push: push to dev → the register gate checks the pushed commit and blocks 1415ms
     ✓ .husky/pre-push: push to a feature branch → the register gate does not run 1009ms
     ✓ .husky/pre-push: push of the checked-out branch with an open PR → the gate checks the pushed commit 1848ms
   ✓ .husky/pre-push min push (24)
     ✓ .bkit/templates/.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 7378ms
     ✓ .bkit/templates/.husky/pre-push: a checked empty trigger uses minimum validation 5109ms
     ✓ .bkit/templates/.husky/pre-push: a remote code head without checked evidence still runs the full gate 3074ms
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 4417ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 2592ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 7277ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 7626ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 4780ms
     ✓ .bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 3186ms
     ✓ .bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 3313ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 2499ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 4487ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 3664ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 2511ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 4645ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 2838ms
     ✓ .husky/pre-push: a code file in the push → the full gate 2330ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 3319ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 3190ms
     ✓ .husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 3105ms
     ✓ .husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 3669ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 3293ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 2891ms
     ✓ .husky/pre-push: a code push still runs them 3371ms
   ✓ .husky/pre-push direnv (11)
     ✓ trusted .envrc → the gate sees its variables 1726ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 576ms
     ✓ trusted .envrc that fails to load prints the cause, not "not trusted" 929ms
     ✓ untrusted .envrc still prints the direnv allow line 569ms
     ✓ no .envrc → no direnv call 966ms
     ✓ direnv not on PATH → gates run, no warning 2620ms
     ✓ CI set → no direnv call 875ms
     ✓ delete-only push through direnv exec → exit 0, no gate 1082ms
     ✓ trusted .envrc → .bkit/.env tooling keys do not reach the gate 1928ms
     ✓ trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate 1387ms
     ✓ no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it 3026ms
   ✓ the gate's vitest run (1)
     ✓ the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED 3467ms
   ✓ .husky/pre-push PR conflict (16)
     ✓ open PR whose base conflicts → blocked before bkit check, names the file 3038ms
     ✓ open PR that merges cleanly → gates run, no message 3859ms
     ✓ no open PR → no fetch, gates run 3031ms
     ✓ gh not on PATH → warns, gates run 2842ms
     ✓ gh not on PATH → warns, gates run for both hook copies 2763ms
     ✓ base fetch fails → warns, gates run 3666ms
     ✓ dev push → no PR lookup 2574ms
     ✓ min push of a conflicting PR → blocked 4317ms
     ✓ BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run 2961ms
     ✓ open PR whose only conflict is a merge=union ledger → blocked 4509ms
     ✓ single-branch fetch refspec → checks the fetched base, no false block 4121ms
     ✓ fork PR with the same head branch name → ignored, gates run 3836ms
     ✓ shallow clone → no base fetch, warns, gates run 2666ms
     ✓ fork contributor's own PR with a skip-ci head → blocked by the CI-suppressor guard 3031ms
     ✓ full page of fork PRs with a skip-ci head → CI-suppressor guard does not read it as no open PR 2727ms
     ✓ fork PRs past gh's page limit → same-repo PR still found, conflict blocked 2764ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (232 tests) 126383ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1967ms
   ✓ preserves the requested event for selected-workflow verification 1072ms
   ✓ requires selected other-workflow success at the exact pushed head 2029ms
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 2010ms
     ✓ saves the failed job count without the capstone job 886ms
     ✓ a CI selection keeps the failed job names, capstone left out 1302ms
     ✓ counts the capstone job when it is the only failed job 778ms
     ✓ saves no failed job count when no job failed 677ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 400ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1053ms
     ✓ freezes explicit workflow run attempt and all failed job pages 660ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1777ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2964ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 637ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 673ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 759ms
     ✓ rejects a workflow result count smaller than its returned records 678ms
     ✓ validates normalized fallback evidence against the requested identity 372ms
   ✓ bkit runs gate (74)
     ✓ refuses green CI when dev advanced beyond the validated code head 2069ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2287ms
     ✓ checks the named repository base and fails closed on missing evidence 1399ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1011ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1646ms
     ✓ rejects MCP capstone jobs belonging to another run 1950ms
     ✓ --fetch refreshes origin/<branch> before gating 681ms
     ✓ config (5)
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 441ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 433ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 367ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 1336ms
       ✓ a source change past the validated head refuses (17) and names the path 533ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 1467ms
       ✓ --validated without --month / --fid is a usage error (2) 415ms
       ✓ a validated sha that is not an ancestor refuses (17) 440ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 634ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 996ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1092ms
   ✓ bkit runs dispatch (21)
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 951ms
     ✓ a failed re-trigger push names the cause in the log 1645ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 1563ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1749ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 968ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 441ms
     ✓ gh-error: every poll errored 354ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 860ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1169ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 916ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 1418ms
     ✓ a hand-off in the re-poll resumes from the saved receipt with no second re-trigger commit 1541ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 498ms
     ✓ CLI: verdict JSON, body scan, exit codes 971ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 797ms
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 318ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 539ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 518ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 379ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 1641ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 2184ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 2190ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2197ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 951ms
     ✓ re-trigger on dev only uses the record of its own FID 915ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1085ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 1166ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (15)
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 494ms
     ✓ --snapshot scopes its run list and dev lookups to --repo 581ms
     ✓ --capstone-only --record writes no ship-merge-ci row while CI still running: exit in-progress is not a verdict 375ms
     ✓ --wait (4)
       ✓ waits for a run still going at the squash commit, then judges and records it 1980ms
       ✓ a wait that runs out exits 11 and writes no ship-merge-ci row 349ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 550ms
       ✓ without --repo no call gains a --repo flag 557ms
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 3033ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 522ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 699ms
     ✓ refuses an unknown --reason 552ms
   ✓ bkit runs context (21)
     ✓ BRIEF phases take the argument as the issue 635ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 1018ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 601ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 343ms
     ✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 403ms
     ✓ CI_DEV refuses the slug "a/b" (exit 9) 461ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 533ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 474ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 673ms
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 1256ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 1083ms
     ✓ debug: a failure test run is a failed run 894ms
     ✓ debug: a timed_out test run is a failed run 1055ms
     ✓ debug: a startup_failure test run is a failed run 779ms
     ✓ debug: a test run still in progress or cancelled is not returned 1474ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 916ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 742ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1698ms
     ✓ an unknown phase exits 3; gh needing auth exits 80 620ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 735ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1122ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1001ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1003ms
     ✓ --file and --step go together 747ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 5270ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 620ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 654ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 1073ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 916ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 1145ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 1211ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 1043ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ runs local gates only after current-generation remediation or soak 1425ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 651ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 442ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 683ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 442ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 452ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 445ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 463ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 445ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 679ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 513ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 412ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 437ms
     ✓ PASS is 0 failures with or without reports 795ms
     ✓ clears a previous attempt's reports before the gate runs 456ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 630ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 590ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1551ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 714ms
     ✓ numbers runs within the workflow's active run and per step 1355ms
     ✓ tests run --file records the tested snapshot on its test-run row 769ms
     ✓ a FAIL test-run row records each failing case as file and name 650ms
     ✓ a PASS test-run row records no failed tests 1181ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 584ms
     ✓ without --file no row is written and the output carries row null 532ms
   ✓ bkit tests run --changed-since (17)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ the nothing-to-run row records the tested snapshot 777ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 2307ms
     ✓ --since-pass-of skips failing runs and steps it does not name 1920ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 1587ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 972ms
     ✓ --since-pass-of needs --file, --workflow and --changed-since 334ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 1091ms
     ✓ changed-since refuses a sha that names no commit 606ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 1293ms
     ✓ a deleted file that no file mentions passes and the log says so 1066ms
     ✓ a failed importer search runs the whole check 1324ms
     ✓ --changed-since=feature-base starts at the feature's start commit 1630ms
     ✓ --changed-since=feature-base with no origin/dev meeting point measures from origin/dev and says so 350ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ a passing required push gate records a receipt 1119ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 963ms
     ✓ a failing required push gate leaves the failed marker 934ms
     ✓ uncommitted code blocks the receipt until it is committed 1161ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 1360ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 514ms
     ✓ a planned test absent from a loaded report is a missing gap 527ms
     ✓ a file that fails to load is a red of kind red-not-loaded 710ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 717ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 329ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1209ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 643ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 642ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 692ms
     ✓ takeover (5)
       ✓ tests red records a failing takeover as red with from 658ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 752ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 951ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ green with no gaps prints verdict PASS and an empty gaps 811ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1111ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 1240ms
     ✓ green: lists each gap kind, with the runner output 661ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1528ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 599ms
       ✓ green clears an exception-only task from a human commit 374ms
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (71 tests) 145229ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (47)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 5017ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 457ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 1993ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches 3772ms
     ✓ T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch 3091ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 2034ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 4140ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 3114ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 5407ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 412ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 2366ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 2005ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 2626ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 1737ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 2085ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 2988ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 3104ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 3165ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 6165ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 4532ms
       ✓ a branch with no status.jsonl dispatches as before 3326ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 3324ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 4684ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 3312ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 3211ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 839ms
     ✓ refuses a code conflict and aborts the rebase on the spot 1244ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1785ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 1913ms
     ✓ produces byte-identical output to merge=union 3316ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1547ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1572ms
     ✓ refuses a lockfile whose regenerate command fails 1424ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1541ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1498ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 894ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 746ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 950ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1135ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 691ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 738ms
       ✓ runs (0) with the landed path count once dev moved 966ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 573ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 2422ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1877ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 3183ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 573ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1533ms
     ✓ --mode=abort pushes when the branch has no open PR 1277ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1067ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 408ms
     ✓ --open-pr carries the MCP answer and skips gh 640ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1485ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1608ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3413ms
     ✓ skip-ci HEAD on the replay is refused 1416ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 4777ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 1447ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1879ms
     ✓ a fetch that fails exits 10 763ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 870ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 870ms
     ✓ scan-diff attributes deletion to its old test ins… 769ms
     ✓ scan-diff consumes each moved assertion once and … 743ms
     ✓ scan-diff does not match identical assertions fro… 783ms
     ✓ scan-diff does not match the same leaf test name … 845ms
     ✓ scan-diff does not match a same-named test with d… 763ms
     ✓ scan-diff does not match a same-named test with c… 722ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 724ms
     ✓ --paths with no match exits 1 689ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 521ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 888ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 1063ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 866ms
     ✓ scan-diff ignores a removed comment in a test file 836ms
     ✓ scan-diff ignores an assertion moved within the file 1005ms
     ✓ scan-diff still reports a removed assertion 1030ms
     ✓ scan-diff reports an assertion re-added only outside the test file 843ms
     ✓ scan-diff finds an added pytest mark skip 715ms
     ✓ scan-diff finds an added unittest skip 690ms
     ✓ scan-diff finds an added bare skip call 686ms
     ✓ scan-diff ignores a quoted skip in a documentation file 608ms
     ✓ scan-diff ignores a marker literal in a non-test source file 673ms
     ✓ scan-diff ignores an assertion whose expectation changed 849ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 822ms
     ✓ scan-diff reports a deleted test file 759ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 546ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 3953ms
     ✓ publishes local code with a CI running head before bookkeeping 5755ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 8094ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 4987ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 4181ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 3717ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1798ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1288ms
     ✓ --merge-docs skips an empty bkit:generate script 1032ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 773ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 2195ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 2633ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 2094ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1845ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 2599ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1927ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 1216ms
     ✓ exits 10 when the fetch fails 616ms
     ✓ refuses --merge-docs with --head, and an unknown --head 752ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1636ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 2137ms
     ✓ a failed install stops ship (16) 2610ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1685ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1849ms
     ✓ exits 10 when the fetch fails 1196ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 886ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 4881ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 3430ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 3293ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1750ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 6161ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 770ms
     ✓ reports undeclared and runs nothing with an empty script 947ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 1425ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 1455ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 1214ms
> [bkit] TRUNCATED HERE — 46 lines omitted. Dropped content was NOT read.
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 348ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 351ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 377ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 496ms
     ✓ tells a caller inside the removed worktree where to cd 546ms
     ✓ fails with its own exit code when git cannot remove a marked path 367ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1759ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 707ms
     ✓ finishes a CI round only with its own failed job count 903ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 712ms
     ✓ done --group writes group on the row 494ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 745ms
     ✓ carries extra fields, parsed as JSON when they are JSON 359ms
     ✓ reports a failed commit with exit 8 without writing the row 729ms
     ✓ a failed commit leaves no row staged in the index 596ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 789ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 779ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 930ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 693ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1103ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 340ms
     ✓ --ref reads the status file as committed on that ref, not from disk 389ms
     ✓ --ref exits 3 when the ref does not carry the status file 515ms
     ✓ fails on a placeholder left in the artifact 422ms
     ✓ fails when the row's verdict differs from the artifact's 545ms
     ✓ fails when the row does not list the artifact, or carries another attempt 362ms
     ✓ fails on a missing artifact 373ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 380ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a run-tests row missing its scope, and an empty scope 420ms
   ✓ bkit steps finish (17)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 504ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 598ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 829ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 468ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 346ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 301ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 661ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 462ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 332ms
     ✓ --attempt-of checks the row carries the derived counter 318ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
> [bkit] TRUNCATED HERE — 62 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 48398ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1048ms
     ✓ names each net-new and worsened finding in the log and the JSON 837ms
     ✓ fails on a net score rise with no net count change 926ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1561ms
     ✓ treats a net score at or below 0.001 as float noise 877ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 511ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 378ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 971ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 751ms
     ✓ exits 4 on a dropped net field instead of silently passing 986ms
     ✓ exits 4 on no summary instead of silently passing 711ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1056ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 976ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 897ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 2025ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 884ms
     ✓ explicit globs can select ignored prose and nested checkout files 816ms
     ✓ fails closed when the git index cannot be read 1466ms
     ✓ fails when vale is not installed 314ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 488ms
     ✓ fails (exit 1) when vale reports alerts 822ms
     ✓ exits 6 on a vale runtime error 579ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1989ms
     ✓ falls back to vale sync when the main worktree has none 522ms
     ✓ fails when vale sync cannot restore the required styles 509ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 566ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 529ms
     ✓ exits 1 naming the files outside, whatever the commit message says 455ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1021ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 535ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 677ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
   ✓ Debug CI evidence sequence (8)
     ✓ finishes local-only rounds through the actual Debug Step 3 commands 12918ms
     ✓ records the failed job count and reads an uncounted local round as unknown 11771ms
     ✓ finishes replacement CI evidence with the unchanged debug run number 16875ms
     ✓ finishes the first CI evidence round of the second debug run 5091ms
> [bkit] TRUNCATED HERE — 45 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 316ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 398ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 402ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 575ms
     ✓ fetches the issue and its comments as GitHub returns them 520ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 731ms
     ✓ invalidates missing corrupt and unsupported progress cache 1220ms
     ✓ contains cache read and write failures as standalone degradation 610ms
     ✓ uses legacy receipts and contains receipt failures 502ms
     ✓ records an engine-action row and skips the same key + body on a re-run 710ms
     ✓ a recent identical comment counts as done (the final close comment) 602ms
     ✓ a failed post reports done false with the reason and never leaks a token 473ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 520ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 625ms
     ✓ a different marker hash posts 798ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 449ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (115 tests) 33728ms
   ✓ bkit prs open (36)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ prMarker writes a FID-only marker with github wired and no issue 494ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 388ms
     ✓ retries a failed create once, and exits 5 when it fails twice 429ms
     ✓ exits 5 when the open-PR probe errors 358ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 454ms
     ✓ prs open still opens against any other base 375ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 360ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 381ms
     ✓ exits 4 when gh errors and 80 when it needs auth 732ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 321ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 550ms
     ✓ runs no merge when the PR is already MERGED 434ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 570ms
     ✓ prs merge refuses a PR whose base is main 308ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 341ms
     ✓ prs merge refuses when the PR base is unknown 309ms
     ✓ prs merge reads the base from the one pr view it already makes 503ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 397ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 561ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 383ms
     ✓ never reads dev's required checks without --only-if-required 578ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 436ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 452ms
     ✓ is not green when a check failed, naming it (exit 1) 365ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 523ms
     ✓ is not green on an empty rollup (total 0) 468ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 590ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 739ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 440ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ keeps published build completion and PR links in one terminal comment 9571ms
     ✓ continues after the prepared completion source disappears 5111ms
     ✓ records preparation and session association failures despite successful delivery 4662ms
     ✓ associates startup and run across restart or starts fresh safely 6184ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 16791ms
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 1751ms
     ✓ a failing file absent at the base commit is the branch's 1001ms
     ✓ no JUnit report reads unknown 397ms
     ✓ an undeclared bkit:test:file reads unknown 648ms
     ✓ a failed base install reads unknown and removes the worktree 704ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 855ms
     ✓ copies the worktreeCopy entries into the base checkout 875ms
     ✓ a base file run that writes no report reads unknown 1018ms
     ✓ a missing required flag is a usage error 399ms
     ✓ a passing CI run at the exact base sha settles none without a local run 1523ms
     ✓ a CI run that cannot settle the base falls back to the local run 5637ms
     ✓ a pull_request-event CI run at the base sha does not settle none 823ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 829ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 924ms
     ✓ the base test run does not inherit the hooks-off git config 907ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (116 tests) 41296ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (25)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 497ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 500ms
     ✓ staging failure: exit 4 and no commit is created, no false success 412ms
     ✓ a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit 506ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 373ms
> [bkit] TRUNCATED HERE — 69 lines omitted. Dropped content was NOT read.
     ✓ tests run exits 4 naming the queue folder when a regular file blocks it 1175ms
     ✓ tests run with --lock-wait-s=0 exits 81 at once against a held lock 1323ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 1973ms
     ✓ the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 2099ms
   ✓ bkit tests jump (3)
> [bkit] TRUNCATED HERE — 422 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 157 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 158 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 159 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 151 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 153 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 151 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 159 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 169 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 205 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 171 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 175 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 453 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 131 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (116 tests) 17822ms
   ✓ bkit context clamp (#427 T1) (22)
     ✓ keeps both ends of a long failing run under debug-evidence 327ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 552ms
> [bkit] TRUNCATED HERE — 49 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 48 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 94 lines omitted. Dropped content was NOT read.
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
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
[bkit-install] write: .cursor/commands/bkit-auto.md
[bkit-install] write: .cursor/commands/bkit-build.md
[bkit-install] write: .cursor/commands/bkit-debug.md
[bkit-install] write: .cursor/commands/bkit-design.md
[bkit-install] write: .cursor/commands/bkit-plan.md
[bkit-install] write: .cursor/commands/bkit-ship.md
[bkit-install] write: .cursor/agents/bkit-audit-generate.md
[bkit-install] write: .cursor/agents/bkit-build-challenge-1.md
[bkit-install] write: .cursor/agents/bkit-build-challenge-2.md
[bkit-install] write: .cursor/agents/bkit-build-install-skills.md
[bkit-install] write: .cursor/agents/bkit-build-plan-convert.md
[bkit-install] write: .cursor/agents/bkit-build-plan-current.md
[bkit-install] write: .cursor/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .cursor/agents/bkit-build-plan-tasks.md
[bkit-install] write: .cursor/agents/bkit-build-plan-tests.md
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .cursor/agents/bkit-design-generate.md
[bkit-install] write: .cursor/agents/bkit-design-organise.md
[bkit-install] write: .cursor/agents/bkit-design-review-1.md
[bkit-install] write: .cursor/agents/bkit-design-review-2.md
[bkit-install] write: .cursor/agents/bkit-design-spike.md
[bkit-install] write: .cursor/agents/bkit-design-update.md
[bkit-install] write: .cursor/agents/bkit-plan-generate.md
[bkit-install] write: .cursor/agents/bkit-plan-review-1.md
[bkit-install] write: .cursor/agents/bkit-plan-review-2.md
[bkit-install] write: .cursor/agents/bkit-plan-scope-check.md
[bkit-install] write: .cursor/agents/bkit-plan-update.md
[bkit-install] write: .cursor/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .cursor/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .cursor/agents/bkit-ship-update-docs.md
[bkit-install] write: .cursor/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .cursor/agents/bkit-utility-update-decisions.md
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .cursor/agents/bkit-utility-update-tracker.md
[bkit-install] cursor: .cursor/hooks.json
[bkit-install] cursor: .cursor/hooks/bkit-preflight.sh
[bkit-install] cursor: .cursor/rules/bkit-rules.mdc
[bkit-install] cursor: .cursor/hooks/bkit-guardrails.cjs
[bkit-install] cursor: .cursor/hooks/bkit-gateguard.cjs
[bkit-install] cursor: .cursor/hooks/bkit-readguard.cjs
[bkit-install] cursor: .cursor/mcp.json
[bkit-install] cursor: .cursor/cli.json
[bkit-install] cursor: .cursor/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write: .codex/agents/bkit-audit-generate.toml
[bkit-install] write: .codex/agents/bkit-build-challenge-1.toml
[bkit-install] write: .codex/agents/bkit-build-challenge-2.toml
[bkit-install] write: .codex/agents/bkit-build-install-skills.toml
[bkit-install] write: .codex/agents/bkit-build-plan-convert.toml
[bkit-install] write: .codex/agents/bkit-build-plan-current.toml
[bkit-install] write: .codex/agents/bkit-build-plan-gaps-remediate.toml
[bkit-install] write: .codex/agents/bkit-build-plan-tasks.toml
[bkit-install] write: .codex/agents/bkit-build-plan-tests.toml
[bkit-install] write: .codex/agents/bkit-build-plan-verify.toml
[bkit-install] write: .codex/agents/bkit-debug-abort-handover.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-diagnose.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-remediate.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-reproduce.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-soak.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-1.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-2.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-3.toml
[bkit-install] write: .codex/agents/bkit-design-generate.toml
[bkit-install] write: .codex/agents/bkit-design-organise.toml
[bkit-install] write: .codex/agents/bkit-design-review-1.toml
[bkit-install] write: .codex/agents/bkit-design-review-2.toml
[bkit-install] write: .codex/agents/bkit-design-spike.toml
[bkit-install] write: .codex/agents/bkit-design-update.toml
[bkit-install] write: .codex/agents/bkit-plan-generate.toml
[bkit-install] write: .codex/agents/bkit-plan-review-1.toml
[bkit-install] write: .codex/agents/bkit-plan-review-2.toml
[bkit-install] write: .codex/agents/bkit-plan-scope-check.toml
[bkit-install] write: .codex/agents/bkit-plan-update.toml
[bkit-install] write: .codex/agents/bkit-ship-conflict-resolve.toml
[bkit-install] write: .codex/agents/bkit-ship-deferred-sweep.toml
[bkit-install] write: .codex/agents/bkit-ship-update-docs.toml
[bkit-install] write: .codex/agents/bkit-utility-compress-markdown.toml
[bkit-install] write: .codex/agents/bkit-utility-update-decisions.toml
[bkit-install] write: .codex/agents/bkit-utility-update-deferrals.toml
[bkit-install] write: .codex/agents/bkit-utility-update-documentation.toml
[bkit-install] write: .codex/agents/bkit-utility-update-failures.toml
[bkit-install] write: .codex/agents/bkit-utility-update-knowledge.toml
[bkit-install] write: .codex/agents/bkit-utility-update-roadmap.toml
[bkit-install] write: .codex/agents/bkit-utility-update-tracker.toml
[bkit-install] write: .agents/skills/bkit-auto/SKILL.md
[bkit-install] write: .agents/skills/bkit-build/SKILL.md
[bkit-install] write: .agents/skills/bkit-debug/SKILL.md
[bkit-install] write: .agents/skills/bkit-design/SKILL.md
[bkit-install] write: .agents/skills/bkit-plan/SKILL.md
[bkit-install] write: .agents/skills/bkit-ship/SKILL.md
[bkit-install] codex: .codex/hooks.json
[bkit-install] codex: .codex/hooks/bkit-gateguard.cjs
[bkit-install] codex: .codex/hooks/bkit-readguard.cjs
[bkit-install] codex: .codex/hooks/bkit-rules.cjs
[bkit-install] codex: .codex/hooks/bkit-guardrails.cjs
[bkit-install] codex: .codex/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-update.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md
[bkit-install] antigravity: .agents/plugins/bkit/plugin.json
[bkit-install] antigravity: GEMINI.md
[bkit-install] antigravity: .agents/plugins/bkit/hooks.json
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-readguard.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-rules.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs
[bkit-install] write version pin: .bkit/version (6.2.0)
[bkit-install] Running core payload pass
[bkit-install] Running bkit docs pass
[bkit-install] Running template copies pass
[bkit-install] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-install] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-install] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] cursor: .cursor/hooks/bkit-guardrails.cjs
[bkit-install] cursor: .cursor/hooks/bkit-gateguard.cjs
[bkit-install] cursor: .cursor/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] codex: .codex/hooks/bkit-gateguard.cjs
[bkit-install] codex: .codex/hooks/bkit-guardrails.cjs
[bkit-install] codex: .codex/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs
[bkit-install] write version pin: .bkit/version (6.2.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > shared hook behaviour footprint (fresh install and upgrade) > upgrades shipped registrations without dropping consumer hook groups or permissions
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
[bkit-install] template added: .bkit/templates/.oxlintrc.json
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
[bkit-install] template added: .bkit/templates/docs/architecture.md
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/docs/components.md
[bkit-install] template added: .bkit/templates/docs/data-schema.md
[bkit-install] template added: .bkit/templates/docs/deployments.md
[bkit-install] template added: .bkit/templates/docs/design.md
[bkit-install] template added: .bkit/templates/docs/noise.md
[bkit-install] template added: .bkit/templates/docs/observability.md
[bkit-install] template added: .bkit/templates/docs/security.md
[bkit-install] template added: .bkit/templates/docs/setup.md
[bkit-install] template added: .bkit/templates/docs/technology.md
[bkit-install] template added: .bkit/templates/docs/testing.md
[bkit-install] template added: .bkit/templates/lintstagedrc.example.json
[bkit-install] template added: .bkit/templates/prettierignore.example
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
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
[bkit-install] write: .cursor/commands/bkit-auto.md
[bkit-install] write: .cursor/commands/bkit-build.md
[bkit-install] write: .cursor/commands/bkit-debug.md
[bkit-install] write: .cursor/commands/bkit-design.md
[bkit-install] write: .cursor/commands/bkit-plan.md
[bkit-install] write: .cursor/commands/bkit-ship.md
[bkit-install] write: .cursor/agents/bkit-audit-generate.md
[bkit-install] write: .cursor/agents/bkit-build-challenge-1.md
[bkit-install] write: .cursor/agents/bkit-build-challenge-2.md
[bkit-install] write: .cursor/agents/bkit-build-install-skills.md
[bkit-install] write: .cursor/agents/bkit-build-plan-convert.md
[bkit-install] write: .cursor/agents/bkit-build-plan-current.md
[bkit-install] write: .cursor/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .cursor/agents/bkit-build-plan-tasks.md
[bkit-install] write: .cursor/agents/bkit-build-plan-tests.md
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .cursor/agents/bkit-design-generate.md
[bkit-install] write: .cursor/agents/bkit-design-organise.md
[bkit-install] write: .cursor/agents/bkit-design-review-1.md
[bkit-install] write: .cursor/agents/bkit-design-review-2.md
[bkit-install] write: .cursor/agents/bkit-design-spike.md
[bkit-install] write: .cursor/agents/bkit-design-update.md
[bkit-install] write: .cursor/agents/bkit-plan-generate.md
[bkit-install] write: .cursor/agents/bkit-plan-review-1.md
[bkit-install] write: .cursor/agents/bkit-plan-review-2.md
[bkit-install] write: .cursor/agents/bkit-plan-scope-check.md
[bkit-install] write: .cursor/agents/bkit-plan-update.md
[bkit-install] write: .cursor/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .cursor/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .cursor/agents/bkit-ship-update-docs.md
[bkit-install] write: .cursor/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .cursor/agents/bkit-utility-update-decisions.md
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .cursor/agents/bkit-utility-update-tracker.md
[bkit-install] cursor: .cursor/hooks.json
[bkit-install] cursor: .cursor/hooks/bkit-preflight.sh
[bkit-install] cursor: .cursor/rules/bkit-rules.mdc
[bkit-install] cursor: .cursor/hooks/bkit-guardrails.cjs
[bkit-install] cursor: .cursor/hooks/bkit-gateguard.cjs
[bkit-install] cursor: .cursor/hooks/bkit-readguard.cjs
[bkit-install] cursor: .cursor/mcp.json
[bkit-install] cursor: .cursor/cli.json
[bkit-install] cursor: .cursor/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-update.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md
[bkit-install] antigravity: .agents/plugins/bkit/plugin.json
[bkit-install] antigravity: GEMINI.md
[bkit-install] antigravity: .agents/plugins/bkit/hooks.json
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-readguard.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-rules.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs
[bkit-install] write version pin: .bkit/version (6.2.0)
[bkit-install] Running core payload pass
[bkit-install] Running bkit docs pass
[bkit-install] Running template copies pass
[bkit-install] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] cursor: .cursor/bkit-cloud.md (generated — gitignored, holds resolved secrets)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > shared hook behaviour footprint (fresh install and upgrade) > upgrades a shipped Claude edit group without dropping a consumer hook inside it
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
[bkit-install] template added: .bkit/templates/.oxlintrc.json
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
[bkit-install] template added: .bkit/templates/docs/architecture.md
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/docs/components.md
[bkit-install] template added: .bkit/templates/docs/data-schema.md
[bkit-install] template added: .bkit/templates/docs/deployments.md
[bkit-install] template added: .bkit/templates/docs/design.md
[bkit-install] template added: .bkit/templates/docs/noise.md
[bkit-install] template added: .bkit/templates/docs/observability.md
[bkit-install] template added: .bkit/templates/docs/security.md
[bkit-install] template added: .bkit/templates/docs/setup.md
[bkit-install] template added: .bkit/templates/docs/technology.md
[bkit-install] template added: .bkit/templates/docs/testing.md
[bkit-install] template added: .bkit/templates/lintstagedrc.example.json
[bkit-install] template added: .bkit/templates/prettierignore.example
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
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
[bkit-install] write version pin: .bkit/version (6.2.0)

 ✓ .bkit/core/engine/install/modules/core.integration.test.ts (165 tests) 18457ms
   ✓ bkit canonical docs pass (runBkitDocs, #218) (6)
     ✓ force-overwrites the package .bkit/*.md docs into the consumer's .bkit/, rendered 370ms
     ✓ keeps install tokens literal in the docs, resolving only the managed marker 300ms
     ✓ writes .bkit/LICENSE.md with the full MIT text and copyright notice 439ms
     ✓ is idempotent: a second core run writes none of the docs again 448ms
   ✓ deterministic bookkeeping contracts in a fresh consumer (1)
     ✓ installs and upgrades fresh consumers with deterministic bookkeeping contracts 8537ms
   ✓ shared hook behaviour footprint (fresh install and upgrade) (3)
     ✓ installs and upgrades shared hook behavior without replacing owned drivers 576ms
     ✓ upgrades shipped registrations without dropping consumer hook groups or permissions 593ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (101 tests) 10322ms
   ✓ bkit issues comment (33)
     ✓ renders header fields in the order the flags were given 434ms
   ✓ bkit issues comment --post (7)
     ✓ renders audit comments from validated result and preserves tracker adapters 478ms
   ✓ bkit issues comment workflow-run proof (7)
     ✓ checks the run proof before skipping an issue-less call 316ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 581ms
 ✓ .bkit/core/engine/audits/templates/auto-route-marker.integration.test.ts (25 tests) 19537ms
   ✓ bkit [auto route] marker comes from the re-read labels (25)
     ✓ bkit-build.md held close (6)
       ✓ threads the marker onto the close subject when the issue carries bkit:auto 2197ms
       ✓ leaves the subject unchanged when bkit:auto is absent 1815ms
       ✓ does not arm the route on the near-miss label bkit:auto-paused 1337ms
       ✓ does not arm the route on the near-miss label no-bkit:auto 1185ms
       ✓ leaves the subject unchanged when no labels are passed 1196ms
     ✓ bkit-build.md publish close (6)
       ✓ threads the marker onto the close subject when the issue carries bkit:auto 1230ms
       ✓ leaves the subject unchanged when bkit:auto is absent 1242ms
       ✓ does not arm the route on the near-miss label bkit:auto-paused 1180ms
       ✓ does not arm the route on the near-miss label no-bkit:auto 1237ms
       ✓ leaves the subject unchanged when no labels are passed 1247ms
     ✓ bkit-debug.md publish close (6)
       ✓ threads the marker onto the close subject when the issue carries bkit:auto 1130ms
       ✓ leaves the subject unchanged when bkit:auto is absent 1095ms
       ✓ does not arm the route on the near-miss label bkit:auto-paused 1122ms
       ✓ does not arm the route on the near-miss label no-bkit:auto 1213ms
       ✓ leaves the subject unchanged when no labels are passed 1092ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 23316ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ github reads "please do #12 today" as issue 12 545ms
     ✓ github reads "<id>12</id>" as issue 12 502ms
     ✓ github reads "<github_issue>12</github_issue>" as issue 12 373ms
     ✓ linear with no key configured: a bare key names no issue, with a hint naming bkit.tracker.linear.team 332ms
     ✓ jira with no key configured: a bare key names no issue, with a hint naming bkit.tracker.jira.project 451ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 1045ms
   ✓ bkit fids resolve (12)
     ✓ 2. the current feat/ branch, when it embeds the issue 302ms
     ✓ 3. a FID logged for the issue on origin/dev, even when the working tree lacks it 318ms
     ✓ 4. mints from the title file; a JSON file with a title key also works 414ms
     ✓ 4. a stopword-only title falls back to the prompt; non-ASCII titles fold 361ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 319ms
   ✓ bkit fids design --description-file --prompt-file (5)
     ✓ a plan issue's Workstreams line lists the workstreams the plan covers 728ms
     ✓ none: no link and no own design doc (exit 1, nulls); a named audit path must exist 373ms
 ✓ .bkit/core/engine/commands/workflow/progress.integration.test.ts (12 tests) 12961ms
   ✓ workflow progress command wiring (12)
     ✓ progress uses saved cross-run soak attempts and grants 602ms
     ✓ progress loop attempts and grants 1774ms
     ✓ workflow progress command wiring progress specialized completion producers 5096ms
     ✓ workflow progress command wiring progress gate only completions 860ms
     ✓ progress excludes noncompletions 3281ms
 ✓ .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts (3 tests) 14021ms
   ✓ the planned-test lock across groups (1)
     ✓ a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed 3872ms
   ✓ a takeover of an earlier task's planned test (2)
     ✓ a takeover across groups lets the next code step finish 2837ms
     ✓ a mid-build contradiction adds a takeover task and the next code step finishes 7309ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 13248ms
   ✓ normFlag (11)
     ✓ "yes" -> true 375ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 538ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 359ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 732ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 445ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 511ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 480ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 682ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 388ms
     ✓ LOCAL -> runtimeHeadless=false 327ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 434ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 673ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 308ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 407ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 519ms
     ✓ re-derives per call: one run's answer does not leak into the next 809ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 325ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 398ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 398ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 469ms
     ✓ --file into a missing directory is refused, not created 475ms
 ✓ .bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts (5 tests) 12622ms
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 1236ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 923ms
     ✓ stops the step when the command crashed or was misused 1299ms
   ✓ deferred landing of a held build (ship, matrix: held → landed) (2)
     ✓ ship pushes the held branch and opens a dev PR 2850ms
     ✓ ship gates on CI and merges the pinned head 6311ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (26 tests) 4142ms
   ✓ publication ownership lock (4)
     ✓ reclaims only a proven dead matching process identity 382ms
 ✓ .bkit/core/engine/commands/lib.test.ts (76 tests) 4805ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1340ms
     ✓ runGit names ENOBUFS when output passes the limit 866ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 846ms
   ✓ explicit invocation context (2)
     ✓ rejects stale cross-worktree invocation and conflicting overrides 414ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (77 tests) 3803ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (44 tests) 5076ms
   ✓ bkit challenge gate (6)
     ✓ challenge gate writes a challenge-gate row 679ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1193ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 420ms
     ✓ challenge gate without --base sizes only the branch's own lines 610ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (46 tests) 3815ms
   ✓ bkit tasks currency (6)
     ✓ currency matches a task on a moved symbol 448ms
     ✓ currency leaves run logs out: a symbol named only in another plan's log matches no task 333ms
     ✓ currency emits no hunk outside the matched set 458ms
     ✓ currency exits 0 with no hunks when no task matches 457ms
     ✓ currency judges base...against (origin/dev), not base...HEAD 636ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (52 tests) 2614ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (85 tests) 3401ms
   ✓ bkit counters route --point (9)
     ✓ takes each point's default limit and asks when nothing is set 655ms
   ✓ bkit counters progress (19)
     ✓ judges codeChanged on source only, from the rounds' parent commits 385ms
     ✓ judges codeChanged between the compared same-scope rounds 422ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (104 tests) 3684ms
   ✓ bkit status invocation (7)
     ✓ binds group and attempt and registers setup, remediation and ship steps 413ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (301 tests) 670ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (79 tests) 1879ms
 ✓ .bkit/core/engine/ledgers/journal.test.ts (18 tests) 593ms
 ✓ .bkit/core/engine/audits/workflows/workflow-archive-snippet.integration.test.ts (6 tests) 1855ms
   ✓ design close: archive before overwrite (4)
     ✓ writes the canonical with no archive when there was no previous design 318ms
     ✓ does not archive when the design is unchanged 305ms
     ✓ archives into the feature's own bucket, not the current month 326ms
   ✓ plan close: archive before overwrite (2)
     ✓ runs under zsh for a plan with a superseded canonical 309ms
     ✓ does not archive when the plan is unchanged 321ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (48 tests) 2295ms
   ✓ runLines (5)
     ✓ counts code, tests and docs apart, and leaves out plans, run logs and the ledgers 341ms
     ✓ counts deleted lines into changed 351ms
     ✓ cuts at each merge on the first-parent chain, so merged-in work is not counted 641ms
     ✓ is null when first is not an ancestor of last, or either is missing 456ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 141ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 254ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (20 tests) 365ms
   ✓ ledger operation effect (1)
     ✓ the row block is stored once per operation 319ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (326 tests) 785ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (71 tests) 264ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (73 tests) 124ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 78ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 65ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 43ms

 Test Files  51 passed (51)
      Tests  4190 passed (4190)
   Start at  12:14:17
   Duration  620.93s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/811-publish-dev-refused/build-holistic-gate-2.log.reports/vitest-77776.xml

[bkit:gate:changed] named: bats tests/shell/bkit-status-holes-sweep.bats
1..2
ok 1 the sweep prints the summary line the lane greps for
ok 2 the lane's grep pattern rejects output without the summary line

[bkit:gate:changed] format: prettier --check --ignore-unknown docs/plans/202611/logs/811-publish-dev-refused/build-plan-gaps-remediate-holistic-1-1-log.md docs/plans/202611/logs/811-publish-dev-refused/build-plan-verify-holistic-1-2.md docs/plans/202611/logs/811-publish-dev-refused/status.jsonl
Checking formatting...
All matched files use Prettier code style!

[bkit:gate:changed] every stage passed
> [bkit] 1 over-long line was shortened; it says so inline.
> [bkit] TRUNCATED — kept 2434 of 12536 lines (173 KB of 847 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
