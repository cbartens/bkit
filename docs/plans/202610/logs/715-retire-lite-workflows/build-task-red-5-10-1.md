
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/workflows.test.ts

[test-timeout-budget] load average 10.6 on 10 cores: unit limits 5308ms per test, 10616ms per hook (x1.06)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (139 tests | 2 failed) 47221ms
   ✓ bkit workflows start (13)
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 97ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 84ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 113ms
       ✓ a new run in the same chat gets its own session row 87ms
       ✓ writes none outside Claude Code 165ms
     ✓ opens the next run after a finished one, and after another workflow's run 85ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 110ms
     ✓ design / plan / build / debug book in the current worktree 116ms
     ✓ refuses when the lock is live, writing no row 85ms
     ✓ --lock-held checks the lock is ours 116ms
     ✓ rejects an unknown workflow 56ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 92ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 118ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 85ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 77ms
     ✓ an OPEN decision of an earlier run never resurfaces 79ms
     ✓ an OPEN decision mid-build prints its header fields 78ms
     ✓ reads Test attempt from a tests pause 79ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 126ms
     ✓ writes no row when status.jsonl does not exist 96ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 100ms
     ✓ aborts a rebase only when one is in progress 212ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 196ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 116ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 128ms
     ✓ --max-exceeded says a handover is due without any sentinel 103ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 92ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 152ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 181ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 85ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 143ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 126ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 272ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 207ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 294ms
     ✓ a debug run in SOAK mode always needs a handover 465ms
   ❯ bkit workflows close (19)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1038ms
       ✓ counts subagents of an earlier chat the run's session rows name 624ms
       ✓ records no context block, and still closes, outside a Claude Code session 413ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 394ms
     × records ending held and publish false on the workflow-done row 160ms
     × defaults the close row to ending done 387ms
     ✓ refuses an unknown ending 170ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 325ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 343ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 330ms
     ✓ always writes the telemetry, whatever the runtime 368ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 287ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 301ms
     ✓ an unwritable stats path is logged and never fails the close 349ms
     ✓ refuses without status.jsonl and writes nothing 145ms
     ✓ ship: run.pr, size of the squash commit, and coverage 610ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1242ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 528ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 587ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 415ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 315ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 332ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 395ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 355ms
     ✓ --record-step writes the close step's row before workflow-done 232ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 236ms
     ✓ --number without --outbox is a usage error 190ms
     ✓ --flush is ship only 102ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 369ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 323ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 371ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 366ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 339ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 139ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 140ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 793ms
     ✓ --flush with nothing to record commits and pushes nothing 614ms
     ✓ --flush carries the named worktree's logs into the dev commit 669ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 975ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 594ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 780ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 643ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 937ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1061ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1905ms
     ✓ --push on dev never carries a row whose references name another feature 1473ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 784ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 1064ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 670ms
     ✓ --push commits in the named worktree, not the checkout it runs from 376ms
     ✓ rejects --push with --flush, and --flush outside ship 77ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 735ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 793ms
     ✓ a close that landed releases the lock 1132ms
     ✓ removes the worktree before it releases the lock 1150ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 1953ms
       ✓ closePr refuses when the PR base is unknown 1696ms
     ✓ leaves a worktree no workflow created, and its branch, in place 864ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 99ms
     ✓ exits 12 when there is no versioned draft 93ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 93ms
     ✓ stamps the anchor from the runtime-resolved base commit 131ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 151ms
     ✓ promote copies the plan only 96ms
     ✓ rejects a workflow other than design or plan 118ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 194ms
     ✓ names the branch, not the remote-tracking ref, in each URL 181ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 162ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 151ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 361ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 253ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 646ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 318ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 287ms
     ✓ a second run's record does not let this FID's close commit 300ms
     ✓ record is present after workflows close and before the push 437ms
     ✓ failed handover from dev removes the record and keeps recorded paths 644ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 87ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 84ms
     ✓ a run with no issue holds the prompt alone 79ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 169ms
     ✓ --plan is appended when the file exists and skipped when it does not 125ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 175ms
     ✓ a missing prompt file exits 13 82ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 271ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 216ms
     ✓ puts each --line after the summary, in flag order 231ms
     ✓ refuses --final-return without --summary-file 79ms
     ✓ --summary prints the file and keeps a copy in --outbox 248ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 232ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 83ms
     ✓ a missing summary file exits 13 before anything is written 84ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 100ms
     ✓ a folder outside the outbox sessions folder is kept 94ms
     ✓ without --session-dir prints no sessionRemoved 131ms
   ✓ bkit workflows summary (8)
     ✓ passes publish into the summary input 34ms
     ✓ summary is FAIL when a plan task is not done 12ms
     ✓ summary is CONCERNS when a deferral was written 13ms
     ✓ summary recommends /bkit-debug on FAIL 24ms
     ✓ summary reports the last attempt 13ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 16ms
     ✓ a design summary carries the organised design's open questions 47ms
     ✓ refuses a status file with no run of the workflow, and a missing one 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close > records ending held and publish false on the workflow-done row
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:821:20
    819|     const cwd = closable();
    820|     const r = await run(cwd, wf("close", "build", "--ending=held", "--…
    821|     expect(r.code).toBe(0);
       |                    ^
    822|     const done = rows(statusOf(cwd)).filter((x) => x.type === "workflo…
    823|     expect(done).toHaveLength(1);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close > defaults the close row to ending done
AssertionError: expected { type: 'workflow-done', …(3) } to match object { ending: 'done' }
(4 matching properties omitted from actual)

- Expected
+ Received

  {
-   "ending": "done",
+   "at": "2026-10-29T02:11:31Z",
+   "parentSha": "3adaba043eeee00c83c1ad14947ca8df6bd43906",
+   "type": "workflow-done",
+   "workflow": "build",
  }

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:834:21
    832|     expect((await run(cwd, wf("close", "build"))).code).toBe(0);
    833|     const done = rows(statusOf(cwd)).filter((x) => x.type === "workflo…
    834|     expect(done[0]).toMatchObject({ ending: "done" });
       |                     ^
    835|     expect(done[0]).not.toHaveProperty("publish");
    836|     expect(writtenOutcome(cwd)).toMatchObject({ ending: "done" });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 137 passed (139)
   Start at  12:11:23
   Duration  47.72s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-K25elF/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
