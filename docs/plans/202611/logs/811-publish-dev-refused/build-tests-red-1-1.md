Enforced: true
Red: 3
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/811-publish-dev-refused-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 2 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev publishes the FAILED record through a PR" | red | failure: expected 10 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev with the PR path failing keeps the record and exits 10" | red | failure: expected '[bkit-workflows] git hooks skipped in…' to match /branch push failed/ |
| 2 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "closePr titles the PR by the record it carries" | red | failure: expected [] to have a length of 1 but got +0 |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/workflows.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/811-publish-dev-refused
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/workflows.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/workflows.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/811-publish-dev-refused
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/workflows.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/811-publish-dev-refused

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (189 tests | 3 failed) 96489ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 217ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 726ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 163ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 159ms
     ✓ writes no limits for a workflow with no ask point 149ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 150ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 182ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 205ms
       ✓ a new run in the same chat gets its own session row 193ms
       ✓ writes none outside Claude Code 151ms
     ✓ opens the next run after a finished one, and after another workflow's run 157ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 181ms
     ✓ design / plan / build / debug book in the current worktree 178ms
     ✓ refuses when the lock is live, writing no row 121ms
     ✓ --lock-held checks the lock is ours 182ms
     ✓ rejects an unknown workflow 98ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 164ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 218ms
   ✓ bkit workflows start — resume facts (12)
     ✓ a new run has no last step and no open decision 125ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 133ms
     ✓ an OPEN decision of an earlier run never resurfaces 153ms
     ✓ an OPEN decision mid-build prints its header fields 116ms
     ✓ openDecision carries the Gate header 129ms
     ✓ openDecision carries the Source changed header 134ms
     ✓ workflows start reports openDecision for a DECIDED decision file that no build-decision row names 141ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 252ms
     ✓ workflows start does not report openDecision for a DECIDED decision file that a build-decision row names 123ms
     ✓ openDecision gate is null without the header 148ms
     ✓ openDecision gate ignores a Gate line below the header 147ms
     ✓ reads Test attempt from a tests pause 142ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 239ms
     ✓ writes no row when status.jsonl does not exist 193ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 192ms
     ✓ aborts a rebase only when one is in progress 409ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 327ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 369ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 217ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 226ms
     ✓ --max-exceeded says a handover is due without any sentinel 191ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 178ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 221ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 255ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 119ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 113ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 123ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 128ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 125ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 134ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 110ms
     ✓ bkit workflows fail refuses a multi-line, non-/bkit- or markdown-carrying --next-step before any write 167ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 211ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 155ms
     ✓ bkit workflows fail treats an empty --next-step as absent 127ms
     ✓ a debug run in SOAK mode always needs a handover 190ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 433ms
       ✓ counts subagents of an earlier chat the run's session rows name 417ms
       ✓ records no context block, and still closes, outside a Claude Code session 356ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 393ms
     ✓ records ending held and publish false on the workflow-done row 404ms
     ✓ defaults the close row to ending done 424ms
     ✓ refuses an unknown ending 173ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 430ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 394ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 397ms
     ✓ always writes the telemetry, whatever the runtime 425ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 320ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 400ms
     ✓ an unwritable stats path is logged and never fails the close 394ms
     ✓ appends the completeness row before the workflow-done row 442ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 428ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 435ms
     ✓ writes one completeness row per close 697ms
     ✓ leaves out the previous run's rows that share a second with this run's start 323ms
     ✓ still closes when the completeness check throws 372ms
     ✓ still closes when the completeness row write throws 433ms
     ✓ refuses without status.jsonl and writes nothing 123ms
     ✓ ship: run.pr, size of the squash commit, and coverage 466ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 681ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 381ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 350ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 512ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 513ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 532ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 443ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 487ms
     ✓ --record-step writes the close step's row before workflow-done 285ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 366ms
     ✓ --number without --outbox is a usage error 347ms
     ✓ --flush is ship only 154ms
   ❯ bkit workflows handover (31)
     ✓ --push commits and pushes the record on the feature branch without a handover 516ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 510ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 572ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 563ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 431ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 217ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 198ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1300ms
     ✓ --flush with nothing to record commits and pushes nothing 703ms
     ✓ --flush carries the named worktree's logs into the dev commit 1301ms
     × --flush refused by dev with the PR path failing keeps the record and exits 10 1430ms
     × --flush refused by dev publishes the FAILED record through a PR 1423ms
     × closePr titles the PR by the record it carries 1389ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 539ms
       ✓ ship's owner Stop on an open PR: exit 9, push skipped → route stop with the not-pushed line 419ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 683ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 542ms
       ✓ --ref, no push → route stop, no message 327ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 579ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1468ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1629ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1355ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1634ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1422ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1399ms
     ✓ --push on dev never carries a row whose references name another feature 1419ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1359ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 2576ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1402ms
     ✓ --push commits in the named worktree, not the checkout it runs from 619ms
     ✓ rejects --push with --flush, and --flush outside ship 126ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 1550ms
     ✓ preserves unlanded file deletions and ledger additions on close 3010ms
     ✓ preserves dirty work and uncertain branch evidence during close 2722ms
     ✓ preserves a local feature ref changed after its cleanup proof 3263ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1581ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1154ms
     ✓ a close that landed releases the lock 1378ms
     ✓ removes the worktree before it releases the lock 1429ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2196ms
       ✓ closePr refuses when the PR base is unknown 1991ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1370ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 116ms
     ✓ exits 12 when there is no versioned draft 112ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 112ms
     ✓ stamps the anchor from the runtime-resolved base commit 149ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 177ms
     ✓ promote copies the plan only 125ms
     ✓ rejects a workflow other than design or plan 105ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 219ms
     ✓ names the branch, not the remote-tracking ref, in each URL 193ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 183ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 194ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 466ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 289ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 739ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 337ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 323ms
     ✓ a second run's record does not let this FID's close commit 388ms
     ✓ record is present after workflows close and before the push 732ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 1512ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 1508ms
       ✓ a run closed by workflow-failed keeps no parked copy 1488ms
       ✓ a run closed by workflow-done keeps no parked copy 1553ms
       ✓ a FAILED run gets no row 1567ms
       ✓ a DONE run gets no row 1553ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1412ms
   ✓ bkit workflows input (10)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 132ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 133ms
     ✓ a run with no issue holds the prompt alone 126ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 350ms
     ✓ --plan is appended when the file exists and skipped when it does not 192ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 296ms
     ✓ a missing prompt file exits 13 141ms
     ✓ a rebuilt design input keeps the owner-interview record appended after the first build 151ms
     ✓ a grill file that was never appended is appended once, after a blank line 134ms
     ✓ a workflow with no grill file writes exactly the sections 137ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 541ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 422ms
     ✓ puts each --line after the summary, in flag order 424ms
     ✓ refuses --final-return without --summary-file 113ms
     ✓ --summary prints the file and keeps a copy in --outbox 488ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 445ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 125ms
     ✓ a missing summary file exits 13 before anything is written 113ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 141ms
     ✓ a folder outside the outbox sessions folder is kept 133ms
     ✓ without --session-dir prints no sessionRemoved 120ms
   ✓ bkit workflows summary (12)
     ✓ passes publish into the summary input 38ms
     ✓ lists ship-failure rows from a run started before their removal 16ms
     ✓ summary is FAIL when a plan task is not done 14ms
     ✓ summary is CONCERNS when a deferral was written 13ms
     ✓ a deferral closed later no longer lowers the verdict, while its history stays on disk 13ms
     ✓ recomputes the verdict from resolved work without rewriting the earlier summary event 14ms
     ✓ prints CONCERNS when a Fix now group's fix task and a test-fix FAIL are both resolved 18ms
     ✓ summary recommends /bkit-debug on FAIL 25ms
     ✓ summary reports the last attempt 14ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 15ms
     ✓ a design summary carries the organised design's open questions 15ms
     ✓ refuses a status file with no run of the workflow, and a missing one 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --flush refused by dev with the PR path failing keeps the record and exits 10
