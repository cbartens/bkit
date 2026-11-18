
> @cbartens/bkit@6.2.0 bkit:gate:changed /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs .bkit/core/engine/commands/workflow/step-base.ts .bkit/core/engine/commands/workflow/tests-changed.test.ts .bkit/core/engine/commands/workflow/tests-changed.ts DETAILS.md dist/commands/workflow/step-base.js dist/commands/workflow/tests-changed.js docs/capabilities.md docs/plans/202611/logs/1018-subagent-commits-makes/build-decision-1-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-holistic-gate-1-5.md docs/plans/202611/logs/1018-subagent-commits-makes/build-holistic-gate-1-6.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-gaps-remediate-holistic-1-5-log.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-verify-holistic-1-6.md docs/plans/202611/logs/1018-subagent-commits-makes/status.jsonl


[bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/engine/commands/workflow/step-base.ts .bkit/core/engine/commands/workflow/tests-changed.test.ts .bkit/core/engine/commands/workflow/tests-changed.ts DETAILS.md dist/commands/workflow/step-base.js dist/commands/workflow/tests-changed.js docs/capabilities.md docs/plans/202611/logs/1018-subagent-commits-makes/build-decision-1-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-holistic-gate-1-5.md docs/plans/202611/logs/1018-subagent-commits-makes/build-holistic-gate-1-6.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-gaps-remediate-holistic-1-5-log.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-verify-holistic-1-6.md docs/plans/202611/logs/1018-subagent-commits-makes/status.jsonl

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes

 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (232 tests) 117045ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1708ms
   ✓ preserves the requested event for selected-workflow verification 1130ms
   ✓ requires selected other-workflow success at the exact pushed head 2230ms
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 2006ms
     ✓ saves the failed job count without the capstone job 1108ms
     ✓ a CI selection keeps the failed job names, capstone left out 1311ms
     ✓ counts the capstone job when it is the only failed job 654ms
     ✓ saves no failed job count when no job failed 708ms
     ✓ counts fallback evidence jobs without the capstone job 325ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 370ms
     ✓ filters branch and PR discovery by configured workflow and exact head 984ms
     ✓ freezes explicit workflow run attempt and all failed job pages 653ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1734ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2143ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 645ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 811ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 833ms
     ✓ rejects a workflow result count smaller than its returned records 669ms
     ✓ validates normalized fallback evidence against the requested identity 632ms
   ✓ bkit runs gate (74)
     ✓ refuses green CI when dev advanced beyond the validated code head 1930ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2379ms
     ✓ checks the named repository base and fails closed on missing evidence 1336ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1044ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1805ms
     ✓ rejects MCP capstone jobs belonging to another run 1771ms
     ✓ --fetch refreshes origin/<branch> before gating 673ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 714ms
       ✓ a source change past the validated head refuses (17) and names the path 546ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 686ms
       ✓ --validated without --month / --fid is a usage error (2) 520ms
       ✓ a validated sha that is not an ancestor refuses (17) 529ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 645ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 554ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1161ms
   ✓ bkit runs dispatch (21)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 672ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1851ms
     ✓ a failed re-trigger push names the cause in the log 1572ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 1955ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2810ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1338ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 588ms
     ✓ gh-error: every poll errored 458ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1370ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1170ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 955ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 1509ms
     ✓ a hand-off in the re-poll resumes from the saved receipt with no second re-trigger commit 1864ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 584ms
     ✓ CLI: verdict JSON, body scan, exit codes 1260ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 822ms
     ✓ CLI: dispatch without a run's invocation is refused, and nothing is polled or committed 493ms
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 507ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 477ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 450ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 436ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 1537ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 2024ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 1920ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1709ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 663ms
     ✓ re-trigger on dev only uses the record of its own FID 818ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 936ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 929ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (15)
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 457ms
     ✓ --snapshot scopes its run list and dev lookups to --repo 352ms
     ✓ --wait (4)
       ✓ waits for a run still going at the squash commit, then judges and records it 1343ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 417ms
       ✓ without --repo no call gains a --repo flag 500ms
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 2104ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 354ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 335ms
   ✓ bkit runs context (21)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 558ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 421ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 393ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 491ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 460ms
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 1121ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 933ms
     ✓ debug: a failure test run is a failed run 1292ms
     ✓ debug: a timed_out test run is a failed run 817ms
     ✓ debug: a startup_failure test run is a failed run 820ms
     ✓ debug: a test run still in progress or cancelled is not returned 1194ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 1320ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 745ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1857ms
     ✓ an unknown phase exits 3; gh needing auth exits 80 322ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 537ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 713ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 887ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 929ms
     ✓ --file and --step go together 678ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 3682ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 692ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 688ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 685ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 877ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 825ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 917ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 962ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run on a suppressed re-trigger 897ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found on a suppressed re-trigger 899ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (61 tests) 160890ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 3824ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 23451ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 2555ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 1558ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 1301ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1741ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 2211ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 3084ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1576ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1205ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 561ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 1091ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 1403ms
     ✓ design installs dependencies like build and debug 1614ms
     ✓ plan installs dependencies like build and debug 1607ms
     ✓ design stops on a failed install (5) 1334ms
     ✓ plan stops on a failed install (5) 1227ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1279ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1479ms
     ✓ fails without minting when origin cannot be reached 352ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1110ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1359ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 2867ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 5311ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 4762ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 3575ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 3488ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 3234ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2119ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 2326ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 2261ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 2155ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 3162ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 3000ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 3409ms
     ✓ commits leftovers when a copy entry points outside the checkout 3039ms
     ✓ never commits the entries setup copies in from the main checkout 2898ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 2959ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 1399ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 1382ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 1939ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 2007ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 2120ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 2091ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 2273ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 2456ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 2696ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 1364ms
     ✓ leaves a clean worktree's history alone 2545ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 2944ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 3350ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 3471ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 4042ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 4361ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 3905ms
     ✓ does not mark a resumed worktree it did not create 1467ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adopts the session branch in place when there is no worktree and no feat/{fid} 501ms
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 857ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 1689ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 2266ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 1668ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (187 tests) 179693ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 432ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1739ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 387ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 369ms
     ✓ writes no limits for a workflow with no ask point 340ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 306ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 368ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 562ms
       ✓ a new run in the same chat gets its own session row 491ms
       ✓ writes none outside Claude Code 376ms
     ✓ opens the next run after a finished one, and after another workflow's run 314ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 404ms
     ✓ design / plan / build / debug book in the current worktree 431ms
     ✓ refuses when the lock is live, writing no row 315ms
     ✓ --lock-held checks the lock is ours 427ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 300ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 523ms
   ✓ bkit workflows start — resume facts (12)
     ✓ an OPEN decision of an earlier run never resurfaces 313ms
     ✓ openDecision carries the Gate header 309ms
     ✓ workflows start reports openDecision for a DECIDED decision file that no build-decision row names 305ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 716ms
     ✓ workflows start does not report openDecision for a DECIDED decision file that a build-decision row names 350ms
     ✓ openDecision gate is null without the header 327ms
     ✓ openDecision gate ignores a Gate line below the header 347ms
     ✓ reads Test attempt from a tests pause 358ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 502ms
     ✓ writes no row when status.jsonl does not exist 380ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 369ms
     ✓ aborts a rebase only when one is in progress 789ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 800ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 711ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 437ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 561ms
     ✓ --max-exceeded says a handover is due without any sentinel 449ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 407ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 763ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 710ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 302ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 318ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 325ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 321ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 316ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 334ms
     ✓ bkit workflows fail refuses a multi-line, non-/bkit- or markdown-carrying --next-step before any write 345ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 527ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 426ms
     ✓ bkit workflows fail treats an empty --next-step as absent 313ms
     ✓ a debug run in SOAK mode always needs a handover 461ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 925ms
       ✓ counts subagents of an earlier chat the run's session rows name 869ms
       ✓ records no context block, and still closes, outside a Claude Code session 924ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 997ms
     ✓ records ending held and publish false on the workflow-done row 865ms
     ✓ defaults the close row to ending done 1485ms
     ✓ refuses an unknown ending 457ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1044ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 767ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 791ms
     ✓ always writes the telemetry, whatever the runtime 761ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 593ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 733ms
     ✓ an unwritable stats path is logged and never fails the close 819ms
     ✓ appends the completeness row before the workflow-done row 1000ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 736ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 780ms
     ✓ writes one completeness row per close 1373ms
     ✓ leaves out the previous run's rows that share a second with this run's start 742ms
     ✓ still closes when the completeness check throws 803ms
     ✓ still closes when the completeness row write throws 851ms
     ✓ ship: run.pr, size of the squash commit, and coverage 947ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1172ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 798ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 668ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1126ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1485ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1229ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 881ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1063ms
     ✓ --record-step writes the close step's row before workflow-done 779ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 957ms
     ✓ --number without --outbox is a usage error 754ms
   ✓ bkit workflows handover (29)
     ✓ --push commits and pushes the record on the feature branch without a handover 1062ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1083ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1044ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1251ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 756ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 510ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 427ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2693ms
     ✓ --flush with nothing to record commits and pushes nothing 1597ms
     ✓ --flush carries the named worktree's logs into the dev commit 2527ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2799ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 1004ms
       ✓ ship's owner Stop on an open PR: exit 9, push skipped → route stop with the not-pushed line 780ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 1221ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 1064ms
       ✓ --ref, no push → route stop, no message 501ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 1020ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2491ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 3041ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2474ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2852ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2386ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2544ms
     ✓ --push on dev never carries a row whose references name another feature 2228ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2146ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 3842ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2336ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1162ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 2972ms
     ✓ preserves unlanded file deletions and ledger additions on close 5294ms
     ✓ preserves dirty work and uncertain branch evidence during close 5533ms
     ✓ preserves a local feature ref changed after its cleanup proof 5641ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3171ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2146ms
     ✓ a close that landed releases the lock 2861ms
     ✓ removes the worktree before it releases the lock 2773ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3592ms
       ✓ closePr refuses when the PR base is unknown 3580ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2579ms
   ✓ bkit workflows promote (7)
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 354ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 349ms
     ✓ names the branch, not the remote-tracking ref, in each URL 378ms
   ✓ --post on fail / links (4)
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 320ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 911ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 570ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 1383ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 578ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 589ms
     ✓ a second run's record does not let this FID's close commit 743ms
     ✓ record is present after workflows close and before the push 1362ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 2667ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 2728ms
       ✓ a run closed by workflow-failed keeps no parked copy 2434ms
       ✓ a run closed by workflow-done keeps no parked copy 2631ms
       ✓ a FAILED run gets no row 2681ms
       ✓ a DONE run gets no row 2679ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2323ms
   ✓ bkit workflows input (10)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 510ms
     ✓ --plan is appended when the file exists and skipped when it does not 303ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 450ms
     ✓ a rebuilt design input keeps the owner-interview record appended after the first build 329ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 963ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 767ms
     ✓ puts each --line after the summary, in flag order 727ms
     ✓ --summary prints the file and keeps a copy in --outbox 815ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 951ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (91 tests) 79771ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 303ms
     ✓ adopts the main checkout even when called from a linked worktree 350ms
     ✓ design and plan in place on main are refused 362ms
     ✓ still adopts a cloud session branch whose upstream is main 305ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1252ms
     ✓ may debug in place on dev 535ms
     ✓ adopts in place when the session is already on feat/{fid} 336ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (25)
     ✓ in-place debug on dev writes the shared-checkout record 1270ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1115ms
     ✓ a new run of the same FID rewrites startSha 1649ms
     ✓ a resume of the same FID reuses the record 1644ms
     ✓ a resume with no record rebuilds it from the run-commits row (17)
       ✓ restores the commits, the pushed list and startSha of the newest row 1955ms
       ✓ drops a commit id that is not on the branch 1944ms
       ✓ keeps the fresh startSha when the row's startSha is not a commit 1777ms
       ✓ writes an empty commit list when the run has no run-commits row 1972ms
       ✓ ignores a row from before the open run started 1948ms
       ✓ restores the commits from the row on origin/dev when the handover landed 2378ms
       ✓ restores the commits when origin/dev holds only the lines the checkout lacks 2765ms
       ✓ ignores the row on origin/dev when the checkout's log shows the run closed 2376ms
       ✓ ignores the row on origin/dev when the run there is closed 2572ms
       ✓ from the parked local copy (8)
         ✓ restores commits, pushed and startSha when no copy of the row is reachable 2097ms
         ✓ wins over the row on origin/dev, which is then not needed 2593ms
         ✓ wins over the row in the checkout's own log while the run is open 2327ms
         ✓ still drops a commit id that is not on the branch 2293ms
         ✓ is ignored and removed when the checkout's log shows the run closed 2041ms
         ✓ is ignored when it was parked for another workflow 2099ms
         ✓ is removed once the record is rebuilt 2323ms
         ✓ is removed when the live record already stands for the open run 1926ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 989ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 982ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1281ms
     ✓ a stale record without a lock is replaced 1230ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 959ms
     ✓ refuses inherited unpublished dev commits in every ship mode 3478ms
     ✓ names inherited commits and ship recovery in the refusal 810ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1037ms
     ✓ ship names a missing feat branch 448ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 944ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 327ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 404ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 427ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 385ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 370ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 319ms
     ✓ never commits an entry only the main checkout's copy list names 436ms
   ✓ bkit worktrees remove (18)
     ✓ preserves a marked worktree with uncommitted changes and its marker 535ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 348ms
     ✓ tells a caller inside the removed worktree where to cd 473ms
     ✓ fails with its own exit code when git cannot remove a marked path 413ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1485ms
       ✓ preserves staged-only mode during landed cleanup 1387ms
       ✓ preserves staged-only type during landed cleanup 1203ms
       ✓ preserves staged-only deletion during landed cleanup 1089ms
       ✓ removes landed staged content when both index and working contents are on dev 1245ms
       ✓ deletes the proved local and remote branch at their landed tips 1317ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1804ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 463ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 464ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 376ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 891ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (167 tests) 84307ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 502ms
     ✓ finishes a CI round only with its own failed job count 460ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 475ms
     ✓ done --group writes group on the row 334ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 533ms
     ✓ carries extra fields, parsed as JSON when they are JSON 338ms
     ✓ reports a failed commit with exit 8 without writing the row 866ms
     ✓ a failed commit leaves no row staged in the index 953ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 803ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 683ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1216ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 833ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 831ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 331ms
     ✓ --ref reads the status file as committed on that ref, not from disk 413ms
     ✓ --ref exits 3 when the ref does not carry the status file 400ms
     ✓ fails on a placeholder left in the artifact 368ms
     ✓ fails when the row's verdict differs from the artifact's 335ms
     ✓ fails when the row does not list the artifact, or carries another attempt 363ms
     ✓ fails on a missing artifact 333ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 372ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a run-tests row missing its scope, and an empty scope 400ms
   ✓ bkit steps finish (17)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 499ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 406ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 334ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 707ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 857ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 719ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 863ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1489ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 756ms
     ✓ --post needs --number; without --post there is no tracker key 317ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 332ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 572ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 455ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 313ms
     ✓ --attempt-of checks the row carries the derived counter 439ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 943ms
     ✓ writeStepRow refuses when a recorded path changed 1187ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 508ms
     ✓ writeStepRow appends its commit sha to the record 874ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1722ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 362ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 822ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 921ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 1072ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 479ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 2024ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 1214ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 976ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 541ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1638ms
     ✓ refuses the execute step when it changes another group's planned test, exit 11 629ms
     ✓ refuses the gaps-remediate step when it changes another group's planned test, exit 11 545ms
     ✓ the tests step's finish refuses an earlier task's changed planned test with exit 11 932ms
     ✓ the tests step's finish passes its own group's and taken-over tests 927ms
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 566ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 546ms
     ✓ staging failure: exit 4 and no commit is created, no false success 723ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 523ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 420ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 409ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 376ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 1495ms
> [bkit] TRUNCATED HERE — 47 lines omitted. Dropped content was NOT read.
     ✓ runs local gates only after current-generation remediation or soak 1134ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 659ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 453ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 462ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 489ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 716ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 742ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 592ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 416ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 716ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 542ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 468ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 745ms
     ✓ PASS is 0 failures with or without reports 812ms
     ✓ clears a previous attempt's reports before the gate runs 498ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 448ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 406ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1531ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 981ms
     ✓ numbers runs within the workflow's active run and per step 1690ms
     ✓ tests run --file records the tested snapshot on its test-run row 1108ms
     ✓ a FAIL test-run row records each failing case as file and name 664ms
     ✓ a PASS test-run row records no failed tests 2022ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 1092ms
     ✓ without --file no row is written and the output carries row null 795ms
   ✓ bkit tests run --changed-since (17)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ the nothing-to-run row records the tested snapshot 773ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 1926ms
     ✓ --since-pass-of skips failing runs and steps it does not name 2477ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 2731ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 1537ms
     ✓ --since-pass-of needs --file, --workflow and --changed-since 457ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 1342ms
     ✓ changed-since refuses a sha that names no commit 573ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 1401ms
     ✓ a deleted file that no file mentions passes and the log says so 1195ms
     ✓ a failed importer search runs the whole check 1398ms
     ✓ --changed-since=feature-base starts at the feature's start commit 1934ms
     ✓ --changed-since=feature-base with no origin/dev meeting point measures from origin/dev and says so 476ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ a passing required push gate records a receipt 1309ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 1179ms
     ✓ a failing required push gate leaves the failed marker 1017ms
     ✓ uncommitted code blocks the receipt until it is committed 1494ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 934ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 620ms
     ✓ a planned test absent from a loaded report is a missing gap 512ms
     ✓ a file that fails to load is a red of kind red-not-loaded 891ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 812ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 379ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1491ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 641ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 726ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 804ms
     ✓ takeover (5)
       ✓ tests red records a failing takeover as red with from 810ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 715ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 1038ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ green with no gaps prints verdict PASS and an empty gaps 929ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1094ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 1099ms
     ✓ green: lists each gap kind, with the runner output 911ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1634ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 506ms
       ✓ green clears an exception-only task from a human commit 442ms
 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (22 tests) 34376ms
   ✓ the dispatch seam on a real worktree (7)
> [bkit] TRUNCATED HERE — 55 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1256ms
     ✓ counts files committed since --base 892ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1043ms
     ✓ runs nothing and exits 0 when no file changed 687ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1277ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (116 tests) 18644ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 1420ms
     ✓ a failing file absent at the base commit is the branch's 811ms
     ✓ an undeclared bkit:test:file reads unknown 792ms
     ✓ a failed base install reads unknown and removes the worktree 814ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 1053ms
     ✓ copies the worktreeCopy entries into the base checkout 1065ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a CI run that cannot settle the base falls back to the local run 4846ms
     ✓ a pull_request-event CI run at the base sha does not settle none 980ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 770ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 818ms
     ✓ the base test run does not inherit the hooks-off git config 884ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 2082ms
     ✓ runs an audit template's project-section change through bkit:gate:min 2486ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1745ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1937ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1877ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 892ms
     ✓ runs the full gate for replayed debug code 1719ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1797ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 1728ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2073ms
     ✓ a push that fails without a server answer is returned once, never retried 1849ms
     ✓ a failed fetch is returned before anything is built 530ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2280ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1572ms
     ✓ lands from a clone whose fetch refspec omits dev 2095ms
     ✓ build throwing stops the landing and removes the throwaway checkout 661ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 556ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1396ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 405ms
     ✓ challenge gate without --base sizes only the branch's own lines 471ms
 ✓ .bkit/core/engine/commands/lib.test.ts (76 tests) 4784ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1349ms
     ✓ runGit names ENOBUFS when output passes the limit 992ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 817ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ node — with no report path the test file is left as it was 3190ms
     ✓ vitest — with no report path the test file is left as it was 2038ms
     ✓ a run naming files of two kinds is refused as a usage error 931ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 1315ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 1396ms
   ✓ bkit:lint:file passes a test file its linter does not cover (4)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs lints clean 781ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… lints clean 875ms
   ✓ bkit:test:file ends a node --test file whose test awaits a child that never exits (1)
     ✓ node — a test awaiting a child that never exits fails within the limit 31196ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (77 tests) 4104ms
   ✓ bkit decisions compose (40)
> [bkit] TRUNCATED HERE — 44 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 588ms
     ✓ refuses a code conflict and aborts the rebase on the spot 753ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1057ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 617ms
     ✓ produces byte-identical output to merge=union 1437ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1100ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1487ms
     ✓ refuses a lockfile whose regenerate command fails 1349ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 2161ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1621ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 891ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 957ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1176ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1511ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 1343ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 636ms
       ✓ runs (0) with the landed path count once dev moved 1170ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 571ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1357ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1802ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2953ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 737ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1171ms
     ✓ --mode=abort pushes when the branch has no open PR 1199ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 986ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 707ms
     ✓ --open-pr carries the MCP answer and skips gh 930ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1467ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1702ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3546ms
     ✓ skip-ci HEAD on the replay is refused 996ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2659ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 785ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1360ms
     ✓ a fetch that fails exits 10 538ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 846ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 783ms
     ✓ scan-diff attributes deletion to its old test ins… 810ms
     ✓ scan-diff consumes each moved assertion once and … 787ms
     ✓ scan-diff does not match identical assertions fro… 757ms
     ✓ scan-diff does not match the same leaf test name … 718ms
     ✓ scan-diff does not match a same-named test with d… 796ms
     ✓ scan-diff does not match a same-named test with c… 742ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 813ms
     ✓ --paths with no match exits 1 696ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 579ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1117ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 1103ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 825ms
     ✓ scan-diff ignores a removed comment in a test file 835ms
     ✓ scan-diff ignores an assertion moved within the file 849ms
     ✓ scan-diff still reports a removed assertion 779ms
     ✓ scan-diff reports an assertion re-added only outside the test file 755ms
     ✓ scan-diff finds an added pytest mark skip 799ms
     ✓ scan-diff finds an added unittest skip 789ms
     ✓ scan-diff finds an added bare skip call 819ms
     ✓ scan-diff ignores a quoted skip in a documentation file 858ms
     ✓ scan-diff ignores a marker literal in a non-test source file 758ms
     ✓ scan-diff ignores an assertion whose expectation changed 692ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 727ms
     ✓ scan-diff reports a deleted test file 754ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 573ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 3990ms
     ✓ publishes local code with a CI running head before bookkeeping 4539ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 6559ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 5405ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 3055ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 2780ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 3118ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 2401ms
     ✓ --merge-docs skips an empty bkit:generate script 2214ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1590ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 3760ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 4369ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 2516ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 2545ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 3146ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 2238ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 1377ms
     ✓ exits 10 when the fetch fails 761ms
     ✓ refuses --merge-docs with --head, and an unknown --head 939ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1466ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1970ms
     ✓ a failed install stops ship (16) 2135ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 2041ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1702ms
     ✓ exits 10 when the fetch fails 1252ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 867ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 4055ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 3216ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 2857ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1507ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 4642ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 828ms
     ✓ reports undeclared and runs nothing with an empty script 840ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 1164ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 1112ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 781ms
> [bkit] TRUNCATED HERE — 43 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
   ✓ publication ownership lock (4)
     ✓ reclaims only a proven dead matching process identity 348ms
stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

> [bkit] TRUNCATED HERE — 45 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (71 tests) 155104ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (47)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 4904ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 381ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 2707ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches 3629ms
     ✓ T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch 2011ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 1765ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 3481ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 2788ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 4650ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 478ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 2255ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 1771ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 2708ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 2514ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 2364ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 2500ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 3076ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 3248ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 3615ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 2836ms
       ✓ a branch with no status.jsonl dispatches as before 3241ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 3217ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 4239ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 3641ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 3740ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ keeps published build completion and PR links in one terminal comment 5728ms
     ✓ continues after the prepared completion source disappears 2930ms
     ✓ records preparation and session association failures despite successful delivery 3140ms
     ✓ associates startup and run across restart or starts fresh safely 5015ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 16690ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 3934ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 3963ms
     ✓ malformed .mcp.json fails install instead of being overwritten 534ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 3551ms
> [bkit] TRUNCATED HERE — 69 lines omitted. Dropped content was NOT read.
   ✓ Debug CI evidence sequence (8)
     ✓ finishes local-only rounds through the actual Debug Step 3 commands 9197ms
     ✓ records the failed job count and reads an uncounted local round as unknown 7203ms
     ✓ finishes replacement CI evidence with the unchanged debug run number 5417ms
     ✓ finishes the first CI evidence round of the second debug run 3789ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ .husky/pre-push: empty stdin → gates still run 1458ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 1379ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 786ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 634ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 1022ms
     ✓ .husky/pre-push: first and last lines name the log 957ms
     ✓ .husky/pre-push: the hook body runs once 841ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 1456ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 1558ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 1471ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 1321ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 1269ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 1246ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 1546ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 995ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 1393ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 776ms
     ✓ .husky/pre-push: a gate fails → no disk prune 1479ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 927ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 1137ms
     ✓ a stale register stops the push before any gate runs 653ms
     ✓ bkit check fails → the push stops before any gate runs 634ms
     ✓ the dependency audit runs before any gate, when its script is present 734ms
     ✓ no dependency-audit script → skipped, the gates still run 913ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1158ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 811ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1308ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 869ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1036ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 1062ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 992ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 891ms
   ✓ graphify register pre-push gate (18)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ branch with an open PR into dev, register current → push goes on 507ms
     ✓ branch with no open PR → no check, push goes on 767ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 722ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 500ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 1043ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ trusted .envrc → the gate sees its variables 2876ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 1268ms
     ✓ trusted .envrc that fails to load prints the cause, not "not trusted" 1356ms
     ✓ untrusted .envrc still prints the direnv allow line 1880ms
     ✓ no .envrc → no direnv call 949ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ gh not on PATH → warns, gates run 2215ms
     ✓ gh not on PATH → warns, gates run for both hook copies 2686ms
     ✓ base fetch fails → warns, gates run 3154ms
     ✓ dev push → no PR lookup 2306ms
     ✓ min push of a conflicting PR → blocked 3090ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ tests run exits 4 naming the queue folder when a regular file blocks it 986ms
     ✓ tests run with --lock-wait-s=0 exits 81 at once against a held lock 1139ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 1225ms
     ✓ the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 1143ms
   ✓ bkit tests jump (3)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 2364ms
     ✓ saves the failed job count without the capstone job 1135ms
     ✓ a CI selection keeps the failed job names, capstone left out 1210ms
     ✓ counts the capstone job when it is the only failed job 629ms
     ✓ saves no failed job count when no job failed 830ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 318ms
     ✓ filters branch and PR discovery by configured workflow and exact head 778ms
     ✓ freezes explicit workflow run attempt and all failed job pages 580ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1909ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2616ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1293ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1600ms
     ✓ checks the named repository base and fails closed on missing evidence 836ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 922ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 843ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 466ms
       ✓ a source change past the validated head refuses (17) and names the path 381ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 460ms
       ✓ --validated without --month / --fid is a usage error (2) 385ms
       ✓ a validated sha that is not an ancestor refuses (17) 392ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 467ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1129ms
     ✓ a failed re-trigger push names the cause in the log 1264ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 2027ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2189ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1131ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 533ms
     ✓ gh-error: every poll errored 403ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1005ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1048ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 756ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 1218ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 428ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 404ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 400ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 462ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 1633ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1460ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 609ms
     ✓ re-trigger on dev only uses the record of its own FID 716ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 761ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 392ms
   ✓ bkit runs context (21)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 351ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 333ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 337ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 364ms
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 667ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 1107ms
     ✓ debug: a failure test run is a failed run 1568ms
     ✓ debug: a timed_out test run is a failed run 1211ms
     ✓ debug: a startup_failure test run is a failed run 1268ms
     ✓ debug: a test run still in progress or cancelled is not returned 891ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 843ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 1118ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 2839ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 444ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 627ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 685ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 884ms
     ✓ --file and --step go together 643ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 3195ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 625ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 649ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 611ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 713ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 687ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 755ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 700ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows start — resume facts (12)
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 452ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 360ms
     ✓ aborts a rebase only when one is in progress 524ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 457ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 512ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 336ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 330ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 499ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 592ms
     ✓ an unwritable stats path is logged and never fails the close 553ms
     ✓ appends the completeness row before the workflow-done row 675ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 504ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 714ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1005ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 697ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 674ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 507ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 676ms
     ✓ --number without --outbox is a usage error 578ms
   ✓ bkit workflows handover (29)
     ✓ --push commits and pushes the record on the feature branch without a handover 784ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 363ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 336ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2159ms
     ✓ --flush with nothing to record commits and pushes nothing 1132ms
     ✓ --flush carries the named worktree's logs into the dev commit 2012ms
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ preserves a local feature ref changed after its cleanup proof 4910ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2575ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1884ms
     ✓ a close that landed releases the lock 2425ms
     ✓ removes the worktree before it releases the lock 2329ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 334ms
   ✓ --post on fail / links (4)
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 301ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 700ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 396ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 2214ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 2680ms
       ✓ a run closed by workflow-failed keeps no parked copy 2316ms
       ✓ a run closed by workflow-done keeps no parked copy 2274ms
       ✓ a FAILED run gets no row 2225ms
       ✓ a DONE run gets no row 2166ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1860ms
   ✓ bkit workflows input (10)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 356ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1616ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 3227ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 3528ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1657ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1492ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 1766ms
     ✓ plan installs dependencies like build and debug 1450ms
     ✓ design stops on a failed install (5) 1335ms
     ✓ plan stops on a failed install (5) 1402ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1359ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1382ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1040ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1264ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 2543ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 1738ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 2074ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 2030ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 2859ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 3093ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 3110ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 2944ms
> [bkit] TRUNCATED HERE — 47 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1392ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1288ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1139ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 1489ms
     ✓ fetches the issue and its comments as GitHub returns them 1354ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 976ms
     ✓ invalidates missing corrupt and unsupported progress cache 1268ms
     ✓ contains cache read and write failures as standalone degradation 948ms
     ✓ uses legacy receipts and contains receipt failures 1650ms
     ✓ records an engine-action row and skips the same key + body on a re-run 983ms
     ✓ a recent identical comment counts as done (the final close comment) 1124ms
     ✓ a failed post reports done false with the reason and never leaks a token 1412ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1161ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 694ms
     ✓ a different marker hash posts 568ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 542ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (115 tests) 61920ms
   ✓ bkit prs open (36)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ prMarker writes a FID-only marker with github wired and no issue 717ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 646ms
     ✓ retries a failed create once, and exits 5 when it fails twice 872ms
     ✓ exits 5 when the open-PR probe errors 331ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 437ms
     ✓ prs open still opens against any other base 937ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 1143ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 1236ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1463ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 1177ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 1323ms
     ✓ runs no merge when the PR is already MERGED 1758ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1165ms
     ✓ prs merge refuses a PR whose base is main 1367ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 1382ms
     ✓ prs merge refuses when the PR base is unknown 904ms
     ✓ prs merge reads the base from the one pr view it already makes 734ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 857ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 1725ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 771ms
     ✓ never reads dev's required checks without --only-if-required 1117ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 702ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 539ms
     ✓ is not green when a check failed, naming it (exit 1) 1100ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 734ms
     ✓ is not green on an empty rollup (total 0) 737ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 560ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 694ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 756ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 383ms
     ✓ refuses a code conflict and aborts the rebase on the spot 444ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1000ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 459ms
     ✓ produces byte-identical output to merge=union 1100ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 600ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1604ms
     ✓ refuses a lockfile whose regenerate command fails 1065ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 804ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 777ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 552ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 621ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 930ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 861ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 535ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 420ms
       ✓ runs (0) with the landed path count once dev moved 701ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 360ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 736ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1168ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1672ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 414ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1481ms
     ✓ --mode=abort pushes when the branch has no open PR 1788ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1618ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 444ms
     ✓ --open-pr carries the MCP answer and skips gh 592ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1063ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1233ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3667ms
     ✓ skip-ci HEAD on the replay is refused 889ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2051ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 778ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1176ms
     ✓ a fetch that fails exits 10 528ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 722ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 580ms
     ✓ scan-diff attributes deletion to its old test ins… 550ms
     ✓ scan-diff consumes each moved assertion once and … 597ms
     ✓ scan-diff does not match identical assertions fro… 670ms
     ✓ scan-diff does not match the same leaf test name … 668ms
     ✓ scan-diff does not match a same-named test with d… 666ms
     ✓ scan-diff does not match a same-named test with c… 575ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 594ms
     ✓ --paths with no match exits 1 548ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 432ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 827ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 994ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 505ms
     ✓ scan-diff ignores a removed comment in a test file 538ms
     ✓ scan-diff ignores an assertion moved within the file 610ms
     ✓ scan-diff still reports a removed assertion 680ms
     ✓ scan-diff reports an assertion re-added only outside the test file 751ms
     ✓ scan-diff finds an added pytest mark skip 757ms
     ✓ scan-diff finds an added unittest skip 694ms
     ✓ scan-diff finds an added bare skip call 707ms
     ✓ scan-diff ignores a quoted skip in a documentation file 765ms
     ✓ scan-diff ignores a marker literal in a non-test source file 810ms
     ✓ scan-diff ignores an assertion whose expectation changed 793ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 712ms
     ✓ scan-diff reports a deleted test file 757ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 587ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 3422ms
     ✓ publishes local code with a CI running head before bookkeeping 3547ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 5412ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 3907ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 2771ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1790ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1858ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1461ms
     ✓ --merge-docs skips an empty bkit:generate script 1261ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1128ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 2120ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 2237ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1918ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1503ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1931ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1161ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 734ms
     ✓ exits 10 when the fetch fails 458ms
     ✓ refuses --merge-docs with --head, and an unknown --head 558ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 946ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1451ms
     ✓ a failed install stops ship (16) 1364ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1375ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1280ms
     ✓ exits 10 when the fetch fails 824ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 597ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2054ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2336ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 2091ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1852ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2833ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 688ms
     ✓ reports undeclared and runs nothing with an empty script 665ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 786ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 892ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 591ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 36334ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1030ms
     ✓ names each net-new and worsened finding in the log and the JSON 909ms
     ✓ fails on a net score rise with no net count change 1117ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 858ms
     ✓ treats a net score at or below 0.001 as float noise 757ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 737ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 386ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 745ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 957ms
     ✓ exits 4 on a dropped net field instead of silently passing 1112ms
     ✓ exits 4 on no summary instead of silently passing 976ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1005ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 773ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 849ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 840ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 579ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 538ms
     ✓ fails (exit 1) when vale reports alerts 727ms
     ✓ exits 6 on a vale runtime error 732ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 523ms
     ✓ falls back to vale sync when the main worktree has none 580ms
     ✓ fails when vale sync cannot restore the required styles 569ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 353ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 307ms
     ✓ exits 1 naming the files outside, whatever the commit message says 329ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 536ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 320ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 583ms
> [bkit] TRUNCATED HERE — 423 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 133 lines omitted. Dropped content was NOT read.
     ✓ runs local gates only after current-generation remediation or soak 1380ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 638ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 901ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 708ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 543ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 924ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 900ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 737ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 578ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 670ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 872ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 904ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1189ms
     ✓ PASS is 0 failures with or without reports 870ms
     ✓ clears a previous attempt's reports before the gate runs 497ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 614ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 558ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1146ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 714ms
     ✓ numbers runs within the workflow's active run and per step 1361ms
     ✓ tests run --file records the tested snapshot on its test-run row 591ms
     ✓ a FAIL test-run row records each failing case as file and name 1077ms
     ✓ a PASS test-run row records no failed tests 1487ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 494ms
     ✓ without --file no row is written and the output carries row null 395ms
   ✓ bkit tests run --changed-since (17)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ the nothing-to-run row records the tested snapshot 408ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 1484ms
     ✓ --since-pass-of skips failing runs and steps it does not name 1606ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 941ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 1018ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 664ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 902ms
     ✓ a deleted file that no file mentions passes and the log says so 428ms
     ✓ a failed importer search runs the whole check 941ms
     ✓ --changed-since=feature-base starts at the feature's start commit 1085ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 837ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 810ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 977ms
     ✓ a failing required push gate leaves the failed marker 892ms
     ✓ uncommitted code blocks the receipt until it is committed 1047ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 852ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 483ms
     ✓ a planned test absent from a loaded report is a missing gap 496ms
     ✓ a file that fails to load is a red of kind red-not-loaded 594ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 951ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 546ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1616ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 763ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 776ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1419ms
     ✓ takeover (5)
       ✓ tests red records a failing takeover as red with from 1277ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 1135ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 1469ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ green with no gaps prints verdict PASS and an empty gaps 543ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 700ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 580ms
     ✓ green: lists each gap kind, with the runner output 546ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1412ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 369ms
       ✓ green clears an exception-only task from a human commit 302ms
(node:30396) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 55 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 45 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 391ms
     ✓ finishes a CI round only with its own failed job count 387ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 327ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 405ms
     ✓ reports a failed commit with exit 8 without writing the row 1018ms
     ✓ a failed commit leaves no row staged in the index 483ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 626ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1113ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 926ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 569ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1150ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 313ms
     ✓ --ref reads the status file as committed on that ref, not from disk 307ms
     ✓ --ref exits 3 when the ref does not carry the status file 313ms
     ✓ fails on a placeholder left in the artifact 311ms
     ✓ fails when the row's verdict differs from the artifact's 307ms
     ✓ fails when the row does not list the artifact, or carries another attempt 329ms
     ✓ fails on a missing artifact 354ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 378ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a diagnose row missing its strategy, passes with it 334ms
     ✓ fails a run-tests row missing its scope, and an empty scope 500ms
   ✓ bkit steps finish (17)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 602ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 509ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1698ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 1336ms
     ✓ --post needs --number; without --post there is no tracker key 500ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks the FID's shape for the wired tracker 381ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 560ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 374ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 1285ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 1009ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 660ms
       ✓ gate --issue without --fid is a usage error 342ms
     ✓ --attempt-of checks the row carries the derived counter 805ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
> [bkit] TRUNCATED HERE — 96 lines omitted. Dropped content was NOT read.
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 781ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 306ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 385ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 359ms
> [bkit] TRUNCATED HERE — 81 lines omitted. Dropped content was NOT read.
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 655ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 1233ms
     ✓ stops the step when the command crashed or was misused 1029ms
   ✓ deferred landing of a held build (ship, matrix: held → landed) (2)
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 409ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 413ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees not allowed (cloud) -> adopts the repo root 453ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
   ✓ bkit runtime row (6)
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 374ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 319ms
     ✓ --file into a missing directory is refused, not created 370ms
 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (22 tests) 24673ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (33 tests) 22201ms
   ✓ changedFiles (2)
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1431ms
     ✓ counts files committed since --base 608ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1042ms
     ✓ runs nothing and exits 0 when no file changed 557ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 841ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 981ms
     ✓ a failing file absent at the base commit is the branch's 528ms
     ✓ an undeclared bkit:test:file reads unknown 473ms
     ✓ a failed base install reads unknown and removes the worktree 787ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 959ms
     ✓ copies the worktreeCopy entries into the base checkout 738ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a CI run that cannot settle the base falls back to the local run 4083ms
     ✓ a pull_request-event CI run at the base sha does not settle none 798ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 737ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 710ms
     ✓ the base test run does not inherit the hooks-off git config 758ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 695ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1075ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 422ms
     ✓ challenge gate without --base sizes only the branch's own lines 529ms
 ✓ .bkit/core/engine/ledgers/journal.test.ts (18 tests) 536ms
> [bkit] TRUNCATED HERE — 122 lines omitted. Dropped content was NOT read.
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

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > preserves byte-equal-text file when hash unknown
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] preserve: .bkit/.env.example (byte-equal-text: no recorded install-time hash — preserve (consumer may have modified it))

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > reclaims an unedited owned byte-equal file via canonicalHashes
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/.env.example
[bkit-uninstall-test] update version pin: .bkit/version (pruned 1)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > preserves byte-equal-text file when hash mismatches (consumer modified)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] preserve: .bkit/.env.example (byte-equal-text: content differs from install-time hash — consumer modified, preserve)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > removes bkit's github entry and keeps a consumer server and top-level key
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .mcp.json
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > removes bkit's linear entry and keeps a consumer server and top-level key
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .mcp.json
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > removes bkit's jira entry and keeps a consumer server and top-level key
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .mcp.json
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > deletes the file when bkit's github entry was all it held
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .cursor/mcp.json
[bkit-uninstall-test] prune empty dir: .cursor

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > deletes the file when bkit's linear entry was all it held
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .cursor/mcp.json
[bkit-uninstall-test] prune empty dir: .cursor

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > deletes the file when bkit's jira entry was all it held
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .cursor/mcp.json
[bkit-uninstall-test] prune empty dir: .cursor

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > deletes a 100%-bkit markered-text file (residual == shipped scaffold, not a dead husk)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after strip): .claude/hooks/bkit-preflight.sh
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude/hooks
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > preserves a markered-text file when the consumer added content outside the block
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] strip-block: .claude/hooks/bkit-preflight.sh
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > deletes opencode.json on full uninstall (renders @@sentinel@@ keys before strip-scope)
[bkit-uninstall-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-guardrails.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > deletes opencode.json holding every provider block and tracker entry earlier installs left
[bkit-uninstall-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-guardrails.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > keeps a provider block and a github tracker entry the consumer edited, whole, and their own entries
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-guardrails.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > keeps a provider block and a linear tracker entry the consumer edited, whole, and their own entries
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-guardrails.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > keeps a provider block and a jira tracker entry the consumer edited, whole, and their own entries
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-guardrails.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > preserves opencode.json when the consumer added their own key
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-guardrails.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > deletes .bkit/version on a full/core uninstall (bkit install-state, zero-footprint)
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/version
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
[bkit-uninstall-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps .bkit/version on a targeted (non-core) uninstall
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > prunes deleted paths from .bkit/version on a targeted (non-core) uninstall
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] delete mirror: .claude/agents/bkit-foo.md
[bkit-uninstall-test] prune empty dir: .claude/agents
[bkit-uninstall-test] update version pin: .bkit/version (pruned 1)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > leaves .bkit/version byte-identical on a targeted uninstall that prunes nothing
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > does not rewrite .bkit/version on a targeted dry-run (no writes)
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

[bkit-uninstall-test] [dry-run] update version pin: .bkit/version (pruned 1)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > strips package.json bkit install-state block on full/core uninstall (github)
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
[bkit-uninstall-test] package.json: removed bkit install-state block

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > strips package.json bkit install-state block on full/core uninstall (linear)
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
[bkit-uninstall-test] package.json: removed bkit install-state block

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > strips package.json bkit install-state block on full/core uninstall (jira)
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
[bkit-uninstall-test] package.json: removed bkit install-state block

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps package.json bkit block on targeted (non-core) uninstall (github)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps package.json bkit block on targeted (non-core) uninstall (linear)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps package.json bkit block on targeted (non-core) uninstall (jira)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > strip-block is idempotent: running on already-stripped file no-ops
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

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > strip-block is idempotent: running on already-stripped file no-ops
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

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — nuke > --nuke --yes deletes all present files without interactive prompt
[bkit-uninstall-test] delete: AGENTS.md
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/version
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
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete: .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/.env.example
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 277ms
 ✓ .bkit/core/engine/commands/lib.test.ts (76 tests) 4490ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1329ms
     ✓ runGit names ENOBUFS when output passes the limit 808ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 803ms
   ✓ explicit invocation context (2)
     ✓ rejects stale cross-worktree invocation and conflicting overrides 345ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (77 tests) 3674ms
   ✓ bkit decisions compose (40)
     ✓ Try again is offered for every base verdict 349ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (104 tests) 2933ms
   ✓ bkit status invocation (7)
     ✓ binds group and attempt and registers setup, remediation and ship steps 315ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (46 tests) 2987ms
   ✓ bkit tasks currency (6)
     ✓ currency matches a task on a moved symbol 342ms
     ✓ currency leaves run logs out: a symbol named only in another plan's log matches no task 352ms
     ✓ currency emits no hunk outside the matched set 329ms
     ✓ currency exits 0 with no hunks when no task matches 301ms
     ✓ currency judges base...against (origin/dev), not base...HEAD 471ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (85 tests) 2580ms
   ✓ bkit counters route --point (9)
     ✓ takes each point's default limit and asks when nothing is set 523ms
   ✓ bkit counters progress (19)
     ✓ judges codeChanged on source only, from the rounds' parent commits 305ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (52 tests) 1994ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 62ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 72ms
 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (51 tests) 1005ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 112ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (71 tests) 110ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 216ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (48 tests) 1994ms
   ✓ runLines (5)
     ✓ counts deleted lines into changed 325ms
     ✓ cuts at each merge on the first-parent chain, so merged-in work is not counted 565ms
     ✓ is null when first is not an ancestor of last, or either is missing 348ms
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

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > syncProjectDocs registers a present docs/{topic}.md beside a Not equivalent row
[bkit-install] register: docs/security.md in .agents/docs.md (Project Documents)

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > adds no row and reports a problem when the index has a row it cannot read
[bkit-install] .agents/docs.md: not edited — .agents/docs.md has a Project Documents row bkit cannot read (| **docs/noise.md** | Noise |), so it may already list the document. Add a row for the project documents you copied under a `## Project Documents` table below `<!-- bkit:end -->` by hand.

 ✓ .bkit/core/engine/install/project-docs.test.ts (38 tests) 75ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (79 tests) 1615ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 115ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (105 tests) 81ms
(node:59355) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:59355) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 98ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (327 tests) 342ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (73 tests) 76ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (19 tests) 22ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 18ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 351ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 47ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (75 tests) 62ms

 Test Files  63 passed (63)
      Tests  5020 passed (5020)
   Start at  18:51:43
   Duration  561.63s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/1018-subagent-commits-makes/build-holistic-gate-6.log.reports/vitest-49765.xml

[bkit:gate:changed] named: bats tests/shell/bkit-graphify-refresh.bats tests/shell/bkit-graphify-rollup.bats tests/shell/bkit-status-holes-sweep.bats
1..13
ok 1 refresh builds the register from the staged files, not HEAD or unstaged edits
ok 2 refresh rewrites the DETAILS copy of the packages diagram from the new register
ok 3 refresh drops a file deleted in the index from the build
ok 4 refresh replaces the text between the graphify markers and keeps an unstaged edit outside them
ok 5 a run replaces the text between the markers and leaves the text outside them unchanged
ok 6 a doc without markers that the script wrote whole is rewritten into the new layout with its overrides kept
ok 7 an absent doc is built from the starter
ok 8 a doc with one marker stops the run and is not written
ok 9 a doc with the markers out of order stops the run and is not written
ok 10 a hand-written doc without markers stops the run and is not written
ok 11 a marker named inside a sentence is not taken for a marker line
ok 12 the sweep prints the summary line the lane greps for
ok 13 the lane's grep pattern rejects output without the summary line

[bkit:gate:changed] lint: oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine/commands/workflow/step-base.ts .bkit/core/engine/commands/workflow/tests-changed.test.ts .bkit/core/engine/commands/workflow/tests-changed.ts

[bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/engine/commands/workflow/step-base.ts .bkit/core/engine/commands/workflow/tests-changed.test.ts .bkit/core/engine/commands/workflow/tests-changed.ts DETAILS.md dist/commands/workflow/step-base.js dist/commands/workflow/tests-changed.js docs/capabilities.md docs/plans/202611/logs/1018-subagent-commits-makes/build-decision-1-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-holistic-gate-1-5.md docs/plans/202611/logs/1018-subagent-commits-makes/build-holistic-gate-1-6.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-gaps-remediate-holistic-1-5-log.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-verify-holistic-1-6.md docs/plans/202611/logs/1018-subagent-commits-makes/status.jsonl
Checking formatting...
All matched files use Prettier code style!

[bkit:gate:changed] types: pnpm typecheck

> @cbartens/bkit@6.2.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.2.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes
> tsc -p tsconfig.test.json


[bkit:gate:changed] every stage passed
> [bkit] 1 over-long line was shortened; it says so inline.
> [bkit] TRUNCATED — kept 3010 of 14872 lines (233 KB of 1.0 MB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
