> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/workflows.test.ts

[test-timeout-budget] load average 18.0 on 10 cores: unit limits 8985ms per test, 17970ms per hook (x1.80)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

stderr | .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close > an unwritable stats path is logged and never fails the close
[bkit-comply] append failed: /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-txG1rg/.bkit/stats.jsonl — ENOTDIR: not a directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-txG1rg/.bkit/stats.jsonl'

❯ .bkit/core/engine/commands/workflow/workflows.test.ts (78 tests | 3 failed) 16418ms
✓ bkit workflows start (8)
✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 79ms
✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 62ms
✓ opens the next run after a finished one, and after another workflow's run 64ms
✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 87ms
✓ design / plan / build / debug book in the current worktree 84ms
✓ refuses when the lock is live, writing no row 58ms
✓ --lock-held checks the lock is ours 88ms
✓ rejects an unknown workflow 46ms
✓ bkit workflows fail (18)
✓ writes workflow-failed, releases its lock, and reports no handover 87ms
✓ writes no row when status.jsonl does not exist 69ms
✓ leaves a lock it never got in place (the Step 1 refusal path) 69ms
✓ aborts a rebase only when one is in progress 159ms
✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 154ms
✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 86ms
✓ clears ship's .deferred-blocked in the worktree being shipped 90ms
✓ --max-exceeded says a handover is due without any sentinel 71ms
✓ without --token changes nothing: the failure came before Step 1 locked 68ms
✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 94ms
✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 101ms
✓ a failed issue under {"issueTracker":"linear"} moves to review status "In Review" 50ms
✓ a failed issue under {"issueTracker":"linear","linear":{"review":"Code Review"}} moves to review status "Code Review" 50ms
✓ a failed issue under {"issueTracker":"jira"} moves to review status "In Review" 49ms
✓ a failed issue under {"issueTracker":"jira","jira":{"review":"QA"}} moves to review status "QA" 52ms
✓ a failed issue under {"issueTracker":"github"} moves to review status null 49ms
✓ prints the failure comment from --error-file, naming a lock it could not remove 54ms
✓ a debug run in SOAK mode always needs a handover 72ms
✓ bkit workflows close (11)
✓ writes workflow-done and schema-valid counter + outcome rows 140ms
✓ carries planSource from this run's workflow-meta, counts plan tasks and ledger totals 133ms
✓ always writes the telemetry, whatever the runtime 133ms
✓ with no workflow-started row: duration 0, per-run counts omitted, attempt 1 110ms
✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 132ms
✓ an unwritable stats path is logged and never fails the close 131ms
✓ refuses without status.jsonl and writes nothing 52ms
✓ ship: prNumber, size of the squash commit, and coverage 162ms
✓ lists the feature's docs and this workflow's logs on the ref as links 207ms
✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 170ms
✓ absent ledgers still give a schema-valid row with zero per-run counts 161ms
✓ bkit workflows close — commit, outbox, comment (7)
✓ --message commits everything, and bkit:auto appends the auto-route marker 181ms
✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 168ms
✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 169ms
✓ --record-step writes the close step's row before workflow-done 132ms
✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 135ms
✓ --number without --outbox is a usage error 128ms
✓ --flush is ship only 72ms
✓ bkit workflows handover (16)
✓ --push commits and pushes the record on the feature branch without a handover 228ms
✓ --push commits the aborted subject, pushes, and links the handover in the comment 232ms
✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 166ms
✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 452ms
✓ --flush with nothing to record commits and pushes nothing 330ms
✓ --flush carries the named worktree's logs into the dev commit 578ms
✓ --flush refused by dev keeps the record in the book and exits 10 837ms
✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 536ms
✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 638ms
✓ --push on dev keeps a staged ledger in the checkout and names it 421ms
✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 520ms
✓ --push on dev with no start row carries no shared-ledger row, and says so 394ms
✓ a second --push on dev lands the run's rewritten log, not only new files 668ms
✓ --push on dev refused keeps the record in the checkout and exits 10 483ms
✓ --push commits in the named worktree, not the checkout it runs from 290ms
✓ rejects --push with --flush, and --flush outside ship 63ms
✓ bkit workflows close --flush (ship) (6)
✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 534ms
✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 366ms
✓ a close that landed releases the lock 487ms
✓ close PR (dev refused the push) (2)
✓ closePr with base dev still merges 999ms
✓ closePr refuses when the PR base is unknown 902ms
✓ leaves a worktree no workflow created, and its branch, in place 392ms
✓ bkit workflows promote (7)
✓ --resolve prints the highest versioned draft and copies nothing 52ms
✓ exits 12 when there is no versioned draft 48ms
✓ archives a changed canonical, then writes the highest draft as the canonical 51ms
✓ stamps the anchor from the runtime-resolved base commit 64ms
✓ stamps the bkit release, and the outdated warning when a newer one is out 82ms
✓ plan: copies the split's children as canonical sub-plans and renames working names 51ms
✓ rejects a workflow other than design or plan 46ms
✓ bkit workflows links (2)
✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 94ms
✓ names the branch, not the remote-tracking ref, in each URL 90ms
❯ bkit workflows close / handover — a debug run in place on dev that shares its checkout (3)
× close with a shared-checkout record never commits a recorded path 190ms
× record is present after workflows close and before the push 182ms
× failed handover from dev removes the record and keeps recorded paths 446ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close / handover — a debug run in place on dev that shares its checkout > close with a shared-checkout record never commits a recorded path
AssertionError: expected [ '.bkit/stats.jsonl', 'a.txt', …(3) ] to not include 'a.txt'
❯ .bkit/core/engine/commands/workflow/workflows.test.ts:1354:32
1352| expect(r.code).toBe(0);
1353| expect(committed(cwd)).toContain(`${REL}/verify-1.md`);
1354| expect(committed(cwd)).not.toContain("a.txt");
| ^
1355| expect(committed(cwd)).not.toContain("notes.md");
1356| expect(fs.readFileSync(path.join(cwd, "a.txt"), "utf-8")).toBe("ba…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

FAIL .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close / handover — a debug run in place on dev that shares its checkout > record is present after workflows close and before the push
AssertionError: expected false to be true // Object.is equality

- Expected

* Received

- true

* false

❯ .bkit/core/engine/commands/workflow/workflows.test.ts:1365:42
1363| const cwd = shared();
1364| expect((await close(cwd)).code).toBe(0);
1365| expect(fs.existsSync(recordAt(cwd))).toBe(true);
| ^
1366| const rec = JSON.parse(fs.readFileSync(recordAt(cwd), "utf-8")) as…
1367| expect(rec.commits.at(-1)).toBe(git(cwd, "rev-parse", "HEAD"));

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

FAIL .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close / handover — a debug run in place on dev that shares its checkout > failed handover from dev removes the record and keeps recorded paths
AssertionError: expected true to be false // Object.is equality

- Expected

* Received

- false

* true

❯ .bkit/core/engine/commands/workflow/workflows.test.ts:1414:42
1412| const r = await run(cwd, wf("handover", "debug", `--month=${M}`, "…
1413| expect(r.code).toBe(0);
1414| expect(fs.existsSync(recordAt(cwd))).toBe(false);
| ^
1415| const left = fs.readFileSync(path.join(cwd, "docs/decisions.jsonl"…
1416| expect(left).toContain('"foreign"');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯

Test Files 1 failed (1)
Tests 3 failed | 75 passed (78)
Start at 15:45:33
Duration 16.70s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-MPujT4/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
