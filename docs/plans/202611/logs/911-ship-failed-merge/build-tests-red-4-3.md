Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 3

Plan: `docs/plans/202611/911-ship-failed-merge-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares" | red | failure: expected 2 not to be 2 // Object.is equality |
| 7 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "the Failure Path re-runs workflows fail without --next-step only on the --next-step refusal" | red | failure: expected ' **If** exit 2 **and** `--next-step…' not to match /exit 2\b/ |

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

[test-timeout-budget] load average 15.8 on 10 cores: unit limits 12400ms per test, 24800ms per hook (x2.48)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (166 tests | 1 failed) 138546ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 416ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1324ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 323ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 303ms
     ✓ writes no limits for a workflow with no ask point 289ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 268ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 349ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 391ms
       ✓ a new run in the same chat gets its own session row 332ms
       ✓ writes none outside Claude Code 250ms
     ✓ opens the next run after a finished one, and after another workflow's run 341ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 345ms
     ✓ design / plan / build / debug book in the current worktree 355ms
     ✓ refuses when the lock is live, writing no row 255ms
     ✓ --lock-held checks the lock is ours 357ms
     ✓ rejects an unknown workflow 158ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 290ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 456ms
   ✓ bkit workflows start — resume facts (8)
     ✓ a new run has no last step and no open decision 251ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 212ms
     ✓ an OPEN decision of an earlier run never resurfaces 254ms
     ✓ an OPEN decision mid-build prints its header fields 192ms
     ✓ openDecision carries the Gate header 190ms
     ✓ openDecision gate is null without the header 210ms
     ✓ openDecision gate ignores a Gate line below the header 203ms
     ✓ reads Test attempt from a tests pause 217ms
   ❯ bkit workflows fail (23)
     ✓ writes workflow-failed, releases its lock, and reports no handover 353ms
     ✓ writes no row when status.jsonl does not exist 277ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 313ms
     ✓ aborts a rebase only when one is in progress 749ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 543ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 544ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 319ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 332ms
     ✓ --max-exceeded says a handover is due without any sentinel 246ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 236ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 337ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 318ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 160ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 181ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 163ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 151ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 148ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 182ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 185ms
     ✓ bkit workflows fail refuses a multi-line or non-/bkit- --next-step before any write 235ms
     × bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 345ms
     ✓ bkit workflows fail treats an empty --next-step as absent 204ms
     ✓ a debug run in SOAK mode always needs a handover 297ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 695ms
       ✓ counts subagents of an earlier chat the run's session rows name 725ms
       ✓ records no context block, and still closes, outside a Claude Code session 780ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 722ms
     ✓ records ending held and publish false on the workflow-done row 771ms
     ✓ defaults the close row to ending done 725ms
     ✓ refuses an unknown ending 329ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 813ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 733ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 699ms
     ✓ always writes the telemetry, whatever the runtime 718ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 665ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 662ms
     ✓ an unwritable stats path is logged and never fails the close 688ms
     ✓ appends the completeness row before the workflow-done row 771ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 607ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 675ms
     ✓ writes one completeness row per close 1084ms
     ✓ leaves out the previous run's rows that share a second with this run's start 610ms
     ✓ still closes when the completeness check throws 712ms
     ✓ still closes when the completeness row write throws 664ms
     ✓ refuses without status.jsonl and writes nothing 222ms
     ✓ ship: run.pr, size of the squash commit, and coverage 839ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1084ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 719ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 666ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 949ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 792ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 983ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 772ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 747ms
     ✓ --record-step writes the close step's row before workflow-done 538ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 622ms
     ✓ --number without --outbox is a usage error 561ms
     ✓ --flush is ship only 235ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 780ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 738ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 877ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1024ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 647ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 338ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 329ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2112ms
     ✓ --flush with nothing to record commits and pushes nothing 1143ms
     ✓ --flush carries the named worktree's logs into the dev commit 2035ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2272ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2236ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2666ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2149ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2720ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2149ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2201ms
     ✓ --push on dev never carries a row whose references name another feature 2284ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2091ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 4050ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2859ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1076ms
     ✓ rejects --push with --flush, and --flush outside ship 222ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 2564ms
     ✓ preserves unlanded file deletions and ledger additions on close 5615ms
     ✓ preserves dirty work and uncertain branch evidence during close 5823ms
     ✓ preserves a local feature ref changed after its cleanup proof 5410ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3148ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2256ms
     ✓ a close that landed releases the lock 3060ms
     ✓ removes the worktree before it releases the lock 2819ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3692ms
       ✓ closePr refuses when the PR base is unknown 3416ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2561ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 178ms
     ✓ exits 12 when there is no versioned draft 242ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 191ms
     ✓ stamps the anchor from the runtime-resolved base commit 261ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 264ms
     ✓ promote copies the plan only 186ms
     ✓ rejects a workflow other than design or plan 185ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 334ms
     ✓ names the branch, not the remote-tracking ref, in each URL 290ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 315ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 305ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 756ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 499ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1438ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 670ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 551ms
     ✓ a second run's record does not let this FID's close commit 658ms
     ✓ record is present after workflows close and before the push 1405ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2592ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 237ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 255ms
     ✓ a run with no issue holds the prompt alone 292ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 533ms
     ✓ --plan is appended when the file exists and skipped when it does not 320ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 567ms
     ✓ a missing prompt file exits 13 238ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 1109ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 866ms
     ✓ puts each --line after the summary, in flag order 722ms
     ✓ refuses --final-return without --summary-file 175ms
     ✓ --summary prints the file and keeps a copy in --outbox 745ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 843ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 195ms
     ✓ a missing summary file exits 13 before anything is written 229ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 178ms
     ✓ a folder outside the outbox sessions folder is kept 130ms
     ✓ without --session-dir prints no sessionRemoved 122ms
   ✓ bkit workflows summary (11)
     ✓ passes publish into the summary input 36ms
     ✓ lists ship-failure rows from a run started before their removal 13ms
     ✓ summary is FAIL when a plan task is not done 12ms
     ✓ summary is CONCERNS when a deferral was written 17ms
     ✓ a deferral closed later no longer lowers the verdict, while its history stays on disk 16ms
     ✓ recomputes the verdict from resolved work without rewriting the earlier summary event 14ms
     ✓ summary recommends /bkit-debug on FAIL 27ms
     ✓ summary reports the last attempt 12ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 12ms
     ✓ a design summary carries the organised design's open questions 12ms
     ✓ refuses a status file with no run of the workflow, and a missing one 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows fail > bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares
