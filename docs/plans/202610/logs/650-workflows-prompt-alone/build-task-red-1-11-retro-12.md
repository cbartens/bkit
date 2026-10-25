> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/workflows.test.ts

[test-timeout-budget] load average 14.3 on 10 cores: unit limits 7158ms per test, 14316ms per hook (x1.43)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

stderr | .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close > an unwritable stats path is logged and never fails the close
[bkit-comply] append failed: /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-XLNpye/.bkit/stats.jsonl — ENOTDIR: not a directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-XLNpye/.bkit/stats.jsonl'

❯ .bkit/core/engine/commands/workflow/workflows.test.ts (79 tests | 8 failed) 15578ms
✓ bkit workflows start (8)
✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 99ms
✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 95ms
✓ opens the next run after a finished one, and after another workflow's run 96ms
✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 121ms
✓ design / plan / build / debug book in the current worktree 102ms
✓ refuses when the lock is live, writing no row 65ms
✓ --lock-held checks the lock is ours 94ms
✓ rejects an unknown workflow 54ms
✓ bkit workflows fail (18)
✓ writes workflow-failed, releases its lock, and reports no handover 89ms
✓ writes no row when status.jsonl does not exist 75ms
✓ leaves a lock it never got in place (the Step 1 refusal path) 81ms
✓ aborts a rebase only when one is in progress 174ms
✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 163ms
✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 89ms
✓ clears ship's .deferred-blocked in the worktree being shipped 112ms
✓ --max-exceeded says a handover is due without any sentinel 70ms
✓ without --token changes nothing: the failure came before Step 1 locked 67ms
✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 91ms
✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 98ms
✓ a failed issue under {"issueTracker":"linear"} moves to review status "In Review" 48ms
✓ a failed issue under {"issueTracker":"linear","linear":{"review":"Code Review"}} moves to review status "Code Review" 48ms
✓ a failed issue under {"issueTracker":"jira"} moves to review status "In Review" 54ms
✓ a failed issue under {"issueTracker":"jira","jira":{"review":"QA"}} moves to review status "QA" 45ms
✓ a failed issue under {"issueTracker":"github"} moves to review status null 48ms
✓ prints the failure comment from --error-file, naming a lock it could not remove 67ms
✓ a debug run in SOAK mode always needs a handover 69ms
✓ bkit workflows close (11)
✓ writes workflow-done and schema-valid counter + outcome rows 129ms
✓ carries planSource from this run's workflow-meta, counts plan tasks and ledger totals 122ms
✓ always writes the telemetry, whatever the runtime 116ms
✓ with no workflow-started row: duration 0, per-run counts omitted, attempt 1 103ms
✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 122ms
✓ an unwritable stats path is logged and never fails the close 122ms
✓ refuses without status.jsonl and writes nothing 50ms
✓ ship: prNumber, size of the squash commit, and coverage 144ms
✓ lists the feature's docs and this workflow's logs on the ref as links 190ms
✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 121ms
✓ absent ledgers still give a schema-valid row with zero per-run counts 118ms
❯ bkit workflows close — commit, outbox, comment (10)
✓ --message commits everything, and bkit:auto appends the auto-route marker 159ms
✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 143ms
✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 144ms
✓ --record-step writes the close step's row before workflow-done 112ms
✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 118ms
❯ in place on dev with a shared-checkout record (3)
× close with a shared-checkout record never commits a recorded path 75ms
× record is present after workflows close and before the push 73ms
× close refuses with exit 10 when a recorded path changed 71ms
✓ --number without --outbox is a usage error 152ms
✓ --flush is ship only 85ms
❯ bkit workflows handover (17)
× --push commits and pushes the record on the feature branch without a handover 313ms
× --push commits the aborted subject, pushes, and links the handover in the comment 306ms
× --push keeps the remote head when the branch has an open PR (exit 9, no link) 193ms
✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 420ms
✓ --flush with nothing to record commits and pushes nothing 376ms
✓ --flush carries the named worktree's logs into the dev commit 565ms
✓ --flush refused by dev keeps the record in the book and exits 10 773ms
✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 628ms
× failed handover from dev removes the record and keeps recorded paths 200ms
✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 575ms
✓ --push on dev keeps a staged ledger in the checkout and names it 392ms
✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 492ms
✓ --push on dev with no start row carries no shared-ledger row, and says so 366ms
✓ a second --push on dev lands the run's rewritten log, not only new files 618ms
✓ --push on dev refused keeps the record in the checkout and exits 10 468ms
× --push commits in the named worktree, not the checkout it runs from 221ms
✓ rejects --push with --flush, and --flush outside ship 50ms
✓ bkit workflows close --flush (ship) (6)
✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 424ms
✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 317ms
✓ a close that landed releases the lock 411ms
✓ close PR (dev refused the push) (2)
✓ closePr with base dev still merges 1011ms
✓ closePr refuses when the PR base is unknown 911ms
✓ leaves a worktree no workflow created, and its branch, in place 346ms
✓ bkit workflows promote (7)
✓ --resolve prints the highest versioned draft and copies nothing 45ms
✓ exits 12 when there is no versioned draft 47ms
✓ archives a changed canonical, then writes the highest draft as the canonical 46ms
✓ stamps the anchor from the runtime-resolved base commit 59ms
✓ stamps the bkit release, and the outdated warning when a newer one is out 69ms
✓ plan: copies the split's children as canonical sub-plans and renames working names 46ms
✓ rejects a workflow other than design or plan 41ms
✓ bkit workflows links (2)
✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 79ms
✓ names the branch, not the remote-tracking ref, in each URL 84ms

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
Start at 14:21:06
Duration 15.97s (tests 98%, transform 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-yHgkrU/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