AssertionError: expected '[bkit-workflows] git hooks skipped in…' to match /branch push failed/

- Expected:
/branch push failed/

+ Received:
"[bkit-workflows] git hooks skipped in the throwaway dev checkout — its declared minimum or full gate runs explicitly
[bkit-workflows] installing frozen dependencies in the throwaway dev checkout
[bkit-workflows] running pnpm bkit:gate:min
[bkit-workflows] dev refused the push: remote: protected        
To /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-rbw6Jp
 ! [remote rejected] HEAD -> dev (pre-receive hook declined)
error: failed to push some refs to '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-rbw6Jp' — ship FAILED record kept in /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-v2FBJd/.worktrees/12-export-csv — the next ship of 12-export-csv carries it
"

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:1990:19
    1989|   });
    1990|
    1991|   /** A remote whose hook refuses only dev, so a ship-failed branch pu…
       |                  ^
    1992|   function devOnlyRefused() {
    1993|     const s = withDevRemote();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --flush refused by dev publishes the FAILED record through a PR
AssertionError: expected 10 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 10

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:2012:20
    2010|     expect(r.code).toBe(0);
    2011|     expect(r.json).toMatchObject({ pushed: true, ref: `ship-failed/${F…
    2012|     expect(git(remote, "rev-parse", "dev")).toBe(before);
       |                    ^
    2013|     expect(git(remote, "log", "-1", "--format=%s", `ship-failed/${FID}…
    2014|       "chore(12-export-csv): ship FAILED bkit [skip ci]",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > closePr titles the PR by the record it carries
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:2029:20
    2027|     expect(create).toHaveLength(1);
    2028|     expect(create[0]).toContain("--title chore(12-export-csv): ship FA…
    2029|     expect(create[0]).toContain(`--head ship-failed/${FID}`);
       |                    ^
    2030|     expect(create[0]).not.toContain("ship DONE");
    2031|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 186 passed (189)
   Start at  10:22:15
   Duration  96.93s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-KvMlRP/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
