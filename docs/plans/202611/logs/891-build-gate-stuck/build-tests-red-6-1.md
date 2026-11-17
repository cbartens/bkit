Enforced: true
Red: 5
Accepted: 0
Updated: 0
Gaps: 1

<!-- verdict:end -->

# Tests Red — group 6, attempt 1

Plan: `docs/plans/202611/891-build-gate-stuck-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 15 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a pull_request-event CI run at the base sha does not settle none" | red | failure: expected { verdict: 'none', reason: null, …(8) } to match object { verdict: 'all', …(2) } (7 matching properties omitted from actual) |
| 16 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a gate red on a non-test stage as well never reads all" | missing | "bkit tests base > a gate red on a non-test stage as well never reads all" did not run; the report holds "bkit tests base > reports all from a local run at the merge-base", "bkit tests base > a failing file absent at the base commit is the branch's", "bkit tests base > no JUnit report reads unknown", "bkit tests base > an undeclared bkit:test:file reads unknown", "bkit tests base > a failed base install reads unknown and removes the worktree", … |
| 17 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a base file run that exits non-zero without the failing case reads unknown" | red | failure: expected 'none' to be 'unknown' // Object.is equality |
| 18 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > the base test run does not inherit the hooks-off git config" | red | failure: expected { verdict: 'all', reason: null, …(8) } to match object { verdict: 'none', baseRed: +0, …(1) } (7 matching properties omitted from actual) |
| 19 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=rerun > refuses a file whose only Gate: FAIL line is in an item body" | red | failure: expected +0 to be 2 // Object.is equality |
| 19 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows start — resume facts > openDecision gate ignores a Gate line below the header" | red | failure: expected 'FAIL' to be null |

## Gaps

- TASK 16 `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a gate red on a non-test stage as well never reads all" `missing` — "bkit tests base > a gate red on a non-test stage as well never reads all" did not run; the report holds "bkit tests base > reports all from a local run at the merge-base", "bkit tests base > a failing file absent at the base commit is the branch's", "bkit tests base > no JUnit report reads unknown", "bkit tests base > an undeclared bkit:test:file reads unknown", "bkit tests base > a failed base install reads unknown and removes the worktree", …

## Lint output — `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tests-base.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tests-base.integration.test.ts

[test-timeout-budget] load average 24.8 on 10 cores: unit limits 16900ms per test, 33800ms per hook (x3.38)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck

 ❯ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts (17 tests | 3 failed) 13806ms
   ❯ bkit tests base (17)
     ✓ reports all from a local run at the merge-base 832ms
     ✓ a failing file absent at the base commit is the branch's 584ms
     ✓ no JUnit report reads unknown 233ms
     ✓ an undeclared bkit:test:file reads unknown 499ms
     ✓ a failed base install reads unknown and removes the worktree 541ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 770ms
     ✓ copies the worktreeCopy entries into the base checkout 745ms
     ✓ no origin/dev ref reads unknown 339ms
     ✓ a base file run that writes no report reads unknown 708ms
     ✓ a missing required flag is a usage error 244ms
     ✓ a passing CI run at the exact base sha settles none without a local run 511ms
     ✓ a CI run that cannot settle the base falls back to the local run 4025ms
     × a pull_request-event CI run at the base sha does not settle none 444ms
     × a base file run that exits non-zero without the failing case reads unknown 739ms
     × the base test run does not inherit the hooks-off git config 716ms
     ✓ adopt follows the run's runtimeWorktrees 1510ms
     ✓ worktreeInstall off reads unknown 362ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-base.integration.test.ts > bkit tests base > a pull_request-event CI run at the base sha does not settle none
AssertionError: expected { verdict: 'none', reason: null, …(8) } to match object { verdict: 'all', …(2) }
(7 matching properties omitted from actual)

