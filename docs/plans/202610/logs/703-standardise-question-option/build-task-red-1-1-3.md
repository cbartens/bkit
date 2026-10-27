> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/decisions.test.ts

[test-timeout-budget] load average 11.1 on 10 cores: unit limits 5552ms per test, 11103ms per hook (x1.11)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option

❯ .bkit/core/engine/commands/workflow/decisions.test.ts (19 tests | 8 failed) 1101ms
❯ bkit decisions compose (6)
× writes the header, one item per question and the reply line 58ms
× compose letters every option and the recommended one 47ms
✓ refuses an item whose recommendation is not one of its options 43ms
× --loop adds the attempt line, the progress block and the loop question as Q1 55ms
× --loop letters the loop question's options and recommendation 52ms
✓ --loop needs --file 52ms
✓ bkit decisions apply --by=headless (3)
✓ takes each recommendation: an Accept is assumed, Fix now is written as such 72ms
✓ leaves hard blockers for the owner and exits with the hard-blocker code 53ms
✓ labels the runtime from the main checkout's Cursor marker when run in a build worktree 161ms
❯ parseDecisionItems (2)
× parseDecisionItems keeps the bare option name, dropping the letter 3ms
× a decision file written before the letters still parses 1ms
❯ applyRecommendations (2)
✓ a Try again loop answer settles the loop alone; the items wait for the next round 0ms
× a lettered recommendation still settles its item by name 1ms
❯ bkit decisions apply --by=owner and pending (6)
✓ pending lists each assumed Accept nobody confirmed 61ms
✓ --confirm writes the owner's decision row and the real Accept; --reject marks it rejected 123ms
✓ refuses an item that is not an assumed Accept, or a call without one of --confirm / --reject 54ms
✓ --defer writes one needs-decision deferral per listed item, then lists none 114ms
× --defer letters the options in the deferral row 98ms
✓ refuses a malformed --month 50ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 8 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > writes the header, one item per question and the reply line
AssertionError: expected 'Status: OPEN\nQuestion: CHALLENGE\nFr…' to contain 'Recommended: B) Fix now — a secret re…'

- Expected

* Received

- Recommended: B) Fix now — a secret reaches the log

* Status: OPEN
* Question: CHALLENGE
* From: challenge
*
* **Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?
* Options: Accept / Fix now
* Recommended: Accept — the caller already caps it
*
* **Q2 — Task 4 [src/b.ts:2]:** HIGH: the token is logged. Fix it now?
* Options: Accept / Fix now
* Recommended: Fix now — a secret reaches the log
*
* **Q3 — Task 5 [src/c.ts:1]:** no test-first evidence. Accept it?
* Options: Accept / Fix now / Stop
* No recommendation — only the owner can waive test-first
*
* Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
*

❯ .bkit/core/engine/commands/workflow/decisions.test.ts:98:18
96| "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Ac…
97| );
98| expect(text).toContain("Recommended: B) Fix now — a secret reaches…
| ^
99| expect(text).toContain("No recommendation — only the owner can wai…
100| expect(text.trimEnd().split("\n").at(-1)).toBe(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯

FAIL .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > compose letters every option and the recommended one
AssertionError: expected 'Status: OPEN\nQuestion: CHALLENGE\nFr…' to contain 'Options: A) Accept / B) Fix now'

- Expected

* Received

- Options: A) Accept / B) Fix now

* Status: OPEN
* Question: CHALLENGE
* From: challenge
*
* **Q1 — Task 4 [src/b.ts:2]:** HIGH: the token is logged. Fix it now?
* Options: Accept / Fix now
* Recommended: Fix now — a secret reaches the log
*
* Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
*

❯ .bkit/core/engine/commands/workflow/decisions.test.ts:109:18
107| const { out } = await compose(root, logs, [ITEMS[1]]);
108| const text = fs.readFileSync(out, "utf-8");
109| expect(text).toContain("Options: A) Accept / B) Fix now");
| ^
110| expect(text).toContain("Recommended: B) Fix now — a secret reaches…
111| expect(text).not.toContain("Options: Accept / Fix now");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯

FAIL .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > --loop adds the attempt line, the progress block and the loop question as Q1
AssertionError: expected 'Status: OPEN\nQuestion: CHALLENGE\nFr…' to contain 'Options: A) Try again / B) Decide'

- Expected

* Received

- Options: A) Try again / B) Decide

* Status: OPEN
* Question: CHALLENGE
* From: challenge
*
* build verify: attempt 2 of 2
*
* ## Progress
*
* Problems after each round: 4 → 4
* Code changed: unknown
* Strategy: none → next STANDARD
* Minutes per round: 10
* Trend: stuck
*
* **Q1 — Verify:** decide the items below instead of another round? No fewer problems, or the code did not change.
* Options: Try again / Decide
* Recommended: Decide — another round is unlikely to close the remaining items
*
* **Q2 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?
* Options: Accept / Fix now
* Recommended: Accept — the caller already caps it
*
* **Q3 — Task 4 [src/b.ts:2]:** HIGH: the token is logged. Fix it now?
* Options: Accept / Fix now
* Recommended: Fix now — a secret reaches the log
*
* Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
*

