
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> bash scripts/ci/test-file.sh .bkit/core/engine/commands/workflow/workflows.test.ts

[test-timeout-budget] load average 17.2 on 10 cores: unit limits 8616ms per test, 17231ms per hook (x1.72)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (142 tests | 1 failed) 80006ms
   ✓ bkit workflows start (15)
     ✓ warns when the previous run for this fid was holey 448ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1583ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 339ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 306ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 373ms
       ✓ a new run in the same chat gets its own session row 456ms
       ✓ writes none outside Claude Code 847ms
     ✓ opens the next run after a finished one, and after another workflow's run 684ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 562ms
     ✓ design / plan / build / debug book in the current worktree 701ms
     ✓ refuses when the lock is live, writing no row 549ms
     ✓ --lock-held checks the lock is ours 1109ms
     ✓ rejects an unknown workflow 274ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 620ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 588ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 476ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 366ms
     ✓ an OPEN decision of an earlier run never resurfaces 570ms
     ✓ an OPEN decision mid-build prints its header fields 405ms
     ✓ reads Test attempt from a tests pause 369ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 690ms
     ✓ writes no row when status.jsonl does not exist 334ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 441ms
     ✓ aborts a rebase only when one is in progress 1147ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1146ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 547ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 592ms
     ✓ --max-exceeded says a handover is due without any sentinel 515ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 595ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 675ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 574ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 359ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 454ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 399ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 297ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 326ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 524ms
     ✓ a debug run in SOAK mode always needs a handover 451ms
   ❯ bkit workflows close (21)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1335ms
       ✓ counts subagents of an earlier chat the run's session rows name 1189ms
       ✓ records no context block, and still closes, outside a Claude Code session 1156ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1284ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1251ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1069ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1086ms
     ✓ always writes the telemetry, whatever the runtime 1205ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 734ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 834ms
     ✓ an unwritable stats path is logged and never fails the close 935ms
     ✓ appends the completeness row before the workflow-done row 516ms
     × prints one telemetry line on stderr when the journal looks dead at close 479ms
     ✓ writes one completeness row per close 668ms
     ✓ still closes when the completeness check throws 452ms
     ✓ still closes when the completeness row write throws 434ms
     ✓ refuses without status.jsonl and writes nothing 144ms
     ✓ ship: run.pr, size of the squash commit, and coverage 500ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 629ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 436ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 390ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 553ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 532ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 590ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 446ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 381ms
     ✓ --record-step writes the close step's row before workflow-done 272ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 319ms
     ✓ --number without --outbox is a usage error 306ms
     ✓ --flush is ship only 124ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 461ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 446ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 506ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 480ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 396ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 224ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 223ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 934ms
     ✓ --flush with nothing to record commits and pushes nothing 606ms
     ✓ --flush carries the named worktree's logs into the dev commit 793ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 1079ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 991ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1261ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 853ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1511ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1018ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 896ms
     ✓ --push on dev never carries a row whose references name another feature 880ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 802ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 1363ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 847ms
     ✓ --push commits in the named worktree, not the checkout it runs from 519ms
     ✓ rejects --push with --flush, and --flush outside ship 102ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 960ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 763ms
     ✓ a close that landed releases the lock 1525ms
     ✓ removes the worktree before it releases the lock 1677ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 1803ms
       ✓ closePr refuses when the PR base is unknown 1589ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1066ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 530ms
     ✓ exits 12 when there is no versioned draft 469ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 331ms
     ✓ stamps the anchor from the runtime-resolved base commit 354ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 447ms
     ✓ promote copies the plan only 275ms
     ✓ rejects a workflow other than design or plan 139ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 268ms
     ✓ names the branch, not the remote-tracking ref, in each URL 291ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 204ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 209ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 462ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 369ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 790ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 321ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 283ms
     ✓ a second run's record does not let this FID's close commit 346ms
     ✓ record is present after workflows close and before the push 661ms
     ✓ failed handover from dev removes the record and keeps recorded paths 914ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 121ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 110ms
     ✓ a run with no issue holds the prompt alone 112ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 262ms
     ✓ --plan is appended when the file exists and skipped when it does not 177ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 297ms
     ✓ a missing prompt file exits 13 120ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 447ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 381ms
     ✓ puts each --line after the summary, in flag order 368ms
     ✓ refuses --final-return without --summary-file 117ms
     ✓ --summary prints the file and keeps a copy in --outbox 359ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 323ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 97ms
     ✓ a missing summary file exits 13 before anything is written 101ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 125ms
     ✓ a folder outside the outbox sessions folder is kept 117ms
     ✓ without --session-dir prints no sessionRemoved 100ms
   ✓ bkit workflows summary (7)
     ✓ summary is FAIL when a plan task is not done 13ms
     ✓ summary is CONCERNS when a deferral was written 12ms
     ✓ summary recommends /bkit-debug on FAIL 24ms
     ✓ summary reports the last attempt 10ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 10ms
     ✓ a design summary carries the organised design's open questions 12ms
     ✓ refuses a status file with no run of the workflow, and a missing one 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close > prints one telemetry line on stderr when the journal looks dead at close
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:1074:19
    1072|     expect(r.code).toBe(0);
    1073|     const lines = r.err.split("\n").filter((l) => l.includes("journal …
    1074|     expect(lines).toHaveLength(1);
       |                   ^
    1075|     expect(lines[0]).toMatch(/^\[bkit-telemetry\] journal looks dead a…
    1076|     // stdout is still the one output object, with no journal field.

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 141 passed (142)
   Start at  17:12:09
   Duration  81.79s (tests 98%, transform 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-60U8zd/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
