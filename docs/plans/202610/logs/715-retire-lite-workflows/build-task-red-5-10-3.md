
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/workflows.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (139 tests | 2 failed) 76966ms
   ✓ bkit workflows start (13)
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 249ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 204ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 256ms
       ✓ a new run in the same chat gets its own session row 209ms
       ✓ writes none outside Claude Code 211ms
     ✓ opens the next run after a finished one, and after another workflow's run 209ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 265ms
     ✓ design / plan / build / debug book in the current worktree 286ms
     ✓ refuses when the lock is live, writing no row 219ms
     ✓ --lock-held checks the lock is ours 296ms
     ✓ rejects an unknown workflow 227ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 310ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 429ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 243ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 222ms
     ✓ an OPEN decision of an earlier run never resurfaces 234ms
     ✓ an OPEN decision mid-build prints its header fields 208ms
     ✓ reads Test attempt from a tests pause 204ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 298ms
     ✓ writes no row when status.jsonl does not exist 255ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 249ms
     ✓ aborts a rebase only when one is in progress 577ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 486ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 256ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 356ms
     ✓ --max-exceeded says a handover is due without any sentinel 235ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 231ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 334ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 457ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 381ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 277ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 166ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 134ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 163ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 178ms
     ✓ a debug run in SOAK mode always needs a handover 193ms
   ❯ bkit workflows close (19)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 359ms
       ✓ counts subagents of an earlier chat the run's session rows name 321ms
       ✓ records no context block, and still closes, outside a Claude Code session 368ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 441ms
     × records ending held and publish false on the workflow-done row 224ms
     × defaults the close row to ending done 439ms
     ✓ refuses an unknown ending 230ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 447ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 496ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 402ms
     ✓ always writes the telemetry, whatever the runtime 298ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 230ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 262ms
     ✓ an unwritable stats path is logged and never fails the close 311ms
     ✓ refuses without status.jsonl and writes nothing 113ms
     ✓ ship: run.pr, size of the squash commit, and coverage 370ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 499ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 313ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 395ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 491ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 535ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 464ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 372ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 379ms
     ✓ --record-step writes the close step's row before workflow-done 258ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 291ms
     ✓ --number without --outbox is a usage error 260ms
     ✓ --flush is ship only 147ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 484ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 505ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 639ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 550ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 382ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 191ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 173ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 858ms
     ✓ --flush with nothing to record commits and pushes nothing 664ms
     ✓ --flush carries the named worktree's logs into the dev commit 972ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 1462ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1403ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2151ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1399ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1685ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1685ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2088ms
     ✓ --push on dev never carries a row whose references name another feature 1525ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1392ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 2660ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1335ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1210ms
     ✓ rejects --push with --flush, and --flush outside ship 257ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1666ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1078ms
     ✓ a close that landed releases the lock 1850ms
     ✓ removes the worktree before it releases the lock 2417ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3573ms
       ✓ closePr refuses when the PR base is unknown 3368ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1541ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 168ms
     ✓ exits 12 when there is no versioned draft 164ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 159ms
     ✓ stamps the anchor from the runtime-resolved base commit 213ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 261ms
     ✓ promote copies the plan only 201ms
     ✓ rejects a workflow other than design or plan 152ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 306ms
     ✓ names the branch, not the remote-tracking ref, in each URL 303ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 279ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 305ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 712ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 800ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1471ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 518ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 492ms
     ✓ a second run's record does not let this FID's close commit 613ms
     ✓ record is present after workflows close and before the push 1070ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1744ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 185ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 173ms
     ✓ a run with no issue holds the prompt alone 215ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 622ms
     ✓ --plan is appended when the file exists and skipped when it does not 308ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 502ms
     ✓ a missing prompt file exits 13 191ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 675ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 546ms
     ✓ puts each --line after the summary, in flag order 533ms
     ✓ refuses --final-return without --summary-file 171ms
     ✓ --summary prints the file and keeps a copy in --outbox 655ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 555ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 199ms
     ✓ a missing summary file exits 13 before anything is written 194ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 214ms
     ✓ a folder outside the outbox sessions folder is kept 171ms
     ✓ without --session-dir prints no sessionRemoved 151ms
   ✓ bkit workflows summary (8)
     ✓ passes publish into the summary input 50ms
     ✓ summary is FAIL when a plan task is not done 18ms
     ✓ summary is CONCERNS when a deferral was written 19ms
     ✓ summary recommends /bkit-debug on FAIL 38ms
     ✓ summary reports the last attempt 19ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 18ms
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
+   "at": "2026-10-29T02:13:27Z",
+   "parentSha": "3a78a58e9192f82a761bbf11a32fc52582d21395",
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
   Start at  12:13:14
   Duration  78.82s (tests 98%, transform 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-hZFpjc/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
