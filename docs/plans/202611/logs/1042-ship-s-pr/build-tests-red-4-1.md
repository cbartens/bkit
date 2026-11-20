Enforced: true
Red: 3
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202611/1042-ship-s-pr-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 10 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that adds files below a deeper logs folder" | red | failure: expected +0 to be 10 // Object.is equality |
| 10 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that adds a non-log file to the run's log folder" | red | failure: expected +0 to be 10 // Object.is equality |
| 11 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that deletes ledger rows" | red | failure: expected +0 to be 10 // Object.is equality |

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

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (235 tests | 3 failed) 583444ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 560ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 2134ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 474ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 498ms
     ✓ writes no limits for a workflow with no ask point 382ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 404ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 920ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 762ms
       ✓ a new run in the same chat gets its own session row 652ms
       ✓ writes none outside Claude Code 491ms
     ✓ opens the next run after a finished one, and after another workflow's run 524ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 573ms
     ✓ design / plan / build / debug book in the current worktree 786ms
     ✓ refuses when the lock is live, writing no row 398ms
     ✓ --lock-held checks the lock is ours 698ms
     ✓ rejects an unknown workflow 377ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 494ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 685ms
   ✓ bkit workflows start — resume facts (12)
     ✓ a new run has no last step and no open decision 568ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 519ms
     ✓ an OPEN decision of an earlier run never resurfaces 474ms
     ✓ an OPEN decision mid-build prints its header fields 889ms
     ✓ openDecision carries the Gate header 547ms
     ✓ openDecision carries the Source changed header 402ms
     ✓ workflows start reports openDecision for a DECIDED decision file that no build-decision row names 439ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 925ms
     ✓ workflows start does not report openDecision for a DECIDED decision file that a build-decision row names 474ms
     ✓ openDecision gate is null without the header 554ms
     ✓ openDecision gate ignores a Gate line below the header 356ms
     ✓ reads Test attempt from a tests pause 370ms
   ✓ bkit workflows fail (47)
     ✓ writes workflow-failed, releases its lock, and reports no handover 723ms
     ✓ writes no row when status.jsonl does not exist 514ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 480ms
     ✓ aborts a rebase only when one is in progress 2064ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 1211ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1166ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 602ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 668ms
     ✓ --max-exceeded says a handover is due without any sentinel 580ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 449ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 648ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 799ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 490ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 380ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 292ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 906ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 670ms
     ✓ rewrites the error and stderr files with configured secret values redacted and stderr cut to 20 lines 852ms
     ✓ redacts credentials beyond the tracker keys from the error and stderr files 503ms
     ✓ redacts token-shaped values that no environment variable holds from the error and stderr files 833ms
     ✓ redacts refresh_token and id_token values and the ghu_, ghr_, sk_live_, rk_live_, ASIA, AIza and npm_ prefixes 605ms
     ✓ redacts JSON-quoted access_token, refresh_token and id_token values and keeps their keys 643ms
     ✓ keeps npm_ environment names and ASIA- or AKIA-led words that are not token-shaped 601ms
     ✓ scrubs the log folder of a linked worktree that sits outside the main checkout 1014ms
     ✓ redacts a private-key body whose BEGIN or END line is missing from the error and stderr files 491ms
     ✓ skips an error or stderr file outside the run's log folder, names it in refusedFiles, and still records the failure 2633ms
     ✓ skips an error or stderr file that is a symbolic link to a file outside the log folder and leaves that file unchanged 5341ms
     ✓ skips a log-folder file other than {workflow}-error.md and {workflow}-stderr.md, such as status.jsonl 1748ms
     ✓ skips an error file it cannot rewrite, quotes none of it, and still records the failure 1378ms
     ✓ keeps the --error text and says on the Error line that the error file was skipped, and why 911ms
     ✓ skips a stderr file in the log folder that is a hard link to a file outside it, and leaves that file unchanged 1489ms
     ✓ skips an error file in the log folder that is a directory 1467ms
     ✓ skips a stderr file in the log folder that is a FIFO, without waiting on it 1045ms
     ✓ skips a missing error file, still prints the comment and names it in refusedFiles 1487ms
     ✓ skips an error file that is a dangling symbolic link, still prints the comment and names it in refusedFiles 883ms
     ✓ scrubs an AWS key ID followed by more letters, digits or an underscore 634ms
     ✓ redacts the values of credential env vars named KEY, PASS or WEBHOOK from the error and stderr files 515ms
     ✓ redacts the password of a URL with an empty user name from the error and stderr files 515ms
     ✓ redacts a Bearer value in a quoted or JSON Authorization header from the error and stderr files 461ms
     ✓ writes the stderr file with the checkout path made relative and the home directory as ~ 461ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 600ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 454ms
     ✓ bkit workflows fail refuses a multi-line, non-/bkit- or markdown-carrying --next-step before any write 540ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 661ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 393ms
     ✓ bkit workflows fail treats an empty --next-step as absent 1023ms
     ✓ a debug run in SOAK mode always needs a handover 663ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1623ms
       ✓ counts subagents of an earlier chat the run's session rows name 1123ms
       ✓ records no context block, and still closes, outside a Claude Code session 1815ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1573ms
     ✓ records ending held and publish false on the workflow-done row 994ms
     ✓ defaults the close row to ending done 1749ms
     ✓ refuses an unknown ending 669ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1679ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 2321ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1404ms
     ✓ always writes the telemetry, whatever the runtime 1396ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 3350ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 4443ms
     ✓ an unwritable stats path is logged and never fails the close 3217ms
     ✓ appends the completeness row before the workflow-done row 2057ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 2345ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 990ms
     ✓ writes one completeness row per close 3151ms
     ✓ leaves out the previous run's rows that share a second with this run's start 1268ms
     ✓ still closes when the completeness check throws 1453ms
     ✓ still closes when the completeness row write throws 1573ms
     ✓ refuses without status.jsonl and writes nothing 353ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1487ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1989ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 2039ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1144ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1575ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1626ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1866ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 2249ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1824ms
     ✓ --record-step writes the close step's row before workflow-done 1175ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1178ms
     ✓ --number without --outbox is a usage error 955ms
     ✓ --flush is ship only 359ms
   ❯ bkit workflows handover (48)
     ✓ --push commits and pushes the record on the feature branch without a handover 1595ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 2727ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1773ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1847ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1600ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 909ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 706ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 5057ms
     ✓ --flush with nothing to record commits and pushes nothing 2056ms
     ✓ --flush carries the named worktree's logs into the dev commit 4860ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 6540ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 6217ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 4999ms
     ✓ closePr titles the PR by the record it carries 7536ms
     ✓ --flush refused by dev twice for one FID publishes the second record through a PR 24094ms
     ✓ --flush refused by dev with ship-failed left on origin and no PR opens one PR on that branch 9107ms
     ✓ --flush refused by dev with a squash-merged ship-failed tip left on origin lands the new record 9896ms
     ✓ --flush refused by dev does not merge a leftover tip that changes code 7940ms
     ✓ --flush refused by dev with gh pr create failing names the pushed ship-failed branch 5329ms
     ✓ --flush refused by dev links the handover comment at the pushed commit when the PR did not merge 6576ms
     ✓ --flush refused by dev keeps the unmerged handover link readable after the branch is deleted 8186ms
     ✓ --flush refused by dev does not merge a leftover tip that adds a symlinked ledger 7218ms
     ✓ --flush refused by dev with a fork PR on the ship-failed branch name opens its own PR 13849ms
     ✓ --flush refused by dev onto a leftover ship-failed branch keeps the skip token on the pushed head 20636ms
     ✓ --flush refused by dev does not merge a leftover tip that adds a skill 6131ms
     ✓ --flush refused by dev does not merge a leftover tip that writes .bkit/issues.jsonl 7507ms
     ✓ --flush refused by dev runs the landing gate on a merged leftover tip 8180ms
     × --flush refused by dev does not merge a leftover tip that adds files below a deeper logs folder 8314ms
     × --flush refused by dev does not merge a leftover tip that adds a non-log file to the run's log folder 9280ms
     × --flush refused by dev does not merge a leftover tip that deletes ledger rows 7119ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 2226ms
       ✓ ship's owner Stop on an open PR: exit 9, push skipped → route stop with the not-pushed line 1451ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 1759ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 1641ms
       ✓ --ref, no push → route stop, no message 761ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 2073ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 4464ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 6172ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 5233ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 5673ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 5422ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 4550ms
     ✓ --push on dev never carries a row whose references name another feature 5666ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 5871ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 8438ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 5417ms
     ✓ --push commits in the named worktree, not the checkout it runs from 2142ms
     ✓ rejects --push with --flush, and --flush outside ship 278ms
   ✓ bkit workflows close --flush (ship) (13)
     ✓ preserves newer feature work when closing an already merged PR 5652ms
     ✓ preserves unlanded file deletions and ledger additions on close 11472ms
     ✓ preserves dirty work and uncertain branch evidence during close 14180ms
     ✓ preserves a local feature ref changed after its cleanup proof 14113ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 7351ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 4342ms
     ✓ a close that landed releases the lock 5863ms
     ✓ removes the worktree before it releases the lock 6154ms
     ✓ close PR (dev refused the push) (4)
       ✓ closePr with base dev still merges 7552ms
       ✓ a second refused close for one FID reuses the open ship-close PR 19687ms
       ✓ a second refused close waits for the reused PR head to reach the pushed tip before merging 9284ms
       ✓ closePr refuses when the PR base is unknown 6175ms
     ✓ leaves a worktree no workflow created, and its branch, in place 5321ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 794ms
     ✓ exits 12 when there is no versioned draft 448ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 392ms
     ✓ stamps the anchor from the runtime-resolved base commit 690ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 2326ms
     ✓ promote copies the plan only 628ms
     ✓ rejects a workflow other than design or plan 269ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 564ms
     ✓ names the branch, not the remote-tracking ref, in each URL 791ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 540ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 631ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1221ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 789ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 2055ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 1632ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 552ms
     ✓ a second run's record does not let this FID's close commit 555ms
     ✓ record is present after workflows close and before the push 2119ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 5344ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 2887ms
       ✓ a run closed by workflow-failed keeps no parked copy 6912ms
       ✓ a run closed by workflow-done keeps no parked copy 4377ms
       ✓ a FAILED run gets no row 4703ms
       ✓ a DONE run gets no row 4054ms
     ✓ failed handover from dev removes the record and keeps recorded paths 3416ms
   ✓ bkit workflows input (10)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 316ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 715ms
     ✓ a run with no issue holds the prompt alone 530ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 954ms
     ✓ --plan is appended when the file exists and skipped when it does not 677ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 1132ms
     ✓ a missing prompt file exits 13 456ms
     ✓ a rebuilt design input keeps the owner-interview record appended after the first build 493ms
     ✓ a grill file that was never appended is appended once, after a blank line 291ms
     ✓ a workflow with no grill file writes exactly the sections 342ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 1433ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 1207ms
     ✓ puts each --line after the summary, in flag order 1648ms
     ✓ refuses --final-return without --summary-file 347ms
     ✓ --summary prints the file and keeps a copy in --outbox 1205ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 1428ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 488ms
     ✓ a missing summary file exits 13 before anything is written 429ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 528ms
     ✓ a folder outside the outbox sessions folder is kept 367ms
     ✓ without --session-dir prints no sessionRemoved 430ms
   ✓ bkit workflows summary (13)
     ✓ passes publish into the summary input 183ms
     ✓ lists ship-failure rows from a run started before their removal 45ms
     ✓ counts an assumed item in an engine file once 90ms
     ✓ summary is FAIL when a plan task is not done 54ms
     ✓ summary is CONCERNS when a deferral was written 64ms
     ✓ a deferral closed later no longer lowers the verdict, while its history stays on disk 73ms
     ✓ recomputes the verdict from resolved work without rewriting the earlier summary event 44ms
     ✓ prints CONCERNS when a Fix now group's fix task and a test-fix FAIL are both resolved 71ms
     ✓ summary recommends /bkit-debug on FAIL 67ms
     ✓ summary reports the last attempt 68ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 45ms
     ✓ a design summary carries the organised design's open questions 39ms
     ✓ refuses a status file with no run of the workflow, and a missing one 8ms
   ✓ bkit workflows start — the run's progress link (3)
     ✓ start with --session-dir writes the session's link as progress on the workflow-started row 755ms
     ✓ a resumed start with another session keeps the run's first link 1162ms
     ✓ start with a session folder that holds no progress id writes the row without progress and records association friction 532ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --flush refused by dev does not merge a leftover tip that adds files below a deeper logs folder