AssertionError: expected 2 not to be 2 // Object.is equality
 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:906:30
    904|     expect(refused.err).toContain("--next-step must be one /bkit-* com…
    905|     expect(refused.code).not.toBe(0);
    906|     expect(refused.code).not.toBe(other.code);
       |                              ^
    907|     expect(refused.code).not.toBe(2);
    908|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 165 passed (166)
   Start at  19:21:46
   Duration  139.25s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-rchci1/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/ship-invariants.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/ship-invariants.test.ts

[test-timeout-budget] load average 19.2 on 10 cores: unit limits 14100ms per test, 28200ms per hook (x2.82)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge

 ❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (68 tests | 1 failed) 47ms
   ✓ deferred sweep — disabled-test evidence (4)
     ✓ adjudicates every scanner hit against the diff and current coverage 2ms
     ✓ requires scoped owner approval and current-contract evidence for retirement 0ms
     ✓ blocks scan errors, real disabling markers and unproven deletions 0ms
     ✓ records each disposition and requires complete adjudication before PASS 0ms
   ✓ ship reconciliation and retry contracts (7)
     ✓ reconciles and publishes feature code before bookkeeping on every ship path 2ms
     ✓ routes stale bases and refused merges through the bounded integration or validation loop 1ms
     ✓ routes late revalidation code and gate seventeen through reconciliation before merge 2ms
     ✓ ship reconciliation and retry contracts passes the actual merge target and defers branch deletion to guarded close 1ms
     ✓ routes MCP safety facts through engine decisions with transport accounting 2ms
     ✓ refreshes merge-aware feature coverage immediately before both reuse decisions 1ms
     ✓ ties deferred sweep and docs reuse to the recorded feature code state 1ms
   ✓ bkit-ship.md — staging hygiene (banned patterns) (2)
     ✓ has no `git add -A` anywhere (full content) 0ms
     ✓ has no literal `git add` anywhere — every stage goes through bkit ledgers 1ms
   ✓ bkit-ship.md — push-timing invariant (feature-branch pushes before merge) (7)
     ✓ pushes feature code during entry and base reconciliation, integration, bookkeeping and fixes 1ms
     ✓ regenerates only in the Merge Gate, after a red CI run, never up front in Base Check 0ms
     ✓ never force-pushes, with or without lease 1ms
     ✓ the Integrate push is a plain push of the locally merged branch 0ms
     ✓ the pre-merge bookkeeping push is a plain push — never forced 0ms
     ✓ the pre-merge bookkeeping commit stages through bkit ledgers --scope=pr, after the step-done row 0ms
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
     ✓ bkit-design.md 1ms
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
     ✓ F3: ship never requests a server-side update-branch, through bkit or raw gh 1ms
     ✓ F5: gate code 11 (poll) routes to Step 9 alongside codes 10 and 14 0ms
   ✓ bkit-ship.md — #363: the auto-route marker comes from labels re-read at the merge (2)
     ✓ no cross-Bash-tool-call handoff survives anywhere in the workflow 0ms
     ✓ Step 10 re-reads the labels through the tracker and passes them to the merge 0ms
   ❯ bkit-ship.md — Failure Path single-write contract (9)
     ✓ records the failure through bkit workflows fail, booked where the runtime books 0ms
     ✓ flushes through bkit workflows handover --flush, once 0ms
     ✓ runs no git push, commit or second write of its own 1ms
     × the Failure Path re-runs workflows fail without --next-step only on the --next-step refusal 5ms
     ✓ does not route any step back into the Failure Path 0ms
     ✓ writes .deferred-blocked with touch under BOOK_ROOT 1ms
     ✓ gitignores routing sentinels in the rendered file and the template source 1ms
     ✓ wires bkit ledgers into exactly 1 bash region 1ms
     ✓ every bkit ledgers stage / commit stops the step on a non-zero exit 1ms
   ✓ bkit-ship.md — issue-less runs and the main guard (5)
     ✓ Step 10 label re-read skips when ISSUE_ID is empty 1ms
     ✓ naming warning comes from worktrees setup, which reads the issue only when there is one 0ms
     ✓ Step 10 MCP merge asserts base dev 0ms
     ✓ Step 12.3 labels skip when ISSUE_ID is empty 0ms
     ✓ a ship on dev or main prints the engine refusal and stops 0ms
   ✓ bkit-ship.md — red CI names /bkit-debug (6)
     ✓ Step 10 holds /bkit-debug {FID} as NEXT_STEP on every red-run route to the Failure Path or the Merge Question, and on no other 1ms
     ✓ Step 2 holds NEXT_STEP on a failed check in the CI wait of a PR ship opened 1ms
     ✓ the Merge Question's Stop arm names NEXT_STEP when held and Try again clears it 0ms
     ✓ Close Workflow routes a red squash capstone to the Failure Path holding NEXT_STEP 0ms
     ✓ the Failure Path passes --next-step only when NEXT_STEP is held and ends the final message with it 0ms
     ✓ the Failure Path re-runs workflows fail without --next-step on exit 2 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/ship-invariants.test.ts > bkit-ship.md — Failure Path single-write contract > the Failure Path re-runs workflows fail without --next-step only on the --next-step refusal
AssertionError: expected '   **If** exit 2 **and** `--next-step…' not to match /exit 2\b/

- Expected:
/exit 2\b/

+ Received:
"   **If** exit 2 **and** `--next-step` was passed → the value was refused before any write: clear `NEXT_STEP` and run the block again without `--next-step`, then route on that exit."

 ❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts:839:23
    837|     expect(reruns, "no re-run line without --next-step").toHaveLength(…
    838|     const rerun = reruns.join("\n");
    839|     expect(rerun).not.toMatch(/exit 2\b/);
       |                       ^
    840|   });
    841|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 67 passed (68)
   Start at  19:24:06
   Duration  195ms (tests 51%, setup 32%, transform 7%, import 6%, worker 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-akrmxT/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
