Enforced: true
Red: 9
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/911-ship-failed-merge-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 3 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep" | red | failure: expected 2 to be +0 // Object.is equality |
| 3 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail refuses a multi-line or non-/bkit- --next-step before any write" | red | failure: expected '[bkit-workflows] unknown flag --next-…' to contain '--next-step must be one /bkit-* comma…' |
| 3 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail treats an empty --next-step as absent" | red | failure: expected 2 to be +0 // Object.is equality |
| 4 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "Step 10 holds /bkit-debug {FID} as NEXT_STEP on every red-run route to the Failure Path or the Merge Question, and on no other" | red | failure: need a regenerable and a non-regenerable exit 12 arm: expected 1 to be greater than or equal to 2 |
| 4 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "Step 2 holds NEXT_STEP on a failed check in the CI wait of a PR ship opened" | red | failure: Step 2 failed check holds no NEXT_STEP: expected ' - **If** there is no check, **or…' to match /NEXT_STEP/ |
| 4 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "the Merge Question's Stop arm names NEXT_STEP when held and Try again clears it" | red | failure: expected ' - **If** the answer is `Try again`…' to match /clear[^.\n]*NEXT_STEP/ |
| 4 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "Close Workflow routes a red squash capstone to the Failure Path holding NEXT_STEP" | red | failure: no Route: after runs gate --capstone-only: expected '1. Assert that the capstone passed at…' to match /Route:/ |
| 4 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "the Failure Path passes --next-step only when NEXT_STEP is held and ends the final message with it" | red | failure: workflows fail fence lacks --next-step=: expected ' "{BKIT}" workflows fail --post --i…' to match /--next-step=/ |
| 4 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "the Failure Path re-runs workflows fail without --next-step on exit 2" | red | failure: no exit 2 retry without --next-step: expected '1. Write the error message / tool res…' to match /exit 2/ |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/workflows.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/workflows.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/workflows.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/workflows.test.ts

