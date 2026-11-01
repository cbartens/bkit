
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/workflows.test.ts

[test-timeout-budget] load average 33.5 on 10 cores: unit limits 16742ms per test, 33484ms per hook (x3.35)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (140 tests | 6 failed) 118803ms
   ❯ bkit workflows start (15)
     × warns when the previous run for this fid was holey 956ms
     × prints nothing when the previous run is clean, absent, or unreadable 603ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 553ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 486ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 765ms
       ✓ a new run in the same chat gets its own session row 666ms
       ✓ writes none outside Claude Code 615ms
     ✓ opens the next run after a finished one, and after another workflow's run 757ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 588ms
     ✓ design / plan / build / debug book in the current worktree 705ms
     ✓ refuses when the lock is live, writing no row 440ms
     ✓ --lock-held checks the lock is ours 768ms
     ✓ rejects an unknown workflow 280ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 783ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 747ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 414ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 373ms
     ✓ an OPEN decision of an earlier run never resurfaces 500ms
     ✓ an OPEN decision mid-build prints its header fields 313ms
     ✓ reads Test attempt from a tests pause 512ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 841ms
     ✓ writes no row when status.jsonl does not exist 484ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 533ms
     ✓ aborts a rebase only when one is in progress 1191ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1039ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 472ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 701ms
     ✓ --max-exceeded says a handover is due without any sentinel 1520ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 439ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 1073ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 960ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 604ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 505ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 433ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 356ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 326ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 407ms
     ✓ a debug run in SOAK mode always needs a handover 687ms
   ❯ bkit workflows close (19)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1059ms
       ✓ counts subagents of an earlier chat the run's session rows name 1066ms
       ✓ records no context block, and still closes, outside a Claude Code session 1439ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1104ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1550ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1607ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1033ms
     ✓ always writes the telemetry, whatever the runtime 1100ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 866ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1020ms
     ✓ an unwritable stats path is logged and never fails the close 1460ms
     × appends the completeness row before the workflow-done row 1421ms
     × writes one completeness row per close 1385ms
     × still closes when the completeness check throws 927ms
     ✓ refuses without status.jsonl and writes nothing 302ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1122ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1995ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1538ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1755ms
   ❯ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 2156ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1736ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1470ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1325ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1183ms
     × --record-step writes the close step's row before workflow-done 922ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1047ms
     ✓ --number without --outbox is a usage error 1358ms
     ✓ --flush is ship only 440ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1640ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1868ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1334ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1645ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1234ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 548ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 586ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2516ms
     ✓ --flush with nothing to record commits and pushes nothing 2176ms
     ✓ --flush carries the named worktree's logs into the dev commit 1805ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2061ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1741ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2805ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1838ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2469ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2124ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1728ms
     ✓ --push on dev never carries a row whose references name another feature 1857ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1508ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 3002ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1494ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1037ms
     ✓ rejects --push with --flush, and --flush outside ship 227ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1973ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1510ms
     ✓ a close that landed releases the lock 1453ms
     ✓ removes the worktree before it releases the lock 1403ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 1912ms
       ✓ closePr refuses when the PR base is unknown 1809ms
     ✓ leaves a worktree no workflow created, and its branch, in place 854ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 126ms
     ✓ exits 12 when there is no versioned draft 110ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 121ms
     ✓ stamps the anchor from the runtime-resolved base commit 179ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 223ms
     ✓ promote copies the plan only 139ms
     ✓ rejects a workflow other than design or plan 125ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 300ms
     ✓ names the branch, not the remote-tracking ref, in each URL 316ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 230ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 253ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 458ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 264ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 651ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 299ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 276ms
     ✓ a second run's record does not let this FID's close commit 332ms
     ✓ record is present after workflows close and before the push 458ms
     ✓ failed handover from dev removes the record and keeps recorded paths 779ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 96ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 108ms
     ✓ a run with no issue holds the prompt alone 98ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 205ms
     ✓ --plan is appended when the file exists and skipped when it does not 139ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 222ms
     ✓ a missing prompt file exits 13 92ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 349ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 240ms
     ✓ puts each --line after the summary, in flag order 253ms
     ✓ refuses --final-return without --summary-file 87ms
     ✓ --summary prints the file and keeps a copy in --outbox 242ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 410ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 108ms
     ✓ a missing summary file exits 13 before anything is written 116ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 123ms
     ✓ a folder outside the outbox sessions folder is kept 123ms
     ✓ without --session-dir prints no sessionRemoved 104ms
   ✓ bkit workflows summary (7)
     ✓ summary is FAIL when a plan task is not done 15ms
     ✓ summary is CONCERNS when a deferral was written 14ms
     ✓ summary recommends /bkit-debug on FAIL 26ms
     ✓ summary reports the last attempt 13ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 13ms
     ✓ a design summary carries the organised design's open questions 14ms
     ✓ refuses a status file with no run of the workflow, and a missing one 2ms

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
   Start at  13:15:18
   Duration  123.53s (tests 96%, transform 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-jqaAPo/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
