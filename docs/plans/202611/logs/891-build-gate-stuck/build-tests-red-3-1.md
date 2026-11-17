Enforced: true
Red: 13
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/891-build-gate-stuck-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > base check all with no items recommends Stop" | red | failure: expected 2 to be +0 // Object.is equality |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > base check all with items recommends Decide" | red | failure: expected 2 to be +0 // Object.is equality |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > base check all in adopt mode adds the merge sentence" | red | failure: expected '' to contain 'merge `dev` into the branch before re…' |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > base check some names the split" | red | failure: expected 2 to be +0 // Object.is equality |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > base check none keeps the trend and names the branch" | red | failure: expected 2 to be +0 // Object.is equality |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > base check unknown keeps the trend and says why" | red | failure: expected 2 to be +0 // Object.is equality |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > Try again is offered for every base verdict" | red | failure: all with 0 items: expected '' to match /\*\*Q1 — Verify:\*\…/ B\) (Decide\|Stop) |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > base check prints how many failing tests are also red on base" | red | failure: expected '' to contain 'Also red on base abc1234: 3 of 3 (loc…' |
| 7 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > a missing or malformed base check is a usage error that names the problem" | red | failure: expected '[bkit-decisions] unknown flag --base-…' to contain 'no-such-base.json' |
| 8 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=rerun > records the re-run under Q1 and closes the file" | red | failure: expected 2 to be +0 // Object.is equality |
| 8 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=rerun > refuses a file without Gate: FAIL or not OPEN" | red | failure: expected '[bkit-decisions] --by must be headles…' to contain 'Gate: FAIL' |
| 9 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows start — resume facts > openDecision carries the Gate header" | red | failure: expected { …(9) } to match object { decision: 1, gate: 'FAIL' } (8 matching properties omitted from actual) |
| 9 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows start — resume facts > openDecision gate is null without the header" | red | failure: expected undefined to be null |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/decisions.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/decisions.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/decisions.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/decisions.test.ts

[test-timeout-budget] load average 8.5 on 10 cores: unit limits 8750ms per test, 17500ms per hook (x1.75)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts (37 tests | 11 failed) 522ms
   ❯ bkit decisions compose (19)
     ✓ writes the header, one item per question and the reply line 15ms
     ✓ compose letters every option and the recommended one 13ms
     ✓ refuses an item whose recommendation is not one of its options 12ms
     ✓ refuses an item with more options than letters 12ms
     ✓ round-trips the last lettered option through parseDecisionItems 12ms
     ✓ --loop adds the attempt line, the progress block and the loop question as Q1 13ms
     ✓ --loop letters the loop question's options and recommendation 12ms
     ✓ --loop=holistic counts only the rounds since the whole-feature check was last clean 12ms
     ✓ prints the group gate's failing tests per round for the verify loop 12ms
     × base check all with no items recommends Stop 15ms
     × base check all with items recommends Decide 12ms
     × base check all in adopt mode adds the merge sentence 11ms
     × base check some names the split 12ms
     × base check none keeps the trend and names the branch 12ms
     × base check unknown keeps the trend and says why 12ms
     × Try again is offered for every base verdict 12ms
     × base check prints how many failing tests are also red on base 11ms
     × a missing or malformed base check is a usage error that names the problem 12ms
     ✓ --loop needs --file 12ms
   ❯ bkit decisions apply --by=rerun (2)
     × records the re-run under Q1 and closes the file 12ms
     × refuses a file without Gate: FAIL or not OPEN 12ms
   ✓ bkit decisions apply --by=headless (3)
     ✓ takes each recommendation: an Accept is assumed, Fix now is written as such 19ms
     ✓ leaves hard blockers for the owner and exits with the hard-blocker code 18ms
     ✓ labels the runtime from the main checkout's Cursor marker when run in a build worktree 59ms
   ✓ parseDecisionItems (4)
     ✓ parseDecisionItems keeps the bare option name, dropping the letter 0ms
     ✓ a decision file written before the letters still parses 0ms
     ✓ parseDecisionItems reads a lettered decision as the option its letter labels 0ms
     ✓ a lettered assumed Accept decision still reads as assumed 0ms
   ✓ applyRecommendations (3)
     ✓ a Try again loop answer settles the loop alone; the items wait for the next round 0ms
     ✓ a lettered recommendation still settles its item by name 0ms
     ✓ applyRecommendations reads a lettered Try again decision as the loop answer 0ms
   ✓ bkit decisions apply --by=owner and pending (6)
     ✓ pending lists each assumed Accept nobody confirmed 24ms
     ✓ --confirm writes the owner's decision row and the real Accept; --reject marks it rejected 40ms
     ✓ refuses an item that is not an assumed Accept, or a call without one of --confirm / --reject 17ms
     ✓ --defer writes one needs-decision deferral per listed item, then lists none 36ms
     ✓ --defer letters the options in the deferral row 30ms
     ✓ refuses a malformed --month 17ms