[test-timeout-budget] load average 19.8 on 10 cores: unit limits 14400ms per test, 28800ms per hook (x2.88)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (165 tests | 3 failed) 120568ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 630ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1657ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 323ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 270ms
     ✓ writes no limits for a workflow with no ask point 310ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 251ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 430ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 359ms
       ✓ a new run in the same chat gets its own session row 347ms
       ✓ writes none outside Claude Code 418ms
     ✓ opens the next run after a finished one, and after another workflow's run 402ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 441ms
     ✓ design / plan / build / debug book in the current worktree 418ms
     ✓ refuses when the lock is live, writing no row 256ms
     ✓ --lock-held checks the lock is ours 442ms
     ✓ rejects an unknown workflow 194ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 367ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 497ms
   ✓ bkit workflows start — resume facts (8)
     ✓ a new run has no last step and no open decision 247ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 226ms
     ✓ an OPEN decision of an earlier run never resurfaces 304ms
     ✓ an OPEN decision mid-build prints its header fields 254ms
     ✓ openDecision carries the Gate header 239ms
     ✓ openDecision gate is null without the header 300ms
     ✓ openDecision gate ignores a Gate line below the header 258ms
     ✓ reads Test attempt from a tests pause 290ms
   ❯ bkit workflows fail (22)
     ✓ writes workflow-failed, releases its lock, and reports no handover 465ms
     ✓ writes no row when status.jsonl does not exist 492ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 389ms
     ✓ aborts a rebase only when one is in progress 823ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 661ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 746ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 474ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 461ms
     ✓ --max-exceeded says a handover is due without any sentinel 345ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 332ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 541ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 537ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 218ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 221ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 202ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 271ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 188ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 219ms
     × bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 226ms
     × bkit workflows fail refuses a multi-line or non-/bkit- --next-step before any write 286ms
     × bkit workflows fail treats an empty --next-step as absent 187ms
     ✓ a debug run in SOAK mode always needs a handover 361ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 782ms
       ✓ counts subagents of an earlier chat the run's session rows name 703ms
       ✓ records no context block, and still closes, outside a Claude Code session 703ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 758ms
     ✓ records ending held and publish false on the workflow-done row 691ms
     ✓ defaults the close row to ending done 766ms
     ✓ refuses an unknown ending 262ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 653ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 687ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 700ms
     ✓ always writes the telemetry, whatever the runtime 708ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 642ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 756ms
     ✓ an unwritable stats path is logged and never fails the close 610ms
     ✓ appends the completeness row before the workflow-done row 725ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 728ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 756ms
     ✓ writes one completeness row per close 1206ms
     ✓ leaves out the previous run's rows that share a second with this run's start 578ms
     ✓ still closes when the completeness check throws 671ms
     ✓ still closes when the completeness row write throws 684ms
     ✓ refuses without status.jsonl and writes nothing 248ms
     ✓ ship: run.pr, size of the squash commit, and coverage 810ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1217ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 672ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 709ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1196ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 963ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 907ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 929ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1057ms
     ✓ --record-step writes the close step's row before workflow-done 671ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 842ms
     ✓ --number without --outbox is a usage error 891ms
     ✓ --flush is ship only 292ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1031ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 978ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1037ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1144ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 851ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 432ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 403ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2560ms
     ✓ --flush with nothing to record commits and pushes nothing 1282ms
     ✓ --flush carries the named worktree's logs into the dev commit 2527ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2547ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2601ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 3220ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2766ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3234ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2833ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2811ms
     ✓ --push on dev never carries a row whose references name another feature 2757ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2839ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 4787ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2758ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1301ms
     ✓ rejects --push with --flush, and --flush outside ship 179ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 1542ms
     ✓ preserves unlanded file deletions and ledger additions on close 2562ms
     ✓ preserves dirty work and uncertain branch evidence during close 2652ms
     ✓ preserves a local feature ref changed after its cleanup proof 2670ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1457ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1100ms
     ✓ a close that landed releases the lock 1390ms
     ✓ removes the worktree before it releases the lock 1360ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2076ms
       ✓ closePr refuses when the PR base is unknown 1713ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1154ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 96ms
     ✓ exits 12 when there is no versioned draft 100ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 100ms
     ✓ stamps the anchor from the runtime-resolved base commit 128ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 155ms
     ✓ promote copies the plan only 101ms
     ✓ rejects a workflow other than design or plan 90ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 177ms
     ✓ names the branch, not the remote-tracking ref, in each URL 164ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 152ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 161ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 415ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 240ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 633ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 294ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 266ms
     ✓ a second run's record does not let this FID's close commit 336ms
     ✓ record is present after workflows close and before the push 603ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1133ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 101ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 105ms
     ✓ a run with no issue holds the prompt alone 106ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 221ms
     ✓ --plan is appended when the file exists and skipped when it does not 148ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 242ms
     ✓ a missing prompt file exits 13 100ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 463ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 364ms
     ✓ puts each --line after the summary, in flag order 372ms
     ✓ refuses --final-return without --summary-file 98ms
     ✓ --summary prints the file and keeps a copy in --outbox 364ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 368ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 93ms
     ✓ a missing summary file exits 13 before anything is written 97ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 115ms
     ✓ a folder outside the outbox sessions folder is kept 105ms
     ✓ without --session-dir prints no sessionRemoved 97ms
   ✓ bkit workflows summary (11)
     ✓ passes publish into the summary input 35ms
     ✓ lists ship-failure rows from a run started before their removal 11ms
     ✓ summary is FAIL when a plan task is not done 11ms
     ✓ summary is CONCERNS when a deferral was written 12ms
     ✓ a deferral closed later no longer lowers the verdict, while its history stays on disk 12ms
     ✓ recomputes the verdict from resolved work without rewriting the earlier summary event 11ms
     ✓ summary recommends /bkit-debug on FAIL 22ms
     ✓ summary reports the last attempt 16ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 11ms
     ✓ a design summary carries the organised design's open questions 11ms
     ✓ refuses a status file with no run of the workflow, and a missing one 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows fail > bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:868:20
    866|       ),
    867|     );
    868|     expect(r.code).toBe(0);
       |                    ^
    869|     expect(r.json.nextStep).toBe("/bkit-debug 911-ship-failed-merge");
    870|     expect(r.json.comment).toContain("Next step: `/bkit-debug 911-ship…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows fail > bkit workflows fail refuses a multi-line or non-/bkit- --next-step before any write
AssertionError: expected '[bkit-workflows] unknown flag --next-…' to contain '--next-step must be one /bkit-* comma…'

- Expected
+ Received

- --next-step must be one /bkit-* command line
+ [bkit-workflows] unknown flag --next-step
+

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:882:21
    880|       const r = await run(cwd, wf("fail", "build", `--month=${M}`, tok…
    881|       expect(r.code).toBe(2);
    882|       expect(r.err).toContain("--next-step must be one /bkit-* command…
       |                     ^
    883|     }
    884|     expect(fs.readFileSync(statusOf(cwd), "utf-8")).toBe(before);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows fail > bkit workflows fail treats an empty --next-step as absent
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:903:20
    901|       ),
    902|     );
    903|     expect(r.code).toBe(0);
       |                    ^
    904|     expect(r.json.nextStep).toBeNull();
    905|     expect(r.json.comment).not.toContain("Next step:");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 162 passed (165)
   Start at  18:08:51
   Duration  121.58s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-XfeB2P/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/ship-invariants.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`

````

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/ship-invariants.test.ts

[test-timeout-budget] load average 13.2 on 10 cores: unit limits 11101ms per test, 22201ms per hook (x2.22)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge

 ❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (67 tests | 6 failed) 46ms
   ✓ deferred sweep — disabled-test evidence (4)
     ✓ adjudicates every scanner hit against the diff and current coverage 2ms
     ✓ requires scoped owner approval and current-contract evidence for retirement 0ms
     ✓ blocks scan errors, real disabling markers and unproven deletions 0ms
     ✓ records each disposition and requires complete adjudication before PASS 0ms
   ✓ ship reconciliation and retry contracts (7)
     ✓ reconciles and publishes feature code before bookkeeping on every ship path 1ms
     ✓ routes stale bases and refused merges through the bounded integration or validation loop 1ms
     ✓ routes late revalidation code and gate seventeen through reconciliation before merge 1ms
     ✓ ship reconciliation and retry contracts passes the actual merge target and defers branch deletion to guarded close 1ms
     ✓ routes MCP safety facts through engine decisions with transport accounting 2ms
     ✓ refreshes merge-aware feature coverage immediately before both reuse decisions 1ms
     ✓ ties deferred sweep and docs reuse to the recorded feature code state 2ms
   ✓ bkit-ship.md — staging hygiene (banned patterns) (2)
     ✓ has no `git add -A` anywhere (full content) 0ms
     ✓ has no literal `git add` anywhere — every stage goes through bkit ledgers 1ms
   ✓ bkit-ship.md — push-timing invariant (feature-branch pushes before merge) (7)
     ✓ pushes feature code during entry and base reconciliation, integration, bookkeeping and fixes 1ms
     ✓ regenerates only in the Merge Gate, after a red CI run, never up front in Base Check 0ms
     ✓ never force-pushes, with or without lease 1ms
     ✓ the Integrate push is a plain push of the locally merged branch 0ms
     ✓ the pre-merge bookkeeping push is a plain push — never forced 0ms
     ✓ the pre-merge bookkeeping commit stages through bkit ledgers --scope=pr, after the step-done row 1ms
     ✓ pushes the branch to open a missing PR only when ahead of dev, non-force, before bkit prs open 0ms
   ✓ bkit-ship.md — bookkeeping and status writes (4)
     ✓ Step 1 resolves the status log through bkit status path, inside the worktree 1ms
     ✓ Step 1 opens the run in the worktree straight after the lock, before any tracker write 0ms
     ✓ no fence reassigns STATUS — every status write takes the resolved {STATUS} 1ms
     ✓ every ship audit row is written through a command, into {STATUS} 1ms
   ✓ every workflow writes its own workflow-started row (#492) (5)
     ✓ bkit-design.md opens its run with bkit workflows start --workflow=design 1ms
     ✓ bkit-plan.md opens its run with bkit workflows start --workflow=plan 1ms
     ✓ bkit-build.md opens its run with bkit workflows start --workflow=build 1ms
     ✓ bkit-debug.md opens its run with bkit workflows start --workflow=debug 0ms
     ✓ bkit-ship.md opens its run with bkit workflows start --workflow=ship 0ms
   ✓ no workflow bash block appends to status.jsonl or .bkit/issues.jsonl with >> (#467) (6)
     ✓ bkit-design.md 0ms
     ✓ bkit-plan.md 0ms
     ✓ bkit-build.md 0ms
     ✓ bkit-debug.md 0ms
     ✓ bkit-ship.md 0ms
     ✓ RED-PROOF: the hand-append shapes are caught 0ms
   ✓ bkit-ship.md — Step 6 SHIPPED row comes from bkit roadmap feature --strict (#380) (2)
     ✓ appends the SHIPPED row mechanically into the worktree ledger, not through the update-docs prompt 1ms
     ✓ a row that did not land stops the step — no re-grep of the ledger 0ms
   ✓ bkit-ship.md — canonical 12 ship-* step-key set (1)
     ✓ bkit-ship.md — canonical 12 ship-* step-key set publishes the canonical 12 ship-* step-key set (no invented names) 1ms
   ✓ bkit-ship.md — the merge is pinned to the head the gate passed (3)
     ✓ never merges through raw gh pr merge 0ms
     ✓ the merge gate runs before bkit prs merge, which is pinned to the gate's head 0ms
     ✓ F4a: the merge gate is handed the run's status log, and snapshots before deciding 0ms
   ✓ bkit-ship.md — dev writes live in commands (1)
     ✓ no fence checks out, commits to or pushes dev by hand; sync-dev, close and flush do 1ms
   ✓ bkit-ship.md — build-challenge remediation regressions (4)
     ✓ F1: Integrate merges origin/dev through bkit branches sync --merge and commits nothing by hand 1ms
     ✓ F2: no single-quoted jq program carries a shell ${...} expansion 0ms
     ✓ F3: ship never requests a server-side update-branch, through bkit or raw gh 0ms
     ✓ F5: gate code 11 (poll) routes to Step 9 alongside codes 10 and 14 0ms
   ✓ bkit-ship.md — #363: the auto-route marker comes from labels re-read at the merge (2)
     ✓ no cross-Bash-tool-call handoff survives anywhere in the workflow 0ms
     ✓ Step 10 re-reads the labels through the tracker and passes them to the merge 0ms
   ✓ bkit-ship.md — Failure Path single-write contract (8)
     ✓ records the failure through bkit workflows fail, booked where the runtime books 0ms
     ✓ flushes through bkit workflows handover --flush, once 0ms
     ✓ runs no git push, commit or second write of its own 1ms
     ✓ does not route any step back into the Failure Path 0ms
     ✓ writes .deferred-blocked with touch under BOOK_ROOT 0ms
     ✓ gitignores routing sentinels in the rendered file and the template source 1ms
     ✓ wires bkit ledgers into exactly 1 bash region 1ms
     ✓ every bkit ledgers stage / commit stops the step on a non-zero exit 1ms
   ✓ bkit-ship.md — issue-less runs and the main guard (5)
     ✓ Step 10 label re-read skips when ISSUE_ID is empty 1ms
     ✓ naming warning comes from worktrees setup, which reads the issue only when there is one 0ms
     ✓ Step 10 MCP merge asserts base dev 0ms
     ✓ Step 12.3 labels skip when ISSUE_ID is empty 0ms
     ✓ a ship on dev or main prints the engine refusal and stops 0ms
   ❯ bkit-ship.md — red CI names /bkit-debug (6)
     × Step 10 holds /bkit-debug {FID} as NEXT_STEP on every red-run route to the Failure Path or the Merge Question, and on no other 4ms
     × Step 2 holds NEXT_STEP on a failed check in the CI wait of a PR ship opened 2ms
     × the Merge Question's Stop arm names NEXT_STEP when held and Try again clears it 1ms
     × Close Workflow routes a red squash capstone to the Failure Path holding NEXT_STEP 1ms
     × the Failure Path passes --next-step only when NEXT_STEP is held and ends the final message with it 0ms
     × the Failure Path re-runs workflows fail without --next-step on exit 2 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/ship-invariants.test.ts > bkit-ship.md — red CI names /bkit-debug > Step 10 holds /bkit-debug {FID} as NEXT_STEP on every red-run route to the Failure Path or the Merge Question, and on no other
AssertionError: need a regenerable and a non-regenerable exit 12 arm: expected 1 to be greater than or equal to 2
 ❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts:989:7
    987|       red.length,
    988|       "need a regenerable and a non-regenerable exit 12 arm",
    989|     ).toBeGreaterThanOrEqual(2);
       |       ^
    990|     for (const arm of red) {
    991|       expect(arm, "exit 12 arm holds no NEXT_STEP").toMatch(/NEXT_STEP…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

 FAIL  .bkit/core/engine/audits/workflows/ship-invariants.test.ts > bkit-ship.md — red CI names /bkit-debug > Step 2 holds NEXT_STEP on a failed check in the CI wait of a PR ship opened
AssertionError: Step 2 failed check holds no NEXT_STEP: expected '     - **If** there is no check, **or…' to match /NEXT_STEP/

- Expected:
/NEXT_STEP/

+ Received:
"     - **If** there is no check, **or** any check failed or is pending → **Failure Path**."

 ❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts:1016:59
    1014|     expect(failedArms.length).toBeGreaterThanOrEqual(2);
    1015|     for (const b of failedArms) {
    1016|       expect(b, "Step 2 failed check holds no NEXT_STEP").toMatch(/NEX…
       |                                                           ^
    1017|       expect(sub5).toMatch(HOLDS_DEBUG);
    1018|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

 FAIL  .bkit/core/engine/audits/workflows/ship-invariants.test.ts > bkit-ship.md — red CI names /bkit-debug > the Merge Question's Stop arm names NEXT_STEP when held and Try again clears it
AssertionError: expected '   - **If** the answer is `Try again`…' to match /clear[^.\n]*NEXT_STEP/

- Expected:
/clear[^.\n]*NEXT_STEP/

+ Received:
"   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
     ```bash
     \"{BKIT}\" counters grant --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --point=ship.merge --file=\"{STATUS}\" --workflow=ship >/dev/null || exit 1
     ```
   - **If** the answer is `Stop` → create `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md` with the question, the answer and the line `Stopped by the owner; run stays IN_PROGRESS. /bkit-ship {FID} resumes at Step 10.`"

 ❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts:1028:22
    1026|       /^ {3}- \*\*If\*\* the answer is `Stop`/,
    1027|     );
    1028|     expect(tryAgain).toMatch(/clear[^.\n]*NEXT_STEP/);
       |                      ^
    1029|     const stop = section(mq, /^ {3}- \*\*If\*\* the answer is `Stop`/,…
    1030|     expect(stop, "Stop handover lacks Next step line").toMatch(/Next s…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯

 FAIL  .bkit/core/engine/audits/workflows/ship-invariants.test.ts > bkit-ship.md — red CI names /bkit-debug > Close Workflow routes a red squash capstone to the Failure Path holding NEXT_STEP
AssertionError: no Route: after runs gate --capstone-only: expected '1. Assert that the capstone passed at…' to match /Route:/

- Expected:
/Route:/

+ Received:
"1. Assert that the capstone passed at the squash commit. The block records the squash-merge CI verdict (`ship-merge-ci`) before routing:
   ```bash
   \"{BKIT}\" runs gate --squash-of=\"{PR_NUMBER}\" --repo=\"{OWNER_REPO}\" --capstone-only --record=\"{STATUS}\"
   ```
   Hold `head` as `SQUASH_SHA`.
2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is deleted only at its inspected landed tip and retained when origin refuses that conditional deletion; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:"

 ❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts:1038:63
    1036|     const step12 = section(readShip(), /^## .*Step 12 — /, /^## /);
    1037|     const sub1 = section(step12, /^1\. Assert that the capstone/, /^2\…
    1038|     expect(sub1, "no Route: after runs gate --capstone-only").toMatch(…
       |                                                               ^
    1039|     const route = sub1.slice(sub1.indexOf("Route:"));
    1040|     expect(route).toMatch(/Failure Path/);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/6]⎯

 FAIL  .bkit/core/engine/audits/workflows/ship-invariants.test.ts > bkit-ship.md — red CI names /bkit-debug > the Failure Path passes --next-step only when NEXT_STEP is held and ends the final message with it
AssertionError: workflows fail fence lacks --next-step=: expected '   "{BKIT}" workflows fail --post --i…' to match /--next-step=/

- Expected:
/--next-step=/

+ Received:
"   \"{BKIT}\" workflows fail --post --issue=\"{ISSUE_ID}\" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title=\"{Step Name}\" --sub-step={M} --error-file=\"{OUTBOX_ROOT}/error.md\" --stderr-file=\"{STDERR_FILE}\" --session-dir=\"{SESSION_DIR}\"
"

 ❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts:1048:62
    1046|     const block = failurePathBlock(readShip());
    1047|     const fence = fences(block).find((f) => /workflows fail --post/.te…
    1048|     expect(fence, "workflows fail fence lacks --next-step=").toMatch(/…
       |                                                              ^
    1049|     const step1 = section(block, /^1\. /, /^2\. /);
    1050|     expect(step1.replace(/```bash[\s\S]*?```/g, "")).toMatch(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/6]⎯

 FAIL  .bkit/core/engine/audits/workflows/ship-invariants.test.ts > bkit-ship.md — red CI names /bkit-debug > the Failure Path re-runs workflows fail without --next-step on exit 2
AssertionError: no exit 2 retry without --next-step: expected '1. Write the error message / tool res…' to match /exit 2/

- Expected:
/exit 2/

+ Received:
"1. Write the error message / tool response to `{OUTBOX_ROOT}/error.md` (`--error-file` dropped while `{OUTBOX_ROOT}` is not held). `{STDERR_FILE}` = `{OUTBOX}/stderr.log` holding the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command or `{OUTBOX}` is not set yet; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per current `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
   ```bash
   \"{BKIT}\" workflows fail --post --issue=\"{ISSUE_ID}\" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title=\"{Step Name}\" --sub-step={M} --error-file=\"{OUTBOX_ROOT}/error.md\" --stderr-file=\"{STDERR_FILE}\" --session-dir=\"{SESSION_DIR}\"
   ```
   Hold `handoverNeeded` as `HANDOVER_NEEDED`, `labels` as `LABELS` and `trackerState` as `TRACKER_STATE`.
   **If** exit non-zero → log `Lock removal failed` with the printed `lock` to stderr, then continue.
2. <!-- bkit:tracker true start -->"

 ❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts:1061:58
    1059|     const block = failurePathBlock(readShip());
    1060|     const step1 = section(block, /^1\. /, /^2\. /);
    1061|     expect(step1, "no exit 2 retry without --next-step").toMatch(/exit…
       |                                                          ^
    1062|     expect(step1).toMatch(/without `?--next-step/);
    1063|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/6]⎯


 Test Files  1 failed (1)
      Tests  6 failed | 61 passed (67)
   Start at  18:10:54
   Duration  205ms (tests 53%, setup 29%, import 7%, transform 7%, worker 4%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-A4vTce/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
````
