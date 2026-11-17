Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 5, attempt 1

Plan: `docs/plans/202611/911-ship-failed-merge-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 8 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit" | red | failure: expected 2 to be 6 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/workflows.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/workflows.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/workflows.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/workflows.test.ts

[test-timeout-budget] load average 18.5 on 10 cores: unit limits 13750ms per test, 27500ms per hook (x2.75)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (167 tests | 1 failed) 137052ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 375ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1308ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 276ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 239ms
     ✓ writes no limits for a workflow with no ask point 306ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 247ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 337ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 370ms
       ✓ a new run in the same chat gets its own session row 396ms
       ✓ writes none outside Claude Code 260ms
     ✓ opens the next run after a finished one, and after another workflow's run 342ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 413ms
     ✓ design / plan / build / debug book in the current worktree 327ms
     ✓ refuses when the lock is live, writing no row 228ms
     ✓ --lock-held checks the lock is ours 351ms
     ✓ rejects an unknown workflow 164ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 250ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 397ms
   ✓ bkit workflows start — resume facts (8)
     ✓ a new run has no last step and no open decision 281ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 238ms
     ✓ an OPEN decision of an earlier run never resurfaces 299ms
     ✓ an OPEN decision mid-build prints its header fields 231ms
     ✓ openDecision carries the Gate header 208ms
     ✓ openDecision gate is null without the header 230ms
     ✓ openDecision gate ignores a Gate line below the header 241ms
     ✓ reads Test attempt from a tests pause 194ms
   ❯ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 306ms
     ✓ writes no row when status.jsonl does not exist 229ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 228ms
     ✓ aborts a rebase only when one is in progress 551ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 480ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 599ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 316ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 326ms
     ✓ --max-exceeded says a handover is due without any sentinel 268ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 233ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 324ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 370ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 198ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 172ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 186ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 196ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 211ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 208ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 194ms
     ✓ bkit workflows fail refuses a multi-line or non-/bkit- --next-step before any write 259ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 445ms
     × bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 299ms
     ✓ bkit workflows fail treats an empty --next-step as absent 190ms
     ✓ a debug run in SOAK mode always needs a handover 287ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 779ms
       ✓ counts subagents of an earlier chat the run's session rows name 708ms
       ✓ records no context block, and still closes, outside a Claude Code session 777ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 801ms
     ✓ records ending held and publish false on the workflow-done row 768ms
     ✓ defaults the close row to ending done 671ms
     ✓ refuses an unknown ending 254ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 711ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 726ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 672ms
     ✓ always writes the telemetry, whatever the runtime 693ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 510ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 643ms
     ✓ an unwritable stats path is logged and never fails the close 666ms
     ✓ appends the completeness row before the workflow-done row 674ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 688ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 683ms
     ✓ writes one completeness row per close 1132ms
     ✓ leaves out the previous run's rows that share a second with this run's start 629ms
     ✓ still closes when the completeness check throws 702ms
     ✓ still closes when the completeness row write throws 609ms
     ✓ refuses without status.jsonl and writes nothing 179ms
     ✓ ship: run.pr, size of the squash commit, and coverage 835ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1150ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 842ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 719ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 856ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 848ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 914ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 769ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 836ms
     ✓ --record-step writes the close step's row before workflow-done 654ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 698ms
     ✓ --number without --outbox is a usage error 630ms
     ✓ --flush is ship only 239ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 849ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 752ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 929ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 914ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 663ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 380ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 326ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2025ms
     ✓ --flush with nothing to record commits and pushes nothing 1071ms
     ✓ --flush carries the named worktree's logs into the dev commit 2124ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2244ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2447ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2831ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2439ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2659ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2500ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2500ms
     ✓ --push on dev never carries a row whose references name another feature 2445ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2263ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 4179ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2388ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1126ms
     ✓ rejects --push with --flush, and --flush outside ship 237ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 2699ms
     ✓ preserves unlanded file deletions and ledger additions on close 5173ms
     ✓ preserves dirty work and uncertain branch evidence during close 5199ms
     ✓ preserves a local feature ref changed after its cleanup proof 5283ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3050ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2150ms
     ✓ a close that landed releases the lock 2671ms
     ✓ removes the worktree before it releases the lock 2677ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3579ms
       ✓ closePr refuses when the PR base is unknown 3318ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2118ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 177ms
     ✓ exits 12 when there is no versioned draft 169ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 198ms
     ✓ stamps the anchor from the runtime-resolved base commit 284ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 326ms
     ✓ promote copies the plan only 182ms
     ✓ rejects a workflow other than design or plan 165ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 351ms
     ✓ names the branch, not the remote-tracking ref, in each URL 368ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 343ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 377ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 831ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 473ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1369ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 571ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 491ms
     ✓ a second run's record does not let this FID's close commit 614ms
     ✓ record is present after workflows close and before the push 1360ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2173ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 231ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 241ms
     ✓ a run with no issue holds the prompt alone 262ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 423ms
     ✓ --plan is appended when the file exists and skipped when it does not 302ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 468ms
     ✓ a missing prompt file exits 13 258ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 903ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 716ms
     ✓ puts each --line after the summary, in flag order 783ms
     ✓ refuses --final-return without --summary-file 193ms
     ✓ --summary prints the file and keeps a copy in --outbox 835ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 873ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 180ms
     ✓ a missing summary file exits 13 before anything is written 162ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 213ms
     ✓ a folder outside the outbox sessions folder is kept 196ms
     ✓ without --session-dir prints no sessionRemoved 193ms
   ✓ bkit workflows summary (11)
     ✓ passes publish into the summary input 67ms
     ✓ lists ship-failure rows from a run started before their removal 26ms
     ✓ summary is FAIL when a plan task is not done 27ms
     ✓ summary is CONCERNS when a deferral was written 28ms
     ✓ a deferral closed later no longer lowers the verdict, while its history stays on disk 30ms
     ✓ recomputes the verdict from resolved work without rewriting the earlier summary event 46ms
     ✓ summary recommends /bkit-debug on FAIL 43ms
     ✓ summary reports the last attempt 25ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 20ms
     ✓ a design summary carries the organised design's open questions 23ms
     ✓ refuses a status file with no run of the workflow, and a missing one 4ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows fail > bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit
AssertionError: expected 2 to be 6 // Object.is equality

- Expected
+ Received

- 6
+ 2

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:918:22
    916|       const r = await run(cwd, wf("fail", "build", `--month=${M}`, tok…
    917|       expect(r.err).toContain("--next-step carries the unsubstituted p…
    918|       expect(r.code).toBe(6);
       |                      ^
    919|     }
    920|     expect(fs.readFileSync(statusOf(cwd), "utf-8")).toBe(before);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 166 passed (167)
   Start at  20:04:35
   Duration  137.71s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-S8nu2L/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
