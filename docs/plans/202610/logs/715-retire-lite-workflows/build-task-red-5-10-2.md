
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/workflows.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (139 tests | 2 failed) 58960ms
   ✓ bkit workflows start (13)
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 126ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 96ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 132ms
       ✓ a new run in the same chat gets its own session row 98ms
       ✓ writes none outside Claude Code 94ms
     ✓ opens the next run after a finished one, and after another workflow's run 92ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 136ms
     ✓ design / plan / build / debug book in the current worktree 145ms
     ✓ refuses when the lock is live, writing no row 116ms
     ✓ --lock-held checks the lock is ours 147ms
     ✓ rejects an unknown workflow 75ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 115ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 171ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 106ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 105ms
     ✓ an OPEN decision of an earlier run never resurfaces 99ms
     ✓ an OPEN decision mid-build prints its header fields 96ms
     ✓ reads Test attempt from a tests pause 101ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 151ms
     ✓ writes no row when status.jsonl does not exist 113ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 111ms
     ✓ aborts a rebase only when one is in progress 239ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 221ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 128ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 136ms
     ✓ --max-exceeded says a handover is due without any sentinel 106ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 98ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 193ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 164ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 77ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 81ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 80ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 77ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 79ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 90ms
     ✓ a debug run in SOAK mode always needs a handover 111ms
   ❯ bkit workflows close (19)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 226ms
       ✓ counts subagents of an earlier chat the run's session rows name 244ms
       ✓ records no context block, and still closes, outside a Claude Code session 227ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 231ms
     × records ending held and publish false on the workflow-done row 113ms
     × defaults the close row to ending done 217ms
     ✓ refuses an unknown ending 104ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 222ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 219ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 218ms
     ✓ always writes the telemetry, whatever the runtime 208ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 186ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 198ms
     ✓ an unwritable stats path is logged and never fails the close 225ms
     ✓ refuses without status.jsonl and writes nothing 80ms
     ✓ ship: run.pr, size of the squash commit, and coverage 274ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 363ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 256ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 289ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 339ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 353ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 379ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 297ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 367ms
     ✓ --record-step writes the close step's row before workflow-done 263ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 302ms
     ✓ --number without --outbox is a usage error 241ms
     ✓ --flush is ship only 112ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 366ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 400ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 375ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 363ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 285ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 202ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 197ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 804ms
     ✓ --flush with nothing to record commits and pushes nothing 637ms
     ✓ --flush carries the named worktree's logs into the dev commit 695ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 712ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 804ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 976ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1236ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1827ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1520ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1676ms
     ✓ --push on dev never carries a row whose references name another feature 1246ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1466ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 2605ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1571ms
     ✓ --push commits in the named worktree, not the checkout it runs from 942ms
     ✓ rejects --push with --flush, and --flush outside ship 164ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1959ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2226ms
     ✓ a close that landed releases the lock 1585ms
     ✓ removes the worktree before it releases the lock 1327ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2227ms
       ✓ closePr refuses when the PR base is unknown 1847ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1123ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 155ms
     ✓ exits 12 when there is no versioned draft 165ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 147ms
     ✓ stamps the anchor from the runtime-resolved base commit 186ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 253ms
     ✓ promote copies the plan only 189ms
     ✓ rejects a workflow other than design or plan 164ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 356ms
     ✓ names the branch, not the remote-tracking ref, in each URL 292ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 289ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 282ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 656ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 490ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1004ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 401ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 377ms
     ✓ a second run's record does not let this FID's close commit 474ms
     ✓ record is present after workflows close and before the push 872ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1291ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 167ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 178ms
     ✓ a run with no issue holds the prompt alone 172ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 403ms
     ✓ --plan is appended when the file exists and skipped when it does not 290ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 585ms
     ✓ a missing prompt file exits 13 192ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 619ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 569ms
     ✓ puts each --line after the summary, in flag order 548ms
     ✓ refuses --final-return without --summary-file 188ms
     ✓ --summary prints the file and keeps a copy in --outbox 669ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 707ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 238ms
     ✓ a missing summary file exits 13 before anything is written 181ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 246ms
     ✓ a folder outside the outbox sessions folder is kept 196ms
     ✓ without --session-dir prints no sessionRemoved 160ms
   ✓ bkit workflows summary (8)
     ✓ passes publish into the summary input 49ms
     ✓ summary is FAIL when a plan task is not done 18ms
     ✓ summary is CONCERNS when a deferral was written 19ms
     ✓ summary recommends /bkit-debug on FAIL 38ms
     ✓ summary reports the last attempt 19ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 19ms
     ✓ a design summary carries the organised design's open questions 19ms
     ✓ refuses a status file with no run of the workflow, and a missing one 3ms

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
+   "at": "2026-10-29T02:12:18Z",
+   "parentSha": "663756fac176e2756e8dd29162b947d1159918a4",
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
   Start at  12:12:12
   Duration  59.63s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-iEm6t8/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
