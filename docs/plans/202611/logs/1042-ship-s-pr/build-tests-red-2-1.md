Enforced: true
Red: 7
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/1042-ship-s-pr-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that adds a symlinked ledger" | red | failure: expected +0 to be 10 // Object.is equality |
| 4 | `.bkit/core/engine/commands/workflow/branches.test.ts` "restoreBranchRows writes nothing through a symlinked ledger" | red | failure: expected true to be false // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev with a fork PR on the ship-failed branch name opens its own PR" | red | failure: expected [] to have a length of 1 but got +0 |
| 6 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev onto a leftover ship-failed branch keeps the skip token on the pushed head" | red | failure: expected 'Merge commit \'78ccc5b1d1bc442fde00f9…' to be 'chore(12-export-csv): ship FAILED bki…' // Object.is equality |
| 7 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "a second refused close waits for the reused PR head to reach the pushed tip before merging" | red | failure: expected { …(2) } to deeply equal { …(2) } |
| 8 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that adds a skill" | red | failure: expected +0 to be 10 // Object.is equality |
| 8 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that writes .bkit/issues.jsonl" | red | failure: expected +0 to be 10 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/workflows.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/workflows.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/workflows.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/workflows.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (231 tests | 6 failed) 86173ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 107ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 351ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 79ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 71ms
     ✓ writes no limits for a workflow with no ask point 71ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 68ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 86ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 95ms
       ✓ a new run in the same chat gets its own session row 89ms
       ✓ writes none outside Claude Code 76ms
     ✓ opens the next run after a finished one, and after another workflow's run 82ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 122ms
     ✓ design / plan / build / debug book in the current worktree 99ms
     ✓ refuses when the lock is live, writing no row 66ms
     ✓ --lock-held checks the lock is ours 97ms
     ✓ rejects an unknown workflow 50ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 82ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 127ms
   ✓ bkit workflows start — resume facts (12)
     ✓ a new run has no last step and no open decision 74ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 67ms
     ✓ an OPEN decision of an earlier run never resurfaces 85ms
     ✓ an OPEN decision mid-build prints its header fields 67ms
     ✓ openDecision carries the Gate header 71ms
     ✓ openDecision carries the Source changed header 69ms
     ✓ workflows start reports openDecision for a DECIDED decision file that no build-decision row names 69ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 138ms
     ✓ workflows start does not report openDecision for a DECIDED decision file that a build-decision row names 69ms
     ✓ openDecision gate is null without the header 69ms
     ✓ openDecision gate ignores a Gate line below the header 68ms
     ✓ reads Test attempt from a tests pause 71ms
   ✓ bkit workflows fail (47)
     ✓ writes workflow-failed, releases its lock, and reports no handover 126ms
     ✓ writes no row when status.jsonl does not exist 99ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 116ms
     ✓ aborts a rebase only when one is in progress 245ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 243ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 254ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 131ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 127ms
     ✓ --max-exceeded says a handover is due without any sentinel 114ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 87ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 123ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 131ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 59ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 59ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 59ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 72ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 62ms
     ✓ rewrites the error and stderr files with configured secret values redacted and stderr cut to 20 lines 105ms
     ✓ redacts credentials beyond the tracker keys from the error and stderr files 103ms
     ✓ redacts token-shaped values that no environment variable holds from the error and stderr files 101ms
     ✓ redacts refresh_token and id_token values and the ghu_, ghr_, sk_live_, rk_live_, ASIA, AIza and npm_ prefixes 114ms
     ✓ redacts JSON-quoted access_token, refresh_token and id_token values and keeps their keys 99ms
     ✓ keeps npm_ environment names and ASIA- or AKIA-led words that are not token-shaped 83ms
     ✓ scrubs the log folder of a linked worktree that sits outside the main checkout 117ms
     ✓ redacts a private-key body whose BEGIN or END line is missing from the error and stderr files 101ms
     ✓ skips an error or stderr file outside the run's log folder, names it in refusedFiles, and still records the failure 319ms
     ✓ skips an error or stderr file that is a symbolic link to a file outside the log folder and leaves that file unchanged 329ms
     ✓ skips a log-folder file other than {workflow}-error.md and {workflow}-stderr.md, such as status.jsonl 149ms
     ✓ skips an error file it cannot rewrite, quotes none of it, and still records the failure 135ms
     ✓ keeps the --error text and says on the Error line that the error file was skipped, and why 142ms
     ✓ skips a stderr file in the log folder that is a hard link to a file outside it, and leaves that file unchanged 155ms
     ✓ skips an error file in the log folder that is a directory 142ms
     ✓ skips a stderr file in the log folder that is a FIFO, without waiting on it 151ms
     ✓ skips a missing error file, still prints the comment and names it in refusedFiles 155ms
     ✓ skips an error file that is a dangling symbolic link, still prints the comment and names it in refusedFiles 141ms
     ✓ scrubs an AWS key ID followed by more letters, digits or an underscore 84ms
     ✓ redacts the values of credential env vars named KEY, PASS or WEBHOOK from the error and stderr files 95ms
     ✓ redacts the password of a URL with an empty user name from the error and stderr files 100ms
     ✓ redacts a Bearer value in a quoted or JSON Authorization header from the error and stderr files 100ms
     ✓ writes the stderr file with the checkout path made relative and the home directory as ~ 83ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 99ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 80ms
     ✓ bkit workflows fail refuses a multi-line, non-/bkit- or markdown-carrying --next-step before any write 78ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 122ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 72ms
     ✓ bkit workflows fail treats an empty --next-step as absent 83ms
     ✓ a debug run in SOAK mode always needs a handover 101ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 255ms
       ✓ counts subagents of an earlier chat the run's session rows name 199ms
       ✓ records no context block, and still closes, outside a Claude Code session 212ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 214ms
     ✓ records ending held and publish false on the workflow-done row 200ms
     ✓ defaults the close row to ending done 240ms
     ✓ refuses an unknown ending 92ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 230ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 207ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 203ms
     ✓ always writes the telemetry, whatever the runtime 195ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 155ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 182ms
     ✓ an unwritable stats path is logged and never fails the close 181ms
     ✓ appends the completeness row before the workflow-done row 213ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 198ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 235ms
     ✓ writes one completeness row per close 377ms
     ✓ leaves out the previous run's rows that share a second with this run's start 184ms
     ✓ still closes when the completeness check throws 229ms
     ✓ still closes when the completeness row write throws 220ms
     ✓ refuses without status.jsonl and writes nothing 70ms
     ✓ ship: run.pr, size of the squash commit, and coverage 243ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 326ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 206ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 223ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 333ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 346ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 279ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 239ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 245ms
     ✓ --record-step writes the close step's row before workflow-done 180ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 219ms
     ✓ --number without --outbox is a usage error 172ms
     ✓ --flush is ship only 78ms
   ❯ bkit workflows handover (44)
     ✓ --push commits and pushes the record on the feature branch without a handover 293ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 271ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 311ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 296ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 203ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 115ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 100ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 691ms
     ✓ --flush with nothing to record commits and pushes nothing 432ms
     ✓ --flush carries the named worktree's logs into the dev commit 717ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 939ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 1375ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 1360ms
     ✓ closePr titles the PR by the record it carries 1264ms
     ✓ --flush refused by dev twice for one FID publishes the second record through a PR 2049ms
     ✓ --flush refused by dev with ship-failed left on origin and no PR opens one PR on that branch 1725ms
     ✓ --flush refused by dev with a squash-merged ship-failed tip left on origin lands the new record 1891ms
     ✓ --flush refused by dev does not merge a leftover tip that changes code 1045ms
     ✓ --flush refused by dev with gh pr create failing names the pushed ship-failed branch 1521ms
     ✓ --flush refused by dev links the handover comment at the pushed commit when the PR did not merge 1406ms
     ✓ --flush refused by dev keeps the unmerged handover link readable after the branch is deleted 1377ms
     × --flush refused by dev does not merge a leftover tip that adds a symlinked ledger 1650ms
     × --flush refused by dev with a fork PR on the ship-failed branch name opens its own PR 1672ms
     × --flush refused by dev onto a leftover ship-failed branch keeps the skip token on the pushed head 1570ms
     × --flush refused by dev does not merge a leftover tip that adds a skill 1620ms
     × --flush refused by dev does not merge a leftover tip that writes .bkit/issues.jsonl 1864ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 333ms
       ✓ ship's owner Stop on an open PR: exit 9, push skipped → route stop with the not-pushed line 199ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 430ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 311ms
       ✓ --ref, no push → route stop, no message 173ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 369ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 823ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1074ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 793ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 956ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1083ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 795ms
     ✓ --push on dev never carries a row whose references name another feature 793ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 756ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 1342ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 858ms
     ✓ --push commits in the named worktree, not the checkout it runs from 375ms
     ✓ rejects --push with --flush, and --flush outside ship 72ms
   ❯ bkit workflows close --flush (ship) (13)
     ✓ preserves newer feature work when closing an already merged PR 997ms
     ✓ preserves unlanded file deletions and ledger additions on close 1718ms
     ✓ preserves dirty work and uncertain branch evidence during close 1779ms
     ✓ preserves a local feature ref changed after its cleanup proof 1862ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1092ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 816ms
     ✓ a close that landed releases the lock 923ms
     ✓ removes the worktree before it releases the lock 949ms
     ❯ close PR (dev refused the push) (4)
       ✓ closePr with base dev still merges 1497ms
       ✓ a second refused close for one FID reuses the open ship-close PR 1878ms
       × a second refused close waits for the reused PR head to reach the pushed tip before merging 1758ms
       ✓ closePr refuses when the PR base is unknown 1385ms
     ✓ leaves a worktree no workflow created, and its branch, in place 851ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 63ms
     ✓ exits 12 when there is no versioned draft 72ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 65ms
     ✓ stamps the anchor from the runtime-resolved base commit 79ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 117ms
     ✓ promote copies the plan only 90ms
     ✓ rejects a workflow other than design or plan 71ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 124ms
     ✓ names the branch, not the remote-tracking ref, in each URL 115ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 135ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 119ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 543ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 213ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 499ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 220ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 183ms
     ✓ a second run's record does not let this FID's close commit 258ms
     ✓ record is present after workflows close and before the push 424ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 995ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 1040ms
       ✓ a run closed by workflow-failed keeps no parked copy 899ms
       ✓ a run closed by workflow-done keeps no parked copy 967ms
       ✓ a FAILED run gets no row 947ms
       ✓ a DONE run gets no row 851ms
     ✓ failed handover from dev removes the record and keeps recorded paths 762ms
   ✓ bkit workflows input (10)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 75ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 77ms
     ✓ a run with no issue holds the prompt alone 85ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 187ms
     ✓ --plan is appended when the file exists and skipped when it does not 110ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 173ms
     ✓ a missing prompt file exits 13 75ms
     ✓ a rebuilt design input keeps the owner-interview record appended after the first build 97ms
     ✓ a grill file that was never appended is appended once, after a blank line 75ms
     ✓ a workflow with no grill file writes exactly the sections 85ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 283ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 234ms
     ✓ puts each --line after the summary, in flag order 232ms
     ✓ refuses --final-return without --summary-file 73ms
     ✓ --summary prints the file and keeps a copy in --outbox 271ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 287ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 69ms
     ✓ a missing summary file exits 13 before anything is written 73ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 89ms
     ✓ a folder outside the outbox sessions folder is kept 87ms
     ✓ without --session-dir prints no sessionRemoved 75ms
   ✓ bkit workflows summary (13)
     ✓ passes publish into the summary input 32ms
     ✓ lists ship-failure rows from a run started before their removal 10ms
     ✓ counts an assumed item in an engine file once 19ms
     ✓ summary is FAIL when a plan task is not done 8ms
     ✓ summary is CONCERNS when a deferral was written 11ms
     ✓ a deferral closed later no longer lowers the verdict, while its history stays on disk 12ms
     ✓ recomputes the verdict from resolved work without rewriting the earlier summary event 10ms
     ✓ prints CONCERNS when a Fix now group's fix task and a test-fix FAIL are both resolved 11ms
     ✓ summary recommends /bkit-debug on FAIL 18ms
     ✓ summary reports the last attempt 11ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 11ms
     ✓ a design summary carries the organised design's open questions 10ms
     ✓ refuses a status file with no run of the workflow, and a missing one 2ms
   ✓ bkit workflows start — the run's progress link (3)
     ✓ start with --session-dir writes the session's link as progress on the workflow-started row 118ms
     ✓ a resumed start with another session keeps the run's first link 147ms
     ✓ start with a session folder that holds no progress id writes the row without progress and records association friction 116ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --flush refused by dev does not merge a leftover tip that adds a symlinked ledger
