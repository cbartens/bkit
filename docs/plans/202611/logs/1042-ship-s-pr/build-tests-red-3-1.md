Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/1042-ship-s-pr-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 9 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev runs the landing gate on a merged leftover tip" | red | failure: expected +0 to be 10 // Object.is equality |

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

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (232 tests | 1 failed) 177797ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 330ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1116ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 292ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 279ms
     ✓ writes no limits for a workflow with no ask point 186ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 169ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 317ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 399ms
       ✓ a new run in the same chat gets its own session row 321ms
       ✓ writes none outside Claude Code 209ms
     ✓ opens the next run after a finished one, and after another workflow's run 282ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 431ms
     ✓ design / plan / build / debug book in the current worktree 459ms
     ✓ refuses when the lock is live, writing no row 190ms
     ✓ --lock-held checks the lock is ours 373ms
     ✓ rejects an unknown workflow 191ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 286ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 383ms
   ✓ bkit workflows start — resume facts (12)
     ✓ a new run has no last step and no open decision 224ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 228ms
     ✓ an OPEN decision of an earlier run never resurfaces 242ms
     ✓ an OPEN decision mid-build prints its header fields 214ms
     ✓ openDecision carries the Gate header 174ms
     ✓ openDecision carries the Source changed header 166ms
     ✓ workflows start reports openDecision for a DECIDED decision file that no build-decision row names 178ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 448ms
     ✓ workflows start does not report openDecision for a DECIDED decision file that a build-decision row names 174ms
     ✓ openDecision gate is null without the header 191ms
     ✓ openDecision gate ignores a Gate line below the header 214ms
     ✓ reads Test attempt from a tests pause 177ms
   ✓ bkit workflows fail (47)
     ✓ writes workflow-failed, releases its lock, and reports no handover 398ms
     ✓ writes no row when status.jsonl does not exist 422ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 265ms
     ✓ aborts a rebase only when one is in progress 600ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 491ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 629ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 404ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 658ms
     ✓ --max-exceeded says a handover is due without any sentinel 360ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 269ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 438ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 358ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 145ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 225ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 243ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 226ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 190ms
     ✓ rewrites the error and stderr files with configured secret values redacted and stderr cut to 20 lines 357ms
     ✓ redacts credentials beyond the tracker keys from the error and stderr files 329ms
     ✓ redacts token-shaped values that no environment variable holds from the error and stderr files 301ms
     ✓ redacts refresh_token and id_token values and the ghu_, ghr_, sk_live_, rk_live_, ASIA, AIza and npm_ prefixes 368ms
     ✓ redacts JSON-quoted access_token, refresh_token and id_token values and keeps their keys 369ms
     ✓ keeps npm_ environment names and ASIA- or AKIA-led words that are not token-shaped 415ms
     ✓ scrubs the log folder of a linked worktree that sits outside the main checkout 424ms
     ✓ redacts a private-key body whose BEGIN or END line is missing from the error and stderr files 286ms
     ✓ skips an error or stderr file outside the run's log folder, names it in refusedFiles, and still records the failure 1077ms
     ✓ skips an error or stderr file that is a symbolic link to a file outside the log folder and leaves that file unchanged 1035ms
     ✓ skips a log-folder file other than {workflow}-error.md and {workflow}-stderr.md, such as status.jsonl 642ms
     ✓ skips an error file it cannot rewrite, quotes none of it, and still records the failure 398ms
     ✓ keeps the --error text and says on the Error line that the error file was skipped, and why 453ms
     ✓ skips a stderr file in the log folder that is a hard link to a file outside it, and leaves that file unchanged 403ms
     ✓ skips an error file in the log folder that is a directory 501ms
     ✓ skips a stderr file in the log folder that is a FIFO, without waiting on it 448ms
     ✓ skips a missing error file, still prints the comment and names it in refusedFiles 536ms
     ✓ skips an error file that is a dangling symbolic link, still prints the comment and names it in refusedFiles 476ms
     ✓ scrubs an AWS key ID followed by more letters, digits or an underscore 267ms
     ✓ redacts the values of credential env vars named KEY, PASS or WEBHOOK from the error and stderr files 283ms
     ✓ redacts the password of a URL with an empty user name from the error and stderr files 331ms
     ✓ redacts a Bearer value in a quoted or JSON Authorization header from the error and stderr files 312ms
     ✓ writes the stderr file with the checkout path made relative and the home directory as ~ 581ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 282ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 284ms
     ✓ bkit workflows fail refuses a multi-line, non-/bkit- or markdown-carrying --next-step before any write 236ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 376ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 210ms
     ✓ bkit workflows fail treats an empty --next-step as absent 244ms
     ✓ a debug run in SOAK mode always needs a handover 334ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 692ms
       ✓ counts subagents of an earlier chat the run's session rows name 862ms
       ✓ records no context block, and still closes, outside a Claude Code session 609ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 559ms
     ✓ records ending held and publish false on the workflow-done row 682ms
     ✓ defaults the close row to ending done 697ms
     ✓ refuses an unknown ending 246ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 666ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 666ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 681ms
     ✓ always writes the telemetry, whatever the runtime 562ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 534ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 504ms
     ✓ an unwritable stats path is logged and never fails the close 605ms
     ✓ appends the completeness row before the workflow-done row 610ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 534ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 803ms
     ✓ writes one completeness row per close 1090ms
     ✓ leaves out the previous run's rows that share a second with this run's start 601ms
     ✓ still closes when the completeness check throws 571ms
     ✓ still closes when the completeness row write throws 696ms
     ✓ refuses without status.jsonl and writes nothing 165ms
     ✓ ship: run.pr, size of the squash commit, and coverage 781ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1197ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 617ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 491ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 684ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 656ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 909ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 819ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 715ms
     ✓ --record-step writes the close step's row before workflow-done 441ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 477ms
     ✓ --number without --outbox is a usage error 416ms
     ✓ --flush is ship only 202ms
   ❯ bkit workflows handover (45)
     ✓ --push commits and pushes the record on the feature branch without a handover 645ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 813ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 804ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 701ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 496ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 255ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 216ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1479ms
     ✓ --flush with nothing to record commits and pushes nothing 973ms
     ✓ --flush carries the named worktree's logs into the dev commit 1750ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 2013ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 2755ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 2174ms
     ✓ closePr titles the PR by the record it carries 2519ms
     ✓ --flush refused by dev twice for one FID publishes the second record through a PR 13466ms
     ✓ --flush refused by dev with ship-failed left on origin and no PR opens one PR on that branch 2290ms
     ✓ --flush refused by dev with a squash-merged ship-failed tip left on origin lands the new record 2219ms
     ✓ --flush refused by dev does not merge a leftover tip that changes code 1531ms
     ✓ --flush refused by dev with gh pr create failing names the pushed ship-failed branch 1649ms
     ✓ --flush refused by dev links the handover comment at the pushed commit when the PR did not merge 1881ms
     ✓ --flush refused by dev keeps the unmerged handover link readable after the branch is deleted 2174ms
     ✓ --flush refused by dev does not merge a leftover tip that adds a symlinked ledger 1720ms
     ✓ --flush refused by dev with a fork PR on the ship-failed branch name opens its own PR 2208ms
     ✓ --flush refused by dev onto a leftover ship-failed branch keeps the skip token on the pushed head 12199ms
     ✓ --flush refused by dev does not merge a leftover tip that adds a skill 2071ms
     ✓ --flush refused by dev does not merge a leftover tip that writes .bkit/issues.jsonl 2015ms
     × --flush refused by dev runs the landing gate on a merged leftover tip 2741ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 479ms
       ✓ ship's owner Stop on an open PR: exit 9, push skipped → route stop with the not-pushed line 355ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 777ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 472ms
       ✓ --ref, no push → route stop, no message 307ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 554ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1248ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1440ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1137ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1442ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1221ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1046ms
     ✓ --push on dev never carries a row whose references name another feature 1048ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1062ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 2244ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1194ms
     ✓ --push commits in the named worktree, not the checkout it runs from 524ms
     ✓ rejects --push with --flush, and --flush outside ship 104ms
   ✓ bkit workflows close --flush (ship) (13)
     ✓ preserves newer feature work when closing an already merged PR 1226ms
     ✓ preserves unlanded file deletions and ledger additions on close 2315ms
     ✓ preserves dirty work and uncertain branch evidence during close 2390ms
     ✓ preserves a local feature ref changed after its cleanup proof 2851ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1389ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 886ms
     ✓ a close that landed releases the lock 1038ms
     ✓ removes the worktree before it releases the lock 1094ms
     ✓ close PR (dev refused the push) (4)
       ✓ closePr with base dev still merges 1542ms
       ✓ a second refused close for one FID reuses the open ship-close PR 12256ms
       ✓ a second refused close waits for the reused PR head to reach the pushed tip before merging 2760ms
       ✓ closePr refuses when the PR base is unknown 2278ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1379ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 69ms
     ✓ exits 12 when there is no versioned draft 74ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 86ms
     ✓ stamps the anchor from the runtime-resolved base commit 105ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 130ms
     ✓ promote copies the plan only 82ms
     ✓ rejects a workflow other than design or plan 83ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 143ms
     ✓ names the branch, not the remote-tracking ref, in each URL 135ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 115ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 130ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 318ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 171ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 395ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 200ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 167ms
     ✓ a second run's record does not let this FID's close commit 195ms
     ✓ record is present after workflows close and before the push 392ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 906ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 783ms
       ✓ a run closed by workflow-failed keeps no parked copy 916ms
       ✓ a run closed by workflow-done keeps no parked copy 881ms
       ✓ a FAILED run gets no row 929ms
       ✓ a DONE run gets no row 798ms
     ✓ failed handover from dev removes the record and keeps recorded paths 707ms
   ✓ bkit workflows input (10)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 78ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 79ms
     ✓ a run with no issue holds the prompt alone 87ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 172ms
     ✓ --plan is appended when the file exists and skipped when it does not 103ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 162ms
     ✓ a missing prompt file exits 13 76ms
     ✓ a rebuilt design input keeps the owner-interview record appended after the first build 102ms
     ✓ a grill file that was never appended is appended once, after a blank line 71ms
     ✓ a workflow with no grill file writes exactly the sections 70ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 277ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 259ms
     ✓ puts each --line after the summary, in flag order 230ms
     ✓ refuses --final-return without --summary-file 57ms
     ✓ --summary prints the file and keeps a copy in --outbox 215ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 241ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 120ms
     ✓ a missing summary file exits 13 before anything is written 61ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 87ms
     ✓ a folder outside the outbox sessions folder is kept 80ms
     ✓ without --session-dir prints no sessionRemoved 85ms
   ✓ bkit workflows summary (13)
     ✓ passes publish into the summary input 29ms
     ✓ lists ship-failure rows from a run started before their removal 10ms
     ✓ counts an assumed item in an engine file once 22ms
     ✓ summary is FAIL when a plan task is not done 11ms
     ✓ summary is CONCERNS when a deferral was written 10ms
     ✓ a deferral closed later no longer lowers the verdict, while its history stays on disk 9ms
     ✓ recomputes the verdict from resolved work without rewriting the earlier summary event 9ms
     ✓ prints CONCERNS when a Fix now group's fix task and a test-fix FAIL are both resolved 11ms
     ✓ summary recommends /bkit-debug on FAIL 18ms
     ✓ summary reports the last attempt 9ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 9ms
     ✓ a design summary carries the organised design's open questions 9ms
     ✓ refuses a status file with no run of the workflow, and a missing one 1ms
   ✓ bkit workflows start — the run's progress link (3)
     ✓ start with --session-dir writes the session's link as progress on the workflow-started row 121ms
     ✓ a resumed start with another session keeps the run's first link 170ms
     ✓ start with a session folder that holds no progress id writes the row without progress and records association friction 141ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --flush refused by dev runs the landing gate on a merged leftover tip
AssertionError: expected +0 to be 10 // Object.is equality

- Expected
+ Received

- 10
+ 0

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:3024:20
    3022|     expect(r.code).toBe(10);
    3023|     expect(r.err).toContain(`ship-failed/${FID}`);
    3024|     expect(r.err).toContain("bkit:gate:min");
       |                    ^
    3025|     expect(git(remote, "rev-parse", `ship-failed/${FID}`)).toBe(tip);
    3026|     expect(gh.calls().some((c) => c.startsWith("pr create"))).toBe(fal…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 231 passed (232)
   Start at  07:32:24
   Duration  178.70s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-8ra91u/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
