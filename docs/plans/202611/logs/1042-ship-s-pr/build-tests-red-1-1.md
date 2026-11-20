Enforced: true
Red: 8
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/1042-ship-s-pr-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev twice for one FID publishes the second record through a PR" | red | failure: [bkit-workflows] git hooks skipped in the throwaway dev checkout — its declared minimum or full gate runs explicitly [bkit-workflows] installing frozen dependencies in the throwaway dev checkout [bkit-workflows] running pnpm bkit:gate:min [bkit-workflows] dev refused the ship FAILED push — publishing it through a PR: remote: dev is protected To /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-ZBFx4o ! [remote rejected] HEAD -> dev (pre-receive hook declined) error: failed to push some refs to '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-ZBFx4o' [bkit-workflows] dev refused the push: remote: dev is protected To /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-ZBFx4o ! [remote rejected] HEAD -> dev (pre-receive hook declined) error: failed to push some refs to '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-ZBFx4o'; the PR path failed too: close branch push failed for ship-failed/12-export-csv — ship FAILED record kept in /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-DI0TpE/.worktrees/12-export-csv — the next ship of 12-export-csv carries it : expected 10 to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev with ship-failed left on origin and no PR opens one PR on that branch" | red | failure: [bkit-workflows] git hooks skipped in the throwaway dev checkout — its declared minimum or full gate runs explicitly [bkit-workflows] installing frozen dependencies in the throwaway dev checkout [bkit-workflows] running pnpm bkit:gate:min [bkit-workflows] dev refused the ship FAILED push — publishing it through a PR: remote: dev is protected To /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-pGvFLW ! [remote rejected] HEAD -> dev (pre-receive hook declined) error: failed to push some refs to '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-pGvFLW' [bkit-workflows] dev refused the push: remote: dev is protected To /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-pGvFLW ! [remote rejected] HEAD -> dev (pre-receive hook declined) error: failed to push some refs to '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-pGvFLW'; the PR path failed too: close branch push failed for ship-failed/12-export-csv — ship FAILED record kept in /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-BcteeF/.worktrees/12-export-csv — the next ship of 12-export-csv carries it : expected 10 to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev with a squash-merged ship-failed tip left on origin lands the new record" | red | failure: [bkit-workflows] git hooks skipped in the throwaway dev checkout — its declared minimum or full gate runs explicitly [bkit-workflows] installing frozen dependencies in the throwaway dev checkout [bkit-workflows] running pnpm bkit:gate:min [bkit-workflows] dev refused the ship FAILED push — publishing it through a PR: remote: dev is protected To /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-FTBZcE ! [remote rejected] HEAD -> dev (pre-receive hook declined) error: failed to push some refs to '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-FTBZcE' [bkit-workflows] dev refused the push: remote: dev is protected To /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-FTBZcE ! [remote rejected] HEAD -> dev (pre-receive hook declined) error: failed to push some refs to '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-FTBZcE'; the PR path failed too: close branch push failed for ship-failed/12-export-csv — ship FAILED record kept in /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-A0ajOZ/.worktrees/12-export-csv — the next ship of 12-export-csv carries it : expected 10 to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that changes code" | red | failure: expected +0 to be 10 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "a second refused close for one FID reuses the open ship-close PR" | red | failure: [bkit-workflows] [bkit-comply] All rules pass. [bkit-workflows] [bkit-telemetry] journal looks dead at close: no engine-call rows for this run; the completeness verdict cannot be trusted [bkit-workflows] git hooks skipped in the throwaway dev checkout — its declared minimum or full gate runs explicitly [bkit-workflows] installing frozen dependencies in the throwaway dev checkout [bkit-workflows] running pnpm bkit:gate:min [bkit-workflows] dev refused the close push — publishing it through a PR: remote: dev is protected To /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-AVlf1Z ! [remote rejected] HEAD -> dev (pre-receive hook declined) error: failed to push some refs to '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-AVlf1Z' [bkit-workflows] close branch push failed for ship-close/12-export-csv — close bookkeeping kept in /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-i4ZnJq/.worktrees/12-export-csv : expected 11 to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev with gh pr create failing names the pushed ship-failed branch" | red | failure: expected '[bkit-workflows] git hooks skipped in…' to contain 'pr create failed for ship-failed/12-e…' |
| 2 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev links the handover comment at the pushed commit when the PR did not merge" | red | failure: expected '###### bkit:generated 53b72b3b096c\n#…' to contain '/blob/1cd73eef28248ad6f87c64ec07cd1ad…' |
| 2 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev keeps the unmerged handover link readable after the branch is deleted" | red | failure: expected undefined to be defined |

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

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (225 tests | 8 failed) 69928ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 144ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 586ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 101ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 83ms
     ✓ writes no limits for a workflow with no ask point 97ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 95ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 122ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 159ms
       ✓ a new run in the same chat gets its own session row 115ms
       ✓ writes none outside Claude Code 88ms
     ✓ opens the next run after a finished one, and after another workflow's run 99ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 111ms
     ✓ design / plan / build / debug book in the current worktree 102ms
     ✓ refuses when the lock is live, writing no row 81ms
     ✓ --lock-held checks the lock is ours 108ms
     ✓ rejects an unknown workflow 51ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 98ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 147ms
   ✓ bkit workflows start — resume facts (12)
     ✓ a new run has no last step and no open decision 72ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 79ms
     ✓ an OPEN decision of an earlier run never resurfaces 92ms
     ✓ an OPEN decision mid-build prints its header fields 76ms
     ✓ openDecision carries the Gate header 77ms
     ✓ openDecision carries the Source changed header 87ms
     ✓ workflows start reports openDecision for a DECIDED decision file that no build-decision row names 74ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 167ms
     ✓ workflows start does not report openDecision for a DECIDED decision file that a build-decision row names 70ms
     ✓ openDecision gate is null without the header 75ms
     ✓ openDecision gate ignores a Gate line below the header 69ms
     ✓ reads Test attempt from a tests pause 67ms
   ✓ bkit workflows fail (47)
     ✓ writes workflow-failed, releases its lock, and reports no handover 131ms
     ✓ writes no row when status.jsonl does not exist 114ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 102ms
     ✓ aborts a rebase only when one is in progress 220ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 182ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 189ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 120ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 120ms
     ✓ --max-exceeded says a handover is due without any sentinel 104ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 82ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 157ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 145ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 69ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 69ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 70ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 59ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 66ms
     ✓ rewrites the error and stderr files with configured secret values redacted and stderr cut to 20 lines 99ms
     ✓ redacts credentials beyond the tracker keys from the error and stderr files 96ms
     ✓ redacts token-shaped values that no environment variable holds from the error and stderr files 98ms
     ✓ redacts refresh_token and id_token values and the ghu_, ghr_, sk_live_, rk_live_, ASIA, AIza and npm_ prefixes 103ms
     ✓ redacts JSON-quoted access_token, refresh_token and id_token values and keeps their keys 121ms
     ✓ keeps npm_ environment names and ASIA- or AKIA-led words that are not token-shaped 86ms
     ✓ scrubs the log folder of a linked worktree that sits outside the main checkout 110ms
     ✓ redacts a private-key body whose BEGIN or END line is missing from the error and stderr files 102ms
     ✓ skips an error or stderr file outside the run's log folder, names it in refusedFiles, and still records the failure 307ms
     ✓ skips an error or stderr file that is a symbolic link to a file outside the log folder and leaves that file unchanged 350ms
     ✓ skips a log-folder file other than {workflow}-error.md and {workflow}-stderr.md, such as status.jsonl 166ms
     ✓ skips an error file it cannot rewrite, quotes none of it, and still records the failure 140ms
     ✓ keeps the --error text and says on the Error line that the error file was skipped, and why 138ms
     ✓ skips a stderr file in the log folder that is a hard link to a file outside it, and leaves that file unchanged 142ms
     ✓ skips an error file in the log folder that is a directory 141ms
     ✓ skips a stderr file in the log folder that is a FIFO, without waiting on it 149ms
     ✓ skips a missing error file, still prints the comment and names it in refusedFiles 153ms
     ✓ skips an error file that is a dangling symbolic link, still prints the comment and names it in refusedFiles 168ms
     ✓ scrubs an AWS key ID followed by more letters, digits or an underscore 97ms
     ✓ redacts the values of credential env vars named KEY, PASS or WEBHOOK from the error and stderr files 100ms
     ✓ redacts the password of a URL with an empty user name from the error and stderr files 99ms
     ✓ redacts a Bearer value in a quoted or JSON Authorization header from the error and stderr files 97ms
     ✓ writes the stderr file with the checkout path made relative and the home directory as ~ 84ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 93ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 84ms
     ✓ bkit workflows fail refuses a multi-line, non-/bkit- or markdown-carrying --next-step before any write 71ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 129ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 78ms
     ✓ bkit workflows fail treats an empty --next-step as absent 83ms
     ✓ a debug run in SOAK mode always needs a handover 109ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 217ms
       ✓ counts subagents of an earlier chat the run's session rows name 211ms
       ✓ records no context block, and still closes, outside a Claude Code session 220ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 226ms
     ✓ records ending held and publish false on the workflow-done row 214ms
     ✓ defaults the close row to ending done 226ms
     ✓ refuses an unknown ending 98ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 286ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 308ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 230ms
     ✓ always writes the telemetry, whatever the runtime 185ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 152ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 183ms
     ✓ an unwritable stats path is logged and never fails the close 183ms
     ✓ appends the completeness row before the workflow-done row 219ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 203ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 210ms
     ✓ writes one completeness row per close 332ms
     ✓ leaves out the previous run's rows that share a second with this run's start 211ms
     ✓ still closes when the completeness check throws 205ms
     ✓ still closes when the completeness row write throws 211ms
     ✓ refuses without status.jsonl and writes nothing 64ms
     ✓ ship: run.pr, size of the squash commit, and coverage 231ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 318ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 204ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 188ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 285ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 314ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 297ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 282ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 280ms
     ✓ --record-step writes the close step's row before workflow-done 194ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 217ms
     ✓ --number without --outbox is a usage error 216ms
     ✓ --flush is ship only 86ms
   ❯ bkit workflows handover (39)
     ✓ --push commits and pushes the record on the feature branch without a handover 344ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 280ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 363ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 465ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 254ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 117ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 101ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 732ms
     ✓ --flush with nothing to record commits and pushes nothing 363ms
     ✓ --flush carries the named worktree's logs into the dev commit 718ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 972ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 1262ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 1275ms
     ✓ closePr titles the PR by the record it carries 1219ms
     × --flush refused by dev twice for one FID publishes the second record through a PR 1718ms
     × --flush refused by dev with ship-failed left on origin and no PR opens one PR on that branch 971ms
     × --flush refused by dev with a squash-merged ship-failed tip left on origin lands the new record 1116ms
     × --flush refused by dev does not merge a leftover tip that changes code 500ms
     × --flush refused by dev with gh pr create failing names the pushed ship-failed branch 1237ms
     × --flush refused by dev links the handover comment at the pushed commit when the PR did not merge 1334ms
     × --flush refused by dev keeps the unmerged handover link readable after the branch is deleted 1307ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 282ms
       ✓ ship's owner Stop on an open PR: exit 9, push skipped → route stop with the not-pushed line 200ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 452ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 267ms
       ✓ --ref, no push → route stop, no message 159ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 350ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 714ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 926ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 721ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 896ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 887ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 778ms
     ✓ --push on dev never carries a row whose references name another feature 734ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 711ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 1307ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 848ms
     ✓ --push commits in the named worktree, not the checkout it runs from 356ms
     ✓ rejects --push with --flush, and --flush outside ship 64ms
   ❯ bkit workflows close --flush (ship) (12)
     ✓ preserves newer feature work when closing an already merged PR 930ms
     ✓ preserves unlanded file deletions and ledger additions on close 1723ms
     ✓ preserves dirty work and uncertain branch evidence during close 1730ms
     ✓ preserves a local feature ref changed after its cleanup proof 1758ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 857ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 690ms
     ✓ a close that landed releases the lock 872ms
     ✓ removes the worktree before it releases the lock 1217ms
     ❯ close PR (dev refused the push) (3)
       ✓ closePr with base dev still merges 1511ms
       × a second refused close for one FID reuses the open ship-close PR 1042ms
       ✓ closePr refuses when the PR base is unknown 1311ms
     ✓ leaves a worktree no workflow created, and its branch, in place 743ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 62ms
     ✓ exits 12 when there is no versioned draft 86ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 83ms
     ✓ stamps the anchor from the runtime-resolved base commit 79ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 97ms
     ✓ promote copies the plan only 70ms
     ✓ rejects a workflow other than design or plan 53ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 111ms
     ✓ names the branch, not the remote-tracking ref, in each URL 108ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 102ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 106ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 267ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 140ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 389ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 167ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 154ms
     ✓ a second run's record does not let this FID's close commit 200ms
     ✓ record is present after workflows close and before the push 369ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 837ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 810ms
       ✓ a run closed by workflow-failed keeps no parked copy 871ms
       ✓ a run closed by workflow-done keeps no parked copy 803ms
       ✓ a FAILED run gets no row 809ms
       ✓ a DONE run gets no row 802ms
     ✓ failed handover from dev removes the record and keeps recorded paths 714ms
   ✓ bkit workflows input (10)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 76ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 74ms
     ✓ a run with no issue holds the prompt alone 80ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 190ms
     ✓ --plan is appended when the file exists and skipped when it does not 102ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 163ms
     ✓ a missing prompt file exits 13 75ms
     ✓ a rebuilt design input keeps the owner-interview record appended after the first build 101ms
     ✓ a grill file that was never appended is appended once, after a blank line 79ms
     ✓ a workflow with no grill file writes exactly the sections 76ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 287ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 211ms
     ✓ puts each --line after the summary, in flag order 239ms
     ✓ refuses --final-return without --summary-file 64ms
     ✓ --summary prints the file and keeps a copy in --outbox 214ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 219ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 57ms
     ✓ a missing summary file exits 13 before anything is written 65ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 86ms
     ✓ a folder outside the outbox sessions folder is kept 82ms
     ✓ without --session-dir prints no sessionRemoved 80ms
   ✓ bkit workflows summary (13)
     ✓ passes publish into the summary input 27ms
     ✓ lists ship-failure rows from a run started before their removal 8ms
     ✓ counts an assumed item in an engine file once 18ms
     ✓ summary is FAIL when a plan task is not done 8ms
     ✓ summary is CONCERNS when a deferral was written 7ms
     ✓ a deferral closed later no longer lowers the verdict, while its history stays on disk 8ms
     ✓ recomputes the verdict from resolved work without rewriting the earlier summary event 7ms
     ✓ prints CONCERNS when a Fix now group's fix task and a test-fix FAIL are both resolved 8ms
     ✓ summary recommends /bkit-debug on FAIL 14ms
     ✓ summary reports the last attempt 7ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 7ms
     ✓ a design summary carries the organised design's open questions 7ms
     ✓ refuses a status file with no run of the workflow, and a missing one 1ms
   ✓ bkit workflows start — the run's progress link (3)
     ✓ start with --session-dir writes the session's link as progress on the workflow-started row 90ms
     ✓ a resumed start with another session keeps the run's first link 117ms
     ✓ start with a session folder that holds no progress id writes the row without progress and records association friction 109ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 8 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --flush refused by dev twice for one FID publishes the second record through a PR
