Enforced: true
Red: 10
Accepted: 1
Updated: 5
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 9, attempt 1

Plan: `docs/plans/202611/958-agents-orchestrator-write-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 32 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged" | updated | taken over from TASK 12; it existed before the run (`0431e556f`) and passes: the verifier judges its diff — it may add expectations, never remove or loosen one |
| 32 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" | updated | taken over from TASK 12; it existed before the run (`0431e556f`) and passes: the verifier judges its diff — it may add expectations, never remove or loosen one |
| 32 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=rerun > records the re-run as a Q1 row and the pause reads DECIDED" | passed-accepted | passes; accepted by the tests step: apply --by=rerun already appends the Q1 row with by rerun (decisions.ts:686) |
| 32 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > pending --defer keeps the answer and marks it needs-decision" | red | failure: expected { workflow: 'ship', …(9) } to match object { q: 1, …(2) } (7 matching properties omitted from actual) |
| 33 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1" | red | failure: expected 2 to be +0 // Object.is equality |
| 33 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file" | red | failure: expected 2 to be +0 // Object.is equality |
| 33 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer=Q2=B --fix-task=Q2=31 records Fix now with its task" | red | failure: expected 2 to be +0 // Object.is equality |
| 33 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > refuses an --answer that is not Q{n} and an option letter" | red | failure: expected 2 to be +0 // Object.is equality |
| 33 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > refuses --reason as an unknown flag" | red | failure: expected +0 to be 2 // Object.is equality |
| 33 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > a multi-line --reason-file reaches only the decisions.jsonl rationale" | red | failure: expected '{"type":"workflow-started","workflow"…' not to contain 'MULTILINE-REASON-MARKER' |
| 34 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses Q1 when the engine file holds the loop question" | updated | taken over from TASK 10; it existed before the run (`0431e556f`) and passes: the verifier judges its diff — it may add expectations, never remove or loosen one |
| 34 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > accepts questions numbered from Q1 when the pause has no engine file" | updated | taken over from TASK 10; it existed before the run (`0431e556f`) and passes: the verifier judges its diff — it may add expectations, never remove or loosen one |
| 34 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options" | updated | taken over from TASK 25; it existed before the run (`0431e556f`) and passes: the verifier judges its diff — it may add expectations, never remove or loosen one |
| 34 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a Decision, Fix task, Rejected or Deferred line in the orchestrator's file" | red | failure: Decision: Accept — looks fine: expected +0 to be 6 // Object.is equality |
| 35 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions answers > prints the last appended answer per question with its writer" | red | failure: expected 2 to be +0 // Object.is equality |
| 35 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions answers > prints an old single-file decision's in-file answers" | red | failure: expected 2 to be +0 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/decisions.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/decisions.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/decisions.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/decisions.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts (87 tests | 10 failed) 2125ms
   ✓ bkit decisions apply --by=rerun (6)
     ✓ records the re-run under Q1 and closes the file 40ms
     ✓ records the re-run as a Q1 row and the pause reads DECIDED 18ms
     ✓ refuses a file without Gate: FAIL or not OPEN 13ms
     ✓ refuses a Gate: FAIL file whose Q1 is an item, not the loop question 12ms
     ✓ refuses a loop file with an undecided item question 25ms
     ✓ refuses a file whose only Gate: FAIL line is in an item body 12ms
   ✓ bkit decisions skip (8)
     ✓ decisions skip exits 0 when all five conditions hold 12ms
     ✓ decisions skip exits 1 and names the fact for a Gate: FAIL header 12ms
     ✓ decisions skip exits 1 when the Source changed header is missing 12ms
     ✓ decisions skip exits 1 when an item is not Accept 12ms
     ✓ decisions skip exits 1 when the loop question is not Decide 12ms
     ✓ decisions skip exits 1 for a pause that is not from verify or holistic 12ms
     ✓ keeps the re-run when the owner's Fix now beats an engine Accept (assumed) 23ms
     ✓ decisions skip exits 2 for a missing file 11ms
   ✓ bkit decisions apply --by=headless (4)
     ✓ takes each recommendation: an Accept is assumed, Fix now is written as such 40ms
     ✓ leaves hard blockers for the owner and exits with the hard-blocker code 25ms
     ✓ apply --by=headless leaves a Recommended: none item for the owner 26ms
     ✓ labels the runtime from the main checkout's Cursor marker when run in a build worktree 63ms
   ✓ parseDecisionItems (11)
     ✓ parseDecisionItems keeps the bare option name, dropping the letter 0ms
     ✓ a decision file written before the letters still parses 0ms
     ✓ parseDecisionItems reads a lettered decision as the option its letter labels 0ms
     ✓ parseDecisionItems reads one option per line and drops each effect 0ms
     ✓ parseDecisionItems reads Recommended: none as a hard blocker 0ms
     ✓ a lettered decision in a per-line file reads as the option its letter labels 0ms
     ✓ a per-line option whose text holds a slash or a middle dot stays one option 0ms
     ✓ a file mixing both layouts parses each item in its own layout 0ms
     ✓ reads the task a Fix now item names on its Fix task line 0ms
     ✓ decisionHeader reads the header block only 0ms
     ✓ a lettered assumed Accept decision still reads as assumed 0ms
   ✓ applyRecommendations (3)
     ✓ a Try again loop answer settles the loop alone; the items wait for the next round 0ms
     ✓ a lettered recommendation still settles its item by name 0ms
     ✓ applyRecommendations reads a lettered Try again decision as the loop answer 0ms
   ❯ bkit decisions apply --by=owner and pending (9)
     ✓ pending lists each assumed Accept nobody confirmed 46ms
     ✓ --confirm writes the owner's decision row and the real Accept; --reject marks it rejected 96ms
     ✓ apply --by=owner --confirm confirms an assumed item in a per-line file 54ms
     ✓ refuses an item that is not an assumed Accept, or a call without one of --confirm / --reject 32ms
     ✓ --defer writes one needs-decision deferral per listed item, then lists none 80ms
     × pending --defer keeps the answer and marks it needs-decision 71ms
     ✓ --defer letters the options in the deferral row 64ms
     ✓ pending refuses a --fid that climbs out of the log folder and reads and writes nothing 17ms
     ✓ refuses a malformed --month 18ms
   ❯ bkit decisions check (9)
     ✓ refuses a question without lettered options, naming it 12ms
     ✓ refuses Q1 when the engine file holds the loop question 12ms
     ✓ refuses a question line written with an en dash, naming the line 12ms
     ✓ accepts a correctly written question numbered Q10 12ms
     ✓ refuses a file with no question when the engine file holds no loop question 12ms
     ✓ refuses a Status, Source changed or Gate line in the orchestrator's header 35ms
     ✓ refuses a decision file whose question count no longer matches the engine file's loop options 11ms
     ✓ accepts questions numbered from Q1 when the pause has no engine file 11ms
     × refuses a Decision, Fix task, Rejected or Deferred line in the orchestrator's file 13ms
   ✓ bkit decisions counts (26)
     ✓ writes the attempt line, progress, base check and loop question into the engine file only 25ms
     ✓ carries the attempt, max and progress numbers in the row's loop 24ms
     ✓ recommends Decide when the last round changed no source 23ms
     ✓ recommends Try again when the last round made progress 23ms
     ✓ engine file recommends Stop when the base check is all and no questions are counted 23ms
     ✓ engine file recommends Decide when the base check is all and questions are counted 23ms
     ✓ writes Source changed and Gate into the engine file for a verify pause with no loop 27ms
     ✓ prints the attempt, progress, base and loop question lines in show 39ms
     ✓ --loop=holistic counts only the rounds since the whole-feature check was last clean 41ms
     ✓ holistic limit pause prints the rounds run, never above max 24ms
     ✓ prints the group gate's failing tests per round for the verify loop 25ms
     ✓ --loop on an unknown trend says the limit is used up 27ms
     ✓ --loop on an unknown trend below the limit does not say the limit is used up 24ms
     ✓ base check all in adopt mode adds the merge sentence 48ms
     ✓ base check some with undetermined cases counts only the branch's as fixable 25ms
     ✓ --loop writes an effect for each loop option, Stop included when no item is counted 23ms
     ✓ prints the holistic gate's failing tests per round for the holistic loop 24ms
     ✓ --loop on an unknown trend recommends Try again without claiming progress 23ms
     ✓ base check all says a gate still red after resume comes from this branch 24ms
     ✓ base check some names the split 24ms
     ✓ base check none keeps the trend and names the branch 23ms
     ✓ base check unknown keeps the trend and says why 23ms
     ✓ Try again is offered for every base verdict 186ms
     ✓ base check prints how many failing tests are also red on base 47ms
     ✓ a missing or malformed base check is a usage error that names the problem 25ms
     ✓ --loop needs --file 11ms
   ✓ bkit decisions apply --by=headless (1)
     ✓ writes assumed decisions into the engine file and leaves the decision file unchanged 29ms
   ❯ bkit decisions apply --by=owner and pending (7)
     ✓ writes a confirmation into the engine file 49ms
     × --answer writes the loop answer under the engine file's Q1 12ms
     × --answer reads the owner's reason from --reason-file 13ms
     × --answer=Q2=B --fix-task=Q2=31 records Fix now with its task 13ms
     × refuses an --answer that is not Q{n} and an option letter 12ms
     × refuses --reason as an unknown flag 58ms
     × a multi-line --reason-file reaches only the decisions.jsonl rationale 59ms
   ✓ bkit decisions apply --by=headless (1)
     ✓ exits non-zero on a decision file with no readable question 12ms
   ❯ bkit decisions answers (2)
     × prints the last appended answer per question with its writer 12ms
     × prints an old single-file decision's in-file answers 11ms

⎯⎯⎯⎯⎯⎯ Failed Tests 10 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=owner and pending > pending --defer keeps the answer and marks it needs-decision
AssertionError: expected { workflow: 'ship', …(9) } to match object { q: 1, …(2) }
(7 matching properties omitted from actual)

- Expected
+ Received

  {
    "assumed": true,
-   "deferred": "needs-decision",
+   "deferred": true,
    "q": 1,
  }

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:948:19
    946|     expect(deferredRows).toHaveLength(2);
    947|     for (const [i, row] of deferredRows.entries()) {
    948|       expect(row).toMatchObject({ q: i + 1, deferred: "needs-decision"…
       |                   ^
    949|       expect(String(row.answer)).toMatch(/^Accept \(assumed\)/);
    950|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions check > refuses a Decision, Fix task, Rejected or Deferred line in the orchestrator's file
AssertionError: Decision: Accept — looks fine: expected +0 to be 6 // Object.is equality

- Expected
+ Received

- 6
+ 0

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1157:28
    1155|       );
    1156|       const r = await run(["decisions", "check", `--file=${file}`], ro…
    1157|       expect(r.code, line).toBe(6);
       |                            ^
    1158|       const said = `${JSON.stringify(r.json)}${r.err}`;
    1159|       expect(said, line).toContain("Q1");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1867:20
    1865|     const before = fs.readFileSync(out, "utf-8");
    1866|     const r = await owner(root, out, "--answer=Q1=A");
    1867|     expect(r.code).toBe(0);
       |                    ^
    1868|     expect(fs.readFileSync(out, "utf-8")).toBe(before);
    1869|     expect(fs.existsSync(engineOf(out))).toBe(false);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1889:60
    1887|     expect(fs.existsSync(engineOf(out))).toBe(false);
    1888|     expect(fs.existsSync(path.join(root, "pwned"))).toBe(false);
    1889|     expect((await owner(root, out, "--answer=Q1=A")).code).toBe(0);
       |                                                            ^
    1890|     expect(answerRows(out)).toHaveLength(1);
    1891|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=owner and pending > --answer=Q2=B --fix-task=Q2=31 records Fix now with its task
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1898:20
    1896|     seedStatus(logs);
    1897|     const r = await owner(root, out, "--answer=Q2=B", "--fix-task=Q2=3…
    1898|     expect(r.code).toBe(0);
       |                    ^
    1899|     const answers = answerRows(out);
    1900|     expect(answers).toHaveLength(1);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=owner and pending > refuses an --answer that is not Q{n} and an option letter
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1917:60
    1915|     expect((await owner(root, out, "--answer=Q1=A", "--fix-task=Q1=31"…
    1916|     expect(answerRows(out)).toEqual([]);
    1917|     expect((await owner(root, out, "--answer=Q2=B")).code).toBe(0);
       |                                                            ^
    1918|     expect(answerRows(out)).toHaveLength(1);
    1919|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=owner and pending > refuses --reason as an unknown flag
AssertionError: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1925:26
    1923|     const answersBefore = answerRows(out).length;
    1924|     const confirm = await owner(root, out, "--q=1", "--confirm", "--re…
    1925|     expect(confirm.code).toBe(2);
       |                          ^
    1926|     expect(`${JSON.stringify(confirm.json)}${confirm.err}`).toContain(…
    1927|     expect(answerRows(out)).toHaveLength(answersBefore);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=owner and pending > a multi-line --reason-file reaches only the decisions.jsonl rationale
AssertionError: expected '{"type":"workflow-started","workflow"…' not to contain 'MULTILINE-REASON-MARKER'

- Expected
+ Received

- MULTILINE-REASON-MARKER
+ {"type":"workflow-started","workflow":"build","at":"2026-10-01T00:00:00Z"}
+ {"workflow":"build","at":"2026-11-19T02:35:49Z","file":"../../../../../../../var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-decisions-DAVvHd/docs/plans/202610/logs/7-x/build-decision-1-1.md","type":"decision-answer","q":1,"answer":"Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-11-19)","by":"headless","assumed":true,"runtime":"GITHUB_ACTION"}
+ {"workflow":"ship","at":"2026-11-19T02:35:49Z","file":"../../../../../../../var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-decisions-DAVvHd/docs/plans/202610/logs/7-x/build-decision-1-1.md","type":"decision-answer","q":1,"answer":"Accept — MULTILINE-REASON-MARKER first line\n**Q3 — Injected question:** is it fine?\nDecision: Accept — injected (owner, confirmed at ship, 2026-11-19)","by":"owner"}
+

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1952:75
    1950|     expect(ledger).toContain(marker);
    1951|     expect(ledger).toContain("Injected question");
    1952|     expect(fs.readFileSync(path.join(logs, "status.jsonl"), "utf-8")).…
       |                                                                           ^
    1953|     expect(fs.readFileSync(path.join(logs, "status.jsonl"), "utf-8")).…
    1954|     expect(fs.readFileSync(out, "utf-8")).toBe(mdBefore);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions answers > prints the last appended answer per question with its writer
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:2016:20
    2014|     fs.appendFileSync(seedStatus(logs), rows.map((x) => `${JSON.string…
    2015|     const r = await run(["decisions", "answers", `--file=${file}`], ro…
    2016|     expect(r.code).toBe(0);
       |                    ^
    2017|     expect(r.json.items).toHaveLength(2);
    2018|     expect(r.json.items[0]).toMatchObject({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions answers > prints an old single-file decision's in-file answers
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:2058:20
    2056|     seedStatus(logs);
    2057|     const r = await run(["decisions", "answers", `--file=${file}`], ro…
    2058|     expect(r.code).toBe(0);
       |                    ^
    2059|     expect(r.json.status).toBe("DECIDED");
    2060|     expect(r.json.items).toHaveLength(1);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/10]⎯


 Test Files  1 failed (1)
      Tests  10 failed | 77 passed (87)
   Start at  12:35:47
   Duration  2.33s (tests 93%, import 3%, transform 3%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-B0ZduY/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