⎯⎯⎯⎯⎯⎯ Failed Tests 11 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > base check all with no items recommends Stop
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:371:20
    369|   it("base check all with no items recommends Stop", async () => {
    370|     const { r, text } = await composeWithBase({}, []);
    371|     expect(r.code).toBe(0);
       |                    ^
    372|     expect(r.json).toMatchObject({ loopRecommended: "Stop" });
    373|     expect(text).toMatch(/Recommended: B\) Stop — .*fail on `dev` too/…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > base check all with items recommends Decide
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:379:20
    377|   it("base check all with items recommends Decide", async () => {
    378|     const { r, text } = await composeWithBase({}, ITEMS);
    379|     expect(r.code).toBe(0);
       |                    ^
    380|     expect(r.json).toMatchObject({ loopRecommended: "Decide" });
    381|     expect(text).toMatch(/Recommended: B\) Decide — .*fail on `dev` to…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > base check all in adopt mode adds the merge sentence
AssertionError: expected '' to contain 'merge `dev` into the branch before re…'

- Expected
+ Received

- merge `dev` into the branch before resuming

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:386:24
    384|   it("base check all in adopt mode adds the merge sentence", async () …
    385|     const adopt = await composeWithBase({ adopt: true }, []);
    386|     expect(adopt.text).toContain("merge `dev` into the branch before r…
       |                        ^
    387|     const plain = await composeWithBase({ adopt: false }, []);
    388|     expect(plain.text).not.toContain("merge `dev` into the branch befo…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > base check some names the split
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:396:20
    394|       ITEMS,
    395|     );
    396|     expect(r.code).toBe(0);
       |                    ^
    397|     expect(text).toContain("a round can fix 2 of 5");
    398|     expect(text).toContain("the build will still stop on the 3 from `d…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > base check none keeps the trend and names the branch
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:407:20
    405|       ITEMS,
    406|     );
    407|     expect(r.code).toBe(0);
       |                    ^
    408|     expect(r.json).toMatchObject({ loopRecommended: "Decide" });
    409|     expect(text).toMatch(/Recommended: B\) Decide — the failures come …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > base check unknown keeps the trend and says why
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:423:20
    421|       ITEMS,
    422|     );
    423|     expect(r.code).toBe(0);
       |                    ^
    424|     expect(r.json).toMatchObject({ loopRecommended: "Decide" });
    425|     expect(text).toMatch(/Recommended: B\) Decide — cause unknown: no …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > Try again is offered for every base verdict
AssertionError: all with 0 items: expected '' to match /\*\*Q1 — Verify:\*\…/ B\) (Decide|Stop)

- Expected:
/\*\*Q1 — Verify:\*\*[^\n]*\nOptions: A\) Try again \/ B\) (Decide|Stop)/

+ Received:
""

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:438:76
    436|       for (const items of [[], ITEMS]) {
    437|         const { text } = await composeWithBase(over, items);
    438|         expect(text, `${String(over.verdict)} with ${items.length} ite…
       |                                                                            ^
    439|           /\*\*Q1 — Verify:\*\*[^\n]*\nOptions: A\) Try again \/ B\) (…
    440|         );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > base check prints how many failing tests are also red on base
AssertionError: expected '' to contain 'Also red on base abc1234: 3 of 3 (loc…'

- Expected
+ Received

- Also red on base abc1234: 3 of 3 (local run)

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:447:22
    445|   it("base check prints how many failing tests are also red on base", …
    446|     const all = await composeWithBase({}, []);
    447|     expect(all.text).toContain("Also red on base abc1234: 3 of 3 (loca…
       |                      ^
    448|     const unknown = await composeWithBase(
    449|       { verdict: "unknown", reason: "no JUnit report", base: null, sou…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > a missing or malformed base check is a usage error that names the problem
AssertionError: expected '[bkit-decisions] unknown flag --base-…' to contain 'no-such-base.json'

- Expected
+ Received

- no-such-base.json
+ [bkit-decisions] unknown flag --base-check
+

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:468:27
    466|     );
    467|     expect(missing.r.code).toBe(2);
    468|     expect(missing.r.err).toContain("no-such-base.json");
       |                           ^
    469|     expect(missing.r.err).not.toContain("unknown flag");
    470|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=rerun > records the re-run under Q1 and closes the file
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:494:20
    492|     expect(fs.readFileSync(out, "utf-8")).toContain("Gate: FAIL");
    493|     const r = await rerun(root, out);
    494|     expect(r.code).toBe(0);
       |                    ^
    495|     expect(r.json).toMatchObject({ status: "DECIDED" });
    496|     const text = fs.readFileSync(out, "utf-8");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=rerun > refuses a file without Gate: FAIL or not OPEN
AssertionError: expected '[bkit-decisions] --by must be headles…' to contain 'Gate: FAIL'

- Expected
+ Received

- Gate: FAIL
+ [bkit-decisions] --by must be headless or owner
+

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:511:24
    509|     const noGate = await rerun(root, plain.out);
    510|     expect(noGate.code).toBe(2);
    511|     expect(noGate.err).toContain("Gate: FAIL");
       |                        ^
    512|     expect(noGate.err).not.toContain("--by must be headless or owner");
    513|     expect(fs.readFileSync(plain.out, "utf-8")).toBe(before);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/11]⎯


 Test Files  1 failed (1)
      Tests  11 failed | 26 passed (37)
   Start at  23:53:05
   Duration  688ms (tests 82%, import 9%, transform 6%, setup 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Ruyqny/junit.xml
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

[test-timeout-budget] load average 8.5 on 10 cores: unit limits 8750ms per test, 17500ms per hook (x1.75)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (156 tests | 3 failed) 36194ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 128ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 390ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 90ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 84ms
     ✓ writes no limits for a workflow with no ask point 82ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 78ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 98ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 115ms
       ✓ a new run in the same chat gets its own session row 110ms
       ✓ writes none outside Claude Code 82ms
     ✓ opens the next run after a finished one, and after another workflow's run 102ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 107ms
     ✓ design / plan / build / debug book in the current worktree 106ms
     ✓ refuses when the lock is live, writing no row 72ms
     ✓ --lock-held checks the lock is ours 110ms
     ✓ rejects an unknown workflow 61ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 94ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 141ms
   ❯ bkit workflows start — resume facts (7)
     ✓ a new run has no last step and no open decision 82ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 78ms
     ✓ an OPEN decision of an earlier run never resurfaces 98ms
     × an OPEN decision mid-build prints its header fields 81ms
     × openDecision carries the Gate header 76ms
     × openDecision gate is null without the header 79ms
     ✓ reads Test attempt from a tests pause 77ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 123ms
     ✓ writes no row when status.jsonl does not exist 100ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 92ms
     ✓ aborts a rebase only when one is in progress 200ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 167ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 180ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 111ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 114ms
     ✓ --max-exceeded says a handover is due without any sentinel 95ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 87ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 116ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 118ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 59ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 60ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 58ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 60ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 60ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 70ms
     ✓ a debug run in SOAK mode always needs a handover 93ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 209ms
       ✓ counts subagents of an earlier chat the run's session rows name 213ms
       ✓ records no context block, and still closes, outside a Claude Code session 200ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 207ms
     ✓ records ending held and publish false on the workflow-done row 196ms
     ✓ defaults the close row to ending done 200ms
     ✓ refuses an unknown ending 87ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 213ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 196ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 210ms
     ✓ always writes the telemetry, whatever the runtime 186ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 157ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 177ms
     ✓ an unwritable stats path is logged and never fails the close 199ms
     ✓ appends the completeness row before the workflow-done row 204ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 199ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 206ms
     ✓ writes one completeness row per close 308ms
     ✓ leaves out the previous run's rows that share a second with this run's start 182ms
     ✓ still closes when the completeness check throws 204ms
     ✓ still closes when the completeness row write throws 199ms
     ✓ refuses without status.jsonl and writes nothing 67ms
     ✓ ship: run.pr, size of the squash commit, and coverage 243ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 317ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 206ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 185ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 262ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 244ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 273ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 239ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 239ms
     ✓ --record-step writes the close step's row before workflow-done 166ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 182ms
     ✓ --number without --outbox is a usage error 172ms
     ✓ --flush is ship only 77ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 276ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 266ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 292ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 289ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 218ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 110ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 100ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 676ms
     ✓ --flush with nothing to record commits and pushes nothing 355ms
     ✓ --flush carries the named worktree's logs into the dev commit 643ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 799ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 725ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 863ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 698ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 908ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 705ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 710ms
     ✓ --push on dev never carries a row whose references name another feature 727ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 729ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 1266ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 787ms
     ✓ --push commits in the named worktree, not the checkout it runs from 331ms
     ✓ rejects --push with --flush, and --flush outside ship 65ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 788ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 642ms
     ✓ a close that landed releases the lock 767ms
     ✓ removes the worktree before it releases the lock 762ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 1350ms
       ✓ closePr refuses when the PR base is unknown 1243ms
     ✓ leaves a worktree no workflow created, and its branch, in place 703ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 64ms
     ✓ exits 12 when there is no versioned draft 63ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 62ms
     ✓ stamps the anchor from the runtime-resolved base commit 93ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 103ms
     ✓ promote copies the plan only 65ms
     ✓ rejects a workflow other than design or plan 55ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 116ms
     ✓ names the branch, not the remote-tracking ref, in each URL 114ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 101ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 107ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 272ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 151ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 409ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 193ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 176ms
     ✓ a second run's record does not let this FID's close commit 214ms
     ✓ record is present after workflows close and before the push 394ms
     ✓ failed handover from dev removes the record and keeps recorded paths 786ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 73ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 78ms
     ✓ a run with no issue holds the prompt alone 72ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 145ms
     ✓ --plan is appended when the file exists and skipped when it does not 101ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 156ms
     ✓ a missing prompt file exits 13 69ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 273ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 209ms
     ✓ puts each --line after the summary, in flag order 206ms
     ✓ refuses --final-return without --summary-file 59ms
     ✓ --summary prints the file and keeps a copy in --outbox 203ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 206ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 61ms
     ✓ a missing summary file exits 13 before anything is written 59ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 70ms
     ✓ a folder outside the outbox sessions folder is kept 65ms
     ✓ without --session-dir prints no sessionRemoved 59ms
   ✓ bkit workflows summary (10)
     ✓ passes publish into the summary input 20ms
     ✓ summary is FAIL when a plan task is not done 8ms
     ✓ summary is CONCERNS when a deferral was written 8ms
     ✓ a deferral closed later no longer lowers the verdict, while its history stays on disk 7ms
     ✓ recomputes the verdict from resolved work without rewriting the earlier summary event 8ms
     ✓ summary recommends /bkit-debug on FAIL 15ms
     ✓ summary reports the last attempt 8ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 7ms
     ✓ a design summary carries the organised design's open questions 8ms
     ✓ refuses a status file with no run of the workflow, and a missing one 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows start — resume facts > an OPEN decision mid-build prints its header fields
AssertionError: expected { …(9) } to deeply equal { …(10) }

- Expected
+ Received

@@ -1,10 +1,9 @@
  {
    "decision": 2,
    "file": "docs/plans/202607/logs/12-export-csv/build-decision-1-2.md",
    "from": "verify",
-   "gate": null,
    "group": 2,
    "pauseStep": 7,
    "plan": "docs/plans/202607/12-export-csv-plan.md",
    "question": "VERIFY_LOOP",
    "testAttempt": null,

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:553:33
    551|     expect(r.code).toBe(0);
    552|     expect(r.json.lastDoneStep).toBe("build-plan-verify");
    553|     expect(r.json.openDecision).toEqual({
       |                                 ^
    554|       file: `${REL}/build-decision-1-2.md`,
    555|       decision: 2,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows start — resume facts > openDecision carries the Gate header
AssertionError: expected { …(9) } to match object { decision: 1, gate: 'FAIL' }
(8 matching properties omitted from actual)

- Expected
+ Received

  {
    "decision": 1,
-   "gate": "FAIL",
  }

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:581:33
    579|     const r = await run(cwd, wf("start", "build"));
    580|     expect(r.code).toBe(0);
    581|     expect(r.json.openDecision).toMatchObject({ decision: 1, gate: "FA…
       |                                 ^
    582|   });
    583|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows start — resume facts > openDecision gate is null without the header
AssertionError: expected undefined to be null

- Expected:
null

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:598:38
    596|     expect(r.code).toBe(0);
    597|     expect(r.json.openDecision).not.toBeNull();
    598|     expect(r.json.openDecision.gate).toBeNull();
       |                                      ^
    599|   });
    600|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 153 passed (156)
   Start at  23:53:06
   Duration  36.36s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-9EOWE4/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
