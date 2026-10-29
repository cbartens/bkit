
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> bash scripts/ci/test-file.sh .bkit/core/engine/commands/workflow/workflows.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (143 tests | 1 failed) 34312ms
   ✓ bkit workflows start (15)
     ✓ warns when the previous run for this fid was holey 112ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 397ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 96ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 81ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 116ms
       ✓ a new run in the same chat gets its own session row 90ms
       ✓ writes none outside Claude Code 85ms
     ✓ opens the next run after a finished one, and after another workflow's run 93ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 116ms
     ✓ design / plan / build / debug book in the current worktree 114ms
     ✓ refuses when the lock is live, writing no row 77ms
     ✓ --lock-held checks the lock is ours 123ms
     ✓ rejects an unknown workflow 62ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 99ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 130ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 81ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 81ms
     ✓ an OPEN decision of an earlier run never resurfaces 86ms
     ✓ an OPEN decision mid-build prints its header fields 81ms
     ✓ reads Test attempt from a tests pause 82ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 126ms
     ✓ writes no row when status.jsonl does not exist 98ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 99ms
     ✓ aborts a rebase only when one is in progress 221ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 208ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 117ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 125ms
     ✓ --max-exceeded says a handover is due without any sentinel 98ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 98ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 128ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 134ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 67ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 67ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 67ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 68ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 73ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 91ms
     ✓ a debug run in SOAK mode always needs a handover 97ms
   ❯ bkit workflows close (22)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 219ms
       ✓ counts subagents of an earlier chat the run's session rows name 285ms
       ✓ records no context block, and still closes, outside a Claude Code session 226ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 211ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 303ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 221ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 212ms
     ✓ always writes the telemetry, whatever the runtime 238ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 158ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 183ms
     ✓ an unwritable stats path is logged and never fails the close 207ms
     ✓ appends the completeness row before the workflow-done row 232ms
     × close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 223ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 217ms
     ✓ writes one completeness row per close 348ms
     ✓ still closes when the completeness check throws 215ms
     ✓ still closes when the completeness row write throws 205ms
     ✓ refuses without status.jsonl and writes nothing 72ms
     ✓ ship: run.pr, size of the squash commit, and coverage 236ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 321ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 203ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 203ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 267ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 267ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 295ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 251ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 247ms
     ✓ --record-step writes the close step's row before workflow-done 169ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 189ms
     ✓ --number without --outbox is a usage error 174ms
     ✓ --flush is ship only 87ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 298ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 298ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 325ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 324ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 239ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 131ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 121ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 551ms
     ✓ --flush with nothing to record commits and pushes nothing 395ms
     ✓ --flush carries the named worktree's logs into the dev commit 526ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 905ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 623ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 784ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 578ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 735ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 584ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 585ms
     ✓ --push on dev never carries a row whose references name another feature 584ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 541ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 1015ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 678ms
     ✓ --push commits in the named worktree, not the checkout it runs from 383ms
     ✓ rejects --push with --flush, and --flush outside ship 71ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 681ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 503ms
     ✓ a close that landed releases the lock 629ms
     ✓ removes the worktree before it releases the lock 644ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 1485ms
       ✓ closePr refuses when the PR base is unknown 1140ms
     ✓ leaves a worktree no workflow created, and its branch, in place 683ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 75ms
     ✓ exits 12 when there is no versioned draft 70ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 69ms
     ✓ stamps the anchor from the runtime-resolved base commit 92ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 110ms
     ✓ promote copies the plan only 70ms
     ✓ rejects a workflow other than design or plan 61ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 128ms
     ✓ names the branch, not the remote-tracking ref, in each URL 117ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 113ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 125ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 244ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 180ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 420ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 218ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 198ms
     ✓ a second run's record does not let this FID's close commit 253ms
     ✓ record is present after workflows close and before the push 419ms
     ✓ failed handover from dev removes the record and keeps recorded paths 620ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 76ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 76ms
     ✓ a run with no issue holds the prompt alone 78ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 167ms
     ✓ --plan is appended when the file exists and skipped when it does not 117ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 176ms
     ✓ a missing prompt file exits 13 78ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 295ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 314ms
     ✓ puts each --line after the summary, in flag order 268ms
     ✓ refuses --final-return without --summary-file 73ms
     ✓ --summary prints the file and keeps a copy in --outbox 227ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 230ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 71ms
     ✓ a missing summary file exits 13 before anything is written 70ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 88ms
     ✓ a folder outside the outbox sessions folder is kept 80ms
     ✓ without --session-dir prints no sessionRemoved 70ms
   ✓ bkit workflows summary (7)
     ✓ summary is FAIL when a plan task is not done 10ms
     ✓ summary is CONCERNS when a deferral was written 10ms
     ✓ summary recommends /bkit-debug on FAIL 17ms
     ✓ summary reports the last attempt 9ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 9ms
     ✓ a design summary carries the organised design's open questions 9ms
     ✓ refuses a status file with no run of the workflow, and a missing one 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close > close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run
AssertionError: expected { type: 'completeness', …(15) } to match object { Object (workflow, holey, ...) }
(15 matching properties omitted from actual)

- Expected
+ Received

  {
-   "holey": false,
-   "verdict": "CLEAN",
+   "holey": true,
+   "verdict": "HOLEY",
    "workflow": "ship",
  }

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:1104:20
    1102|     expect((await run(cwd, wf("close", workflow))).code).toBe(0);
    1103|     const stored = rows(statusOf(cwd)).find((x) => x.type === "complet…
    1104|     expect(stored).toMatchObject({ workflow, holey: false, verdict: "C…
       |                    ^
    1105|   });
    1106|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 142 passed (143)
   Start at  17:57:44
   Duration  34.85s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-RQBOgI/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
