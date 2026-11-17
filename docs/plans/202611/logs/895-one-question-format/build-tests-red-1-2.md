Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 2

Plan: `docs/plans/202611/895-one-question-format-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "apply --by=owner --confirm confirms an assumed item in a per-line file" | red | failure: expected [] to deeply equal [ 'Accept', 'Fix now' ] |
| 2 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "compose refuses an option name that contains a spaced dash" | red | failure: expected '[bkit-decisions] item 1: needs title,…' to contain 'Keep it — as is' |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/decisions.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/decisions.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/decisions.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/decisions.test.ts

[test-timeout-budget] load average 18.4 on 10 cores: unit limits 13701ms per test, 27401ms per hook (x2.74)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts (66 tests | 44 failed) 4574ms
   ❯ bkit decisions compose (36)
     × writes the header, one item per question and the reply line 82ms
     × compose letters every option and the recommended one 79ms
     ✓ refuses an item whose recommendation is not one of its options 57ms
     × refuses an item with more options than letters 65ms
     × round-trips the last lettered option through parseDecisionItems 99ms
     × compose writes each option on its own line with its effect 95ms
     × compose refuses an option without an effect 88ms
     × compose writes the default effect for a bare fixed option name 64ms
     × compose refuses an option name that contains a spaced dash 50ms
     × compose writes a Default if unanswered line for each question 63ms
     × compose writes Recommended: none for a hard blocker 79ms
     × compose ends with the shared reply line 60ms
     × compose offers one by one from three questions on, not for two 73ms
     × --loop writes an effect for each loop option 55ms
     × round-trips an item with effects through parseDecisionItems 94ms
     × --loop adds the attempt line, the progress block and the loop question as Q1 62ms
     × --loop letters the loop question's options and recommendation 49ms
     × --loop=holistic counts only the rounds since the whole-feature check was last clean 97ms
     × prints the group gate's failing tests per round for the verify loop 81ms
     ✓ --loop=verify with an uncounted group gate reads unknown 52ms
     ✓ --loop on an unknown trend recommends Try again without claiming progress 51ms
     ✓ --loop on an unknown trend says the limit is used up 76ms
     ✓ --loop=verify on an unknown trend below the limit does not say the limit is used up 75ms
     × --loop states the engine's trendLine in Q1 108ms
     ✓ base check all with no items recommends Stop 63ms
     × base check all with items recommends Decide 47ms
     ✓ base check all says a gate still red after resume comes from this branch 60ms
     ✓ base check all in adopt mode adds the merge sentence 107ms
     × base check some names the split 82ms
     × base check some with undetermined cases counts only the branch's as fixable 59ms
     × base check none keeps the trend and names the branch 60ms
     × base check unknown keeps the trend and says why 71ms
     × Try again is offered for every base verdict 73ms
     ✓ base check prints how many failing tests are also red on base 111ms
     × a missing or malformed base check is a usage error that names the problem 65ms
     ✓ --loop needs --file 123ms
   ❯ bkit decisions apply --by=rerun (5)
     ✓ records the re-run under Q1 and closes the file 97ms
     × refuses a file without Gate: FAIL or not OPEN 151ms
     × refuses a Gate: FAIL file whose Q1 is an item, not the loop question 54ms
     × refuses a loop file with an undecided item question 58ms
     × refuses a file whose only Gate: FAIL line is in an item body 84ms
   ❯ bkit decisions apply --by=headless (4)
     × takes each recommendation: an Accept is assumed, Fix now is written as such 55ms
     × leaves hard blockers for the owner and exits with the hard-blocker code 105ms
     × apply --by=headless leaves a Recommended: none item for the owner 122ms
     × labels the runtime from the main checkout's Cursor marker when run in a build worktree 365ms
   ❯ parseDecisionItems (11)
     ✓ parseDecisionItems keeps the bare option name, dropping the letter 1ms
     ✓ a decision file written before the letters still parses 0ms
     ✓ parseDecisionItems reads a lettered decision as the option its letter labels 1ms
     × parseDecisionItems reads one option per line and drops each effect 2ms
     × parseDecisionItems reads Recommended: none as a hard blocker 1ms
     × a lettered decision in a per-line file reads as the option its letter labels 1ms
     × a per-line option whose text holds a slash or a middle dot stays one option 1ms
     × a file mixing both layouts parses each item in its own layout 1ms
     ✓ reads the task a Fix now item names on its Fix task line 0ms
     ✓ decisionHeader reads the header block only 0ms
     ✓ a lettered assumed Accept decision still reads as assumed 0ms
   ✓ applyRecommendations (3)
     ✓ a Try again loop answer settles the loop alone; the items wait for the next round 0ms
     ✓ a lettered recommendation still settles its item by name 0ms
     ✓ applyRecommendations reads a lettered Try again decision as the loop answer 0ms
   ❯ bkit decisions apply --by=owner and pending (7)
     × pending lists each assumed Accept nobody confirmed 169ms
     × --confirm writes the owner's decision row and the real Accept; --reject marks it rejected 72ms
     × apply --by=owner --confirm confirms an assumed item in a per-line file 205ms
     ✓ refuses an item that is not an assumed Accept, or a call without one of --confirm / --reject 54ms
     × --defer writes one needs-decision deferral per listed item, then lists none 123ms
     × --defer letters the options in the deferral row 79ms
     ✓ refuses a malformed --month 90ms

⎯⎯⎯⎯⎯⎯ Failed Tests 44 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > writes the header, one item per question and the reply line
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:102:20
    100|     const { root, logs } = checkout();
    101|     const { r, out } = await compose(root, logs, [...ITEMS, BLOCKER]);
    102|     expect(r.code).toBe(0);
       |                    ^
    103|     expect(r.json).toMatchObject({ questions: 3, loopRecommended: null…
    104|     const text = fs.readFileSync(out, "utf-8");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > compose letters every option and the recommended one
Error: ENOENT: no such file or directory, open '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-decisions-V149hK/docs/plans/202610/logs/7-x/build-decision-1-1.md'
 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:123:21
    121|     const { root, logs } = checkout();
    122|     const { out } = await compose(root, logs, [ITEMS[1]]);
    123|     const text = fs.readFileSync(out, "utf-8");
       |                     ^
    124|     expect(text).toContain("A) Accept — the item is recorded as accept…
    125|     expect(text).toContain("B) Fix now — a fix task is added to the pl…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > refuses an item with more options than letters
AssertionError: expected '[bkit-decisions] item 1: needs title,…' to contain 'at most 26 options'

- Expected
+ Received

- at most 26 options
+ [bkit-decisions] item 1: needs title, question and options
+

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:145:19
    143|     const { r } = await compose(root, logs, bad);
    144|     expect(r.code).toBe(2);
    145|     expect(r.err).toContain("at most 26 options");
       |                   ^
    146|   });
    147|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > round-trips the last lettered option through parseDecisionItems
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:157:20
    155|       { ...ITEMS[0], options, recommended: "Option 26" },
    156|     ]);
    157|     expect(r.code).toBe(0);
       |                    ^
    158|     const text = fs.readFileSync(out, "utf-8");
    159|     expect(text).toContain("Z) Option 26 — option 26 happens");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > compose writes each option on its own line with its effect
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:172:20
    170|     const { root, logs } = checkout();
    171|     const { r, out } = await compose(root, logs, [ITEMS[0]]);
    172|     expect(r.code).toBe(0);
       |                    ^
    173|     const lines = fs.readFileSync(out, "utf-8").split("\n");
    174|     const q = lines.findIndex((l) => l.startsWith("**Q1 — "));

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > compose refuses an option without an effect
AssertionError: expected +0 to be 2 // Object.is equality

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:189:22
    187|         { ...ITEMS[0], options, recommended: "Accept" },
    188|       ]);
    189|       expect(r.code).toBe(2);
       |                      ^
    190|       expect(fs.existsSync(out)).toBe(false);
    191|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > compose writes the default effect for a bare fixed option name
AssertionError: expected 'Status: OPEN\nQuestion: CHALLENGE\nFr…' to contain 'A) Accept — the item is recorded as a…'

- Expected
+ Received

- A) Accept — the item is recorded as accepted
+ Status: OPEN
+ Question: CHALLENGE
+ From: challenge
+
+ **Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?
+ Options: A) Accept / B) Stop
+ Recommended: A) Accept — the caller already caps it
+
+ Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
+

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:201:18
    199|     expect(r.code).toBe(0);
    200|     const text = fs.readFileSync(out, "utf-8");
    201|     expect(text).toContain("A) Accept — the item is recorded as accept…
       |                  ^
    202|     expect(text).toContain(
    203|       "B) Stop — the run ends here with a handover; the next run resum…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > compose refuses an option name that contains a spaced dash
AssertionError: expected '[bkit-decisions] item 1: needs title,…' to contain 'Keep it — as is'

- Expected
+ Received

- Keep it — as is
+ [bkit-decisions] item 1: needs title, question and options
+

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:217:19
    215|     ]);
    216|     expect(r.code).toBe(2);
    217|     expect(r.err).toContain("Keep it — as is");
       |                   ^
    218|     expect(r.err).toContain("Q1");
    219|     expect(r.err).toMatch(/—|dash/);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > compose writes a Default if unanswered line for each question
Error: ENOENT: no such file or directory, open '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-decisions-1mFCZP/docs/plans/202610/logs/7-x/build-decision-1-1.md'
 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:227:21
    225|     const { root, logs } = checkout();
    226|     const { out } = await compose(root, logs, [ITEMS[1], BLOCKER]);
    227|     const text = fs.readFileSync(out, "utf-8");
       |                     ^
    228|     const [, q1, q2] = text.split(/^(?=\*\*Q\d+ — )/m);
    229|     expect(q1).toContain(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > compose writes Recommended: none for a hard blocker
Error: ENOENT: no such file or directory, open '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-decisions-4kKCrj/docs/plans/202610/logs/7-x/build-decision-1-1.md'
 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:240:21
    238|     const { root, logs } = checkout();
    239|     const { out } = await compose(root, logs, [BLOCKER]);
    240|     const text = fs.readFileSync(out, "utf-8");
       |                     ^
    241|     expect(text).toContain("Recommended: none — only the owner can wai…
    242|     expect(text).not.toContain("No recommendation");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > compose ends with the shared reply line
Error: ENOENT: no such file or directory, open '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-decisions-rWGzc9/docs/plans/202610/logs/7-x/build-decision-1-1.md'
 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:248:21
    246|     const { root, logs } = checkout();
    247|     const { out } = await compose(root, logs, ITEMS);
    248|     const text = fs.readFileSync(out, "utf-8");
       |                     ^
    249|     expect(text.trimEnd().split("\n").at(-1)).toBe(REPLY_LINE);
    250|     expect(text).not.toContain("Reply per question.");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > compose offers one by one from three questions on, not for two
Error: ENOENT: no such file or directory, open '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-decisions-slgl5q/docs/plans/202610/logs/7-x/build-decision-1-1.md'
 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:255:20
    253|   it("compose offers one by one from three questions on, not for two",…
    254|     const { root, logs } = checkout();
    255|     const two = fs.readFileSync((await compose(root, logs, ITEMS)).out…
       |                    ^
    256|     expect(two).not.toContain("one by one");
    257|     const three = fs.readFileSync((await compose(root, logs, [...ITEMS…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > --loop writes an effect for each loop option
AssertionError: expected 'Status: OPEN\nQuestion: CHALLENGE\nFr…' to contain 'A) Try again — one more fix round runs'

- Expected
+ Received

- A) Try again — one more fix round runs
+ Status: OPEN
+ Question: CHALLENGE
+ From: challenge
+
+ build verify: attempt 1 of ?
+
+ ## Progress
+
+ Problems after each round: 2
+ Group gate failures after each round: 0
+ Code changed: unknown
+ Strategy: none → next STANDARD
+ Minutes per round: unknown
+ Trend: first-round
+
+ **Q1 — Verify:** another fix round? This was the first round, so there is no trend yet.
+ Options: A) Try again / B) Stop
+ Recommended: A) Try again — the last round made progress
+
+ Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
+

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:284:18
    282|     const { out } = await compose(root, logs, [], "--loop=verify", `--…
    283|     const text = fs.readFileSync(out, "utf-8");
    284|     expect(text).toContain("A) Try again — one more fix round runs");
       |                  ^
    285|     expect(text).toContain(
    286|       "B) Stop — the run ends here with a handover; the next run resum…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > round-trips an item with effects through parseDecisionItems
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:294:20
    292|     const { root, logs } = checkout();
    293|     const { r, out } = await compose(root, logs, [ITEMS[1], BLOCKER]);
    294|     expect(r.code).toBe(0);
       |                    ^
    295|     const items = parseDecisionItems(fs.readFileSync(out, "utf-8"));
    296|     expect(items[0]!.options).toEqual(["Accept", "Fix now"]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[14/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > --loop adds the attempt line, the progress block and the loop question as Q1
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:336:20
    334|       "--max=2",
    335|     );
    336|     expect(r.code).toBe(0);
       |                    ^
    337|     expect(r.json).toMatchObject({ questions: 3, loopRecommended: "Dec…
    338|     const text = fs.readFileSync(out, "utf-8");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[15/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > --loop letters the loop question's options and recommendation
Error: ENOENT: no such file or directory, open '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-decisions-fDSZKT/docs/plans/202610/logs/7-x/build-decision-1-1.md'
 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:375:21
    373|       "--group=1",
    374|     );
    375|     const text = fs.readFileSync(out, "utf-8");
       |                     ^
    376|     expect(text).toContain("A) Try again — one more fix round runs");
    377|     expect(text).toContain("B) Decide — ");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[16/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > --loop=holistic counts only the rounds since the whole-feature check was last clean
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:415:20
    413|       "--max=2",
    414|     );
    415|     expect(r.code).toBe(0);
       |                    ^
    416|     const text = fs.readFileSync(out, "utf-8");
    417|     expect(text).toContain("build verify: attempt 2 of 2");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[17/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > prints the group gate's failing tests per round for the verify loop
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:468:20
    466|       "--group=1",
    467|     );
    468|     expect(r.code).toBe(0);
       |                    ^
    469|     const text = fs.readFileSync(out, "utf-8");
    470|     expect(text).toContain("Group gate failures after each round: 3 → …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[18/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > --loop states the engine's trendLine in Q1
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:680:20
    678|       "--max=3",
    679|     );
    680|     expect(r.code).toBe(0);
       |                    ^
    681|     const text = fs.readFileSync(out, "utf-8");
    682|     const q1 = text.slice(text.indexOf("**Q1"), text.indexOf("**Q2"));

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[19/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > base check all with items recommends Decide
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:758:20
    756|   it("base check all with items recommends Decide", async () => {
    757|     const { r, text } = await composeWithBase({}, ITEMS);
    758|     expect(r.code).toBe(0);
       |                    ^
    759|     expect(r.json).toMatchObject({ loopRecommended: "Decide" });
    760|     expect(text).toMatch(/Recommended: B\) Decide — .*fail on `dev` to…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[20/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > base check some names the split
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:782:20
    780|       ITEMS,
    781|     );
    782|     expect(r.code).toBe(0);
       |                    ^
    783|     expect(text).toContain("a round can fix 2 of 5");
    784|     expect(text).toContain("the build will still stop on the 3 from `d…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[21/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > base check some with undetermined cases counts only the branch's as fixable
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:800:20
    798|       ITEMS,
    799|     );
    800|     expect(r.code).toBe(0);
       |                    ^
    801|     expect(text).toContain("a round can fix 1 of 3");
    802|     expect(text).not.toContain("a round can fix 2 of 3");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[22/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > base check none keeps the trend and names the branch
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:812:20
    810|       ITEMS,
    811|     );
    812|     expect(r.code).toBe(0);
       |                    ^
    813|     expect(r.json).toMatchObject({ loopRecommended: "Decide" });
    814|     expect(text).toMatch(/Recommended: B\) Decide — the failures come …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[23/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > base check unknown keeps the trend and says why
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:828:20
    826|       ITEMS,
    827|     );
    828|     expect(r.code).toBe(0);
       |                    ^
    829|     expect(r.json).toMatchObject({ loopRecommended: "Decide" });
    830|     expect(text).toMatch(/Recommended: B\) Decide — cause unknown: no …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[24/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > Try again is offered for every base verdict
AssertionError: all with 0 items: expected 'Status: OPEN\nQuestion: CHALLENGE\nFr…' to match /\*\*Q1 — Verify:\*\*[^\n]*\nA\) Try a…/

- Expected:
/\*\*Q1 — Verify:\*\*[^\n]*\nA\) Try again — [^\n]*\nB\) (Decide|Stop) — /

+ Received:
"Status: OPEN
Question: CHALLENGE
From: challenge

build verify: attempt 2 of 2

## Progress

Problems after each round: 4 → 4
Group gate failures after each round: 0 → 0
Code changed: unknown
Strategy: none → next STANDARD
Minutes per round: 10
Trend: stuck
Also red on base abc1234: 3 of 3 (local run)

**Q1 — Verify:** decide the items below instead of another round? The count did not fall between the first and the last round (4 → 4).
Options: A) Try again / B) Stop
Recommended: B) Stop — all 3 failing tests fail on `dev` too, so no round here can fix them. Fix `dev`, then resume. If the gate is still red after `dev` is fixed and the run resumed, the rest comes from this branch, and the gate re-run on resume shows it.

Reply per question. \"yes\" takes every recommendation. \"stop\" writes a handover; the run can be resumed.
"

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:843:76
    841|       for (const items of [[], ITEMS]) {
    842|         const { text } = await composeWithBase(over, items);
    843|         expect(text, `${String(over.verdict)} with ${items.length} ite…
       |                                                                            ^
    844|           /\*\*Q1 — Verify:\*\*[^\n]*\nA\) Try again — [^\n]*\nB\) (De…
    845|         );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[25/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > a missing or malformed base check is a usage error that names the problem
AssertionError: expected '[bkit-decisions] item 1: needs title,…' to contain 'no-such-base.json'

- Expected
+ Received

- no-such-base.json
+ [bkit-decisions] item 1: needs title, question and options
+

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:873:27
    871|     );
    872|     expect(missing.r.code).toBe(2);
    873|     expect(missing.r.err).toContain("no-such-base.json");
       |                           ^
    874|     expect(missing.r.err).not.toContain("unknown flag");
    875|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[26/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=rerun > refuses a file without Gate: FAIL or not OPEN
Error: ENOENT: no such file or directory, open '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-decisions-gQhlZp/docs/plans/202610/logs/7-x/build-decision-1-1.md'
 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:941:23
    939|     const { root, logs } = checkout();
    940|     const plain = await compose(root, logs, [ITEMS[1]]);
    941|     const before = fs.readFileSync(plain.out, "utf-8");
       |                       ^
    942|     const noGate = await rerun(root, plain.out);
    943|     expect(noGate.code).toBe(2);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[27/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=rerun > refuses a Gate: FAIL file whose Q1 is an item, not the loop question
Error: ENOENT: no such file or directory, open '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-decisions-7GiVuD/docs/plans/202610/logs/7-x/build-decision-1-1.md'
 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:961:23
    959|     const { root, logs } = checkout();
    960|     const { out } = await compose(root, logs, [BLOCKER], "--header=Gat…
    961|     const before = fs.readFileSync(out, "utf-8");
       |                       ^
    962|     const r = await rerun(root, out);
    963|     expect(r.code).toBe(2);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[28/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=rerun > refuses a loop file with an undecided item question
Error: ENOENT: no such file or directory, open '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-decisions-EH3ClU/docs/plans/202610/logs/7-x/build-decision-1-1.md'
 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1001:23
    999|       "--group=1",
    1000|     );
    1001|     const before = fs.readFileSync(out, "utf-8");
       |                       ^
    1002|     expect(before).toContain("**Q2");
    1003|     const r = await rerun(root, out);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[29/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=rerun > refuses a file whose only Gate: FAIL line is in an item body
Error: ENOENT: no such file or directory, open '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-decisions-ahXUaR/docs/plans/202610/logs/7-x/build-decision-1-1.md'
 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1014:23
    1012|     const smuggled = { ...ITEMS[1], question: "Fix it?\nGate: FAIL" };
    1013|     const { out } = await compose(root, logs, [smuggled]);
    1014|     const before = fs.readFileSync(out, "utf-8");
       |                       ^
    1015|     const r = await rerun(root, out);
    1016|     expect(r.code).toBe(2);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[30/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=headless > takes each recommendation: an Accept is assumed, Fix now is written as such
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1030:20
    1028|     process.env.BKIT_RUNTIME = "GITHUB_ACTION";
    1029|     const r = await run(["decisions", "apply", "--by=headless", `--fil…
    1030|     expect(r.code).toBe(0);
       |                    ^
    1031|     expect(r.json).toMatchObject({
    1032|       status: "ASSUMED",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[31/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=headless > leaves hard blockers for the owner and exits with the hard-blocker code
AssertionError: expected 2 to be 4 // Object.is equality

- Expected
+ Received

- 4
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1053:20
    1051|     process.env.BKIT_RUNTIME = "LOCAL";
    1052|     const r = await run(["decisions", "apply", "--by=headless", `--fil…
    1053|     expect(r.code).toBe(EXIT_HARD_BLOCKERS);
       |                    ^
    1054|     expect(r.json).toMatchObject({ status: "OPEN", applied: [1], hardB…
    1055|     expect(r.err).toContain("hard blockers need the owner: Q2");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[32/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=headless > apply --by=headless leaves a Recommended: none item for the owner
AssertionError: expected +0 to be 4 // Object.is equality

- Expected
+ Received

- 4
+ 0

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1077:20
    1075|     process.env.BKIT_RUNTIME = "LOCAL";
    1076|     const r = await run(["decisions", "apply", "--by=headless", `--fil…
    1077|     expect(r.code).toBe(EXIT_HARD_BLOCKERS);
       |                    ^
    1078|     expect(r.json).toMatchObject({ status: "OPEN", applied: [], hardBl…
    1079|     expect(fs.readFileSync(out, "utf-8")).not.toContain("Decision:");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[33/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=headless > labels the runtime from the main checkout's Cursor marker when run in a build worktree
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1098:20
    1096|     delete process.env.BKIT_RUNTIME;
    1097|     const r = await run(["decisions", "apply", "--by=headless", `--fil…
    1098|     expect(r.code).toBe(0);
       |                    ^
    1099|     expect(fs.readFileSync(out, "utf-8")).toContain("(ask:false, CLOUD…
    1100|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[34/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > parseDecisionItems > parseDecisionItems reads one option per line and drops each effect
AssertionError: expected [] to deeply equal [ 'Accept', 'Fix now' ]

- Expected
+ Received

- [
-   "Accept",
-   "Fix now",
- ]
+ []

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1180:26
    1178|   it("parseDecisionItems reads one option per line and drops each effe…
    1179|     const item = parseDecisionItems([...PER_LINE, ""].join("\n"))[0]!;
    1180|     expect(item.options).toEqual(["Accept", "Fix now"]);
       |                          ^
    1181|     expect(item.recommended).toBe("Fix now");
    1182|     expect(item.reason).toBe("a secret reaches the log");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[35/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > parseDecisionItems > parseDecisionItems reads Recommended: none as a hard blocker
AssertionError: expected 'none' to be null

- Expected:
null

+ Received:
"none"

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1197:30
    1195|     ].join("\n");
    1196|     const item = parseDecisionItems(text)[0]!;
    1197|     expect(item.recommended).toBeNull();
       |                              ^
    1198|     expect(item.reason).toBe("only the owner can waive test-first");
    1199|     expect(item.options).toEqual(["Accept", "Stop"]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[36/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > parseDecisionItems > a lettered decision in a per-line file reads as the option its letter labels
AssertionError: expected 'B' to be 'Fix now' // Object.is equality

Expected: "Fix now"
Received: "B"

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1205:26
    1203|     const decided = (decision: string) =>
    1204|       parseDecisionItems([...PER_LINE, `Decision: ${decision}`, ""].jo…
    1205|     expect(decided("B")).toBe("Fix now");
       |                          ^
    1206|     expect(decided("B) Fix now — a secret reaches the log")).toBe(
    1207|       "Fix now — a secret reaches the log",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[37/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > parseDecisionItems > a per-line option whose text holds a slash or a middle dot stays one option
AssertionError: expected [] to deeply equal [ 'keep the read/write split', …(1) ]

- Expected
+ Received

- [
-   "keep the read/write split",
-   "merge them",
- ]
+ []

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1226:26
    1224|     ].join("\n");
    1225|     const item = parseDecisionItems(text)[0]!;
    1226|     expect(item.options).toEqual(["keep the read/write split", "merge …
       |                          ^
    1227|     expect(item.recommended).toBe("keep the read/write split");
    1228|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[38/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > parseDecisionItems > a file mixing both layouts parses each item in its own layout
AssertionError: expected [] to deeply equal [ 'Accept', 'Fix now' ]

- Expected
+ Received

- [
-   "Accept",
-   "Fix now",
- ]
+ []

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1248:31
    1246|     expect(items[0]!.options).toEqual(["Accept", "Fix now"]);
    1247|     expect(items[0]!.recommended).toBe("Accept");
    1248|     expect(items[1]!.options).toEqual(["Accept", "Fix now"]);
       |                               ^
    1249|     expect(items[1]!.recommended).toBeNull();
    1250|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[39/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=owner and pending > pending lists each assumed Accept nobody confirmed
AssertionError: expected { items: [], count: +0, deferred: [] } to match object { count: 2, deferred: [] }
(1 matching property omitted from actual)

- Expected
+ Received

  {
-   "count": 2,
+   "count": 0,
    "deferred": [],
  }

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1378:20
    1376|     const r = await pending(root);
    1377|     expect(r.code).toBe(0);
    1378|     expect(r.json).toMatchObject({ count: 2, deferred: [] });
       |                    ^
    1379|     expect(r.json.items[0]).toMatchObject({
    1380|       file: "docs/plans/202610/logs/7-x/build-decision-1-1.md",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[40/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=owner and pending > --confirm writes the owner's decision row and the real Accept; --reject marks it rejected
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1392:26
    1390|       run(["decisions", "apply", "--by=owner", `--file=${out}`, `--q=$…
    1391|     const confirm = await owner("1", "--confirm", "--reason=fine as is…
    1392|     expect(confirm.code).toBe(0);
       |                          ^
    1393|     expect(confirm.json.decisionKey).toBe("7-x-accepted-task-3-src-a-t…
    1394|     const ledger = fs.readFileSync(path.join(root, "docs/decisions.jso…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[41/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=owner and pending > apply --by=owner --confirm confirms an assumed item in a per-line file
AssertionError: expected [] to deeply equal [ 'Accept', 'Fix now' ]

- Expected
+ Received

- [
-   "Accept",
-   "Fix now",
- ]
+ []

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1435:31
    1433|     expect(items[0]!.decision).toMatch(/^Accept — fine \(owner, confir…
    1434|     expect(items[0]!.assumed).toBe(false);
    1435|     expect(items[0]!.options).toEqual(["Accept", "Fix now"]);
       |                               ^
    1436|     expect(items[0]!.recommended).toBe("Accept");
    1437|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[42/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=owner and pending > --defer writes one needs-decision deferral per listed item, then lists none
AssertionError: expected [] to have a length of 2 but got +0

- Expected
+ Received

- 2
+ 0

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1451:29
    1449|     const r = await pending(root, "--defer");
    1450|     expect(r.code).toBe(0);
    1451|     expect(r.json.deferred).toHaveLength(2);
       |                             ^
    1452|     const rows = fs
    1453|       .readFileSync(path.join(root, "docs/deferrals.jsonl"), "utf-8")

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[43/44]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=owner and pending > --defer letters the options in the deferral row
Error: ENOENT: no such file or directory, open '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-decisions-yqVzNW/docs/deferrals.jsonl'
 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1466:10
    1464|     await pending(root, "--defer");
    1465|     const row = JSON.parse(
    1466|       fs.readFileSync(path.join(root, "docs/deferrals.jsonl"), "utf-8"…
       |          ^
    1467|     );
    1468|     expect(row.description).toContain("Options: A) Accept / B) Fix now…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[44/44]⎯


 Test Files  1 failed (1)
      Tests  44 failed | 22 passed (66)
   Start at  18:38:12
   Duration  6.46s (tests 75%, transform 15%, import 9%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-jyVjSb/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