AssertionError: [bkit-workflows] git hooks skipped in the throwaway dev checkout — its declared minimum or full gate runs explicitly
[bkit-workflows] installing frozen dependencies in the throwaway dev checkout
[bkit-workflows] running pnpm bkit:gate:min
[bkit-workflows] dev refused the ship FAILED push — publishing it through a PR: remote: dev is protected        
To /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-ZBFx4o
 ! [remote rejected] HEAD -> dev (pre-receive hook declined)
error: failed to push some refs to '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-ZBFx4o'
[bkit-workflows] dev refused the push: remote: dev is protected        
To /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-ZBFx4o
 ! [remote rejected] HEAD -> dev (pre-receive hook declined)
error: failed to push some refs to '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-ZBFx4o'; the PR path failed too: close branch push failed for ship-failed/12-export-csv — ship FAILED record kept in /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-DI0TpE/.worktrees/12-export-csv — the next ship of 12-export-csv carries it
: expected 10 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 10

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:2778:37
    2776|     expect(second.code, second.err).toBe(0);
    2777|     expect(second.json).toMatchObject({ pushed: true, ref: `ship-faile…
    2778|     const tip = git(remote, "rev-parse", `ship-failed/${FID}`);
       |                                     ^
    2779|     expect(tip).not.toBe(firstTip);
    2780|     expect(isAncestor(remote, firstTip, tip)).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --flush refused by dev with ship-failed left on origin and no PR opens one PR on that branch
AssertionError: [bkit-workflows] git hooks skipped in the throwaway dev checkout — its declared minimum or full gate runs explicitly
[bkit-workflows] installing frozen dependencies in the throwaway dev checkout
[bkit-workflows] running pnpm bkit:gate:min
[bkit-workflows] dev refused the ship FAILED push — publishing it through a PR: remote: dev is protected        
To /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-pGvFLW
 ! [remote rejected] HEAD -> dev (pre-receive hook declined)
error: failed to push some refs to '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-pGvFLW'
[bkit-workflows] dev refused the push: remote: dev is protected        
To /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-pGvFLW
 ! [remote rejected] HEAD -> dev (pre-receive hook declined)
error: failed to push some refs to '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-pGvFLW'; the PR path failed too: close branch push failed for ship-failed/12-export-csv — ship FAILED record kept in /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-BcteeF/.worktrees/12-export-csv — the next ship of 12-export-csv carries it
: expected 10 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 10

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:2799:27
    2797|     expect(r.code, r.err).toBe(0);
    2798|     const create = gh.calls().filter((c) => c.startsWith("pr create"));
    2799|     expect(create).toHaveLength(1);
       |                           ^
    2800|     expect(create[0]).toContain(`--head ship-failed/${FID}`);
    2801|     expect(git(remote, "show", `ship-failed/${FID}:${REL}/ship-earlier…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --flush refused by dev with a squash-merged ship-failed tip left on origin lands the new record
AssertionError: [bkit-workflows] git hooks skipped in the throwaway dev checkout — its declared minimum or full gate runs explicitly
[bkit-workflows] installing frozen dependencies in the throwaway dev checkout
[bkit-workflows] running pnpm bkit:gate:min
[bkit-workflows] dev refused the ship FAILED push — publishing it through a PR: remote: dev is protected        
To /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-FTBZcE
 ! [remote rejected] HEAD -> dev (pre-receive hook declined)
error: failed to push some refs to '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-FTBZcE'
[bkit-workflows] dev refused the push: remote: dev is protected        
To /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-FTBZcE
 ! [remote rejected] HEAD -> dev (pre-receive hook declined)
error: failed to push some refs to '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-FTBZcE'; the PR path failed too: close branch push failed for ship-failed/12-export-csv — ship FAILED record kept in /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-A0ajOZ/.worktrees/12-export-csv — the next ship of 12-export-csv carries it
: expected 10 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 10

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:2832:27
    2830|     expect(r.code, r.err).toBe(0);
    2831|     const diff = git(remote, "diff", "dev", `ship-failed/${FID}`, "--n…
    2832|     expect(diff).toContain(`${REL}/status.jsonl`);
       |                           ^
    2833|     expect(diff).not.toContain(`${REL}/ship-earlier.md`);
    2834|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --flush refused by dev does not merge a leftover tip that changes code
AssertionError: expected +0 to be 10 // Object.is equality

- Expected
+ Received

- 10
+ 0

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:2845:20
    2843|     expect(r.code).toBe(10);
    2844|     expect(r.err).toContain(`ship-failed/${FID}`);
    2845|     expect(r.err).toContain("src/app.ts");
       |                    ^
    2846|     expect(git(remote, "rev-parse", `ship-failed/${FID}`)).toBe(tip);
    2847|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --flush refused by dev with gh pr create failing names the pushed ship-failed branch
AssertionError: expected '[bkit-workflows] git hooks skipped in…' to contain 'pr create failed for ship-failed/12-e…'

- Expected
+ Received

- pr create failed for ship-failed/12-export-csv
+ [bkit-workflows] git hooks skipped in the throwaway dev checkout — its declared minimum or full gate runs explicitly
+ [bkit-workflows] installing frozen dependencies in the throwaway dev checkout
+ [bkit-workflows] running pnpm bkit:gate:min
+ [bkit-workflows] dev refused the ship FAILED push — publishing it through a PR: remote: dev is protected        
+ To /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-dXFSSv
+  ! [remote rejected] HEAD -> dev (pre-receive hook declined)
+ error: failed to push some refs to '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-dXFSSv'
+ [bkit-workflows] dev refused the push: remote: dev is protected        
+ To /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-dXFSSv
+  ! [remote rejected] HEAD -> dev (pre-receive hook declined)
+ error: failed to push some refs to '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-dXFSSv'; the PR path failed too: gh pr create failed:  — ship FAILED record kept in /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-KxrLbR/.worktrees/12-export-csv — the next ship of 12-export-csv carries it
+

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:2857:19
    2856|   });
    2857|
    2858|   it("--flush refused by dev links the handover comment at the pushed …
       |                  ^
    2859|     const { remote, wt } = devOnlyRefused();
    2860|     write(wt, `${REL}/ship-handover.md`, "# Handover\n");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --flush refused by dev links the handover comment at the pushed commit when the PR did not merge
AssertionError: expected '###### bkit:generated 53b72b3b096c\n#…' to contain '/blob/1cd73eef28248ad6f87c64ec07cd1ad…'

- Expected
+ Received

- /blob/1cd73eef28248ad6f87c64ec07cd1adc4f9ed2f1/
+ ###### bkit:generated 53b72b3b096c
+ ### Workflow Handover
+ [ship-handover.md](https://github.com/o/r/blob/ship-failed/12-export-csv/docs/plans/202607/logs/12-export-csv/ship-handover.md)
+ # Handover

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:2867:28
    2867|   });
    2868|
    2869|   it("--flush refused by dev keeps the unmerged handover link readable…
       |                     ^
    2870|     const { remote, wt } = devOnlyRefused();
    2871|     write(wt, `${REL}/ship-handover.md`, "# Handover\n");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --flush refused by dev keeps the unmerged handover link readable after the branch is deleted
AssertionError: expected undefined to be defined
 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:2877:17
    2875|     expect(sha).toBeDefined();
    2876|     git(remote, "update-ref", "-d", `refs/heads/ship-failed/${FID}`);
    2877|     const read = spawnSync("git", ["cat-file", "-e", `${sha}:${REL}/sh…
       |                 ^
    2878|       cwd: remote,
    2879|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close --flush (ship) > close PR (dev refused the push) > a second refused close for one FID reuses the open ship-close PR
AssertionError: [bkit-workflows] [bkit-comply] All rules pass.
[bkit-workflows] [bkit-telemetry] journal looks dead at close: no engine-call rows for this run; the completeness verdict cannot be trusted
[bkit-workflows] git hooks skipped in the throwaway dev checkout — its declared minimum or full gate runs explicitly
[bkit-workflows] installing frozen dependencies in the throwaway dev checkout
[bkit-workflows] running pnpm bkit:gate:min
[bkit-workflows] dev refused the close push — publishing it through a PR: remote: dev is protected        
To /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-AVlf1Z
 ! [remote rejected] HEAD -> dev (pre-receive hook declined)
error: failed to push some refs to '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-remote-AVlf1Z'
[bkit-workflows] close branch push failed for ship-close/12-export-csv — close bookkeeping kept in /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-i4ZnJq/.worktrees/12-export-csv
: expected 11 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 11

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:3482:29
    3480|       expect(r.code, r.err).toBe(0);
    3481|       expect(r.json.landed).toMatchObject({ ref: `ship-close/${FID}` }…
    3482|       expect(calls().filter((c) => c.startsWith("pr create"))).toEqual…
       |                             ^
    3483|       const tip = git(remote, "rev-parse", `ship-close/${FID}`);
    3484|       expect(calls().find((c) => c.startsWith("pr merge"))).toContain(…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/8]⎯


 Test Files  1 failed (1)
      Tests  8 failed | 217 passed (225)
   Start at  04:58:22
   Duration  70.31s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-nlI6a9/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
