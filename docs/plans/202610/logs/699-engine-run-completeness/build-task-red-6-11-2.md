
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/workflows.test.ts

[test-timeout-budget] load average 25.8 on 10 cores: unit limits 12885ms per test, 25770ms per hook (x2.58)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (140 tests | 6 failed) 213646ms
   ❯ bkit workflows start (15)
     × warns when the previous run for this fid was holey 506ms
     × prints nothing when the previous run is clean, absent, or unreadable 603ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 538ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 492ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 638ms
       ✓ a new run in the same chat gets its own session row 578ms
       ✓ writes none outside Claude Code 492ms
     ✓ opens the next run after a finished one, and after another workflow's run 552ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 611ms
     ✓ design / plan / build / debug book in the current worktree 785ms
     ✓ refuses when the lock is live, writing no row 597ms
     ✓ --lock-held checks the lock is ours 897ms
     ✓ rejects an unknown workflow 518ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 558ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 736ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 605ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 485ms
     ✓ an OPEN decision of an earlier run never resurfaces 615ms
     ✓ an OPEN decision mid-build prints its header fields 513ms
     ✓ reads Test attempt from a tests pause 581ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 904ms
     ✓ writes no row when status.jsonl does not exist 623ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 759ms
     ✓ aborts a rebase only when one is in progress 1618ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1657ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 676ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 657ms
     ✓ --max-exceeded says a handover is due without any sentinel 567ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 547ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 722ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 785ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 333ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 377ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 423ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 452ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 343ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 336ms
     ✓ a debug run in SOAK mode always needs a handover 474ms
   ❯ bkit workflows close (19)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1333ms
       ✓ counts subagents of an earlier chat the run's session rows name 1746ms
       ✓ records no context block, and still closes, outside a Claude Code session 1023ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 999ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 984ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 962ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1369ms
     ✓ always writes the telemetry, whatever the runtime 1210ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 855ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 875ms
     ✓ an unwritable stats path is logged and never fails the close 1361ms
     × appends the completeness row before the workflow-done row 1106ms
     × writes one completeness row per close 2352ms
     × still closes when the completeness check throws 1065ms
     ✓ refuses without status.jsonl and writes nothing 359ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1157ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1383ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1085ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1065ms
   ❯ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1100ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1110ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1321ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 2101ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1538ms
     × --record-step writes the close step's row before workflow-done 1166ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 2171ms
     ✓ --number without --outbox is a usage error 1175ms
     ✓ --flush is ship only 501ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 2466ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1163ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1339ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1203ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1182ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 587ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 464ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2236ms
     ✓ --flush with nothing to record commits and pushes nothing 2085ms
     ✓ --flush carries the named worktree's logs into the dev commit 2532ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3951ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3777ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 3751ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2971ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3990ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2909ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 3406ms
     ✓ --push on dev never carries a row whose references name another feature 2618ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2517ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 4264ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 4000ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1794ms
     ✓ rejects --push with --flush, and --flush outside ship 649ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 6782ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 10369ms
     ✓ a close that landed releases the lock 10398ms
     ✓ removes the worktree before it releases the lock 4769ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 5734ms
       ✓ closePr refuses when the PR base is unknown 4813ms
     ✓ leaves a worktree no workflow created, and its branch, in place 3808ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 475ms
     ✓ exits 12 when there is no versioned draft 341ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 280ms
     ✓ stamps the anchor from the runtime-resolved base commit 589ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 530ms
     ✓ promote copies the plan only 290ms
     ✓ rejects a workflow other than design or plan 1143ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 676ms
     ✓ names the branch, not the remote-tracking ref, in each URL 494ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 814ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 1333ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 3066ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 1257ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 3128ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 1264ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 1229ms
     ✓ a second run's record does not let this FID's close commit 2553ms
     ✓ record is present after workflows close and before the push 6398ms
     ✓ failed handover from dev removes the record and keeps recorded paths 6166ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 577ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 447ms
     ✓ a run with no issue holds the prompt alone 825ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 866ms
     ✓ --plan is appended when the file exists and skipped when it does not 810ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 1492ms
     ✓ a missing prompt file exits 13 810ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 2560ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 2673ms
     ✓ puts each --line after the summary, in flag order 2607ms
     ✓ refuses --final-return without --summary-file 604ms
     ✓ --summary prints the file and keeps a copy in --outbox 1647ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 1548ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 524ms
     ✓ a missing summary file exits 13 before anything is written 612ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 561ms
     ✓ a folder outside the outbox sessions folder is kept 407ms
     ✓ without --session-dir prints no sessionRemoved 417ms
   ✓ bkit workflows summary (7)
     ✓ summary is FAIL when a plan task is not done 45ms
     ✓ summary is CONCERNS when a deferral was written 52ms
     ✓ summary recommends /bkit-debug on FAIL 112ms
     ✓ summary reports the last attempt 71ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 74ms
     ✓ a design summary carries the organised design's open questions 80ms
     ✓ refuses a status file with no run of the workflow, and a missing one 7ms

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
   Start at  13:07:41
   Duration  223.90s (tests 96%, transform 4%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-sUBo28/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
