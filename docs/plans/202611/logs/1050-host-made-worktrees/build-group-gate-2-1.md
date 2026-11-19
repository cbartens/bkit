
> @cbartens/bkit@6.2.0 bkit:gate:changed /Users/christian/Documents/GitHub/bkit/.worktrees/1050-host-made-worktrees
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs .bkit/core/engine/commands/workflow/worktrees.integration.test.ts .bkit/core/engine/commands/workflow/worktrees.test.ts .bkit/core/engine/commands/workflow/worktrees.ts dist/commands/workflow/worktrees.js docs/plans/202611/1050-host-made-worktrees-plan.md docs/plans/202611/logs/1050-host-made-worktrees/build-brief-2-1.md docs/plans/202611/logs/1050-host-made-worktrees/build-brief-tests-2-1.md docs/plans/202611/logs/1050-host-made-worktrees/build-diff-2-1.md docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tasks-2-log.md docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tests-2-log.md docs/plans/202611/logs/1050-host-made-worktrees/build-plan-verify-2-1.md docs/plans/202611/logs/1050-host-made-worktrees/build-tests-green-2-1.md docs/plans/202611/logs/1050-host-made-worktrees/build-tests-red-2-1.md


[bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/engine/commands/workflow/worktrees.integration.test.ts .bkit/core/engine/commands/workflow/worktrees.test.ts .bkit/core/engine/commands/workflow/worktrees.ts dist/commands/workflow/worktrees.js docs/plans/202611/1050-host-made-worktrees-plan.md docs/plans/202611/logs/1050-host-made-worktrees/build-brief-2-1.md docs/plans/202611/logs/1050-host-made-worktrees/build-brief-tests-2-1.md docs/plans/202611/logs/1050-host-made-worktrees/build-diff-2-1.md docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tasks-2-log.md docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tests-2-log.md docs/plans/202611/logs/1050-host-made-worktrees/build-plan-verify-2-1.md docs/plans/202611/logs/1050-host-made-worktrees/build-tests-green-2-1.md docs/plans/202611/logs/1050-host-made-worktrees/build-tests-red-2-1.md

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1050-host-made-worktrees

 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (232 tests) 97985ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 2848ms
   ✓ preserves the requested event for selected-workflow verification 1463ms
   ✓ requires selected other-workflow success at the exact pushed head 2770ms
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 2783ms
     ✓ saves the failed job count without the capstone job 920ms
     ✓ a CI selection keeps the failed job names, capstone left out 1569ms
     ✓ counts the capstone job when it is the only failed job 783ms
     ✓ saves no failed job count when no job failed 617ms
     ✓ filters branch and PR discovery by configured workflow and exact head 904ms
     ✓ freezes explicit workflow run attempt and all failed job pages 725ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2287ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2165ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 934ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 669ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 596ms
     ✓ rejects a workflow result count smaller than its returned records 470ms
   ✓ bkit runs gate (74)
     ✓ refuses green CI when dev advanced beyond the validated code head 1554ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1661ms
     ✓ checks the named repository base and fails closed on missing evidence 828ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 750ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 859ms
     ✓ rejects MCP capstone jobs belonging to another run 1015ms
     ✓ --fetch refreshes origin/<branch> before gating 434ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 435ms
       ✓ a source change past the validated head refuses (17) and names the path 427ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 452ms
       ✓ a validated sha that is not an ancestor refuses (17) 305ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 557ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 446ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1075ms
   ✓ bkit runs dispatch (21)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 673ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1439ms
     ✓ a failed re-trigger push names the cause in the log 1318ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 1392ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1587ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 893ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 355ms
     ✓ gh-error: every poll errored 393ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 793ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 814ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 522ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 879ms
     ✓ a hand-off in the re-poll resumes from the saved receipt with no second re-trigger commit 1217ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 467ms
     ✓ CLI: verdict JSON, body scan, exit codes 1430ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 559ms
     ✓ CLI: dispatch without a run's invocation is refused, and nothing is polled or committed 388ms
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 340ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 348ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 352ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 312ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 1149ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 1229ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 1523ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1547ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 527ms
     ✓ re-trigger on dev only uses the record of its own FID 567ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 758ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 693ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (15)
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 364ms
     ✓ --snapshot scopes its run list and dev lookups to --repo 309ms
     ✓ --wait (4)
       ✓ waits for a run still going at the squash commit, then judges and records it 1367ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 363ms
       ✓ without --repo no call gains a --repo flag 410ms
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 2209ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 367ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 339ms
   ✓ bkit runs context (21)
     ✓ BRIEF phases take the argument as the issue 459ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 513ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 420ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 331ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 308ms
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 673ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 778ms
     ✓ debug: a failure test run is a failed run 1079ms
     ✓ debug: a timed_out test run is a failed run 807ms
     ✓ debug: a startup_failure test run is a failed run 713ms
     ✓ debug: a test run still in progress or cancelled is not returned 777ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 858ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 718ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1967ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 615ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 531ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 654ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 823ms
     ✓ --file and --step go together 665ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 4314ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 547ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 541ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 605ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 638ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 648ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 638ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 685ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run on a suppressed re-trigger 669ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found on a suppressed re-trigger 830ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (63 tests) 150325ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 6760ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 21321ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 1399ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 1128ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 1024ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1522ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1670ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 2255ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1377ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 734ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 350ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 1369ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 1183ms
     ✓ design installs dependencies like build and debug 1367ms
     ✓ plan installs dependencies like build and debug 981ms
     ✓ design stops on a failed install (5) 904ms
     ✓ plan stops on a failed install (5) 935ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1008ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1170ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 833ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1135ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 2841ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 3442ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 4170ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 2336ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 2641ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 3093ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2366ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 2549ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 1742ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 2114ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 3009ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 2778ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 3243ms
     ✓ commits leftovers when a copy entry points outside the checkout 3633ms
     ✓ never commits the entries setup copies in from the main checkout 2342ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 2244ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 1150ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 1463ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 1752ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 2217ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 2515ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 2108ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 1645ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 1897ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 2005ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 1090ms
     ✓ leaves a clean worktree's history alone 2306ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 2601ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 3093ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 3146ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 3897ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 5446ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 4765ms
     ✓ does not mark a resumed worktree it did not create 1429ms
   ✓ bkit worktrees setup — a host-made worktree on feat/{fid} (2)
     ✓ plan from a host-made worktree on feat/{fid} adopts it without rebasing 1186ms
     ✓ refuses plan from a host-made worktree whose branch carries unpushed dev work 898ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adopts the session branch in place when there is no worktree and no feat/{fid} 617ms
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 982ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 1880ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 2573ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 1298ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (193 tests) 175610ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 779ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 3231ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 413ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 441ms
     ✓ writes no limits for a workflow with no ask point 646ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 505ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 546ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 478ms
       ✓ a new run in the same chat gets its own session row 847ms
       ✓ writes none outside Claude Code 547ms
     ✓ opens the next run after a finished one, and after another workflow's run 487ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 619ms
     ✓ design / plan / build / debug book in the current worktree 550ms
     ✓ refuses when the lock is live, writing no row 404ms
     ✓ --lock-held checks the lock is ours 565ms
     ✓ rejects an unknown workflow 307ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 493ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 503ms
   ✓ bkit workflows start — resume facts (12)
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 432ms
     ✓ openDecision gate is null without the header 309ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 392ms
     ✓ writes no row when status.jsonl does not exist 456ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 527ms
     ✓ aborts a rebase only when one is in progress 1297ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 721ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 806ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 393ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 461ms
     ✓ --max-exceeded says a handover is due without any sentinel 361ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 446ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 495ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 697ms
     ✓ a debug run in SOAK mode always needs a handover 363ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 696ms
       ✓ counts subagents of an earlier chat the run's session rows name 603ms
       ✓ records no context block, and still closes, outside a Claude Code session 612ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 616ms
     ✓ records ending held and publish false on the workflow-done row 611ms
     ✓ defaults the close row to ending done 610ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 637ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 560ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 532ms
     ✓ always writes the telemetry, whatever the runtime 540ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 368ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 522ms
     ✓ an unwritable stats path is logged and never fails the close 414ms
     ✓ appends the completeness row before the workflow-done row 656ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 603ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 611ms
     ✓ writes one completeness row per close 826ms
     ✓ leaves out the previous run's rows that share a second with this run's start 434ms
     ✓ still closes when the completeness check throws 544ms
     ✓ still closes when the completeness row write throws 542ms
     ✓ ship: run.pr, size of the squash commit, and coverage 611ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 770ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 488ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 365ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 568ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 460ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 659ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1197ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 924ms
     ✓ --record-step writes the close step's row before workflow-done 612ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 684ms
     ✓ --number without --outbox is a usage error 561ms
   ✓ bkit workflows handover (32)
     ✓ --push commits and pushes the record on the feature branch without a handover 690ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 622ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 787ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 735ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 531ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 321ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1658ms
     ✓ --flush with nothing to record commits and pushes nothing 861ms
     ✓ --flush carries the named worktree's logs into the dev commit 2133ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 2700ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 2554ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 2835ms
     ✓ closePr titles the PR by the record it carries 2798ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 674ms
       ✓ ship's owner Stop on an open PR: exit 9, push skipped → route stop with the not-pushed line 568ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 974ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 694ms
       ✓ --ref, no push → route stop, no message 399ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 1460ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2326ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 3142ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1898ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2692ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1906ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2035ms
     ✓ --push on dev never carries a row whose references name another feature 2505ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2196ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 4962ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2270ms
     ✓ --push commits in the named worktree, not the checkout it runs from 893ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 2528ms
     ✓ preserves unlanded file deletions and ledger additions on close 6144ms
     ✓ preserves dirty work and uncertain branch evidence during close 5152ms
     ✓ preserves a local feature ref changed after its cleanup proof 4228ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2421ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1787ms
     ✓ a close that landed releases the lock 2498ms
     ✓ removes the worktree before it releases the lock 2209ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3180ms
       ✓ closePr refuses when the PR base is unknown 3778ms
     ✓ leaves a worktree no workflow created, and its branch, in place 3839ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 323ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 354ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 398ms
     ✓ names the branch, not the remote-tracking ref, in each URL 397ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 367ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 303ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 2098ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 524ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 1238ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 640ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 606ms
     ✓ a second run's record does not let this FID's close commit 885ms
     ✓ record is present after workflows close and before the push 1582ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 3107ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 2849ms
       ✓ a run closed by workflow-failed keeps no parked copy 3237ms
       ✓ a run closed by workflow-done keeps no parked copy 2587ms
       ✓ a FAILED run gets no row 2309ms
       ✓ a DONE run gets no row 2653ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2727ms
   ✓ bkit workflows input (10)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 527ms
     ✓ --plan is appended when the file exists and skipped when it does not 307ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 669ms
     ✓ a rebuilt design input keeps the owner-interview record appended after the first build 362ms
     ✓ a grill file that was never appended is appended once, after a blank line 304ms
     ✓ a workflow with no grill file writes exactly the sections 385ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 913ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 650ms
     ✓ puts each --line after the summary, in flag order 663ms
     ✓ --summary prints the file and keeps a copy in --outbox 1224ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 1334ms
   ✓ bkit workflows start — the run's progress link (3)
     ✓ start with --session-dir writes the session's link as progress on the workflow-started row 335ms
     ✓ a resumed start with another session keeps the run's first link 460ms
     ✓ start with a session folder that holds no progress id writes the row without progress and records association friction 348ms
 ✓ .bkit/core/engine/audits/repo/test-file-script.integration.test.ts (17 tests) 79879ms
   ✓ bkit:test:file runs every test file kind into a JUnit report (9)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs reports its named test passed 15270ms
     ✓ bats — tests/shell/bkit-gh-stub.bats reports its named test passed 2664ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs reports its named test passed 1826ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… reports its named test passed 1334ms
     ✓ node — with no report path the test file is left as it was 13365ms
     ✓ bats — with no report path the test file is left as it was 3498ms
     ✓ node — with no report path the test file is left as it was 3615ms
     ✓ vitest — with no report path the test file is left as it was 1339ms
     ✓ a run naming files of two kinds is refused as a usage error 723ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 945ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 1285ms
   ✓ bkit:lint:file passes a test file its linter does not cover (4)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs lints clean 678ms
     ✓ bats — tests/shell/bkit-gh-stub.bats lints clean 552ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs lints clean 1128ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… lints clean 717ms
   ✓ bkit:test:file ends a node --test file whose test awaits a child that never exits (1)
     ✓ node — a test awaiting a child that never exits fails within the limit 30933ms
 ✓ .bkit/core/engine/commands/land.test.ts (45 tests) 60539ms
   ✓ pushToDev (31)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1592ms
     ✓ runs code.ts through its declared gate in the built checkout 1478ms
     ✓ runs code.ts through its declared gate in the built checkout 1546ms
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 1683ms
     ✓ runs an audit template's project-section change through bkit:gate:min 1679ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1186ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1347ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1438ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 727ms
     ✓ runs the full gate for replayed debug code 1224ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1805ms
     ✓ installs local dependencies against the built target tree 1632ms
     ✓ runs the configured frozen install even without root dependencies 1734ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1606ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1760ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1760ms
     ✓ never pushes local dev commits missing from origin/dev 1917ms
     ✓ dev moved: rebuilds on the new dev and pushes again 3215ms
     ✓ dev moved before every push: exhausted, nothing landed 4848ms
     ✓ any other refusal is returned, not retried 2191ms
     ✓ pushToDev replays a commit range onto origin/dev 1937ms
     ✓ a replay retries on the new dev when dev moved 3860ms
     ✓ pushToDev log line names what it lands 1784ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1998ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2058ms
     ✓ a push that fails without a server answer is returned once, never retried 1774ms
     ✓ a failed fetch is returned before anything is built 825ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 3343ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2298ms
     ✓ lands from a clone whose fetch refspec omits dev 3275ms
     ✓ build throwing stops the landing and removes the throwaway checkout 998ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (101 tests) 98908ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 514ms
     ✓ adopts the main checkout even when called from a linked worktree 479ms
     ✓ design and plan in place on main are refused 351ms
     ✓ still adopts a cloud session branch whose upstream is main 317ms
   ✓ bkit worktrees setup — adopt the checkout the session is already on (7)
     ✓ adopts the linked worktree already on feat/{fid} for design, plan, build and debug 1744ms
     ✓ ship run from a linked worktree on its target branch adopts that worktree 434ms
     ✓ the adopted linked worktree holds the log directory 402ms
     ✓ refuses design, plan and build in place in the main checkout on feat/{fid} under --worktrees 400ms
     ✓ refuses design, plan and build in place in a submodule's main checkout on feat/{fid} 1849ms
     ✓ says so when the adopted worktree has no hooks directory 1090ms
     ✓ a plan session on another branch still mints .worktrees/{fid} 880ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1389ms
     ✓ may debug in place on dev 520ms
     ✓ adopts in place when the session is already on feat/{fid} 356ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (26)
     ✓ in-place debug on dev writes the shared-checkout record 1164ms
     ✓ debug in place on dev from a linked worktree records its own checkout 1192ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1255ms
     ✓ a new run of the same FID rewrites startSha 1786ms
     ✓ a resume of the same FID reuses the record 1637ms
     ✓ a resume with no record rebuilds it from the run-commits row (17)
       ✓ restores the commits, the pushed list and startSha of the newest row 3145ms
       ✓ drops a commit id that is not on the branch 2129ms
       ✓ keeps the fresh startSha when the row's startSha is not a commit 1576ms
       ✓ writes an empty commit list when the run has no run-commits row 1847ms
       ✓ ignores a row from before the open run started 1798ms
       ✓ restores the commits from the row on origin/dev when the handover landed 2498ms
       ✓ restores the commits when origin/dev holds only the lines the checkout lacks 2344ms
       ✓ ignores the row on origin/dev when the checkout's log shows the run closed 2018ms
       ✓ ignores the row on origin/dev when the run there is closed 2382ms
       ✓ from the parked local copy (8)
         ✓ restores commits, pushed and startSha when no copy of the row is reachable 1745ms
         ✓ wins over the row on origin/dev, which is then not needed 2576ms
         ✓ wins over the row in the checkout's own log while the run is open 2138ms
         ✓ still drops a commit id that is not on the branch 2179ms
         ✓ is ignored and removed when the checkout's log shows the run closed 2066ms
         ✓ is ignored when it was parked for another workflow 2528ms
         ✓ is removed once the record is rebuilt 2106ms
         ✓ is removed when the live record already stands for the open run 2073ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 900ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 899ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1258ms
     ✓ a stale record without a lock is replaced 1300ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1130ms
     ✓ refuses inherited unpublished dev commits in every ship mode 3639ms
     ✓ names inherited commits and ship recovery in the refusal 1022ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1248ms
     ✓ ship names a missing feat branch 442ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1220ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 373ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 450ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 364ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 594ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 543ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 385ms
     ✓ never commits an entry only the main checkout's copy list names 423ms
   ✓ bkit worktrees remove (20)
     ✓ preserves a marked worktree with uncommitted changes and its marker 509ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 358ms
     ✓ tells a caller inside the removed worktree where to cd 450ms
     ✓ fails with its own exit code when git cannot remove a marked path 317ms
     ✓ --branch (14)
       ✓ preserves staged-only content during landed cleanup 1478ms
       ✓ preserves staged-only mode during landed cleanup 1417ms
       ✓ preserves staged-only type during landed cleanup 1760ms
       ✓ preserves staged-only deletion during landed cleanup 1652ms
       ✓ removes landed staged content when both index and working contents are on dev 1503ms
       ✓ deletes the proved local and remote branch at their landed tips 2183ms
       ✓ retains the remote branch when origin refuses its conditional deletion 2507ms
       ✓ removes the worktree and local branch when a later dev commit changed the branch's file 2628ms
       ✓ deletes the remote branch when a later dev commit changed the branch's file 2635ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 720ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 665ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 339ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 585ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1314ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (215 tests) 89423ms
   ✓ CI evidence test rounds (5)
     ✓ runs local gates only after current-generation remediation or soak 1025ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 608ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 466ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 530ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 479ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 457ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 472ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 441ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 388ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 608ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 443ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 467ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 446ms
     ✓ PASS is 0 failures with or without reports 694ms
     ✓ clears a previous attempt's reports before the gate runs 438ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 482ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 486ms
     ✓ a log under the outbox is named main-checkout relative in the record 518ms
     ✓ a log small enough is copied whole: not clamped, raw null 442ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 432ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1104ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 571ms
     ✓ numbers runs within the workflow's active run and per step 1247ms
     ✓ tests run --file records the tested snapshot on its test-run row 553ms
     ✓ a FAIL test-run row records each failing case as file and name 670ms
     ✓ a PASS test-run row records no failed tests 1048ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 568ms
     ✓ without --file no row is written and the output carries row null 470ms
   ✓ bkit tests run --changed-since (17)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 826ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 689ms
     ✓ changed-since with no changed files writes a PASS row and runs nothing 358ms
     ✓ the nothing-to-run row records the tested snapshot 399ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 1473ms
     ✓ --since-pass-of skips failing runs and steps it does not name 1587ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 1403ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 903ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 846ms
     ✓ changed-since refuses a sha that names no commit 334ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 1105ms
     ✓ a deleted file that no file mentions passes and the log says so 569ms
     ✓ a failed importer search runs the whole check 874ms
     ✓ --changed-since=feature-base starts at the feature's start commit 1038ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 793ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 721ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 689ms
     ✓ a failing required push gate leaves the failed marker 670ms
     ✓ uncommitted code blocks the receipt until it is committed 968ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 749ms
     ✓ only the required push gate records a receipt 778ms
     ✓ a gate that gave up on the tests lock exits 81 from the status file and records no receipt 1067ms
   ✓ bkit tests red / green (49)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1002ms
     ✓ a planned test that passes is a vacuous gap, exit 1 983ms
     ✓ a planned test absent from a loaded report is a missing gap 827ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1316ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1020ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 360ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 922ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 737ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 856ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1402ms
     ✓ red keeps a test standing whose lines match a code step's recorded change 750ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1322ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1454ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1032ms
     ✓ takeover (8)
       ✓ tests red records a failing takeover as red with from 909ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 1181ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 1311ms
       ✓ tests red records from as the owner when an unbuilt task between the two names the test 1178ms
       ✓ tests green lists a takeover whose nearest earlier task has no red as taken over from the owner 1108ms
       ✓ tests red records no from when no earlier task naming the test has a baseline 1134ms
       ✓ a resumed tests red skips a taken-over entry 963ms
       ✓ tests green lists takenOver and never counts it as a gap or unproven 1241ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1151ms
     ✓ green: a passed-accepted test is already landed, not a gap 826ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 831ms
     ✓ tests a code step changed (7)
       ✓ green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap 852ms
       ✓ green gives each changed test the line diff of its own lines since its baseline and whether it is additive 1308ms
       ✓ green leaves a changed test the plan no longer names out of changed 972ms
       ✓ green leaves a test out of changed when a later red replaced the code step's change 985ms
       ✓ green lists a changed test when test-first is not enforced 316ms
       ✓ green gives a changed test whose red recorded its file missing every line of the test as added 731ms
       ✓ green prints an empty changed list and no Changed by a code step section when no code step changed a test 2275ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 410ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 859ms
     ✓ green: --group audits only that group's tasks 716ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 941ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1234ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1012ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 968ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 1110ms
     ✓ green: lists each gap kind, with the runner output 826ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1581ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 641ms
       ✓ green clears an exception-only task from a human commit 478ms
 ✓ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts (10 tests) 52049ms
   ✓ the push of a debug run in place on dev sends only the run's commits (4)
     ✓ push from an ahead local dev lands only the run commits 7376ms
     ✓ a foreign commit made mid-run never reaches the remote 7053ms
     ✓ feature-mode push on dev with a record never pushes the foreign commit 6590ms
     ✓ push from a level local dev is a plain push 3124ms
   ✓ the dev push lands on a moved origin and only with the run's own record (3)
     ✓ a local dev one remote commit behind origin/dev lands by replay, not a rejected push 6810ms
     ✓ with the record gone, the dev push refuses and the foreign commit stays local 4373ms
     ✓ two records on dev: each push selects its own FID's commits 6041ms
   ✓ the commits of a debug run in place on dev carry only the run's own paths (3)
     ✓ foreign staged and untracked files survive a run commit 2539ms
     ✓ close commit tree excludes foreign files 3997ms
     ✓ debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not 4142ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (130 tests) 47798ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (28)
     ✓ modified ledger under the FID logdir is staged and committed 686ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 586ms
     ✓ brand-new untracked ledger is staged and committed 544ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 641ms
     ✓ path containing a space is staged and committed 750ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 488ms
     ✓ staging failure: exit 4 and no commit is created, no false success 409ms
     ✓ a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit 644ms
     ✓ a --fid that climbs out of the log folder is refused and commits nothing 304ms
     ✓ a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit 621ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 448ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 402ms
     ✓ --mode=stage stages the sweep but creates no commit 483ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 1619ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 824ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 907ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 481ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 350ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 318ms
     ✓ --root defaults to the working directory 463ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 749ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 617ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 549ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 573ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 487ms
     ✓ a path outside the checkout exits 6 with nothing committed 509ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 482ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (7)
     ✓ stageTrackedUpdates skips recorded paths 883ms
     ✓ --path records its commit on the run's record, like every other commit mode 856ms
     ✓ a recorded ledger commits only the rows the run appended 1311ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 1264ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 1421ms
     ✓ commitBookkeeping refuses when a recorded path changed 807ms
     ✓ a recorded tracked lock deleted during an in-place run does not refuse the bookkeeping commit 861ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 867ms
     ✓ under --mode=commit counts the squashed paths as something to commit 862ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 722ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 329ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 540ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 377ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 405ms
   ✓ bkit ledgers only-bookkeeping (8)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 511ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 801ms
     ✓ a source file in the range: exit 7, path listed 555ms
     ✓ only-bookkeeping refuses a wildcard or climbing --fid instead of passing a source change 353ms
     ✓ only-bookkeeping refuses --month=* from the command line 363ms
     ✓ another FID's plan file in the range: exit 7 539ms
     ✓ from not an ancestor of to: exit 7 424ms
   ✓ bkit ledgers append (24)
     ✓ append refuses a supplied schema or bkit 354ms
   ✓ bkit ledgers triage (11)
     ✓ triage refuses a plan whose task blocks do not parse 318ms
   ✓ bkit ledgers append --invocation (7)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 847ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 609ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 618ms
     ✓ lands a standalone corrected candidate and reports the spend 329ms
     ✓ the correction-events file has mode 0600 332ms
     ✓ a correction-events file left at 0644 is 0600 after a corrected append 347ms
     ✓ issues the same operation for rows whose keys are reordered 368ms
   ✓ bkit ledgers append --operation (6)
     ✓ keeps ledger operation intents and receipts out of committed book paths 545ms
   ✓ parked run commits (3)
     ✓ reads null for a missing file, another workflow, an unreadable file and a bad fid 366ms
     ✓ is invisible to the record listing and removes by fid 616ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (171 tests) 88193ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 567ms
     ✓ finishes a CI round only with its own failed job count 555ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 620ms
     ✓ done --group writes group on the row 470ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 947ms
     ✓ carries extra fields, parsed as JSON when they are JSON 406ms
     ✓ reports a failed commit with exit 8 without writing the row 1428ms
     ✓ a failed commit leaves no row staged in the index 1095ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1044ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 878ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1182ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1324ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1582ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 483ms
     ✓ --ref reads the status file as committed on that ref, not from disk 604ms
     ✓ --ref exits 3 when the ref does not carry the status file 842ms
     ✓ fails on a placeholder left in the artifact 591ms
     ✓ fails when the row's verdict differs from the artifact's 561ms
     ✓ fails when the row does not list the artifact, or carries another attempt 485ms
     ✓ fails on a missing artifact 531ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 550ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a diagnose row missing its strategy, passes with it 483ms
     ✓ fails a run-tests row missing its scope, and an empty scope 649ms
   ✓ bkit steps finish (21)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 648ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 385ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 749ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 390ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 682ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1028ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 755ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 811ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1305ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 1060ms
     ✓ --post needs --number; without --post there is no tracker key 355ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 381ms
     ✓ checks the FID's shape for the wired tracker 318ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 455ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 835ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 657ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 418ms
     ✓ --attempt-of checks the row carries the derived counter 409ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1312ms
     ✓ writeStepRow refuses when a recorded path changed 1611ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 681ms
     ✓ writeStepRow appends its commit sha to the record 1225ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1642ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 382ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 1096ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 788ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 952ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 526ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1418ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 1110ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 735ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 477ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1606ms
     ✓ refuses the execute step when it changes another group's planned test, exit 11 440ms
     ✓ refuses the gaps-remediate step when it changes another group's planned test, exit 11 445ms
     ✓ the tests step's finish refuses an earlier task's changed planned test with exit 11 948ms
     ✓ the tests step's finish passes its own group's and taken-over tests 1086ms
     ✓ lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row 722ms
     ✓ lets a code step through when its BLOCKED line names the changed test by the last segment of its name 1028ms
     ✓ lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test 883ms
     ✓ records only the changed test when a BLOCKED line also names an unchanged one 921ms
     ✓ refuses only the changed planned tests no BLOCKED line of the log names 594ms
     ✓ the refusal names the BLOCKED line the engine reads 393ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 1326ms
     ✓ refuses a later code step that changes a BLOCKED change again 682ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 1063ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 1271ms
     ✓ refuses a code step that writes a planned test whose red recorded its file missing, exit 11 562ms
     ✓ the refusal of a restored BLOCKED change names the recorded change as the lines to put back 765ms
     ✓ the refusal of a re-change says the logged reason is already recorded 713ms
     ✓ refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11 453ms
     ✓ a code step's finish adds one takeover task and one build-takeover row for a contradicted test, exit 11 597ms
     ✓ the contradiction's problem says the takeover task rewrites the test and no BLOCKED line keeps it 451ms
     ✓ the same contradicted finish run again adds no second task or row 539ms
     ✓ exit 11 names no contradiction and adds no task while the owning task is open 472ms
     ✓ a mixed refusal names both tests and words the problem for each kind 751ms
     ✓ a chain of takeovers gives one contradiction, from the latest owner 730ms
     ✓ refuses a code step whose BLOCKED-named change renames a planned test away, exit 11 502ms
     ✓ records the baseline blob on a BLOCKED-named change that only adds lines 789ms
     ✓ passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block 988ms
     ✓ still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11 906ms
     ✓ passes group 2's tests step that appends its test to a file whose group 1 test has no recorded block, before group 2's red 1397ms
     ✓ passes group 2's tests step that creates the file a group 1 test was recorded missing in 1018ms
     ✓ a changedTests record on a non-code-step row does not move the lock's baseline 544ms
     ✓ refuses a --field changedTests on a step finish 317ms
     ✓ the exit 11 refusal says verify reads a BLOCKED change's added lines 549ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 344ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 627ms
     ✓ does not count an artifact the run found committed when it started 578ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 306ms
     ✓ commits a package.json change outside bkit.workflows 530ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1310ms
   ✓ bkit steps stub --result-file (12)
     ✓ refuses line breaks in header-bound result values 331ms
     ✓ retains special verdict judgments and legacy stub behavior 541ms
     ✓ derives a fresh audit key when the ledger already holds it 496ms
     ✓ keeps the audit key when the same finding is rendered again after its append 413ms
     ✓ reads held audit keys from the linked worktree's own ledger 329ms
 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (23 tests) 37309ms
   ✓ the dispatch seam on a real worktree (7)
     ✓ writes friction to the run's own book root 321ms
     ✓ writes no friction row for a declared routing exit 457ms
     ✓ skips a call made outside the run's worktree 309ms
     ✓ writes nothing when no run is active in the cwd 364ms
     ✓ a call launched from a git hook writes no engine-call row 1110ms
     ✓ branches rebase finishes a rebase paused on a commit that carries the run's status file 1096ms
   ✓ explicit invocation on real worktrees (3)
     ✓ resumes explicit invocation across two real worktrees without identity leakage 789ms
     ✓ keeps invocation events and engine-call rows inside the issuing worktree after receipt loss 672ms
     ✓ completes missing subagent attribution before a real append 604ms
   ✓ canonical ledger reads on real files (1)
     ✓ distinguishes unreadable missing malformed and clean ledger coverage without writing 350ms
   ✓ replay-safe ledger appends on real files (8)
     ✓ reconciles lost append response at each durable checkpoint without duplicate rows 609ms
     ✓ serializes concurrent append operations and blocks partial uncertain ledger writes 2711ms
     ✓ keeps rendered audit report appended rows and tracker draft counts identical 1012ms
     ✓ resolves a pending ledger intent after its invocation is stale 898ms
     ✓ appends the printed audit ledgerRows verbatim under the standalone invocation 570ms
     ✓ refuses to re-append a partly landed block after a foreign writer appended 425ms
     ✓ prepares afresh when nothing landed and a foreign row followed 484ms
     ✓ receipts a lost-response block that a rebase moved behind upstream rows instead of appending it again 545ms
   ✓ persistent CI handoff on a real local remote (3)
     ✓ resumes nonwaiting CI polls without resetting attempts or duplicating retrigger 16977ms
     ✓ blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it 2019ms
     ✓ does not push a second re-trigger copy after a lost push response on a shared branch 2573ms
   ✓ bounded correction on real ledgers (1)
     ✓ resumes corrected substep and blocks exhausted unauthorized or uncertain effects 2180ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (33 tests) 33187ms
   ✓ changedFiles (2)
     ✓ lists modified, staged and untracked files, and leaves out ignored and deleted ones 322ms
     ✓ adds files changed in commits since the base, and drops one a later commit deleted 570ms
   ✓ snapshotTree / changedBetween (5)
     ✓ the tested snapshot holds uncommitted and untracked files 423ms
     ✓ snapshotting leaves the index and working tree as they were 642ms
     ✓ a checkout with no commit yet snapshots with no parent 328ms
     ✓ changedBetween lists the existing files that differ from a snapshot, and the deleted ones apart 1163ms
     ✓ changedBetween is null when the snapshot is gone 307ms
   ✓ deletedFiles (1)
     ✓ deletedFiles lists a file removed since the base 525ms
   ✓ importersOf (4)
     ✓ importersOf lists the unchanged files that mention a deleted file's name 390ms
     ✓ importersOf leaves out a file that no longer exists 332ms
     ✓ importersOf returns null when the base tree cannot be searched 442ms
     ✓ importersOf returns null when a blob is unreadable even though another file matched 367ms
   ✓ tests changed (13)
     ✓ runs bkit:gate:changed with the changed files as its arguments 1688ms
     ✓ counts files committed since --base 785ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1195ms
     ✓ runs nothing and exits 0 when no file changed 891ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 2251ms
     ✓ runs the --fallback gate even when no file changed, as it did before 1494ms
     ✓ exits 3 when neither bkit:gate:changed nor the --fallback gate is declared 974ms
     ✓ exits 4 when the gate could not run 1531ms
     ✓ changed-since exits 81 with the holder read from the status file 1436ms
     ✓ exits 4 with no verdict when the status file says the hold limit stopped the gate 1107ms
     ✓ exits 1 when the gate exits 75 and writes no status file 1115ms
   ✓ tests changed default base (8)
     ✓ lists a file the subagent committed after the last step-done commit 1762ms
     ✓ lists the same file when it is left uncommitted 1009ms
     ✓ leaves out a file only the previous step's own commit touched 1139ms
     ✓ lists the subagent's file when a later commit sweeps in an uncommitted step-done row 1182ms
     ✓ lists the subagent's committed file when another feature's run is also in progress 1707ms
     ✓ on an in-place shared-branch run leaves out a file another agent committed after the last step-done commit 1454ms
     ✓ on an in-place shared-branch run with a second run in progress and a dirty status file leaves out another agent's commit 2214ms
     ✓ lists the subagent's committed file on an adopted branch when another feature's run is also in progress 2034ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts (18 tests) 21651ms
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 1697ms
     ✓ a failing file absent at the base commit is the branch's 912ms
     ✓ no JUnit report reads unknown 518ms
     ✓ an undeclared bkit:test:file reads unknown 798ms
     ✓ a failed base install reads unknown and removes the worktree 736ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 1025ms
     ✓ copies the worktreeCopy entries into the base checkout 1004ms
     ✓ no origin/dev ref reads unknown 446ms
     ✓ a base file run that writes no report reads unknown 895ms
     ✓ a passing CI run at the exact base sha settles none without a local run 555ms
     ✓ a CI run that cannot settle the base falls back to the local run 5487ms
     ✓ a pull_request-event CI run at the base sha does not settle none 1023ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 841ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 1030ms
     ✓ the base test run does not inherit the hooks-off git config 1452ms
     ✓ adopt follows the run's runtimeWorktrees 2409ms
     ✓ worktreeInstall off reads unknown 555ms
 ✓ .bkit/core/engine/commands/lib.test.ts (79 tests) 7104ms
   ✓ repo facts on a real repository (5)
     ✓ design / plan / build / debug: worktree copy when it exists, else the main checkout 400ms
     ✓ a host-made linked worktree holds the run 563ms
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 485ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1358ms
     ✓ runGit names ENOBUFS when output passes the limit 1082ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1122ms
   ✓ explicit invocation context (2)
     ✓ rejects stale cross-worktree invocation and conflicting overrides 689ms
 ✓ .bkit/core/engine/commands/workflow/progress.integration.test.ts (12 tests) 12986ms
   ✓ workflow progress command wiring (12)
     ✓ progress resumes from saved run 362ms
     ✓ progress loop attempts and grants 1670ms
     ✓ workflow progress command wiring progress specialized completion producers 6146ms
     ✓ workflow progress command wiring progress gate only completions 883ms
     ✓ progress excludes noncompletions 2218ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (116 tests) 21473ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 669ms
     ✓ keeps each context's own section banner and drops every other context's 1579ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 380ms
     ✓ clamps a ci block with the ci profile and a runtime block without it 740ms
     ✓ finalise derives verdict, artifacts, configured contexts and clamp records 328ms
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 887ms
   ✓ bkit context diff (10)
     ✓ writes origin/dev...HEAD without docs/plans/** and prints the numstat numbers 639ms
     ✓ --base narrows the range to the commits after a group's start sha 561ms
     ✓ diff from a group start covers only the group's commits 684ms
     ✓ an empty range writes a one-line note and zero numbers 687ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 1014ms
     ✓ --reset-log empties the step's clamp log before the record lands 1043ms
     ✓ partial: prints and writes the files not shown whole, and keeps the whole diff in the outbox 469ms
     ✓ whole: nothing omitted and no copy kept 540ms
     ✓ the budget honours topFiles and totalLines and says when the ceiling cut a file 491ms
   ✓ featureBase (#960) (7)
     ✓ featureBase picks the local dev meeting point when the branch was cut from a local dev ahead of origin/dev 655ms
     ✓ featureBase picks the origin/dev meeting point when local dev equals origin/dev 377ms
     ✓ featureBase picks the origin/dev meeting point when the branch was cut from origin/dev and local dev diverged 520ms
     ✓ featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev 1325ms
     ✓ featureBase falls back to the origin/dev meeting point and logs when the combination conflicts 1161ms
     ✓ featureBase uses the origin/dev meeting point when there is no local dev 400ms
     ✓ context diff without --base leaves out an unpushed local dev commit 835ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (44 tests) 6490ms
   ✓ bkit challenge gate (6)
     ✓ challenge gate writes a challenge-gate row 890ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1446ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 547ms
     ✓ challenge gate without --base sizes only the branch's own lines 632ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (48 tests) 4967ms
   ✓ bkit tasks currency (6)
     ✓ currency matches a task on a moved symbol 533ms
     ✓ currency leaves run logs out: a symbol named only in another plan's log matches no task 498ms
     ✓ currency emits no hunk outside the matched set 483ms
     ✓ currency exits 0 with no hunks when no task matches 453ms
     ✓ currency judges base...against (origin/dev), not base...HEAD 704ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (78 tests) 5147ms
   ✓ bkit decisions compose (40)
     ✓ Try again is offered for every base verdict 411ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (104 tests) 4897ms
   ✓ bkit status route --prompt-file (debug Step 1) (12)
     ✓ finds status.jsonl from --fid and --month 316ms
   ✓ bkit status invocation (7)
     ✓ records the issued invocation in the run status log and rebuilds a deleted receipt 358ms
     ✓ binds group and attempt and registers setup, remediation and ship steps 635ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 4522ms
   ✓ selected CI context evidence (3)
     ✓ pins selected evidence variables and clears inherited pins without selection 345ms
     ✓ accepts only matching complete CI receipts with nonempty logs 1787ms
     ✓ validates adapted legacy and fallback context through the same receipt path 566ms
   ✓ bkit context fetch (9)
     ✓ round-trips a value holding a pipe 353ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (90 tests) 4210ms
   ✓ bkit counters route --point (9)
     ✓ takes each point's default limit and asks when nothing is set 807ms
   ✓ bkit counters grant (4)
     ✓ grants one more full allowance at the used-up limit, and route counts it 364ms
   ✓ bkit counters progress (19)
     ✓ judges codeChanged on source only, from the rounds' parent commits 488ms
     ✓ judges codeChanged between the compared same-scope rounds 442ms
     ✓ trendLine for a fall without a code change says no source code changed 359ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (48 tests) 3225ms
   ✓ runLines (5)
     ✓ counts code, tests and docs apart, and leaves out plans, run logs and the ledgers 522ms
     ✓ counts deleted lines into changed 521ms
     ✓ cuts at each merge on the first-parent chain, so merged-in work is not counted 901ms
     ✓ is null when first is not an ancestor of last, or either is missing 595ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (52 tests) 3360ms
   ✓ bkit status resume (43)
     ✓ design: a completed step resumes at the next one 302ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (79 tests) 2253ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (82 tests) 1776ms
   ✓ SETUP_TIPS — detection (66)
     ✓ cloud tip names the Claude GitHub App and BKIT_ANTHROPIC_API_KEY only for cloud.agent claude 345ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (288 tests) 377115ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 1512ms
     ✓ rejects missing explicit and ambiguous existing branch selections 1545ms
   ✓ branches rebase: classification (31)
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 450ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1525ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1752ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 1276ms
     ✓ a refused --continue carries git's own reason 1316ms
     ✓ --file records nothing for a refused rebase 968ms
     ✓ refuses a code conflict and aborts the rebase on the spot 963ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1524ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 491ms
     ✓ produces byte-identical output to merge=union 1176ms
     ✓ restores a trailing newline so the next append starts on its own line 834ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 839ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1794ms
     ✓ refuses a union that leaves a line which is not JSON 814ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 958ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1352ms
     ✓ refuses a lockfile whose regenerate command fails 1100ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 953ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1348ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1080ms
     ✓ refuses and aborts when both sides changed the hand-written region 556ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 648ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 755ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1015ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 617ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 680ms
     ✓ refuses and aborts when a side deleted the install record 462ms
     ✓ refuses a conflicted doc the repo's script does not list 506ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 423ms
     ✓ removes a stale sentinel when the rebase succeeds 602ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 769ms
     ✓ resolves a conflict in each of two replayed commits across rounds 831ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 399ms
       ✓ skips (12) with no anchor 365ms
       ✓ skips (12) when the base is unreachable in this clone 377ms
       ✓ skips (12) when nothing landed since the base 377ms
       ✓ runs (0) with the landed path count once dev moved 776ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 478ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 810ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 473ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 575ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1099ms
     ✓ runs exactly one git push 1127ms
     ✓ --set-upstream records the upstream 1031ms
     ✓ refuses with no branch checked out 663ms
     ✓ --mode=dev refuses a feature checkout 588ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1414ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1691ms
     ✓ --require-ci pushes as-is when dev has not moved 764ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1233ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1808ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 538ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1257ms
     ✓ --mode=abort pushes when the branch has no open PR 957ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1224ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 564ms
     ✓ --open-pr carries the MCP answer and skips gh 617ms
     ✓ --mode=abort on dev pushes plainly without probing 636ms
     ✓ rejects an unknown mode 451ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1904ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 860ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1320ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2955ms
     ✓ skip-ci HEAD on the replay is refused 728ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1921ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3403ms
     ✓ a level local dev is a plain push, recording nothing extra 998ms
     ✓ a record with no commits pushes nothing 1053ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 784ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1431ms
     ✓ a rewritten branch is refused, never forced 765ms
     ✓ refuses dev and main with exit 21 and pushes nothing 564ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1063ms
     ✓ refuses a detached HEAD (exit 5) 476ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 997ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1313ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 890ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1244ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 617ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1096ms
     ✓ an up-to-date branch is a no-op 913ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1555ms
     ✓ a fetch that fails exits 10 436ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 694ms
     ✓ scan-diff still reports a new skip when its test … 817ms
     ✓ scan-diff reports a skip moved onto a different t… 762ms
     ✓ scan-diff does not cancel a skip moved between am… 748ms
     ✓ scan-diff does not spend an unchanged duplicate t… 1090ms
     ✓ scan-diff recognizes a renamed test file 1338ms
     ✓ scan-diff recognizes a suite moved into a differe… 815ms
     ✓ scan-diff does not let unrelated additions hide a… 607ms
     ✓ scan-diff attributes deletion to its old test ins… 582ms
     ✓ scan-diff consumes each moved assertion once and … 676ms
     ✓ scan-diff does not match identical assertions fro… 580ms
     ✓ scan-diff does not match the same leaf test name … 645ms
     ✓ scan-diff does not match a same-named test with d… 603ms
     ✓ scan-diff does not match a same-named test with c… 625ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 630ms
     ✓ --paths with no match exits 1 722ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 581ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 897ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 938ms
     ✓ scan-diff without --base finds a marker the branch added when local dev already contains the branch 758ms
     ✓ --marker reads a diff over 1 MiB 894ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1209ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1350ms
     ✓ scan-diff finds an added skip 854ms
     ✓ scan-diff ignores a skip predating the base 987ms
     ✓ scan-diff reports a disabled test with its line 828ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 753ms
     ✓ scan-diff ignores a removed comment in a test file 638ms
     ✓ scan-diff ignores an assertion moved within the file 621ms
     ✓ scan-diff still reports a removed assertion 784ms
     ✓ scan-diff reports an assertion re-added only outside the test file 456ms
     ✓ scan-diff finds an added pytest mark skip 605ms
     ✓ scan-diff finds an added unittest skip 466ms
     ✓ scan-diff finds an added bare skip call 476ms
     ✓ scan-diff ignores a quoted skip in a documentation file 583ms
     ✓ scan-diff ignores a marker literal in a non-test source file 698ms
     ✓ scan-diff ignores an assertion whose expectation changed 598ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 878ms
     ✓ scan-diff reports a deleted test file 619ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 499ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1418ms
     ✓ a title that already carries the marker is left alone 1049ms
     ✓ with no open PR: pushes the marker commit and edits no title 1296ms
     ✓ a re-run is deduped: no second marker commit 1510ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1544ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 392ms
     ✓ --title-set skips gh entirely 1055ms
     ✓ refuses dev and main (exit 21) 340ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1489ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 3745ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 2831ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 5568ms
     ✓ continues only the explicitly recorded target through the public merge command 3873ms
     ✓ fetches the unseen feature head before classifying the base 2392ms
     ✓ fast forwards the feature before either base path is chosen 5027ms
     ✓ merges divergent feature tips without rebasing either side 3202ms
     ✓ continues the feature merge before starting a dev merge 4162ms
     ✓ publishes local code with a CI running head before bookkeeping 4258ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 6537ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 4977ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 3138ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 774ms
     ✓ Path B once dev moved; --head checks a given commit 914ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 916ms
     ✓ --merge-docs merges dev when docs/ is behind 1352ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 1144ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1741ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 2038ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1387ms
     ✓ --merge-docs skips an empty bkit:generate script 1221ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1076ms
     ✓ --merge-docs never merges on dev itself 1032ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1547ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1310ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 1485ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 1491ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 699ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 2037ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1989ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 2270ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 2330ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1856ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 2681ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 1792ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 2341ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1359ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 928ms
     ✓ exits 10 when the fetch fails 642ms
     ✓ refuses --merge-docs with --head, and an unknown --head 783ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1620ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1936ms
     ✓ a failed install stops ship (16) 2373ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1673ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1534ms
     ✓ exits 10 when the fetch fails 1132ms
   ✓ shared landed comparison (7)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 858ms
     ✓ preserves unlanded file type changes in the shared landed comparison 885ms
     ✓ a later dev commit on the same file does not turn a landed branch back into unlanded 2269ms
     ✓ names only the file whose branch version never reached dev 2479ms
     ✓ a deleted file that dev deleted and a later commit re-added counts as landed 2227ms
     ✓ names a path under a directory named : when dev deleted, re-added and later edited the top-level file 2849ms
     ✓ a path under a directory named : that dev never touched is not reported landed 1067ms
   ✓ branches land (28)
     ✓ refuses a workflow other than design or plan 594ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 839ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 4361ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 4679ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 5314ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 5149ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 8930ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 10097ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 1476ms
     ✓ local: names unpushed dev as the cause when the branch carries it 2258ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 2009ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 4906ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 4601ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 2959ms
     ✓ uses tree entry equivalence for design and plan land cleanup 13584ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 3771ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 3654ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 3398ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1898ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 7934ms
     ✓ land removes the worktree when only the copied .env is untracked 4251ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 3285ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 4258ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 6967ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 4265ms
     ✓ landPr refuses a main-based PR without retrying 1255ms
     ✓ landPr refuses when the PR base is unknown 1174ms
     ✓ PR not open (closed): stops (17) at once, no retry 1794ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 1662ms
     ✓ --attempt names the merge round in a fix commit 1506ms
     ✓ commits a rewritten and a deleted tracked file 1544ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 1265ms
     ✓ reports undeclared and runs nothing with no scripts 1084ms
     ✓ reports undeclared and runs nothing with an empty script 936ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 1453ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 1374ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 1103ms
   ✓ branches scan-diff --since-step (4)
     ✓ scan-diff --since-step --code exits 0 when the subagent committed its fix before steps finish 1484ms
     ✓ scan-diff --since-step --code exits 0 when the fix was left uncommitted and the finish commit holds it 1376ms
     ✓ scan-diff --since-step --code exits 1 when the step changed only logs 1389ms
     ✓ scan-diff --since-step --code exits 0 when a refused finish wrote a takeover row after the subagent committed its fix 1597ms
 ✓ .bkit/core/engine/audits/templates/template-ci-yml.test.ts (16 tests) 824ms
   ✓ template bkit-ci.yml, filled in (2)
     ✓ passes actionlint 355ms
 ✓ .bkit/core/engine/commands/workflow/tests-jump.test.ts (4 tests) 1243ms
   ✓ bkit tests jump (4)
     ✓ tests jump reads the queue and jumps through the template's script 465ms
     ✓ tests jump reports no match in the EXIT.NO style when the script finds none 444ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 82ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 315ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (329 tests) 471ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (82 tests) 100ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 55ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 71ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 64ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 8ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 66ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 14ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 34ms

 Test Files  40 passed (40)
   Affected  40 of 247 test files (related to 13 files)
      Tests  3049 passed (3049)
   Start at  16:40:46
   Duration  379.97s (tests 99%, import 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/1050-host-made-worktrees/build-group-gate-2-1.log.reports/vitest-33042.xml

[bkit:gate:changed] named: vitest run --passWithNoTests .bkit/core/engine/audits/templates/disk-prune-worktrees.integration.test.ts .bkit/core/engine/commands/workflow/context.test.ts .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts .bkit/core/engine/commands/workflow/steps.test.ts .bkit/core/engine/commands/workflow/tests.test.ts .bkit/core/engine/commands/workflow/worktrees.integration.test.ts .bkit/core/engine/commands/workflow/worktrees.test.ts

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1050-host-made-worktrees

 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (171 tests) 94123ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 648ms
     ✓ finishes a CI round only with its own failed job count 682ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 500ms
     ✓ done --group writes group on the row 461ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 749ms
     ✓ carries extra fields, parsed as JSON when they are JSON 404ms
     ✓ reports a failed commit with exit 8 without writing the row 658ms
     ✓ a failed commit leaves no row staged in the index 956ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1247ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1203ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1179ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1377ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 816ms
   ✓ bkit steps verdict (10)
     ✓ a required field that is absent is invalid (re-prompt) 335ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 528ms
     ✓ --ref reads the status file as committed on that ref, not from disk 420ms
     ✓ --ref exits 3 when the ref does not carry the status file 462ms
     ✓ fails on a placeholder left in the artifact 475ms
     ✓ fails when the row's verdict differs from the artifact's 611ms
     ✓ fails when the row does not list the artifact, or carries another attempt 493ms
     ✓ fails on a missing artifact 448ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 429ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a diagnose row missing its strategy, passes with it 433ms
     ✓ fails a run-tests row missing its scope, and an empty scope 656ms
   ✓ bkit steps finish (21)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 601ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 428ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 378ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 581ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 788ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 540ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 712ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 2249ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 775ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 307ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 637ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 581ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 389ms
     ✓ --attempt-of checks the row carries the derived counter 379ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1147ms
     ✓ writeStepRow refuses when a recorded path changed 1260ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 780ms
     ✓ writeStepRow appends its commit sha to the record 1423ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1650ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 428ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 779ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 672ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 857ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 549ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1383ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 1197ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 905ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 614ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 3403ms
     ✓ refuses the execute step when it changes another group's planned test, exit 11 682ms
     ✓ refuses the gaps-remediate step when it changes another group's planned test, exit 11 625ms
     ✓ the tests step's finish refuses an earlier task's changed planned test with exit 11 1212ms
     ✓ the tests step's finish passes its own group's and taken-over tests 1793ms
     ✓ lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row 1008ms
     ✓ lets a code step through when its BLOCKED line names the changed test by the last segment of its name 898ms
     ✓ lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test 835ms
     ✓ records only the changed test when a BLOCKED line also names an unchanged one 1398ms
     ✓ refuses only the changed planned tests no BLOCKED line of the log names 780ms
     ✓ the refusal names the BLOCKED line the engine reads 674ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 2050ms
     ✓ refuses a later code step that changes a BLOCKED change again 1034ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 1648ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 1641ms
     ✓ refuses a code step that writes a planned test whose red recorded its file missing, exit 11 569ms
     ✓ the refusal of a restored BLOCKED change names the recorded change as the lines to put back 1224ms
     ✓ the refusal of a re-change says the logged reason is already recorded 1102ms
     ✓ refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11 636ms
     ✓ a code step's finish adds one takeover task and one build-takeover row for a contradicted test, exit 11 749ms
     ✓ the contradiction's problem says the takeover task rewrites the test and no BLOCKED line keeps it 823ms
     ✓ the same contradicted finish run again adds no second task or row 719ms
     ✓ exit 11 names no contradiction and adds no task while the owning task is open 605ms
     ✓ a mixed refusal names both tests and words the problem for each kind 696ms
     ✓ a chain of takeovers gives one contradiction, from the latest owner 762ms
     ✓ refuses a code step whose BLOCKED-named change renames a planned test away, exit 11 570ms
     ✓ records the baseline blob on a BLOCKED-named change that only adds lines 927ms
     ✓ passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block 1179ms
     ✓ still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11 838ms
     ✓ passes group 2's tests step that appends its test to a file whose group 1 test has no recorded block, before group 2's red 1404ms
     ✓ passes group 2's tests step that creates the file a group 1 test was recorded missing in 2218ms
     ✓ a changedTests record on a non-code-step row does not move the lock's baseline 515ms
     ✓ refuses a --field changedTests on a step finish 443ms
     ✓ the exit 11 refusal says verify reads a BLOCKED change's added lines 552ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 335ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 656ms
     ✓ does not count an artifact the run found committed when it started 839ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 497ms
     ✓ commits a package.json change outside bkit.workflows 670ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1390ms
   ✓ bkit steps stub --result-file (12)
     ✓ refuses line breaks in header-bound result values 401ms
     ✓ retains special verdict judgments and legacy stub behavior 439ms
     ✓ derives a fresh audit key when the ledger already holds it 375ms
     ✓ reads held audit keys from the linked worktree's own ledger 363ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (215 tests) 111149ms
   ✓ CI evidence test rounds (5)
     ✓ runs local gates only after current-generation remediation or soak 1253ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 494ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 625ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 663ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 537ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 555ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 556ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 577ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 738ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1142ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 743ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 580ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 956ms
     ✓ PASS is 0 failures with or without reports 1432ms
     ✓ clears a previous attempt's reports before the gate runs 752ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 907ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 783ms
     ✓ a log under the outbox is named main-checkout relative in the record 750ms
     ✓ a log small enough is copied whole: not clamped, raw null 695ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 828ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1589ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 756ms
     ✓ numbers runs within the workflow's active run and per step 1469ms
     ✓ tests run --file records the tested snapshot on its test-run row 832ms
     ✓ a FAIL test-run row records each failing case as file and name 811ms
     ✓ a PASS test-run row records no failed tests 1547ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 856ms
     ✓ without --file no row is written and the output carries row null 578ms
   ✓ bkit tests run --changed-since (17)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 997ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 797ms
     ✓ changed-since with no changed files writes a PASS row and runs nothing 456ms
     ✓ the nothing-to-run row records the tested snapshot 568ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 2443ms
     ✓ --since-pass-of skips failing runs and steps it does not name 2321ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 1470ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 984ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 1006ms
     ✓ changed-since refuses a sha that names no commit 335ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 1597ms
     ✓ a deleted file that no file mentions passes and the log says so 802ms
     ✓ a failed importer search runs the whole check 1344ms
     ✓ --changed-since=feature-base starts at the feature's start commit 1569ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 993ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 743ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 998ms
     ✓ a failing required push gate leaves the failed marker 1175ms
     ✓ uncommitted code blocks the receipt until it is committed 1315ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 1092ms
     ✓ only the required push gate records a receipt 1973ms
     ✓ a gate that gave up on the tests lock exits 81 from the status file and records no receipt 2852ms
   ✓ bkit tests plan-check (40)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 409ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 303ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 302ms
     ✓ plan-check follows bkit.workflows.tasks 392ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 442ms
     ✓ --ledger-rows (4)
       ✓ refuses a missing or unfilled Ledger rows line 438ms
       ✓ passes when the plan parses and every key has a decision or deferral row 371ms
   ✓ bkit tests red / green (49)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 842ms
     ✓ a planned test that passes is a vacuous gap, exit 1 837ms
     ✓ a planned test absent from a loaded report is a missing gap 666ms
     ✓ a file that fails to load is a red of kind red-not-loaded 983ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1275ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 465ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1252ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 642ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 694ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 340ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1411ms
     ✓ red keeps a test standing whose lines match a code step's recorded change 738ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1141ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1275ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1027ms
     ✓ takeover (8)
       ✓ tests red records a failing takeover as red with from 997ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 1033ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 2195ms
       ✓ tests red records from as the owner when an unbuilt task between the two names the test 930ms
       ✓ tests green lists a takeover whose nearest earlier task has no red as taken over from the owner 1285ms
       ✓ tests red records no from when no earlier task naming the test has a baseline 782ms
       ✓ a resumed tests red skips a taken-over entry 1013ms
       ✓ tests green lists takenOver and never counts it as a gap or unproven 1447ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1302ms
     ✓ green: a passed-accepted test is already landed, not a gap 1153ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1153ms
     ✓ tests a code step changed (7)
       ✓ green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap 1059ms
       ✓ green gives each changed test the line diff of its own lines since its baseline and whether it is additive 1121ms
       ✓ green leaves a changed test the plan no longer names out of changed 1047ms
       ✓ green leaves a test out of changed when a later red replaced the code step's change 1252ms
       ✓ green lists a changed test when test-first is not enforced 370ms
       ✓ green gives a changed test whose red recorded its file missing every line of the test as added 672ms
       ✓ green prints an empty changed list and no Changed by a code step section when no code step changed a test 1209ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 827ms
     ✓ green: --group audits only that group's tasks 721ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 961ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1007ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 735ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1066ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 799ms
     ✓ green: lists each gap kind, with the runner output 821ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1677ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 625ms
       ✓ green clears an exception-only task from a human commit 531ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (116 tests) 22566ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 925ms
     ✓ keeps each context's own section banner and drops every other context's 1786ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ clamps a ci block with the ci profile and a runtime block without it 434ms
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 847ms
   ✓ bkit context diff (10)
     ✓ writes origin/dev...HEAD without docs/plans/** and prints the numstat numbers 603ms
     ✓ --base narrows the range to the commits after a group's start sha 587ms
     ✓ diff from a group start covers only the group's commits 634ms
     ✓ an empty range writes a one-line note and zero numbers 607ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 856ms
     ✓ --reset-log empties the step's clamp log before the record lands 1297ms
     ✓ partial: prints and writes the files not shown whole, and keeps the whole diff in the outbox 477ms
     ✓ whole: nothing omitted and no copy kept 687ms
     ✓ the budget honours topFiles and totalLines and says when the ceiling cut a file 484ms
   ✓ featureBase (#960) (7)
     ✓ featureBase picks the local dev meeting point when the branch was cut from a local dev ahead of origin/dev 653ms
     ✓ featureBase picks the origin/dev meeting point when local dev equals origin/dev 509ms
     ✓ featureBase picks the origin/dev meeting point when the branch was cut from origin/dev and local dev diverged 599ms
     ✓ featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev 1130ms
     ✓ featureBase falls back to the origin/dev meeting point and logs when the combination conflicts 1231ms
     ✓ featureBase uses the origin/dev meeting point when there is no local dev 528ms
     ✓ context diff without --base leaves out an unpushed local dev commit 833ms
   ✓ bkit context brief (17)
     ✓ the tests brief lists a taken-over test under its own section 321ms
     ✓ a taken-over test that existed before the run keeps the add-only wording 339ms
 ✓ .bkit/core/engine/audits/templates/disk-prune-worktrees.integration.test.ts (3 tests) 5122ms
   ✓ example repo step — leftover worktrees (3)
     ✓ removes what loses nothing, keeps what is in use, notes the rest 4106ms
     ✓ notes a plain folder under .worktrees, even while the checkout is busy 491ms
     ✓ keeps a worktree whose workflow holds its lock, without a note 523ms
 ✓ .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts (3 tests) 12440ms
   ✓ the planned-test lock across groups (1)
     ✓ a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed 3940ms
   ✓ a takeover of an earlier task's planned test (2)
     ✓ a takeover across groups lets the next code step finish 2646ms
     ✓ a mid-build contradiction adds a takeover task and the next code step finishes 5851ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (101 tests) 130632ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 321ms
     ✓ adopts the main checkout even when called from a linked worktree 483ms
     ✓ design and plan in place on main are refused 505ms
     ✓ still adopts a cloud session branch whose upstream is main 432ms
   ✓ bkit worktrees setup — adopt the checkout the session is already on (7)
     ✓ adopts the linked worktree already on feat/{fid} for design, plan, build and debug 2034ms
     ✓ ship run from a linked worktree on its target branch adopts that worktree 568ms
     ✓ the adopted linked worktree holds the log directory 473ms
     ✓ refuses design, plan and build in place in the main checkout on feat/{fid} under --worktrees 771ms
     ✓ refuses design, plan and build in place in a submodule's main checkout on feat/{fid} 2718ms
     ✓ says so when the adopted worktree has no hooks directory 1360ms
     ✓ a plan session on another branch still mints .worktrees/{fid} 1218ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1541ms
     ✓ may debug in place on dev 1103ms
     ✓ adopts in place when the session is already on feat/{fid} 304ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (26)
     ✓ in-place debug on dev writes the shared-checkout record 1568ms
     ✓ debug in place on dev from a linked worktree records its own checkout 1735ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1484ms
     ✓ a new run of the same FID rewrites startSha 2650ms
     ✓ a resume of the same FID reuses the record 1944ms
     ✓ a resume with no record rebuilds it from the run-commits row (17)
       ✓ restores the commits, the pushed list and startSha of the newest row 2169ms
       ✓ drops a commit id that is not on the branch 3337ms
       ✓ keeps the fresh startSha when the row's startSha is not a commit 2699ms
       ✓ writes an empty commit list when the run has no run-commits row 2380ms
       ✓ ignores a row from before the open run started 2508ms
       ✓ restores the commits from the row on origin/dev when the handover landed 3848ms
       ✓ restores the commits when origin/dev holds only the lines the checkout lacks 3116ms
       ✓ ignores the row on origin/dev when the checkout's log shows the run closed 3304ms
       ✓ ignores the row on origin/dev when the run there is closed 5707ms
       ✓ from the parked local copy (8)
         ✓ restores commits, pushed and startSha when no copy of the row is reachable 4042ms
         ✓ wins over the row on origin/dev, which is then not needed 4029ms
         ✓ wins over the row in the checkout's own log while the run is open 4048ms
         ✓ still drops a commit id that is not on the branch 3882ms
         ✓ is ignored and removed when the checkout's log shows the run closed 3677ms
         ✓ is ignored when it was parked for another workflow 3387ms
         ✓ is removed once the record is rebuilt 3268ms
         ✓ is removed when the live record already stands for the open run 3974ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1553ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1615ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1789ms
     ✓ a stale record without a lock is replaced 2442ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1992ms
     ✓ refuses inherited unpublished dev commits in every ship mode 5559ms
     ✓ names inherited commits and ship recovery in the refusal 1215ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1457ms
     ✓ ship names a missing feat branch 529ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1462ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 516ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 327ms
     ✓ fails with a fetch error when there is no origin to rebase onto 544ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 375ms
       ✓ checks no disk when there are no cleanup step files 499ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 585ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 500ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 407ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 311ms
     ✓ never commits an entry only the main checkout's copy list names 526ms
   ✓ bkit worktrees remove (20)
     ✓ leaves a worktree without the marker in place 303ms
     ✓ preserves a marked worktree with uncommitted changes and its marker 717ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 396ms
     ✓ tells a caller inside the removed worktree where to cd 469ms
     ✓ fails with its own exit code when git cannot remove a marked path 379ms
     ✓ --branch (14)
       ✓ preserves staged-only content during landed cleanup 1526ms
       ✓ preserves staged-only mode during landed cleanup 1568ms
       ✓ preserves staged-only type during landed cleanup 1638ms
       ✓ preserves staged-only deletion during landed cleanup 1369ms
       ✓ removes landed staged content when both index and working contents are on dev 1181ms
       ✓ deletes the proved local and remote branch at their landed tips 1533ms
       ✓ retains the remote branch when origin refuses its conditional deletion 2077ms
       ✓ removes the worktree and local branch when a later dev commit changed the branch's file 1917ms
       ✓ deletes the remote branch when a later dev commit changed the branch's file 1857ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 537ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 477ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 461ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 885ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (63 tests) 184055ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 3800ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 24592ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 2547ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 1794ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 1621ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1903ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 2783ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 3863ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1804ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1288ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 767ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 1294ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 1580ms
     ✓ design installs dependencies like build and debug 2562ms
     ✓ plan installs dependencies like build and debug 1816ms
     ✓ design stops on a failed install (5) 1571ms
     ✓ plan stops on a failed install (5) 1809ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1566ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1713ms
     ✓ fails without minting when origin cannot be reached 538ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1521ms
     ✓ reports a package manager that could not run (127) apart from a failed install 2167ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 3872ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 6801ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 6252ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 5615ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 5291ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 5286ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2997ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 3271ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 2806ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 2795ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 4107ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 3930ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 4608ms
     ✓ commits leftovers when a copy entry points outside the checkout 2995ms
     ✓ never commits the entries setup copies in from the main checkout 2747ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 2817ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 1188ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 1279ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 1809ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 2072ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 1726ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 2078ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 2093ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 2184ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 2472ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 1061ms
     ✓ leaves a clean worktree's history alone 2241ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 2786ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 3849ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 4554ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 3380ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 4325ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 3909ms
     ✓ does not mark a resumed worktree it did not create 1340ms
   ✓ bkit worktrees setup — a host-made worktree on feat/{fid} (2)
     ✓ plan from a host-made worktree on feat/{fid} adopts it without rebasing 1096ms
     ✓ refuses plan from a host-made worktree whose branch carries unpushed dev work 890ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adopts the session branch in place when there is no worktree and no feat/{fid} 457ms
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 860ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 1485ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 2063ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 1163ms

 Test Files  7 passed (7)
      Tests  672 passed (672)
   Start at  16:47:07
   Duration  184.71s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/1050-host-made-worktrees/build-group-gate-2-1.log.reports/vitest-80189.xml

[bkit:gate:changed] lint: oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine/commands/workflow/worktrees.integration.test.ts .bkit/core/engine/commands/workflow/worktrees.test.ts .bkit/core/engine/commands/workflow/worktrees.ts

[bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/engine/commands/workflow/worktrees.integration.test.ts .bkit/core/engine/commands/workflow/worktrees.test.ts .bkit/core/engine/commands/workflow/worktrees.ts dist/commands/workflow/worktrees.js docs/plans/202611/1050-host-made-worktrees-plan.md docs/plans/202611/logs/1050-host-made-worktrees/build-brief-2-1.md docs/plans/202611/logs/1050-host-made-worktrees/build-brief-tests-2-1.md docs/plans/202611/logs/1050-host-made-worktrees/build-diff-2-1.md docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tasks-2-log.md docs/plans/202611/logs/1050-host-made-worktrees/build-plan-tests-2-log.md docs/plans/202611/logs/1050-host-made-worktrees/build-plan-verify-2-1.md docs/plans/202611/logs/1050-host-made-worktrees/build-tests-green-2-1.md docs/plans/202611/logs/1050-host-made-worktrees/build-tests-red-2-1.md
Checking formatting...
All matched files use Prettier code style!

[bkit:gate:changed] types: pnpm typecheck

> @cbartens/bkit@6.2.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/1050-host-made-worktrees
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.2.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/1050-host-made-worktrees
> tsc -p tsconfig.test.json


[bkit:gate:changed] every stage passed
