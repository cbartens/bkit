
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/workflows.test.ts

[test-timeout-budget] load average 44.9 on 10 cores: unit limits 22447ms per test, 44894ms per hook (x4.49)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (140 tests | 6 failed) 214136ms
   ❯ bkit workflows start (15)
     × warns when the previous run for this fid was holey 468ms
     × prints nothing when the previous run is clean, absent, or unreadable 458ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 473ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 401ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 609ms
       ✓ a new run in the same chat gets its own session row 414ms
       ✓ writes none outside Claude Code 504ms
     ✓ opens the next run after a finished one, and after another workflow's run 368ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 638ms
     ✓ design / plan / build / debug book in the current worktree 656ms
     ✓ refuses when the lock is live, writing no row 539ms
     ✓ --lock-held checks the lock is ours 717ms
     ✓ rejects an unknown workflow 490ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 533ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 775ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 864ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 813ms
     ✓ an OPEN decision of an earlier run never resurfaces 643ms
     ✓ an OPEN decision mid-build prints its header fields 387ms
     ✓ reads Test attempt from a tests pause 359ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 698ms
     ✓ writes no row when status.jsonl does not exist 796ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 845ms
     ✓ aborts a rebase only when one is in progress 1497ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1609ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 1243ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 1072ms
     ✓ --max-exceeded says a handover is due without any sentinel 714ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 1082ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 1049ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 1229ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 532ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 616ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 541ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 1032ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 773ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 633ms
     ✓ a debug run in SOAK mode always needs a handover 739ms
   ❯ bkit workflows close (19)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1815ms
       ✓ counts subagents of an earlier chat the run's session rows name 1671ms
       ✓ records no context block, and still closes, outside a Claude Code session 1766ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1767ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 2049ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1233ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1139ms
     ✓ always writes the telemetry, whatever the runtime 1640ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 1416ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1982ms
     ✓ an unwritable stats path is logged and never fails the close 1511ms
     × appends the completeness row before the workflow-done row 1615ms
     × writes one completeness row per close 2598ms
     × still closes when the completeness check throws 1509ms
     ✓ refuses without status.jsonl and writes nothing 559ms
     ✓ ship: run.pr, size of the squash commit, and coverage 2044ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 2583ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1777ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1282ms
   ❯ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1905ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1989ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 2555ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 2303ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 2368ms
     × --record-step writes the close step's row before workflow-done 1640ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1514ms
     ✓ --number without --outbox is a usage error 1229ms
     ✓ --flush is ship only 562ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1967ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1583ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1726ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1457ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1137ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 701ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 562ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2694ms
     ✓ --flush with nothing to record commits and pushes nothing 2205ms
     ✓ --flush carries the named worktree's logs into the dev commit 2720ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2791ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3911ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 3668ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 4035ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 4804ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3477ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 4363ms
     ✓ --push on dev never carries a row whose references name another feature 3413ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 3398ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 7384ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3220ms
     ✓ --push commits in the named worktree, not the checkout it runs from 2679ms
     ✓ rejects --push with --flush, and --flush outside ship 735ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 4622ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 5083ms
     ✓ a close that landed releases the lock 3939ms
     ✓ removes the worktree before it releases the lock 6777ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 8330ms
       ✓ closePr refuses when the PR base is unknown 7192ms
     ✓ leaves a worktree no workflow created, and its branch, in place 6123ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 316ms
     ✓ exits 12 when there is no versioned draft 286ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 396ms
     ✓ stamps the anchor from the runtime-resolved base commit 552ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 833ms
     ✓ promote copies the plan only 367ms
     ✓ rejects a workflow other than design or plan 365ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 726ms
     ✓ names the branch, not the remote-tracking ref, in each URL 1052ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 1051ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 981ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1645ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 954ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 2242ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 1169ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 1192ms
     ✓ a second run's record does not let this FID's close commit 1252ms
     ✓ record is present after workflows close and before the push 2179ms
     ✓ failed handover from dev removes the record and keeps recorded paths 3451ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 507ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 395ms
     ✓ a run with no issue holds the prompt alone 537ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 823ms
     ✓ --plan is appended when the file exists and skipped when it does not 646ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 710ms
     ✓ a missing prompt file exits 13 341ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 1489ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 931ms
     ✓ puts each --line after the summary, in flag order 911ms
     ✓ refuses --final-return without --summary-file 249ms
     ✓ --summary prints the file and keeps a copy in --outbox 787ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 733ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 244ms
     ✓ a missing summary file exits 13 before anything is written 238ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 279ms
     ✓ a folder outside the outbox sessions folder is kept 267ms
     ✓ without --session-dir prints no sessionRemoved 244ms
   ✓ bkit workflows summary (7)
     ✓ summary is FAIL when a plan task is not done 36ms
     ✓ summary is CONCERNS when a deferral was written 34ms
     ✓ summary recommends /bkit-debug on FAIL 60ms
     ✓ summary reports the last attempt 43ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 43ms
     ✓ a design summary carries the organised design's open questions 35ms
     ✓ refuses a status file with no run of the workflow, and a missing one 4ms

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
   Start at  13:11:32
   Duration  220.70s (tests 97%, transform 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-AWhhSy/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