❯ .bkit/core/engine/commands/workflow/decisions.test.ts:158:18
156| expect(text).toContain("Problems after each round: 4 → 4");
157| expect(text).toMatch(/\*\*Q1 — Verify:\*\* decide the items below/…
158| expect(text).toContain("Options: A) Try again / B) Decide");
| ^
159| expect(text).toContain("**Q2 — Task 3 [src/a.ts:10]:**");
160| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯

FAIL .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions compose > --loop letters the loop question's options and recommendation
AssertionError: expected 'Status: OPEN\nQuestion: CHALLENGE\nFr…' to contain 'Options: A) Try again / B) Decide'

- Expected

* Received

- Options: A) Try again / B) Decide

* Status: OPEN
* Question: CHALLENGE
* From: challenge
*
* build verify: attempt 1 of ?
*
* ## Progress
*
* Problems after each round: 2
* Code changed: unknown
* Strategy: none → next STANDARD
* Minutes per round: unknown
* Trend: first-round
*
* **Q1 — Verify:** another fix round? This was the first round, so there is no trend yet.
* Options: Try again / Decide
* Recommended: Try again — the last round made progress
*
* **Q2 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?
* Options: Accept / Fix now
* Recommended: Accept — the caller already caps it
*
* **Q3 — Task 4 [src/b.ts:2]:** HIGH: the token is logged. Fix it now?
* Options: Accept / Fix now
* Recommended: Fix now — a secret reaches the log
*
* Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
*

❯ .bkit/core/engine/commands/workflow/decisions.test.ts:191:18
189| );
190| const text = fs.readFileSync(out, "utf-8");
191| expect(text).toContain("Options: A) Try again / B) Decide");
| ^
192| expect(text).not.toContain("Options: Try again / Decide");
193| expect(text).toMatch(/Recommended: [AB]\) (Try again|Decide) — /);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯

FAIL .bkit/core/engine/commands/workflow/decisions.test.ts > parseDecisionItems > parseDecisionItems keeps the bare option name, dropping the letter
AssertionError: expected [ 'A) Accept', 'B) Fix now' ] to deeply equal [ 'Accept', 'Fix now' ]

- Expected

* Received

  [

- "Accept",
- "Fix now",

* "A) Accept",
* "B) Fix now",
  ]

❯ .bkit/core/engine/commands/workflow/decisions.test.ts:269:26
267| ].join("\n");
268| const item = parseDecisionItems(text)[0]!;
269| expect(item.options).toEqual(["Accept", "Fix now"]);
| ^
270| expect(item.recommended).toBe("Fix now");
271| expect(item.reason).toBe("a secret reaches the log");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯

FAIL .bkit/core/engine/commands/workflow/decisions.test.ts > parseDecisionItems > a decision file written before the letters still parses
AssertionError: expected [ 'A) Accept', 'B) Fix now' ] to deeply equal [ 'Accept', 'Fix now' ]

- Expected

* Received

  [

- "Accept",
- "Fix now",

* "A) Accept",
* "B) Fix now",
  ]

❯ .bkit/core/engine/commands/workflow/decisions.test.ts:291:34
289| .replace("Recommended: Accept —", "Recommended: A) Accept —"),
290| );
291| expect(lettered[0]!.options).toEqual(items[0]!.options);
| ^
292| expect(lettered[0]!.recommended).toEqual(items[0]!.recommended);
293| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/8]⎯

FAIL .bkit/core/engine/commands/workflow/decisions.test.ts > applyRecommendations > a lettered recommendation still settles its item by name
AssertionError: expected 'A) Accept — recommended; applied with…' to match /^Accept \(assumed\) — minor \(/

- Expected:
  /^Accept \(assumed\) — minor \(/

* Received:
  "A) Accept — recommended; applied without asking (LOCAL)"

❯ .bkit/core/engine/commands/workflow/decisions.test.ts:326:53
324| const r = applyRecommendations(text, "LOCAL", "ask:false");
325| expect(r).toMatchObject({ applied: [1], hardBlockers: [], loop: nu…
326| expect(parseDecisionItems(r.text)[0]!.decision).toMatch(/^Accept \…
| ^
327| });
328| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/8]⎯

FAIL .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=owner and pending > --defer letters the options in the deferral row
AssertionError: expected 'Decision needed: accept or fix "Task …' to contain 'Options: A) Accept / B) Fix now'

Expected: "Options: A) Accept / B) Fix now"
Received: "Decision needed: accept or fix "Task 3 [src/a.ts:10]". Options: Accept / Fix now. Nobody confirmed the assumed accept before the merge. Item: **Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?"

❯ .bkit/core/engine/commands/workflow/decisions.test.ts:408:29
406| fs.readFileSync(path.join(root, "docs/deferrals.jsonl"), "utf-8"…
407| );
408| expect(row.description).toContain("Options: A) Accept / B) Fix now…
| ^
409| });
410|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/8]⎯

Test Files 1 failed (1)
Tests 8 failed | 11 passed (19)
Start at 18:01:50
Duration 3.57s (transform 61%, tests 33%, import 6%)

Transform transforming modules took 2.03s · 61% of tracked time, re-done on every run
persist transforms across runs with fsModuleCache: true
learn more: https://vitest.dev/guide/improving-performance#caching-between-reruns

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-a2yW4w/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