- Expected
+ Received

  {
-   "baseRed": 1,
-   "source": "local",
-   "verdict": "all",
+   "baseRed": 0,
+   "source": "ci",
+   "verdict": "none",
  }

 ❯ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts:479:20
    477|     const r = await testsBase(f);
    478|     expect(r.code).toBe(0);
    479|     expect(r.json).toMatchObject({ verdict: "all", source: "local", ba…
       |                    ^
    480|     expect(installRuns(f)).toHaveLength(1);
    481|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-base.integration.test.ts > bkit tests base > a base file run that exits non-zero without the failing case reads unknown
AssertionError: expected 'none' to be 'unknown' // Object.is equality

Expected: "unknown"
Received: "none"

 ❯ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts:488:28
    486|     const r = await testsBase(f);
    487|     expect(r.code).toBe(0);
    488|     expect(r.json.verdict).toBe("unknown");
       |                            ^
    489|     expect(r.json.reason).toContain("exit");
    490|     expect(r.json.branch).toBe(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-base.integration.test.ts > bkit tests base > the base test run does not inherit the hooks-off git config
AssertionError: expected { verdict: 'all', reason: null, …(8) } to match object { verdict: 'none', baseRed: +0, …(1) }
(7 matching properties omitted from actual)

- Expected
+ Received

  {
-   "baseRed": 0,
-   "branch": 1,
-   "verdict": "none",
+   "baseRed": 1,
+   "branch": 0,
+   "verdict": "all",
  }

 ❯ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts:502:20
    500|     const r = await testsBase(f);
    501|     expect(r.code).toBe(0);
    502|     expect(r.json).toMatchObject({ verdict: "none", baseRed: 0, branch…
       |                    ^
    503|   });
    504|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 14 passed (17)
   Start at  08:34:29
   Duration  14.36s (tests 97%, import 2%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-OxFoGb/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/decisions.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/decisions.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/decisions.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/decisions.test.ts

[test-timeout-budget] load average 21.9 on 10 cores: unit limits 15450ms per test, 30900ms per hook (x3.09)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts (38 tests | 1 failed) 2242ms
   ✓ bkit decisions compose (19)
     ✓ writes the header, one item per question and the reply line 57ms
     ✓ compose letters every option and the recommended one 45ms
     ✓ refuses an item whose recommendation is not one of its options 45ms
     ✓ refuses an item with more options than letters 56ms
     ✓ round-trips the last lettered option through parseDecisionItems 55ms
     ✓ --loop adds the attempt line, the progress block and the loop question as Q1 54ms
     ✓ --loop letters the loop question's options and recommendation 42ms
     ✓ --loop=holistic counts only the rounds since the whole-feature check was last clean 47ms
     ✓ prints the group gate's failing tests per round for the verify loop 42ms
     ✓ base check all with no items recommends Stop 35ms
     ✓ base check all with items recommends Decide 44ms
     ✓ base check all in adopt mode adds the merge sentence 76ms
     ✓ base check some names the split 37ms
     ✓ base check none keeps the trend and names the branch 41ms
     ✓ base check unknown keeps the trend and says why 42ms
     ✓ Try again is offered for every base verdict 310ms
     ✓ base check prints how many failing tests are also red on base 86ms
     ✓ a missing or malformed base check is a usage error that names the problem 79ms
     ✓ --loop needs --file 37ms
   ❯ bkit decisions apply --by=rerun (3)
     ✓ records the re-run under Q1 and closes the file 37ms
     ✓ refuses a file without Gate: FAIL or not OPEN 40ms
     × refuses a file whose only Gate: FAIL line is in an item body 63ms
   ✓ bkit decisions apply --by=headless (3)
     ✓ takes each recommendation: an Accept is assumed, Fix now is written as such 65ms
     ✓ leaves hard blockers for the owner and exits with the hard-blocker code 67ms
     ✓ labels the runtime from the main checkout's Cursor marker when run in a build worktree 167ms
   ✓ parseDecisionItems (4)
     ✓ parseDecisionItems keeps the bare option name, dropping the letter 0ms
     ✓ a decision file written before the letters still parses 0ms
     ✓ parseDecisionItems reads a lettered decision as the option its letter labels 1ms
     ✓ a lettered assumed Accept decision still reads as assumed 0ms
   ✓ applyRecommendations (3)
     ✓ a Try again loop answer settles the loop alone; the items wait for the next round 0ms
     ✓ a lettered recommendation still settles its item by name 0ms
     ✓ applyRecommendations reads a lettered Try again decision as the loop answer 0ms
   ✓ bkit decisions apply --by=owner and pending (6)
     ✓ pending lists each assumed Accept nobody confirmed 95ms
     ✓ --confirm writes the owner's decision row and the real Accept; --reject marks it rejected 144ms
     ✓ refuses an item that is not an assumed Accept, or a call without one of --confirm / --reject 58ms
     ✓ --defer writes one needs-decision deferral per listed item, then lists none 118ms
     ✓ --defer letters the options in the deferral row 94ms
     ✓ refuses a malformed --month 61ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=rerun > refuses a file whose only Gate: FAIL line is in an item body
AssertionError: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:531:20
    529|     const before = fs.readFileSync(out, "utf-8");
    530|     const r = await rerun(root, out);
    531|     expect(r.code).toBe(2);
       |                    ^
    532|     expect(r.err).toContain("Gate: FAIL");
    533|     expect(r.err).not.toContain("--by must be headless or owner");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 37 passed (38)
   Start at  08:34:45
   Duration  2.94s (tests 80%, transform 9%, import 8%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-TA4J5g/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/workflows.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/workflows.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/workflows.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/workflows.test.ts

[test-timeout-budget] load average 22.6 on 10 cores: unit limits 15800ms per test, 31600ms per hook (x3.16)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (157 tests | 1 failed) 92730ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 376ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1284ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 310ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 290ms
     ✓ writes no limits for a workflow with no ask point 270ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 234ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 303ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 446ms
       ✓ a new run in the same chat gets its own session row 321ms
       ✓ writes none outside Claude Code 279ms
     ✓ opens the next run after a finished one, and after another workflow's run 323ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 361ms
     ✓ design / plan / build / debug book in the current worktree 354ms
     ✓ refuses when the lock is live, writing no row 253ms
     ✓ --lock-held checks the lock is ours 392ms
     ✓ rejects an unknown workflow 179ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 317ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 430ms
   ❯ bkit workflows start — resume facts (8)
     ✓ a new run has no last step and no open decision 268ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 232ms
     ✓ an OPEN decision of an earlier run never resurfaces 329ms
     ✓ an OPEN decision mid-build prints its header fields 278ms
     ✓ openDecision carries the Gate header 257ms
     ✓ openDecision gate is null without the header 234ms
     × openDecision gate ignores a Gate line below the header 267ms
     ✓ reads Test attempt from a tests pause 230ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 402ms
     ✓ writes no row when status.jsonl does not exist 266ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 281ms
     ✓ aborts a rebase only when one is in progress 654ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 588ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 588ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 323ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 393ms
     ✓ --max-exceeded says a handover is due without any sentinel 324ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 305ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 362ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 337ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 183ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 212ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 182ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 203ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 199ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 255ms
     ✓ a debug run in SOAK mode always needs a handover 278ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 632ms
       ✓ counts subagents of an earlier chat the run's session rows name 690ms
       ✓ records no context block, and still closes, outside a Claude Code session 677ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 615ms
     ✓ records ending held and publish false on the workflow-done row 687ms
     ✓ defaults the close row to ending done 659ms
     ✓ refuses an unknown ending 274ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 576ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 593ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 611ms
     ✓ always writes the telemetry, whatever the runtime 626ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 480ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 525ms
     ✓ an unwritable stats path is logged and never fails the close 595ms
     ✓ appends the completeness row before the workflow-done row 625ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 638ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 588ms
     ✓ writes one completeness row per close 1148ms
     ✓ leaves out the previous run's rows that share a second with this run's start 652ms
     ✓ still closes when the completeness check throws 624ms
     ✓ still closes when the completeness row write throws 698ms
     ✓ refuses without status.jsonl and writes nothing 212ms
     ✓ ship: run.pr, size of the squash commit, and coverage 824ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1138ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 709ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 630ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 769ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 815ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 708ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 670ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 870ms
     ✓ --record-step writes the close step's row before workflow-done 564ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 482ms
     ✓ --number without --outbox is a usage error 473ms
     ✓ --flush is ship only 194ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 682ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 669ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 811ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 800ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 573ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 251ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 283ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1740ms
     ✓ --flush with nothing to record commits and pushes nothing 854ms
     ✓ --flush carries the named worktree's logs into the dev commit 1784ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2630ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2342ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2562ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2066ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2777ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2238ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2196ms
     ✓ --push on dev never carries a row whose references name another feature 2058ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2098ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 3727ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2262ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1181ms
     ✓ rejects --push with --flush, and --flush outside ship 195ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2631ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2103ms
     ✓ a close that landed releases the lock 1131ms
     ✓ removes the worktree before it releases the lock 1019ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 1811ms
       ✓ closePr refuses when the PR base is unknown 1459ms
     ✓ leaves a worktree no workflow created, and its branch, in place 943ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 76ms
     ✓ exits 12 when there is no versioned draft 81ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 77ms
     ✓ stamps the anchor from the runtime-resolved base commit 102ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 120ms
     ✓ promote copies the plan only 78ms
     ✓ rejects a workflow other than design or plan 66ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 134ms
     ✓ names the branch, not the remote-tracking ref, in each URL 132ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 128ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 163ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 360ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 200ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 547ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 228ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 237ms
     ✓ a second run's record does not let this FID's close commit 293ms
     ✓ record is present after workflows close and before the push 525ms
     ✓ failed handover from dev removes the record and keeps recorded paths 930ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 84ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 80ms
     ✓ a run with no issue holds the prompt alone 83ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 182ms
     ✓ --plan is appended when the file exists and skipped when it does not 130ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 215ms
     ✓ a missing prompt file exits 13 85ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 353ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 263ms
     ✓ puts each --line after the summary, in flag order 262ms
     ✓ refuses --final-return without --summary-file 78ms
     ✓ --summary prints the file and keeps a copy in --outbox 289ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 275ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 79ms
     ✓ a missing summary file exits 13 before anything is written 83ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 104ms
     ✓ a folder outside the outbox sessions folder is kept 89ms
     ✓ without --session-dir prints no sessionRemoved 90ms
   ✓ bkit workflows summary (10)
     ✓ passes publish into the summary input 28ms
     ✓ summary is FAIL when a plan task is not done 11ms
     ✓ summary is CONCERNS when a deferral was written 11ms
     ✓ a deferral closed later no longer lowers the verdict, while its history stays on disk 11ms
     ✓ recomputes the verdict from resolved work without rewriting the earlier summary event 11ms
     ✓ summary recommends /bkit-debug on FAIL 22ms
     ✓ summary reports the last attempt 10ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 11ms
     ✓ a design summary carries the organised design's open questions 11ms
     ✓ refuses a status file with no run of the workflow, and a missing one 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows start — resume facts > openDecision gate ignores a Gate line below the header
AssertionError: expected 'FAIL' to be null

- Expected:
null

+ Received:
"FAIL"

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:620:38
    618|     expect(r.code).toBe(0);
    619|     expect(r.json.openDecision).not.toBeNull();
    620|     expect(r.json.openDecision.gate).toBeNull();
       |                                      ^
    621|   });
    622|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 156 passed (157)
   Start at  08:34:50
   Duration  93.42s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-puPlaV/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
