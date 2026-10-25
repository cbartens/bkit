> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/workflows.test.ts

[test-timeout-budget] load average 23.7 on 10 cores: unit limits 11858ms per test, 23715ms per hook (x2.37)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

stderr | .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close > an unwritable stats path is logged and never fails the close
[bkit-comply] append failed: /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-dFmmHs/.bkit/stats.jsonl — ENOTDIR: not a directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-workflows-dFmmHs/.bkit/stats.jsonl'

❯ .bkit/core/engine/commands/workflow/workflows.test.ts (78 tests | 3 failed) 18575ms
✓ bkit workflows start (8)
✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 126ms
✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 102ms
✓ opens the next run after a finished one, and after another workflow's run 120ms
✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 148ms
✓ design / plan / build / debug book in the current worktree 148ms
✓ refuses when the lock is live, writing no row 125ms
✓ --lock-held checks the lock is ours 154ms
✓ rejects an unknown workflow 75ms
✓ bkit workflows fail (18)
✓ writes workflow-failed, releases its lock, and reports no handover 132ms
✓ writes no row when status.jsonl does not exist 104ms
✓ leaves a lock it never got in place (the Step 1 refusal path) 106ms
✓ aborts a rebase only when one is in progress 210ms
✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 178ms
✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 100ms
✓ clears ship's .deferred-blocked in the worktree being shipped 98ms
✓ --max-exceeded says a handover is due without any sentinel 76ms
✓ without --token changes nothing: the failure came before Step 1 locked 75ms
✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 96ms
✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 101ms
✓ a failed issue under {"issueTracker":"linear"} moves to review status "In Review" 49ms
✓ a failed issue under {"issueTracker":"linear","linear":{"review":"Code Review"}} moves to review status "Code Review" 50ms
✓ a failed issue under {"issueTracker":"jira"} moves to review status "In Review" 50ms
✓ a failed issue under {"issueTracker":"jira","jira":{"review":"QA"}} moves to review status "QA" 49ms
✓ a failed issue under {"issueTracker":"github"} moves to review status null 50ms
✓ prints the failure comment from --error-file, naming a lock it could not remove 55ms
✓ a debug run in SOAK mode always needs a handover 70ms
✓ bkit workflows close (11)
✓ writes workflow-done and schema-valid counter + outcome rows 137ms
✓ carries planSource from this run's workflow-meta, counts plan tasks and ledger totals 131ms
✓ always writes the telemetry, whatever the runtime 129ms
✓ with no workflow-started row: duration 0, per-run counts omitted, attempt 1 107ms
✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 131ms
✓ an unwritable stats path is logged and never fails the close 129ms
✓ refuses without status.jsonl and writes nothing 54ms
✓ ship: prNumber, size of the squash commit, and coverage 158ms
✓ lists the feature's docs and this workflow's logs on the ref as links 204ms
✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 131ms
✓ absent ledgers still give a schema-valid row with zero per-run counts 134ms
✓ bkit workflows close — commit, outbox, comment (7)
✓ --message commits everything, and bkit:auto appends the auto-route marker 172ms
✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 154ms
✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 155ms
✓ --record-step writes the close step's row before workflow-done 120ms
✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 126ms
✓ --number without --outbox is a usage error 130ms
✓ --flush is ship only 70ms
✓ bkit workflows handover (16)
✓ --push commits and pushes the record on the feature branch without a handover 221ms
✓ --push commits the aborted subject, pushes, and links the handover in the comment 231ms
✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 181ms
✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 410ms
✓ --flush with nothing to record commits and pushes nothing 304ms
✓ --flush carries the named worktree's logs into the dev commit 396ms
✓ --flush refused by dev keeps the record in the book and exits 10 525ms
✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 494ms
✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 810ms
✓ --push on dev keeps a staged ledger in the checkout and names it 672ms
✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 772ms
✓ --push on dev with no start row carries no shared-ledger row, and says so 439ms
✓ a second --push on dev lands the run's rewritten log, not only new files 866ms
✓ --push on dev refused keeps the record in the checkout and exits 10 517ms
✓ --push commits in the named worktree, not the checkout it runs from 263ms
✓ rejects --push with --flush, and --flush outside ship 52ms
✓ bkit workflows close --flush (ship) (6)
✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 448ms
✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 349ms
✓ a close that landed releases the lock 471ms
✓ close PR (dev refused the push) (2)
✓ closePr with base dev still merges 1021ms
✓ closePr refuses when the PR base is unknown 878ms
✓ leaves a worktree no workflow created, and its branch, in place 593ms
✓ bkit workflows promote (7)
✓ --resolve prints the highest versioned draft and copies nothing 99ms
✓ exits 12 when there is no versioned draft 96ms
✓ archives a changed canonical, then writes the highest draft as the canonical 147ms
✓ stamps the anchor from the runtime-resolved base commit 265ms
✓ stamps the bkit release, and the outdated warning when a newer one is out 188ms
✓ plan: copies the split's children as canonical sub-plans and renames working names 146ms
✓ rejects a workflow other than design or plan 140ms
✓ bkit workflows links (2)
✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 281ms
✓ names the branch, not the remote-tracking ref, in each URL 185ms
❯ bkit workflows close / handover — a debug run in place on dev that shares its checkout (3)
× close with a shared-checkout record never commits a recorded path 327ms
× record is present after workflows close and before the push 258ms
× failed handover from dev removes the record and keeps recorded paths 509ms

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
Start at 15:45:14
Duration 19.10s (tests 98%, transform 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-ftXSD6/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