AssertionError: expected +0 to be 10 // Object.is equality

- Expected
+ Received

- 10
+ 0

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:3044:20
    3042|     expect(r.code).toBe(10);
    3043|     expect(r.err).toContain(`ship-failed/${FID}`);
    3044|     expect(r.err).toContain(`${deeper}/.prettierrc.mjs`);
       |                    ^
    3045|     expect(git(remote, "rev-parse", `ship-failed/${FID}`)).toBe(tip);
    3046|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --flush refused by dev does not merge a leftover tip that adds a non-log file to the run's log folder
AssertionError: expected +0 to be 10 // Object.is equality

- Expected
+ Received

- 10
+ 0

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:3062:20
    3060|     expect(r.code).toBe(10);
    3061|     expect(r.err).toContain(`ship-failed/${FID}`);
    3062|     expect(r.err).toContain(`${REL}/.prettierrc.mjs`);
       |                    ^
    3063|     expect(r.err).toContain(`${REL}/sub/x.test.ts`);
    3064|     expect(git(remote, "rev-parse", `ship-failed/${FID}`)).toBe(tip);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --flush refused by dev does not merge a leftover tip that deletes ledger rows
AssertionError: expected +0 to be 10 // Object.is equality

- Expected
+ Received

- 10
+ 0

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:3095:20
    3093|     expect(r.code).toBe(10);
    3094|     expect(r.err).toContain(`ship-failed/${FID}`);
    3095|     expect(r.err).toContain("docs/decisions.jsonl");
       |                    ^
    3096|     expect(r.err).toContain("docs/knowledge.jsonl");
    3097|     expect(git(remote, "rev-parse", `ship-failed/${FID}`)).toBe(tip);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 232 passed (235)
   Start at  10:40:02
   Duration  585.01s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-ZoBWEP/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
