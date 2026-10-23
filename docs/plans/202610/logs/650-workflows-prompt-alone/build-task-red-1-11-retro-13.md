> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/workflows.test.ts

[test-timeout-budget] load average 11.6 on 10 cores: unit limits 5791ms per test, 11581ms per hook (x1.16)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

stderr | .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close > an unwritable stats path is logged and never fails the close
[bkit-comply] append failed: /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-U38lEO/.bkit/stats.jsonl — ENOTDIR: not a directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-U38lEO/.bkit/stats.jsonl'

❯ .bkit/core/engine/commands/workflow/workflows.test.ts (79 tests | 8 failed) 25048ms
✓ bkit workflows start (8)
✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 76ms
✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 63ms
✓ opens the next run after a finished one, and after another workflow's run 80ms
✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 106ms
✓ design / plan / build / debug book in the current worktree 103ms
✓ refuses when the lock is live, writing no row 73ms
✓ --lock-held checks the lock is ours 101ms
✓ rejects an unknown workflow 51ms
✓ bkit workflows fail (18)
✓ writes workflow-failed, releases its lock, and reports no handover 102ms
✓ writes no row when status.jsonl does not exist 74ms
✓ leaves a lock it never got in place (the Step 1 refusal path) 76ms
✓ aborts a rebase only when one is in progress 168ms
✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 156ms
✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 89ms
✓ clears ship's .deferred-blocked in the worktree being shipped 92ms
✓ --max-exceeded says a handover is due without any sentinel 73ms
✓ without --token changes nothing: the failure came before Step 1 locked 64ms
✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 94ms
✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 101ms
✓ a failed issue under {"issueTracker":"linear"} moves to review status "In Review" 49ms
✓ a failed issue under {"issueTracker":"linear","linear":{"review":"Code Review"}} moves to review status "Code Review" 56ms
✓ a failed issue under {"issueTracker":"jira"} moves to review status "In Review" 53ms
✓ a failed issue under {"issueTracker":"jira","jira":{"review":"QA"}} moves to review status "QA" 56ms
✓ a failed issue under {"issueTracker":"github"} moves to review status null 57ms
✓ prints the failure comment from --error-file, naming a lock it could not remove 68ms
✓ a debug run in SOAK mode always needs a handover 93ms
✓ bkit workflows close (11)
✓ writes workflow-done and schema-valid counter + outcome rows 194ms
✓ carries planSource from this run's workflow-meta, counts plan tasks and ledger totals 198ms
✓ always writes the telemetry, whatever the runtime 186ms
✓ with no workflow-started row: duration 0, per-run counts omitted, attempt 1 165ms
✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 189ms
✓ an unwritable stats path is logged and never fails the close 178ms
✓ refuses without status.jsonl and writes nothing 74ms
✓ ship: prNumber, size of the squash commit, and coverage 220ms
✓ lists the feature's docs and this workflow's logs on the ref as links 281ms
✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 173ms
✓ absent ledgers still give a schema-valid row with zero per-run counts 184ms
❯ bkit workflows close — commit, outbox, comment (10)
✓ --message commits everything, and bkit:auto appends the auto-route marker 272ms
✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 255ms
✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 234ms
✓ --record-step writes the close step's row before workflow-done 188ms
✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 184ms
❯ in place on dev with a shared-checkout record (3)
× close with a shared-checkout record never commits a recorded path 115ms
× record is present after workflows close and before the push 100ms
× close refuses with exit 10 when a recorded path changed 100ms
✓ --number without --outbox is a usage error 165ms
✓ --flush is ship only 93ms
❯ bkit workflows handover (17)
× --push commits and pushes the record on the feature branch without a handover 303ms
× --push commits the aborted subject, pushes, and links the handover in the comment 268ms
× --push keeps the remote head when the branch has an open PR (exit 9, no link) 182ms
✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 595ms
✓ --flush with nothing to record commits and pushes nothing 520ms
✓ --flush carries the named worktree's logs into the dev commit 729ms
✓ --flush refused by dev keeps the record in the book and exits 10 937ms
✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 892ms
× failed handover from dev removes the record and keeps recorded paths 404ms
✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1319ms
✓ --push on dev keeps a staged ledger in the checkout and names it 1012ms
✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1105ms
✓ --push on dev with no start row carries no shared-ledger row, and says so 750ms
✓ a second --push on dev lands the run's rewritten log, not only new files 1346ms
✓ --push on dev refused keeps the record in the checkout and exits 10 865ms
× --push commits in the named worktree, not the checkout it runs from 523ms
✓ rejects --push with --flush, and --flush outside ship 107ms
✓ bkit workflows close --flush (ship) (6)
✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 894ms
✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 668ms
✓ a close that landed releases the lock 890ms
✓ close PR (dev refused the push) (2)
✓ closePr with base dev still merges 1555ms
✓ closePr refuses when the PR base is unknown 1369ms
✓ leaves a worktree no workflow created, and its branch, in place 819ms
✓ bkit workflows promote (7)
✓ --resolve prints the highest versioned draft and copies nothing 97ms
✓ exits 12 when there is no versioned draft 99ms
✓ archives a changed canonical, then writes the highest draft as the canonical 100ms
✓ stamps the anchor from the runtime-resolved base commit 122ms
✓ stamps the bkit release, and the outdated warning when a newer one is out 155ms
✓ plan: copies the split's children as canonical sub-plans and renames working names 93ms
✓ rejects a workflow other than design or plan 82ms
✓ bkit workflows links (2)
✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 168ms
✓ names the branch, not the remote-tracking ref, in each URL 158ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 8 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close — commit, outbox, comment > in place on dev with a shared-checkout record > close with a shared-checkout record never commits a recorded path
TypeError: newRecord is not a function
❯ recorded .bkit/core/engine/commands/workflow/workflows.test.ts:737:24
735| write(cwd, "staged.txt", "foreign staged\n");
736| git(cwd, "add", "staged.txt");
737| writeRecord(cwd, newRecord(cwd, FID, "dev"));
| ^
738| return cwd;
739| }
❯ .bkit/core/engine/commands/workflow/workflows.test.ts:742:19

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯

FAIL .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close — commit, outbox, comment > in place on dev with a shared-checkout record > record is present after workflows close and before the push
TypeError: newRecord is not a function
❯ recorded .bkit/core/engine/commands/workflow/workflows.test.ts:737:24
735| write(cwd, "staged.txt", "foreign staged\n");
736| git(cwd, "add", "staged.txt");
737| writeRecord(cwd, newRecord(cwd, FID, "dev"));
| ^
738| return cwd;
739| }
❯ .bkit/core/engine/commands/workflow/workflows.test.ts:755:19

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯

FAIL .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close — commit, outbox, comment > in place on dev with a shared-checkout record > close refuses with exit 10 when a recorded path changed
TypeError: newRecord is not a function
❯ recorded .bkit/core/engine/commands/workflow/workflows.test.ts:737:24
735| write(cwd, "staged.txt", "foreign staged\n");
736| git(cwd, "add", "staged.txt");
737| writeRecord(cwd, newRecord(cwd, FID, "dev"));
| ^
738| return cwd;
739| }
❯ .bkit/core/engine/commands/workflow/workflows.test.ts:761:19

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯

FAIL .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --push commits and pushes the record on the feature branch without a handover
TypeError: Cannot read properties of undefined (reading 'pushed')
❯ Object.handoverVerb [as run] .bkit/core/engine/commands/workflow/workflows.ts:606:20
604| const r = pushBranch(tree, { mode: "abort", openPr: str(ctx.flags.…
605| if (r.code === EXIT.USE_MCP) return r.code;
606| pushed = r.out.pushed;
| ^
607| ref = r.out.ref;
608| skipped = r.out.skipped;
❯ runCommand .bkit/core/engine/commands/lib.ts:322:23
❯ run .bkit/core/engine/commands/workflow/workflows.test.ts:69:22
❯ .bkit/core/engine/commands/workflow/workflows.test.ts:806:21

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯

FAIL .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --push commits the aborted subject, pushes, and links the handover in the comment
TypeError: Cannot read properties of undefined (reading 'pushed')
❯ Object.handoverVerb [as run] .bkit/core/engine/commands/workflow/workflows.ts:606:20
604| const r = pushBranch(tree, { mode: "abort", openPr: str(ctx.flags.…
605| if (r.code === EXIT.USE_MCP) return r.code;
606| pushed = r.out.pushed;
| ^
607| ref = r.out.ref;
608| skipped = r.out.skipped;
❯ runCommand .bkit/core/engine/commands/lib.ts:322:23
❯ run .bkit/core/engine/commands/workflow/workflows.test.ts:69:22
❯ .bkit/core/engine/commands/workflow/workflows.test.ts:823:21

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯

FAIL .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --push keeps the remote head when the branch has an open PR (exit 9, no link)
TypeError: Cannot read properties of undefined (reading 'pushed')
❯ Object.handoverVerb [as run] .bkit/core/engine/commands/workflow/workflows.ts:606:20
604| const r = pushBranch(tree, { mode: "abort", openPr: str(ctx.flags.…
605| if (r.code === EXIT.USE_MCP) return r.code;
606| pushed = r.out.pushed;
| ^
607| ref = r.out.ref;
608| skipped = r.out.skipped;
❯ runCommand .bkit/core/engine/commands/lib.ts:322:23
❯ run .bkit/core/engine/commands/workflow/workflows.test.ts:69:22
❯ .bkit/core/engine/commands/workflow/workflows.test.ts:847:21

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/8]⎯

FAIL .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > failed handover from dev removes the record and keeps recorded paths
TypeError: newRecord is not a function
❯ .bkit/core/engine/commands/workflow/workflows.test.ts:933:22
931| write(cwd, "src.ts", "foreign half-done fix\n");
932| write(cwd, `${REL}/debug-handover.md`, "# Handover\n");
933| writeRecord(cwd, newRecord(cwd, FID, "dev"));
| ^
934| expect(readRecord(cwd, FID)).not.toBeNull();
935| const start = Date.now() - 1000;

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/8]⎯

FAIL .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows handover > --push commits in the named worktree, not the checkout it runs from
TypeError: Cannot read properties of undefined (reading 'pushed')
❯ Object.handoverVerb [as run] .bkit/core/engine/commands/workflow/workflows.ts:606:20
604| const r = pushBranch(tree, { mode: "abort", openPr: str(ctx.flags.…
605| if (r.code === EXIT.USE_MCP) return r.code;
606| pushed = r.out.pushed;
| ^
607| ref = r.out.ref;
608| skipped = r.out.skipped;
❯ runCommand .bkit/core/engine/commands/lib.ts:322:23
❯ run .bkit/core/engine/commands/workflow/workflows.test.ts:69:22
❯ .bkit/core/engine/commands/workflow/workflows.test.ts:1056:21

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/8]⎯

Test Files 1 failed (1)
Tests 8 failed | 71 passed (79)
Start at 14:21:23
Duration 25.31s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-W54PDy/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
