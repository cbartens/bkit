
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/workflows.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (136 tests | 1 failed) 50081ms
   ✓ bkit workflows start (13)
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 235ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 177ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 265ms
       ✓ a new run in the same chat gets its own session row 184ms
       ✓ writes none outside Claude Code 183ms
     ✓ opens the next run after a finished one, and after another workflow's run 153ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 179ms
     ✓ design / plan / build / debug book in the current worktree 223ms
     ✓ refuses when the lock is live, writing no row 161ms
     ✓ --lock-held checks the lock is ours 244ms
     ✓ rejects an unknown workflow 125ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 200ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 250ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 181ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 175ms
     ✓ an OPEN decision of an earlier run never resurfaces 157ms
     ✓ an OPEN decision mid-build prints its header fields 186ms
     ✓ reads Test attempt from a tests pause 169ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 264ms
     ✓ writes no row when status.jsonl does not exist 192ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 200ms
     ✓ aborts a rebase only when one is in progress 421ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 387ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 232ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 271ms
     ✓ --max-exceeded says a handover is due without any sentinel 180ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 162ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 258ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 254ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 126ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 127ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 130ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 121ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 121ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 147ms
     ✓ a debug run in SOAK mode always needs a handover 186ms
   ✓ bkit workflows close (16)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 398ms
       ✓ counts subagents of an earlier chat the run's session rows name 358ms
       ✓ records no context block, and still closes, outside a Claude Code session 387ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 374ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 402ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 360ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 377ms
     ✓ always writes the telemetry, whatever the runtime 356ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 268ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 314ms
     ✓ an unwritable stats path is logged and never fails the close 373ms
     ✓ refuses without status.jsonl and writes nothing 131ms
     ✓ ship: run.pr, size of the squash commit, and coverage 433ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 610ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 379ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 356ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 491ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 471ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 453ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 471ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 520ms
     ✓ --record-step writes the close step's row before workflow-done 334ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 384ms
     ✓ --number without --outbox is a usage error 320ms
     ✓ --flush is ship only 172ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 611ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 595ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 613ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 623ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 421ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 250ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 207ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 960ms
     ✓ --flush with nothing to record commits and pushes nothing 941ms
     ✓ --flush carries the named worktree's logs into the dev commit 1118ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 1363ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1461ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1693ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1227ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1674ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1466ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1374ms
     ✓ --push on dev never carries a row whose references name another feature 1539ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1432ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 2603ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 686ms
     ✓ --push commits in the named worktree, not the checkout it runs from 355ms
     ✓ rejects --push with --flush, and --flush outside ship 67ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 581ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 451ms
     ✓ a close that landed releases the lock 560ms
     ✓ removes the worktree before it releases the lock 584ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 1186ms
       ✓ closePr refuses when the PR base is unknown 1074ms
     ✓ leaves a worktree no workflow created, and its branch, in place 504ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 66ms
     ✓ exits 12 when there is no versioned draft 61ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 61ms
     ✓ stamps the anchor from the runtime-resolved base commit 78ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 97ms
     ✓ promote copies the plan only 65ms
     ✓ rejects a workflow other than design or plan 52ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 110ms
     ✓ names the branch, not the remote-tracking ref, in each URL 104ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 102ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 104ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 214ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 142ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 364ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 181ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 169ms
     ✓ a second run's record does not let this FID's close commit 211ms
     ✓ record is present after workflows close and before the push 349ms
     ✓ failed handover from dev removes the record and keeps recorded paths 527ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 69ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 69ms
     ✓ a run with no issue holds the prompt alone 66ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 162ms
     ✓ --plan is appended when the file exists and skipped when it does not 99ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 150ms
     ✓ a missing prompt file exits 13 64ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 234ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 182ms
     ✓ puts each --line after the summary, in flag order 179ms
     ✓ refuses --final-return without --summary-file 60ms
     ✓ --summary prints the file and keeps a copy in --outbox 184ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 180ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 60ms
     ✓ a missing summary file exits 13 before anything is written 60ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 81ms
     ✓ a folder outside the outbox sessions folder is kept 67ms
     ✓ without --session-dir prints no sessionRemoved 59ms
   ❯ bkit workflows summary (8)
     × passes publish into the summary input 5ms
     ✓ summary is FAIL when a plan task is not done 9ms
     ✓ summary is CONCERNS when a deferral was written 8ms
     ✓ summary recommends /bkit-debug on FAIL 15ms
     ✓ summary reports the last attempt 8ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 8ms
     ✓ a design summary carries the organised design's open questions 8ms
     ✓ refuses a status file with no run of the workflow, and a missing one 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows summary > passes publish into the summary input
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:2659:65
    2657|       `--file=${path.join(cwd, SREL, "status.jsonl")}`,
    2658|     ];
    2659|     expect((await run(cwd, [...base, "--publish=false"])).code).toBe(0…
       |                                                                 ^
    2660|     expect(md()).toContain("Publish: held");
    2661|     expect(md()).toContain("Docs: not synced");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 135 passed (136)
   Start at  07:05:25
   Duration  51.07s (tests 98%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-VjTD3P/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
