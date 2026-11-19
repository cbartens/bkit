Enforced: true
Red: 3
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 7, attempt 1

Plan: `docs/plans/202611/958-agents-orchestrator-write-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 25 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options" | red | failure: expected +0 to be 6 // Object.is equality |
| 26 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail > redacts credentials beyond the tracker keys from the error and stderr files" | red | failure: tmp/error.md: expected 'migration failed: svc_fakeTokenValue9…' not to contain 'svc_fakeTokenValue9876543210' |
| 26 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail > writes the stderr file with the checkout path made relative and the home directory as ~" | red | failure: expected 'Error at /private/var/folders/td/lj74…' not to contain '/private/var/folders/td/lj74ml2d0jz3t…' |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/decisions.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/decisions.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/decisions.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/decisions.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts (75 tests | 1 failed) 1185ms
   ✓ bkit decisions apply --by=rerun (5)
     ✓ records the re-run under Q1 and closes the file 19ms
     ✓ refuses a file without Gate: FAIL or not OPEN 13ms
     ✓ refuses a Gate: FAIL file whose Q1 is an item, not the loop question 12ms
     ✓ refuses a loop file with an undecided item question 13ms
     ✓ refuses a file whose only Gate: FAIL line is in an item body 12ms
   ✓ bkit decisions skip (8)
     ✓ decisions skip exits 0 when all five conditions hold 14ms
     ✓ decisions skip exits 1 and names the fact for a Gate: FAIL header 13ms
     ✓ decisions skip exits 1 when the Source changed header is missing 13ms
     ✓ decisions skip exits 1 when an item is not Accept 12ms
     ✓ decisions skip exits 1 when the loop question is not Decide 12ms
     ✓ decisions skip exits 1 for a pause that is not from verify or holistic 12ms
     ✓ keeps the re-run when the owner's Fix now beats an engine Accept (assumed) 12ms
     ✓ decisions skip exits 2 for a missing file 12ms
   ✓ bkit decisions apply --by=headless (4)
     ✓ takes each recommendation: an Accept is assumed, Fix now is written as such 18ms
     ✓ leaves hard blockers for the owner and exits with the hard-blocker code 18ms
     ✓ apply --by=headless leaves a Recommended: none item for the owner 18ms
     ✓ labels the runtime from the main checkout's Cursor marker when run in a build worktree 56ms
   ✓ parseDecisionItems (11)
     ✓ parseDecisionItems keeps the bare option name, dropping the letter 0ms
     ✓ a decision file written before the letters still parses 0ms
     ✓ parseDecisionItems reads a lettered decision as the option its letter labels 0ms
     ✓ parseDecisionItems reads one option per line and drops each effect 0ms
     ✓ parseDecisionItems reads Recommended: none as a hard blocker 0ms
     ✓ a lettered decision in a per-line file reads as the option its letter labels 0ms
     ✓ a per-line option whose text holds a slash or a middle dot stays one option 0ms
     ✓ a file mixing both layouts parses each item in its own layout 0ms
     ✓ reads the task a Fix now item names on its Fix task line 0ms
     ✓ decisionHeader reads the header block only 0ms
     ✓ a lettered assumed Accept decision still reads as assumed 0ms
   ✓ applyRecommendations (3)
     ✓ a Try again loop answer settles the loop alone; the items wait for the next round 0ms
     ✓ a lettered recommendation still settles its item by name 0ms
     ✓ applyRecommendations reads a lettered Try again decision as the loop answer 0ms
   ✓ bkit decisions apply --by=owner and pending (8)
     ✓ pending lists each assumed Accept nobody confirmed 24ms
     ✓ --confirm writes the owner's decision row and the real Accept; --reject marks it rejected 65ms
     ✓ apply --by=owner --confirm confirms an assumed item in a per-line file 38ms
     ✓ refuses an item that is not an assumed Accept, or a call without one of --confirm / --reject 19ms
     ✓ --defer writes one needs-decision deferral per listed item, then lists none 49ms
     ✓ --defer letters the options in the deferral row 41ms
     ✓ pending refuses a --fid that climbs out of the log folder and reads and writes nothing 18ms
     ✓ refuses a malformed --month 18ms
   ❯ bkit decisions check (8)
     ✓ refuses a question without lettered options, naming it 13ms
     ✓ refuses Q1 when the engine file holds the loop question 12ms
     ✓ refuses a question line written with an en dash, naming the line 12ms
     ✓ accepts a correctly written question numbered Q10 12ms
     ✓ refuses a file with no question when the engine file holds no loop question 12ms
     ✓ refuses a Status, Source changed or Gate line in the orchestrator's header 35ms
     × refuses a decision file whose question count no longer matches the engine file's loop options 15ms
     ✓ accepts questions numbered from Q1 when the pause has no engine file 12ms
   ✓ bkit decisions counts (24)
     ✓ writes the attempt line, progress, base check and loop question into the engine file only 13ms
     ✓ recommends Decide when the last round changed no source 12ms
     ✓ recommends Try again when the last round made progress 13ms
     ✓ engine file recommends Stop when the base check is all and no questions are counted 12ms
     ✓ engine file recommends Decide when the base check is all and questions are counted 12ms
     ✓ writes Source changed and Gate into the engine file for a verify pause with no loop 12ms
     ✓ --loop=holistic counts only the rounds since the whole-feature check was last clean 13ms
     ✓ holistic limit pause prints the rounds run, never above max 12ms
     ✓ prints the group gate's failing tests per round for the verify loop 12ms
     ✓ --loop on an unknown trend says the limit is used up 12ms
     ✓ --loop on an unknown trend below the limit does not say the limit is used up 12ms
     ✓ base check all in adopt mode adds the merge sentence 25ms
     ✓ base check some with undetermined cases counts only the branch's as fixable 12ms
     ✓ --loop writes an effect for each loop option, Stop included when no item is counted 12ms
     ✓ prints the holistic gate's failing tests per round for the holistic loop 13ms
     ✓ --loop on an unknown trend recommends Try again without claiming progress 13ms
     ✓ base check all says a gate still red after resume comes from this branch 13ms
     ✓ base check some names the split 13ms
     ✓ base check none keeps the trend and names the branch 12ms
     ✓ base check unknown keeps the trend and says why 12ms
     ✓ Try again is offered for every base verdict 98ms
     ✓ base check prints how many failing tests are also red on base 24ms
     ✓ a missing or malformed base check is a usage error that names the problem 24ms
     ✓ --loop needs --file 12ms
   ✓ bkit decisions apply --by=headless (1)
     ✓ writes assumed decisions into the engine file and leaves the decision file unchanged 19ms
   ✓ bkit decisions apply --by=owner and pending (3)
     ✓ writes a confirmation into the engine file 46ms
     ✓ --answer writes the loop answer under the engine file's Q1 13ms
     ✓ --answer reads the owner's reason from --reason-file 12ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options
AssertionError: expected +0 to be 6 // Object.is equality

- Expected
+ Received

- 6
+ 0

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1033:20
    1031|     );
    1032|     const r = await run(["decisions", "check", `--file=${file}`], root…
    1033|     expect(r.code).toBe(6);
       |                    ^
    1034|     expect(`${JSON.stringify(r.json)}${r.err}`).toContain("decisions c…
    1035|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 74 passed (75)
   Start at  07:01:20
   Duration  1.39s (tests 89%, import 5%, transform 5%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-fL2Zsw/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/workflows.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/workflows.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/workflows.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/workflows.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (197 tests | 2 failed) 54645ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 109ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 363ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 84ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 77ms
     ✓ writes no limits for a workflow with no ask point 77ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 74ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 91ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 103ms
       ✓ a new run in the same chat gets its own session row 95ms
       ✓ writes none outside Claude Code 77ms
     ✓ opens the next run after a finished one, and after another workflow's run 89ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 102ms
     ✓ design / plan / build / debug book in the current worktree 120ms
     ✓ refuses when the lock is live, writing no row 75ms
     ✓ --lock-held checks the lock is ours 107ms
     ✓ rejects an unknown workflow 56ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 91ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 131ms
   ✓ bkit workflows start — resume facts (12)
     ✓ a new run has no last step and no open decision 79ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 73ms
     ✓ an OPEN decision of an earlier run never resurfaces 88ms
     ✓ an OPEN decision mid-build prints its header fields 77ms
     ✓ openDecision carries the Gate header 72ms
     ✓ openDecision carries the Source changed header 75ms
     ✓ workflows start reports openDecision for a DECIDED decision file that no build-decision row names 72ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 144ms
     ✓ workflows start does not report openDecision for a DECIDED decision file that a build-decision row names 72ms
     ✓ openDecision gate is null without the header 76ms
     ✓ openDecision gate ignores a Gate line below the header 73ms
     ✓ reads Test attempt from a tests pause 73ms
   ❯ bkit workflows fail (27)
     ✓ writes workflow-failed, releases its lock, and reports no handover 122ms
     ✓ writes no row when status.jsonl does not exist 95ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 95ms
     ✓ aborts a rebase only when one is in progress 204ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 169ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 183ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 113ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 121ms
     ✓ --max-exceeded says a handover is due without any sentinel 94ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 83ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 114ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 120ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 61ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 59ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 61ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 61ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 60ms
     ✓ rewrites the error and stderr files with configured secret values redacted and stderr cut to 20 lines 70ms
     × redacts credentials beyond the tracker keys from the error and stderr files 72ms
     × writes the stderr file with the checkout path made relative and the home directory as ~ 67ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 75ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 68ms
     ✓ bkit workflows fail refuses a multi-line, non-/bkit- or markdown-carrying --next-step before any write 78ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 114ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 78ms
     ✓ bkit workflows fail treats an empty --next-step as absent 67ms
     ✓ a debug run in SOAK mode always needs a handover 96ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 238ms
       ✓ counts subagents of an earlier chat the run's session rows name 225ms
       ✓ records no context block, and still closes, outside a Claude Code session 222ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 226ms
     ✓ records ending held and publish false on the workflow-done row 220ms
     ✓ defaults the close row to ending done 222ms
     ✓ refuses an unknown ending 88ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 226ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 223ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 222ms
     ✓ always writes the telemetry, whatever the runtime 203ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 172ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 200ms
     ✓ an unwritable stats path is logged and never fails the close 188ms
     ✓ appends the completeness row before the workflow-done row 225ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 215ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 218ms
     ✓ writes one completeness row per close 349ms
     ✓ leaves out the previous run's rows that share a second with this run's start 215ms
     ✓ still closes when the completeness check throws 219ms
     ✓ still closes when the completeness row write throws 221ms
     ✓ refuses without status.jsonl and writes nothing 68ms
     ✓ ship: run.pr, size of the squash commit, and coverage 271ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 342ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 221ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 208ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 277ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 270ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 294ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 258ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 260ms
     ✓ --record-step writes the close step's row before workflow-done 183ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 205ms
     ✓ --number without --outbox is a usage error 195ms
     ✓ --flush is ship only 80ms
   ✓ bkit workflows handover (32)
     ✓ --push commits and pushes the record on the feature branch without a handover 277ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 273ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 297ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 292ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 218ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 114ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 100ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 690ms
     ✓ --flush with nothing to record commits and pushes nothing 358ms
     ✓ --flush carries the named worktree's logs into the dev commit 665ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 870ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 1352ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 1259ms
     ✓ closePr titles the PR by the record it carries 1204ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 287ms
       ✓ ship's owner Stop on an open PR: exit 9, push skipped → route stop with the not-pushed line 208ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 411ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 265ms
       ✓ --ref, no push → route stop, no message 161ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 353ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 741ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 886ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 720ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 850ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 728ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 732ms
     ✓ --push on dev never carries a row whose references name another feature 725ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 693ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 1363ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 806ms
     ✓ --push commits in the named worktree, not the checkout it runs from 342ms
     ✓ rejects --push with --flush, and --flush outside ship 67ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 832ms
     ✓ preserves unlanded file deletions and ledger additions on close 1630ms
     ✓ preserves dirty work and uncertain branch evidence during close 1631ms
     ✓ preserves a local feature ref changed after its cleanup proof 1639ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 899ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 672ms
     ✓ a close that landed releases the lock 878ms
     ✓ removes the worktree before it releases the lock 869ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 1449ms
       ✓ closePr refuses when the PR base is unknown 1230ms
     ✓ leaves a worktree no workflow created, and its branch, in place 715ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 62ms
     ✓ exits 12 when there is no versioned draft 60ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 59ms
     ✓ stamps the anchor from the runtime-resolved base commit 107ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 92ms
     ✓ promote copies the plan only 58ms
     ✓ rejects a workflow other than design or plan 53ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 105ms
     ✓ names the branch, not the remote-tracking ref, in each URL 97ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 90ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 100ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 232ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 142ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 373ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 167ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 157ms
     ✓ a second run's record does not let this FID's close commit 196ms
     ✓ record is present after workflows close and before the push 359ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 772ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 769ms
       ✓ a run closed by workflow-failed keeps no parked copy 745ms
       ✓ a run closed by workflow-done keeps no parked copy 736ms
       ✓ a FAILED run gets no row 741ms
       ✓ a DONE run gets no row 779ms
     ✓ failed handover from dev removes the record and keeps recorded paths 744ms
   ✓ bkit workflows input (10)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 71ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 68ms
     ✓ a run with no issue holds the prompt alone 66ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 144ms
     ✓ --plan is appended when the file exists and skipped when it does not 97ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 151ms
     ✓ a missing prompt file exits 13 67ms
     ✓ a rebuilt design input keeps the owner-interview record appended after the first build 80ms
     ✓ a grill file that was never appended is appended once, after a blank line 68ms
     ✓ a workflow with no grill file writes exactly the sections 67ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 297ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 232ms
     ✓ puts each --line after the summary, in flag order 229ms
     ✓ refuses --final-return without --summary-file 61ms
     ✓ --summary prints the file and keeps a copy in --outbox 227ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 227ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 63ms
     ✓ a missing summary file exits 13 before anything is written 63ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 74ms
     ✓ a folder outside the outbox sessions folder is kept 67ms
     ✓ without --session-dir prints no sessionRemoved 60ms
   ✓ bkit workflows summary (13)
     ✓ passes publish into the summary input 22ms
     ✓ lists ship-failure rows from a run started before their removal 8ms
     ✓ counts an assumed item in an engine file once 9ms
     ✓ summary is FAIL when a plan task is not done 9ms
     ✓ summary is CONCERNS when a deferral was written 8ms
     ✓ a deferral closed later no longer lowers the verdict, while its history stays on disk 9ms
     ✓ recomputes the verdict from resolved work without rewriting the earlier summary event 9ms
     ✓ prints CONCERNS when a Fix now group's fix task and a test-fix FAIL are both resolved 10ms
     ✓ summary recommends /bkit-debug on FAIL 15ms
     ✓ summary reports the last attempt 8ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 8ms
     ✓ a design summary carries the organised design's open questions 8ms
     ✓ refuses a status file with no run of the workflow, and a missing one 1ms
   ✓ bkit workflows start — the run's progress link (3)
     ✓ start with --session-dir writes the session's link as progress on the workflow-started row 98ms
     ✓ a resumed start with another session keeps the run's first link 127ms
     ✓ start with a session folder that holds no progress id writes the row without progress and records association friction 110ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows fail > redacts credentials beyond the tracker keys from the error and stderr files
AssertionError: tmp/error.md: expected 'migration failed: svc_fakeTokenValue9…' not to contain 'svc_fakeTokenValue9876543210'

- Expected
+ Received

- svc_fakeTokenValue9876543210
+ migration failed: svc_fakeTokenValue9876543210 at postgres://app:fakePassw0rdValue@db/app
+

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:1003:29
    1001|       for (const f of ["tmp/error.md", "tmp/stderr.md"]) {
    1002|         const text = fs.readFileSync(path.join(cwd, f), "utf8");
    1003|         expect(text, f).not.toContain(token);
       |                             ^
    1004|         expect(text, f).not.toContain(password);
    1005|         expect(text, f).toContain("<BKIT_TEST_SERVICE_TOKEN>");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows fail > writes the stderr file with the checkout path made relative and the home directory as ~
AssertionError: expected 'Error at /private/var/folders/td/lj74…' not to contain '/private/var/folders/td/lj74ml2d0jz3t…'

- Expected
+ Received

- /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-WsZXla
+ Error at /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-WsZXla/src/a.ts:10
+     at load (/Users/christian/.cache/tool/index.js:3)
+

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:1035:22
    1033|     expect(r.code).toBe(0);
    1034|     const text = fs.readFileSync(path.join(cwd, "tmp/stderr.md"), "utf…
    1035|     expect(text).not.toContain(cwd);
       |                      ^
    1036|     expect(text).not.toContain(home);
    1037|     expect(text).toContain("src/a.ts:10");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 195 passed (197)
   Start at  07:01:22
   Duration  54.92s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-ilT2c5/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
