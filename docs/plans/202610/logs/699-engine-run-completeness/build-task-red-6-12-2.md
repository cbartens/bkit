
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/workflows.test.ts

[test-timeout-budget] load average 31.7 on 10 cores: unit limits 15848ms per test, 31696ms per hook (x3.17)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (140 tests | 6 failed) 45001ms
   ❯ bkit workflows start (15)
     × warns when the previous run for this fid was holey 167ms
     × prints nothing when the previous run is clean, absent, or unreadable 127ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 163ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 207ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 188ms
       ✓ a new run in the same chat gets its own session row 152ms
       ✓ writes none outside Claude Code 133ms
     ✓ opens the next run after a finished one, and after another workflow's run 123ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 149ms
     ✓ design / plan / build / debug book in the current worktree 136ms
     ✓ refuses when the lock is live, writing no row 96ms
     ✓ --lock-held checks the lock is ours 140ms
     ✓ rejects an unknown workflow 70ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 112ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 146ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 102ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 140ms
     ✓ an OPEN decision of an earlier run never resurfaces 110ms
     ✓ an OPEN decision mid-build prints its header fields 182ms
     ✓ reads Test attempt from a tests pause 128ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 165ms
     ✓ writes no row when status.jsonl does not exist 128ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 120ms
     ✓ aborts a rebase only when one is in progress 273ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 277ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 151ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 163ms
     ✓ --max-exceeded says a handover is due without any sentinel 202ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 178ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 220ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 208ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 96ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 100ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 194ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 152ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 122ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 151ms
     ✓ a debug run in SOAK mode always needs a handover 187ms
   ❯ bkit workflows close (19)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 391ms
       ✓ counts subagents of an earlier chat the run's session rows name 267ms
       ✓ records no context block, and still closes, outside a Claude Code session 234ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 254ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 285ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 254ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 251ms
     ✓ always writes the telemetry, whatever the runtime 260ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 207ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 201ms
     ✓ an unwritable stats path is logged and never fails the close 230ms
     × appends the completeness row before the workflow-done row 336ms
     × writes one completeness row per close 564ms
     × still closes when the completeness check throws 383ms
     ✓ refuses without status.jsonl and writes nothing 122ms
     ✓ ship: run.pr, size of the squash commit, and coverage 373ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 552ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 726ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 760ms
   ❯ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 617ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 395ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 477ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 407ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 292ms
     × --record-step writes the close step's row before workflow-done 216ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 228ms
     ✓ --number without --outbox is a usage error 210ms
     ✓ --flush is ship only 171ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 485ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 524ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 617ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 466ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 290ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 333ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 162ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 935ms
     ✓ --flush with nothing to record commits and pushes nothing 950ms
     ✓ --flush carries the named worktree's logs into the dev commit 920ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 782ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 667ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 886ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 782ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 905ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 766ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 703ms
     ✓ --push on dev never carries a row whose references name another feature 737ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 691ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 1189ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 851ms
     ✓ --push commits in the named worktree, not the checkout it runs from 541ms
     ✓ rejects --push with --flush, and --flush outside ship 87ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 998ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 753ms
     ✓ a close that landed releases the lock 897ms
     ✓ removes the worktree before it releases the lock 1252ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 1894ms
       ✓ closePr refuses when the PR base is unknown 1087ms
     ✓ leaves a worktree no workflow created, and its branch, in place 513ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 65ms
     ✓ exits 12 when there is no versioned draft 64ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 62ms
     ✓ stamps the anchor from the runtime-resolved base commit 84ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 101ms
     ✓ promote copies the plan only 64ms
     ✓ rejects a workflow other than design or plan 56ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 117ms
     ✓ names the branch, not the remote-tracking ref, in each URL 113ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 110ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 109ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 237ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 163ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 506ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 272ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 321ms
     ✓ a second run's record does not let this FID's close commit 372ms
     ✓ record is present after workflows close and before the push 538ms
     ✓ failed handover from dev removes the record and keeps recorded paths 784ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 169ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 135ms
     ✓ a run with no issue holds the prompt alone 100ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 197ms
     ✓ --plan is appended when the file exists and skipped when it does not 129ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 222ms
     ✓ a missing prompt file exits 13 83ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 278ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 215ms
     ✓ puts each --line after the summary, in flag order 227ms
     ✓ refuses --final-return without --summary-file 79ms
     ✓ --summary prints the file and keeps a copy in --outbox 212ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 210ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 68ms
     ✓ a missing summary file exits 13 before anything is written 67ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 79ms
     ✓ a folder outside the outbox sessions folder is kept 73ms
     ✓ without --session-dir prints no sessionRemoved 66ms
   ✓ bkit workflows summary (7)
     ✓ summary is FAIL when a plan task is not done 10ms
     ✓ summary is CONCERNS when a deferral was written 9ms
     ✓ summary recommends /bkit-debug on FAIL 18ms
     ✓ summary reports the last attempt 13ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 9ms
     ✓ a design summary carries the organised design's open questions 9ms
     ✓ refuses a status file with no run of the workflow, and a missing one 1ms

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
   Start at  13:17:24
   Duration  45.92s (tests 98%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-uUdlKl/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
