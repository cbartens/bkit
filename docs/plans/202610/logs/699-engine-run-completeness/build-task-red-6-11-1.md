
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/workflows.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (140 tests | 6 failed) 143277ms
   ❯ bkit workflows start (15)
     × warns when the previous run for this fid was holey 247ms
     × prints nothing when the previous run is clean, absent, or unreadable 252ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 376ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 251ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 481ms
       ✓ a new run in the same chat gets its own session row 450ms
       ✓ writes none outside Claude Code 337ms
     ✓ opens the next run after a finished one, and after another workflow's run 282ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 384ms
     ✓ design / plan / build / debug book in the current worktree 362ms
     ✓ refuses when the lock is live, writing no row 221ms
     ✓ --lock-held checks the lock is ours 398ms
     ✓ rejects an unknown workflow 162ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 338ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 375ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 237ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 229ms
     ✓ an OPEN decision of an earlier run never resurfaces 246ms
     ✓ an OPEN decision mid-build prints its header fields 239ms
     ✓ reads Test attempt from a tests pause 250ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 440ms
     ✓ writes no row when status.jsonl does not exist 347ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 353ms
     ✓ aborts a rebase only when one is in progress 740ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 688ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 359ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 525ms
     ✓ --max-exceeded says a handover is due without any sentinel 373ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 316ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 353ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 569ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 216ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 222ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 249ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 253ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 283ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 402ms
     ✓ a debug run in SOAK mode always needs a handover 488ms
   ❯ bkit workflows close (19)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 716ms
       ✓ counts subagents of an earlier chat the run's session rows name 790ms
       ✓ records no context block, and still closes, outside a Claude Code session 946ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 799ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 890ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 884ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 713ms
     ✓ always writes the telemetry, whatever the runtime 673ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 548ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 544ms
     ✓ an unwritable stats path is logged and never fails the close 596ms
     × appends the completeness row before the workflow-done row 755ms
     × writes one completeness row per close 1262ms
     × still closes when the completeness check throws 872ms
     ✓ refuses without status.jsonl and writes nothing 357ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1269ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1304ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1156ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 776ms
   ❯ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 816ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1013ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1805ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1496ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1290ms
     × --record-step writes the close step's row before workflow-done 621ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 647ms
     ✓ --number without --outbox is a usage error 528ms
     ✓ --flush is ship only 264ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 956ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 908ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1219ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1166ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1060ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 490ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 588ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1665ms
     ✓ --flush with nothing to record commits and pushes nothing 1278ms
     ✓ --flush carries the named worktree's logs into the dev commit 2361ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2431ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2526ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 4146ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2907ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3797ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2592ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2794ms
     ✓ --push on dev never carries a row whose references name another feature 3774ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 3917ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 5788ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3414ms
     ✓ --push commits in the named worktree, not the checkout it runs from 2012ms
     ✓ rejects --push with --flush, and --flush outside ship 333ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 4882ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2326ms
     ✓ a close that landed releases the lock 3156ms
     ✓ removes the worktree before it releases the lock 2997ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 5239ms
       ✓ closePr refuses when the PR base is unknown 3777ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2426ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 330ms
     ✓ exits 12 when there is no versioned draft 336ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 401ms
     ✓ stamps the anchor from the runtime-resolved base commit 477ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 519ms
     ✓ promote copies the plan only 322ms
     ✓ rejects a workflow other than design or plan 258ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 698ms
     ✓ names the branch, not the remote-tracking ref, in each URL 708ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 510ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 594ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1385ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 926ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 2087ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 822ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 794ms
     ✓ a second run's record does not let this FID's close commit 1018ms
     ✓ record is present after workflows close and before the push 1835ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2490ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 530ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 408ms
     ✓ a run with no issue holds the prompt alone 375ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 762ms
     ✓ --plan is appended when the file exists and skipped when it does not 529ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 664ms
     ✓ a missing prompt file exits 13 403ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 1129ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 827ms
     ✓ puts each --line after the summary, in flag order 825ms
     ✓ refuses --final-return without --summary-file 360ms
     ✓ --summary prints the file and keeps a copy in --outbox 964ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 1196ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 470ms
     ✓ a missing summary file exits 13 before anything is written 450ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 564ms
     ✓ a folder outside the outbox sessions folder is kept 596ms
     ✓ without --session-dir prints no sessionRemoved 539ms
   ✓ bkit workflows summary (7)
     ✓ summary is FAIL when a plan task is not done 113ms
     ✓ summary is CONCERNS when a deferral was written 148ms
     ✓ summary recommends /bkit-debug on FAIL 113ms
     ✓ summary reports the last attempt 71ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 49ms
     ✓ a design summary carries the organised design's open questions 111ms
     ✓ refuses a status file with no run of the workflow, and a missing one 9ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows start > warns when the previous run for this fid was holey
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:181:19
    179|     expect(r.json).toMatchObject({ resumed: false, run: 1 });
    180|     const lines = warnings(r.err);
    181|     expect(lines).toHaveLength(1);
       |                   ^
    182|     expect(lines[0]).toContain("build");
    183|     expect(lines[0]).toContain("run 1");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows start > prints nothing when the previous run is clean, absent, or unreadable
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:192:71
    190|     const control = repo();
    191|     write(control, `${REL}/status.jsonl`, jsonl(holeyBuild));
    192|     expect(warnings((await run(control, wf("start", "design"))).err)).…
       |                                                                       ^
    193|
    194|     // Absent: the first run of a feature has no previous run.

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close > appends the completeness row before the workflow-done row
AssertionError: expected -1 to be greater than -1
 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:1050:16
    1048|     const all = rows(statusOf(cwd));
    1049|     const at = all.findIndex((x) => x.type === "completeness");
    1050|     expect(at).toBeGreaterThan(-1);
       |                ^
    1051|     expect(all[at]).toMatchObject({ workflow: "build", journalSuspect:…
    1052|     expect(["CLEAN", "HOLEY"]).toContain(all[at]!.verdict);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close > writes one completeness row per close
AssertionError: expected [] to have a length of 2 but got +0

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:1062:58
    1060|     expect((await run(cwd, wf("close", "build"))).code).toBe(0);
    1061|     const all = rows(statusOf(cwd));
    1062|     expect(all.filter((x) => x.type === "completeness")).toHaveLength(…
       |                                                          ^
    1063|     expect(all.filter((x) => x.type === "workflow-done")).toHaveLength…
    1064|     expect(all.map((x) => x.type).slice(-4)).toEqual([

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close > still closes when the completeness check throws
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:1081:19
    1079|     expect(all.some((x) => x.type === "completeness")).toBe(false);
    1080|     const lines = r.err.split("\n").filter((l) => l.includes("complete…
    1081|     expect(lines).toHaveLength(1);
       |                   ^
    1082|     expect(lines[0]).toContain("forced checker failure");
    1083|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close — commit, outbox, comment > --record-step writes the close step's row before workflow-done
AssertionError: expected [ 'workflow-started:', …(2) ] to deeply equal [ …(3) ]

- Expected
+ Received

  [
+   "workflow-started:",
    "step-done:design-close-workflow",
-   "completeness:",
    "workflow-done:",
  ]

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:1267:29
    1265|     await run(cwd, wf("close", "design", "--record-step"));
    1266|     const kinds = rows(statusOf(cwd)).map((x) => [x.type, x.step].join…
    1267|     expect(kinds.slice(-3)).toEqual([
       |                             ^
    1268|       "step-done:design-close-workflow",
    1269|       "completeness:",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/6]⎯


 Test Files  1 failed (1)
      Tests  6 failed | 134 passed (140)
   Start at  13:05:03
   Duration  145.02s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-x41Uh2/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