AssertionError: expected +0 to be 10 // Object.is equality

- Expected
+ Received

- 10
+ 0

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:2928:20
    2926|     expect(r.code).toBe(10);
    2927|     expect(r.err).toContain(`ship-failed/${FID}`);
    2928|     expect(r.err).toContain("evil.jsonl");
       |                    ^
    2929|     expect(git(remote, "rev-parse", `ship-failed/${FID}`)).toBe(tip);
    2930|     expect(fs.existsSync(planted)).toBe(false);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --flush refused by dev with a fork PR on the ship-failed branch name opens its own PR
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:2950:20
    2948|     expect(create).toHaveLength(1);
    2949|     expect(create[0]).toContain(`--head ${head}`);
    2950|     expect(gh.calls().some((c) => c.startsWith("pr merge 7"))).toBe(fa…
       |                    ^
    2951|   });
    2952|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --flush refused by dev onto a leftover ship-failed branch keeps the skip token on the pushed head
AssertionError: expected 'Merge commit \'78ccc5b1d1bc442fde00f9…' to be 'chore(12-export-csv): ship FAILED bki…' // Object.is equality

Expected: "chore(12-export-csv): ship FAILED bkit [skip ci]"
Received: "Merge commit '78ccc5b1d1bc442fde00f9c3d9dba0fdadce624d' into HEAD"

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:2961:75
    2962|   });
    2963|
    2964|   it("--flush refused by dev does not merge a leftover tip that adds a…
       |                                                             ^
    2965|     let tip = "";
    2966|     const { remote, wt } = refusedAfter((rm) => {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --flush refused by dev does not merge a leftover tip that adds a skill
AssertionError: expected +0 to be 10 // Object.is equality

- Expected
+ Received

- 10
+ 0

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:2977:20
    2975|     expect(r.code).toBe(10);
    2976|     expect(r.err).toContain(`ship-failed/${FID}`);
    2977|     expect(r.err).toContain(".claude/skills/probe/SKILL.md");
       |                    ^
    2978|     expect(git(remote, "rev-parse", `ship-failed/${FID}`)).toBe(tip);
    2979|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --flush refused by dev does not merge a leftover tip that writes .bkit/issues.jsonl
AssertionError: expected +0 to be 10 // Object.is equality

- Expected
+ Received

- 10
+ 0

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:2994:20
    2992|     expect(r.code).toBe(10);
    2993|     expect(r.err).toContain(".bkit/issues.jsonl");
    2994|     // The branch stays at the leftover tip: the new record is not mer…
       |                    ^
    2995|     expect(git(remote, "rev-parse", `ship-failed/${FID}`)).toBe(tip);
    2996|     expect(git(remote, "show", `dev:.bkit/issues.jsonl`)).not.toContai…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/6]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close --flush (ship) > close PR (dev refused the push) > a second refused close waits for the reused PR head to reach the pushed tip before merging
AssertionError: expected { …(2) } to deeply equal { …(2) }

- Expected
+ Received

  {
    "ref": "ship-close/12-export-csv",
-   "via": "close-pr",
+   "via": "close-pr-open",
  }

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:3631:29
    3629|       expect(r.json.landed).toEqual({ ref: branch, via: "close-pr" });
    3630|       const pushed = git(s.remote, "rev-parse", branch);
    3631|       expect(pushed).not.toBe(leftover);
       |                             ^
    3632|       expect(gh.calls().filter((c) => c.includes(`--match-head-commit …
    3633|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/6]⎯


 Test Files  1 failed (1)
      Tests  6 failed | 225 passed (231)
   Start at  06:35:47
   Duration  86.41s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-xZOXcv/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/branches.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/branches.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/branches.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/branches.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts (307 tests | 1 failed) 248703ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 200ms
     ✓ rejects missing explicit and ambiguous existing branch selections 200ms
   ✓ branches rebase: classification (32)
     ✓ ledger list does not drift from .gitattributes merge=union 1ms
     ✓ classifies docs/knowledge.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/decisions.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/deferrals.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/failures.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies .bkit/issues.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/roadmap.md as an auto-resolvable ledger 1ms
     ✓ classifies .bkit/stats.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies .bkit/friction.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/plans/202608/logs/234-x/status.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies every lockfile with a regenerate command as the lockfile shape 1ms
     ✓ refuses src.txt 0ms
     ✓ refuses package.json 0ms
     ✓ refuses .bkit/config.json 0ms
     ✓ refuses docs/testing.md 0ms
     ✓ refuses docs/plans/202608/234-plan.md 0ms
     ✓ refuses apps/web/data.jsonl 0ms
     ✓ refuses docs/plans/202608/logs/234-x/other.jsonl 0ms
     ✓ refuses packages/a/Cargo.lock 0ms
     ✓ classifies only the feature's own plan files as the plan-log shape 1ms
     ✓ matches ledger globs as whole paths: `**` spans any depth, `.` is literal, no prefix match 0ms
     ✓ classifies pnpm-lock.yaml (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies package-lock.json (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies yarn.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies bun.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies Cargo.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies go.sum (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies uv.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies every generated register as the register shape, and only at its exact path 0ms
     ✓ classifies a doc as embedding a register only when the repo's script lists it 0ms
     ✓ classifies the install record, and only at its exact path 0ms
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 69ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 366ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 365ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 250ms
     ✓ a refused --continue carries git's own reason 589ms
     ✓ --file records nothing for a refused rebase 318ms
     ✓ refuses a code conflict and aborts the rebase on the spot 282ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 578ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 196ms
     ✓ produces byte-identical output to merge=union 413ms
     ✓ restores a trailing newline so the next append starts on its own line 246ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 245ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 344ms
     ✓ refuses a union that leaves a line which is not JSON 193ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 278ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 593ms
     ✓ refuses a lockfile whose regenerate command fails 371ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 436ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 422ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 439ms
     ✓ refuses and aborts when both sides changed the hand-written region 245ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 309ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 373ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 485ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 335ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 349ms
     ✓ refuses and aborts when a side deleted the install record 230ms
     ✓ refuses a conflicted doc the repo's script does not list 176ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 232ms
     ✓ removes a stale sentinel when the rebase succeeds 330ms
     ✓ exits 4 when no rebase is in progress 64ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 322ms
     ✓ resolves a conflict in each of two replayed commits across rounds 296ms
   ✓ branches rebase: plan-closed branch with a leftover push (17)
     ✓ takes the rebase target's copy of a plan log both sides added, and completes the rebase 284ms
     ✓ takes the target's copy in each round when the branch changed the plan log in a later commit 472ms
     ✓ completes the rebase when the branch ends on the same plan-log bytes as the target, emptying its commit 372ms
     ✓ settles the feature's plan file on the target's copy and still unions status.jsonl in the same pass 790ms
     ✓ refuses another feature's plan log and names the rule in the reason 424ms
     ✓ refuses a code conflict beside the plan logs, leaving the plan log unresolved 459ms
     ✓ keeps a differing branch copy larger than 1 MiB aside and names it 654ms
     ✓ names the kept branch copy in the rebase log by an outbox-relative path, never an absolute one 699ms
     ✓ gives a branch not named feat/{fid} no plan-log rule 390ms
     ✓ does not silently drop a later branch edit to the plan file when dev changed an adjacent line 549ms
     ✓ refuses and aborts the rebase when the branch's differing plan-log copy cannot be kept aside 1530ms
     ✓ removes only the glob-named plan log dev deleted and keeps the feature's other logs 1266ms
     ✓ gives a branch whose feat/ suffix is not a feature id no plan-log rule 360ms
     ✓ names the plan log whose rebase-target copy emptied the commit on the SKIPPED line 528ms
     ✓ names a plan log the branch deleted and dev edited on the SKIPPED line 486ms
     ✓ takes dev's copy of only the glob-named plan log and still unions the ledger its name matches 642ms
     ✓ keeps every differing branch copy of one rebase under one dropped-logs/{time}/ folder 807ms
   ✓ branches anchor-stamp (19)
     ✓ prepends a well-formed block to an unstamped file 32ms
     ✓ records the bkit release, and warns visibly under the block when it is outdated 99ms
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 73ms
     ✓ stamps an empty bkitLatest and no warning when the newest release is unknown 30ms
     ✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 37ms
     ✓ is idempotent: stamping twice with the same args is byte-identical 70ms
     ✓ re-stamping with a different base replaces the block instead of adding a second 67ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 61ms
     ✓ --design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha 86ms
     ✓ fails closed on an empty --base-sha and writes nothing 1ms
     ✓ fails closed on a missing file 1ms
     ✓ two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard) 66ms
     ✓ strips an unterminated block to the end of the file, as sed's range does 1ms
     ✓ stampAnchor: empty file 1ms
     ✓ stampAnchor: no trailing newline (kept as-is) 0ms
     ✓ stampAnchor: two blocks (both removed) 0ms
     ✓ stampAnchor: close on the line after open (body line kept) 1ms
     ✓ stampAnchor: inline lookalike marker is not a block 0ms
     ✓ stampAnchor: empty field block 0ms
   ✓ branches anchor-read (15)
     ✓ round-trips every field 41ms
     ✓ is silent on an unstamped file: a baseSha-shaped body line is not the anchor 2ms
     ✓ matches only inside the block, and the first occurrence wins 1ms
     ✓ exits 13 on a missing file and 2 on an unknown field 1ms
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 331ms
       ✓ skips (12) with no anchor 350ms
       ✓ skips (12) when the base is unreachable in this clone 355ms
       ✓ skips (12) when nothing landed since the base 313ms
       ✓ runs (0) with the landed path count once dev moved 717ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 389ms
     ✓ readAnchor: two blocks: the first block's value wins 1ms
     ✓ readAnchor: an unterminated block runs to the end of the file 1ms
     ✓ readAnchor: a field after the close line is outside the block 1ms
     ✓ readAnchor: an empty field reads as the empty string 1ms
     ✓ readAnchor: an empty file has no fields 1ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 992ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 482ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 728ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1112ms
     ✓ runs exactly one git push 935ms
     ✓ --set-upstream records the upstream 437ms
     ✓ refuses with no branch checked out 372ms
     ✓ --mode=dev refuses a feature checkout 360ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1244ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2102ms
     ✓ --require-ci pushes as-is when dev has not moved 708ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1532ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2006ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 400ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 796ms
     ✓ --mode=abort pushes when the branch has no open PR 612ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 835ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 351ms
     ✓ --open-pr carries the MCP answer and skips gh 508ms
     ✓ --mode=abort on dev pushes plainly without probing 553ms
     ✓ rejects an unknown mode 315ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1574ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 777ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1138ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2943ms
     ✓ skip-ci HEAD on the replay is refused 818ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1990ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2499ms
     ✓ a level local dev is a plain push, recording nothing extra 832ms
     ✓ a record with no commits pushes nothing 669ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 501ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1341ms
     ✓ a rewritten branch is refused, never forced 651ms
     ✓ refuses dev and main with exit 21 and pushes nothing 425ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1077ms
     ✓ refuses a detached HEAD (exit 5) 381ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 861ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 949ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1181ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1031ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 512ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1217ms
     ✓ an up-to-date branch is a no-op 648ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 952ms
     ✓ a fetch that fails exits 10 370ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 512ms
     ✓ scan-diff still reports a new skip when its test … 535ms
     ✓ scan-diff reports a skip moved onto a different t… 603ms
     ✓ scan-diff does not cancel a skip moved between am… 524ms
     ✓ scan-diff does not spend an unchanged duplicate t… 521ms
     ✓ scan-diff recognizes a renamed test file 477ms
     ✓ scan-diff recognizes a suite moved into a differe… 500ms
     ✓ scan-diff does not let unrelated additions hide a… 467ms
     ✓ scan-diff attributes deletion to its old test ins… 584ms
     ✓ scan-diff consumes each moved assertion once and … 449ms
     ✓ scan-diff does not match identical assertions fro… 490ms
     ✓ scan-diff does not match the same leaf test name … 507ms
     ✓ scan-diff does not match a same-named test with d… 426ms
     ✓ scan-diff does not match a same-named test with c… 479ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 545ms
     ✓ --paths with no match exits 1 417ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 370ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 664ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 710ms
     ✓ scan-diff without --base finds a marker the branch added when local dev already contains the branch 491ms
     ✓ --marker reads a diff over 1 MiB 566ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 752ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 567ms
     ✓ scan-diff finds an added skip 695ms
     ✓ scan-diff ignores a skip predating the base 549ms
     ✓ scan-diff reports a disabled test with its line 562ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 525ms
     ✓ scan-diff ignores a removed comment in a test file 557ms
     ✓ scan-diff ignores an assertion moved within the file 681ms
     ✓ scan-diff still reports a removed assertion 674ms
     ✓ scan-diff reports an assertion re-added only outside the test file 659ms
     ✓ scan-diff finds an added pytest mark skip 583ms
     ✓ scan-diff finds an added unittest skip 536ms
     ✓ scan-diff finds an added bare skip call 501ms
     ✓ scan-diff ignores a quoted skip in a documentation file 520ms
     ✓ scan-diff ignores a marker literal in a non-test source file 555ms
     ✓ scan-diff ignores an assertion whose expectation changed 517ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 493ms
     ✓ scan-diff reports a deleted test file 628ms
     ✓ scan-diff never opens a symlinked test file's outside target 4ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 456ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1387ms
     ✓ a title that already carries the marker is left alone 997ms
     ✓ with no open PR: pushes the marker commit and edits no title 947ms
     ✓ a re-run is deduped: no second marker commit 1296ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1395ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 430ms
     ✓ --title-set skips gh entirely 734ms
     ✓ refuses dev and main (exit 21) 300ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 2667ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 2380ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1328ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 3064ms
     ✓ continues only the explicitly recorded target through the public merge command 1976ms
     ✓ fetches the unseen feature head before classifying the base 1330ms
     ✓ fast forwards the feature before either base path is chosen 2985ms
     ✓ merges divergent feature tips without rebasing either side 1615ms
     ✓ continues the feature merge before starting a dev merge 2690ms
     ✓ publishes local code with a CI running head before bookkeeping 3004ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 4981ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 2947ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1908ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 515ms
     ✓ Path B once dev moved; --head checks a given commit 805ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 694ms
     ✓ --merge-docs merges dev when docs/ is behind 944ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 940ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1238ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1260ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1004ms
     ✓ --merge-docs skips an empty bkit:generate script 1027ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 860ms
     ✓ --merge-docs never merges on dev itself 896ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1237ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1054ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 904ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 1147ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 734ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1406ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1339ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1575ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1321ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1400ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1970ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 1434ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1521ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1008ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 744ms
     ✓ exits 10 when the fetch fails 618ms
     ✓ refuses --merge-docs with --head, and an unknown --head 540ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 897ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1185ms
     ✓ a failed install stops ship (16) 914ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 914ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 964ms
     ✓ exits 10 when the fetch fails 640ms
   ✓ shared landed comparison (7)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 492ms
     ✓ preserves unlanded file type changes in the shared landed comparison 579ms
     ✓ a later dev commit on the same file does not turn a landed branch back into unlanded 1071ms
     ✓ names only the file whose branch version never reached dev 1192ms
     ✓ a deleted file that dev deleted and a later commit re-added counts as landed 1099ms
     ✓ names a path under a directory named : when dev deleted, re-added and later edited the top-level file 1232ms
     ✓ a path under a directory named : that dev never touched is not reported landed 518ms
   ✓ branches land (28)
     ✓ refuses a workflow other than design or plan 321ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 497ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 2200ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 2399ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 2908ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 2356ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 4761ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 5081ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 769ms
     ✓ local: names unpushed dev as the cause when the branch carries it 841ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 841ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2622ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2475ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1599ms
     ✓ uses tree entry equivalence for design and plan land cleanup 8794ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2524ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2007ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1723ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1217ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3516ms
     ✓ land removes the worktree when only the copied .env is untracked 2258ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 2242ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 2971ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 3928ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 2748ms
     ✓ landPr refuses a main-based PR without retrying 839ms
     ✓ landPr refuses when the PR base is unknown 847ms
     ✓ PR not open (closed): stops (17) at once, no retry 1083ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 920ms
     ✓ --attempt names the merge round in a fix commit 803ms
     ✓ commits a rewritten and a deleted tracked file 834ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 733ms
     ✓ reports undeclared and runs nothing with no scripts 831ms
     ✓ reports undeclared and runs nothing with an empty script 531ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 1005ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 771ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 549ms
   ✓ branches scan-diff --since-step (4)
     ✓ scan-diff --since-step --code exits 0 when the subagent committed its fix before steps finish 1137ms
     ✓ scan-diff --since-step --code exits 0 when the fix was left uncommitted and the finish commit holds it 817ms
     ✓ scan-diff --since-step --code exits 1 when the step changed only logs 633ms
     ✓ scan-diff --since-step --code exits 0 when a refused finish wrote a takeover row after the subagent committed its fix 623ms
   ❯ restoreBranchRows (1)
     × restoreBranchRows writes nothing through a symlinked ledger 378ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > restoreBranchRows > restoreBranchRows writes nothing through a symlinked ledger
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:4943:36
    4941|     expect(fs.lstatSync(path.join(dir, "docs/evil.jsonl")).isSymbolicL…
    4942|     restoreBranchRows(dir, "feat");
    4943|     expect(fs.existsSync(planted)).toBe(false);
       |                                    ^
    4944|   });
    4945| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 306 passed (307)
   Start at  06:37:14
   Duration  248.91s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-jOhKJa/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
