> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/workflows.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

stderr | .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close > an unwritable stats path is logged and never fails the close
[bkit-comply] append failed: /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-IV3aDm/.bkit/stats.jsonl — ENOTDIR: not a directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-IV3aDm/.bkit/stats.jsonl'

❯ .bkit/core/engine/commands/workflow/workflows.test.ts (75 tests | 1 failed) 13593ms
✓ bkit workflows start (8)
✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 68ms
✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 55ms
✓ opens the next run after a finished one, and after another workflow's run 60ms
✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 77ms
✓ design / plan / build / debug book in the current worktree 78ms
✓ refuses when the lock is live, writing no row 53ms
✓ --lock-held checks the lock is ours 79ms
✓ rejects an unknown workflow 42ms
✓ bkit workflows fail (18)
✓ writes workflow-failed, releases its lock, and reports no handover 95ms
✓ writes no row when status.jsonl does not exist 64ms
✓ leaves a lock it never got in place (the Step 1 refusal path) 67ms
✓ aborts a rebase only when one is in progress 150ms
✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 140ms
✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 80ms
✓ clears ship's .deferred-blocked in the worktree being shipped 84ms
✓ --max-exceeded says a handover is due without any sentinel 67ms
✓ without --token changes nothing: the failure came before Step 1 locked 62ms
✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 84ms
✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 91ms
✓ a failed issue under {"issueTracker":"linear"} moves to review status "In Review" 45ms
✓ a failed issue under {"issueTracker":"linear","linear":{"review":"Code Review"}} moves to review status "Code Review" 46ms
✓ a failed issue under {"issueTracker":"jira"} moves to review status "In Review" 60ms
✓ a failed issue under {"issueTracker":"jira","jira":{"review":"QA"}} moves to review status "QA" 46ms
✓ a failed issue under {"issueTracker":"github"} moves to review status null 45ms
✓ prints the failure comment from --error-file, naming a lock it could not remove 51ms
✓ a debug run in SOAK mode always needs a handover 66ms
✓ bkit workflows close (11)
✓ writes workflow-done and schema-valid counter + outcome rows 128ms
✓ carries planSource from this run's workflow-meta, counts plan tasks and ledger totals 118ms
✓ always writes the telemetry, whatever the runtime 120ms
✓ with no workflow-started row: duration 0, per-run counts omitted, attempt 1 99ms
✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 122ms
✓ an unwritable stats path is logged and never fails the close 120ms
✓ refuses without status.jsonl and writes nothing 49ms
✓ ship: prNumber, size of the squash commit, and coverage 145ms
✓ lists the feature's docs and this workflow's logs on the ref as links 184ms
✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 123ms
✓ absent ledgers still give a schema-valid row with zero per-run counts 118ms
✓ bkit workflows close — commit, outbox, comment (7)
✓ --message commits everything, and bkit:auto appends the auto-route marker 154ms
✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 142ms
✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 139ms
✓ --record-step writes the close step's row before workflow-done 112ms
✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 113ms
✓ --number without --outbox is a usage error 110ms
✓ --flush is ship only 61ms
✓ bkit workflows handover (16)
✓ --push commits and pushes the record on the feature branch without a handover 188ms
✓ --push commits the aborted subject, pushes, and links the handover in the comment 189ms
✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 140ms
✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 353ms
✓ --flush with nothing to record commits and pushes nothing 267ms
✓ --flush carries the named worktree's logs into the dev commit 334ms
✓ --flush refused by dev keeps the record in the book and exits 10 706ms
✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 407ms
✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 485ms
✓ --push on dev keeps a staged ledger in the checkout and names it 367ms
✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 452ms
✓ --push on dev with no start row carries no shared-ledger row, and says so 342ms
✓ a second --push on dev lands the run's rewritten log, not only new files 598ms
✓ --push on dev refused keeps the record in the checkout and exits 10 474ms
✓ --push commits in the named worktree, not the checkout it runs from 235ms
✓ rejects --push with --flush, and --flush outside ship 47ms
❯ bkit workflows close --flush (ship) (6)
✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 415ms
✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 303ms
✓ a close that landed releases the lock 398ms
❯ close PR (dev refused the push) (2)
✓ closePr with base dev still merges 1015ms
× closePr refuses when the PR base is unknown 1015ms
✓ leaves a worktree no workflow created, and its branch, in place 345ms
✓ bkit workflows promote (7)
✓ --resolve prints the highest versioned draft and copies nothing 44ms
✓ exits 12 when there is no versioned draft 44ms
✓ archives a changed canonical, then writes the highest draft as the canonical 46ms
✓ stamps the anchor from the runtime-resolved base commit 56ms
✓ stamps the bkit release, and the outdated warning when a newer one is out 67ms
✓ plan: copies the split's children as canonical sub-plans and renames working names 45ms
✓ rejects a workflow other than design or plan 41ms
✓ bkit workflows links (2)
✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 79ms
✓ names the branch, not the remote-tracking ref, in each URL 83ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close --flush (ship) > close PR (dev refused the push) > closePr refuses when the PR base is unknown
AssertionError: expected { …(2) } to deeply equal { …(2) }

- Expected

* Received

  {
  "ref": "ship-close/12-export-csv",

- "via": "close-pr-open",

* "via": "close-pr",
  }

❯ .bkit/core/engine/commands/workflow/workflows.test.ts:1155:29
1153| const r = await withGh(bin, () => run(wt, close));
1154| expect(r.code).toBe(0);
1155| expect(r.json.landed).toEqual({ ref: `ship-close/${FID}`, via: "…
| ^
1156| expect(r.err).toContain("not merged");
1157| expect(calls().filter((c) => c.startsWith("pr merge"))).toEqual(…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

Test Files 1 failed (1)
Tests 1 failed | 74 passed (75)
Start at 13:05:13
Duration 13.84s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-9JVQhj/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
