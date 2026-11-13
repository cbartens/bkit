Enforced: true
Red: 13
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/903-build-owner-s-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 2 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "reads the task a Fix now item names on its Fix task line" | red | failure: expected undefined to be 42 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "decisionHeader reads the header block only" | red | failure: decisionHeader is not a function |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a verify pause's Fix now group is resolved once each fix task is verified" | red | failure: expected [ …(4) ] to not include 'build-plan-tasks (group 9) FAIL' |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a verify pause before the round limit resolves its Fix now group the same way" | red | failure: expected [ …(4) ] to not include 'build-plan-tasks (group 9) FAIL' |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a verify pause clears its group's FAIL only when every item is answered" | red | failure: expected [ …(4) ] to not include 'build-plan-tasks (group 9) FAIL' |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a Fix now item clears its group's FAIL only through a ticked task its own group verified after the pause" | red | failure: expected [ …(4) ] to not include 'build-plan-tasks (group 9) FAIL' |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a verify pause clears only the group its Group header names" | red | failure: expected [ …(7) ] to not include 'build-plan-tasks (group 9) FAIL' |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a Fix now item without a Fix task line or naming a missing task keeps its group's FAIL" | red | failure: expected [ …(4) ] to not include 'build-plan-tasks (group 9) FAIL' |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a paused group's CONCERNS rows stay concerns after its Fix now task is verified" | red | failure: expected [ …(4) ] to not include 'build-plan-tasks (group 9) FAIL' |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a holistic or challenge decision file clears no group rows" | red | failure: expected [ …(4) ] to not include 'build-plan-tasks (group 9) FAIL' |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a group that paused more than once is settled by its latest qualifying decision" | red | failure: expected [ …(3) ] to not include 'build-plan-verify (group 9) FAIL' |
| 3 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "prints CONCERNS when a Fix now group's fix task and a test-fix FAIL are both resolved" | red | failure: expected 'FAIL' to be 'CONCERNS' // Object.is equality |
| 4 | `.bkit/core/engine/commands/workflow/summary.test.ts` "an Accept-only verify pause resolves its group's FAIL rows before the pause" | red | failure: expected [ …(4) ] to not include 'build-plan-tasks (group 9) FAIL' |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/decisions.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/decisions.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/decisions.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/decisions.test.ts

[test-timeout-budget] load average 62.4 on 10 cores: unit limits 30000ms per test, 60000ms per hook (x6.00)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts (44 tests | 2 failed) 4648ms
   ✓ bkit decisions compose (21)
     ✓ writes the header, one item per question and the reply line 103ms
     ✓ compose letters every option and the recommended one 165ms
     ✓ refuses an item whose recommendation is not one of its options 73ms
     ✓ refuses an item with more options than letters 81ms
     ✓ round-trips the last lettered option through parseDecisionItems 51ms
     ✓ --loop adds the attempt line, the progress block and the loop question as Q1 55ms
     ✓ --loop letters the loop question's options and recommendation 58ms
     ✓ --loop=holistic counts only the rounds since the whole-feature check was last clean 119ms
     ✓ prints the group gate's failing tests per round for the verify loop 96ms
     ✓ base check all with no items recommends Stop 96ms
     ✓ base check all with items recommends Decide 60ms
     ✓ base check all says a gate still red after resume comes from this branch 42ms
     ✓ base check all in adopt mode adds the merge sentence 207ms
     ✓ base check some names the split 59ms
     ✓ base check some with undetermined cases counts only the branch's as fixable 79ms
     ✓ base check none keeps the trend and names the branch 47ms
     ✓ base check unknown keeps the trend and says why 45ms
     ✓ Try again is offered for every base verdict 530ms
     ✓ base check prints how many failing tests are also red on base 126ms
     ✓ a missing or malformed base check is a usage error that names the problem 148ms
     ✓ --loop needs --file 65ms
   ✓ bkit decisions apply --by=rerun (5)
     ✓ records the re-run under Q1 and closes the file 79ms
     ✓ refuses a file without Gate: FAIL or not OPEN 82ms
     ✓ refuses a Gate: FAIL file whose Q1 is an item, not the loop question 70ms
     ✓ refuses a loop file with an undecided item question 48ms
     ✓ refuses a file whose only Gate: FAIL line is in an item body 58ms
   ✓ bkit decisions apply --by=headless (3)
     ✓ takes each recommendation: an Accept is assumed, Fix now is written as such 87ms
     ✓ leaves hard blockers for the owner and exits with the hard-blocker code 74ms
     ✓ labels the runtime from the main checkout's Cursor marker when run in a build worktree 293ms
   ❯ parseDecisionItems (6)
     ✓ parseDecisionItems keeps the bare option name, dropping the letter 1ms
     ✓ a decision file written before the letters still parses 0ms
     ✓ parseDecisionItems reads a lettered decision as the option its letter labels 6ms
     × reads the task a Fix now item names on its Fix task line 10ms
     × decisionHeader reads the header block only 1ms
     ✓ a lettered assumed Accept decision still reads as assumed 0ms
   ✓ applyRecommendations (3)
     ✓ a Try again loop answer settles the loop alone; the items wait for the next round 1ms
     ✓ a lettered recommendation still settles its item by name 1ms
     ✓ applyRecommendations reads a lettered Try again decision as the loop answer 0ms
   ✓ bkit decisions apply --by=owner and pending (6)
     ✓ pending lists each assumed Accept nobody confirmed 190ms
     ✓ --confirm writes the owner's decision row and the real Accept; --reject marks it rejected 447ms
     ✓ refuses an item that is not an assumed Accept, or a call without one of --confirm / --reject 92ms
     ✓ --defer writes one needs-decision deferral per listed item, then lists none 461ms
     ✓ --defer letters the options in the deferral row 243ms
     ✓ refuses a malformed --month 94ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > parseDecisionItems > reads the task a Fix now item names on its Fix task line
AssertionError: expected undefined to be 42 // Object.is equality

- Expected:
42

+ Received:
undefined

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:783:79
    781|         "",
    782|       ].join("\n");
    783|     expect(parseDecisionItems(item("Fix now", ["Fix task: 42"]))[0]!.f…
       |                                                                               ^
    784|     expect(parseDecisionItems(item("Fix now", []))[0]!.fixTask).toBeNu…
    785|     expect(parseDecisionItems(item("Fix now", ["Fix task: soon"]))[0]!…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > parseDecisionItems > decisionHeader reads the header block only
TypeError: decisionHeader is not a function
 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:802:20
    800|       "",
    801|     ].join("\n");
    802|     const header = decisionHeader(text);
       |                    ^
    803|     expect(header.From).toBe("verify");
    804|     expect(header.Group).toBe("9");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 42 passed (44)
   Start at  17:06:41
   Duration  6.85s (tests 79%, setup 8%, import 6%, transform 6%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-V6XjjA/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/summary.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/summary.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/summary.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/summary.test.ts

[test-timeout-budget] load average 71.2 on 10 cores: unit limits 30000ms per test, 60000ms per hook (x6.00)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts (65 tests | 10 failed) 67ms
   ✓ refOf (3)
     ✓ gives #N for a numeric issue segment 3ms
     ✓ gives the uppercase key for a prefixed issue segment 0ms
     ✓ gives no ref for a FID with no issue segment, or under no tracker 0ms
   ❯ buildSummary (62)
     ✓ writes the header every reader expects, and the next step with the ref 5ms
     ✓ writes Publish: held when publish is false 1ms
     ✓ writes Publish: pr by default 2ms
     ✓ writes Docs: not synced on a held summary 0ms
     ✓ keeps the verdict and next step unchanged by publish 0ms
     ✓ a plan review resolved by its passing apply step leaves a passing summary and history 1ms
     ✓ a group check whose fix moved to a new group is resolved by the later whole-run checks 1ms
     ✓ a group check's CONCERNS is not cleared by the whole-run checks 1ms
     ✓ a build challenge cannot be cleared by unrelated fix tasks or a decision 1ms
     ✓ design clears only the review covered by a passing update 1ms
     ✓ plan clears only the review covered by a passing update 1ms
     ✓ does not inherit a previous summary verdict when recomputing resolved work 1ms
     ✓ retains unrelated concerns after resolving a review 0ms
     ✓ an update that applies critical review findings leaves only its optional concerns 0ms
     ✓ a spike's disproven claims can be addressed without hiding unsettled claims 2ms
     ✓ retains remediation warnings and unrelated group failures after a verification PASS 0ms
     ✓ uses the latest verification and preserves earlier attempts in history 0ms
     ✓ resolves challenge findings only through their matching round's verified tasks 7ms
     ✓ a later verification covering the complete plan resolves its currency findings 0ms
     ✓ a group's failed execution stays unresolved when verification still has concerns 1ms
     ✓ a group's gaps fix FAIL resolved by that group's later PASS verify is historical 0ms
     ✓ a holistic gaps fix FAIL resolved by a later PASS holistic verify is historical 0ms
     ✓ a later PASS whole-plan verify resolves a group's failed execution and gaps fix 0ms
     ✓ a later passing test run resolves a failed test-failure fix 0ms
     ✓ a test-fix FAIL resolved by a later passing test run on the same scope is historical 1ms
     ✓ a debug fix FAIL resolved by a later passing debug test run is historical 0ms
     ✓ a debug fix FAIL after a CI-sourced round is not resolved by a local pass 0ms
     ✓ the Challenge section says when challenge-1 was skipped for a small change 0ms
     ✓ debug with Reproduced: NO recommends a repro re-run, not FAIL 0ms
     ✓ ship PASS says no further command; FAIL goes back to /bkit-ship 0ms
     ✓ prints plans with covered workstreams 0ms
     ✓ a one-workstream design shows one plan and /bkit-plan on its own ref 0ms
     ✓ two plans ask to file plan issues first 0ms
     ✓ copies the organised design's Risks & Open Questions under ## Open Questions 0ms
     ✓ a design with no organised design says None under ## Open Questions 0ms
     ✓ copies the plan's Acceptance Scenario and Open Questions word for word 1ms
     ✓ a build with no plan file fails, even when every step passed 0ms
     ✓ a missing plan file fails only the build summary 0ms
     ✓ a build's last unanswered verify FAIL fails it 0ms
     ✓ lists open BLOCKED lines, accepted gaps, undecided pauses and TEST EXCEPTION fields 2ms
     ✓ keeps a repaired Task blocker in history rather than current action items 0ms
     ✓ keeps a repaired Step blocker in history rather than current action items 0ms
     ✓ keeps a repaired Gap blocker in history rather than current action items 0ms
     ✓ lists each sub-bullet of a nested TEST EXCEPTION field with its task and reason 1ms
     ✓ consolidates documentation warnings from the active run without changing its verdict 1ms
     ✓ counts a lettered Accept decision as accepted at the Decision Pause 1ms
     ✓ reads pretty-printed and one-line warning records from a jsonl fence 0ms
     ✓ excludes raw tracker text in related-issues.md from documentation warnings 0ms
     ✓ excludes the debug tracker sweep context-related-N.md from documentation warnings 0ms
     ✓ ignores a warning record placed after a forged closing marker in a fenced context artifact 0ms
     ✓ ignores warning records inside an UNTRUSTED fence 0ms
     ✓ a plan built from the unfilled bkit-plan.md template yields no documentation warning 1ms
     ❯ a verify pause's group (10)
       × a verify pause's Fix now group is resolved once each fix task is verified 9ms
       × a verify pause before the round limit resolves its Fix now group the same way 1ms
       × a verify pause clears its group's FAIL only when every item is answered 1ms
       × a Fix now item clears its group's FAIL only through a ticked task its own group verified after the pause 2ms
       × a verify pause clears only the group its Group header names 1ms
       × a Fix now item without a Fix task line or naming a missing task keeps its group's FAIL 1ms
       × a paused group's CONCERNS rows stay concerns after its Fix now task is verified 1ms
       × a holistic or challenge decision file clears no group rows 1ms
       × a group that paused more than once is settled by its latest qualifying decision 1ms
       × an Accept-only verify pause resolves its group's FAIL rows before the pause 1ms

⎯⎯⎯⎯⎯⎯ Failed Tests 10 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > a verify pause's group > a verify pause's Fix now group is resolved once each fix task is verified
AssertionError: expected [ …(4) ] to not include 'build-plan-tasks (group 9) FAIL'
 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:1556:64
    1554|       const decision = pauseFile({ gaps: [ACCEPT, FIX42] });
    1555|       const s = summary(rowsOf(), decision);
    1556|       for (const reason of FAIL_REASONS) expect(s.reasons).not.toConta…
       |                                                                ^
    1557|       expect(s.verdict).toBe("CONCERNS");
    1558|       expect(s.reasons.join("\n")).toContain("accepted at the Decision…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > a verify pause's group > a verify pause before the round limit resolves its Fix now group the same way
AssertionError: expected [ …(4) ] to not include 'build-plan-tasks (group 9) FAIL'
 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:1583:64
    1581|       expect(decision).not.toContain("## Progress");
    1582|       const s = summary(rowsOf(), decision);
    1583|       for (const reason of FAIL_REASONS) expect(s.reasons).not.toConta…
       |                                                                ^
    1584|       expect(s.verdict).toBe("CONCERNS");
    1585|       expect(s.markdown.split("## Resolved Findings")[1]!.split("## ")…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > a verify pause's group > a verify pause clears its group's FAIL only when every item is answered
AssertionError: expected [ …(4) ] to not include 'build-plan-tasks (group 9) FAIL'
 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:1591:70
    1589|       // The control answers every item and clears the group.
    1590|       const control = summary(rowsOf(), pauseFile({ gaps: [ACCEPT, FIX…
    1591|       for (const reason of FAIL_REASONS) expect(control.reasons).not.t…
       |                                                                      ^
    1592|       // An unanswered gap item, or an unanswered loop item, keeps it.
    1593|       expectKept(summary(rowsOf(), pauseFile({ gaps: [{ decision: null…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > a verify pause's group > a Fix now item clears its group's FAIL only through a ticked task its own group verified after the pause
AssertionError: expected [ …(4) ] to not include 'build-plan-tasks (group 9) FAIL'
 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:1600:70
    1598|       const decision = pauseFile({ gaps: [ACCEPT, FIX42] });
    1599|       const control = summary(rowsOf(), decision);
    1600|       for (const reason of FAIL_REASONS) expect(control.reasons).not.t…
       |                                                                      ^
    1601|
    1602|       const fixed = verifiedRows(10);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > a verify pause's group > a verify pause clears only the group its Group header names
AssertionError: expected [ …(7) ] to not include 'build-plan-tasks (group 9) FAIL'
 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:1652:68
    1650|       const rows = [...other, ...failRows(), decisionRow(), ...verifie…
    1651|       const named = summary(rows, pauseFile({ gaps: [ACCEPT, FIX42] })…
    1652|       for (const reason of FAIL_REASONS) expect(named.reasons).not.toC…
       |                                                                    ^
    1653|       expect(named.reasons).toContain("build-plan-tasks (group 7) FAIL…
    1654|       expect(named.reasons).toContain("build-plan-verify (group 7) FAI…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > a verify pause's group > a Fix now item without a Fix task line or naming a missing task keeps its group's FAIL
AssertionError: expected [ …(4) ] to not include 'build-plan-tasks (group 9) FAIL'
 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:1663:70
    1661|       // The control names task 42, verified, and clears the group.
    1662|       const control = summary(rowsOf(), pauseFile({ gaps: [ACCEPT, FIX…
    1663|       for (const reason of FAIL_REASONS) expect(control.reasons).not.t…
       |                                                                      ^
    1664|       expectKept(summary(rowsOf(), pauseFile({ gaps: [ACCEPT, { decisi…
    1665|       expectKept(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > a verify pause's group > a paused group's CONCERNS rows stay concerns after its Fix now task is verified
AssertionError: expected [ …(4) ] to not include 'build-plan-tasks (group 9) FAIL'
 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:1682:29
    1680|       ];
    1681|       const s = summary(rows, pauseFile({ gaps: [ACCEPT, FIX42] }));
    1682|       expect(s.reasons).not.toContain("build-plan-tasks (group 9) FAIL…
       |                             ^
    1683|       expect(s.reasons).toContain("build-plan-verify (group 9) CONCERN…
    1684|       expect(s.reasons).toContain("build-plan-gaps-remediate (group 9)…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > a verify pause's group > a holistic or challenge decision file clears no group rows
AssertionError: expected [ …(4) ] to not include 'build-plan-tasks (group 9) FAIL'
 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:1691:70
    1689|       // The control is a verify pause and clears the group.
    1690|       const control = summary(rowsOf(), pauseFile({ gaps: [ACCEPT, FIX…
    1691|       for (const reason of FAIL_REASONS) expect(control.reasons).not.t…
       |                                                                      ^
    1692|       for (const from of ["holistic", "challenge"])
    1693|         expectKept(summary(rowsOf(), pauseFile({ from, gaps: [ACCEPT, …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > a verify pause's group > a group that paused more than once is settled by its latest qualifying decision
AssertionError: expected [ …(3) ] to not include 'build-plan-verify (group 9) FAIL'
 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:1729:35
    1727|         }),
    1728|       );
    1729|       expect(settled.reasons).not.toContain("build-plan-verify (group …
       |                                   ^
    1730|       expect(settled.reasons).not.toContain("build-plan-tasks (group 9…
    1731|       // Without the later fix verified, the first pause cannot clear …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > a verify pause's group > an Accept-only verify pause resolves its group's FAIL rows before the pause
AssertionError: expected [ …(4) ] to not include 'build-plan-tasks (group 9) FAIL'
 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:1746:64
    1744|       const rows = [...failRows(), decisionRow()];
    1745|       const s = summary(rows, decision);
    1746|       for (const reason of FAIL_REASONS) expect(s.reasons).not.toConta…
       |                                                                ^
    1747|       expect(s.verdict).toBe("CONCERNS");
    1748|       expect(s.reasons.join("\n")).toContain("2 item(s) accepted at th…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/10]⎯


 Test Files  1 failed (1)
      Tests  10 failed | 55 passed (65)
   Start at  17:06:52
   Duration  1.47s (import 45%, transform 39%, setup 9%, tests 6%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-l1kIb1/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/workflows.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/workflows.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/workflows.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/workflows.test.ts

[test-timeout-budget] load average 73.3 on 10 cores: unit limits 30000ms per test, 60000ms per hook (x6.00)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (162 tests | 1 failed) 141165ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 822ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1961ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 425ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 438ms
     ✓ writes no limits for a workflow with no ask point 348ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 432ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 682ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 698ms
       ✓ a new run in the same chat gets its own session row 701ms
       ✓ writes none outside Claude Code 381ms
     ✓ opens the next run after a finished one, and after another workflow's run 497ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 583ms
     ✓ design / plan / build / debug book in the current worktree 510ms
     ✓ refuses when the lock is live, writing no row 598ms
     ✓ --lock-held checks the lock is ours 957ms
     ✓ rejects an unknown workflow 285ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 545ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 793ms
   ✓ bkit workflows start — resume facts (8)
     ✓ a new run has no last step and no open decision 443ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 422ms
     ✓ an OPEN decision of an earlier run never resurfaces 561ms
     ✓ an OPEN decision mid-build prints its header fields 421ms
     ✓ openDecision carries the Gate header 392ms
     ✓ openDecision gate is null without the header 434ms
     ✓ openDecision gate ignores a Gate line below the header 344ms
     ✓ reads Test attempt from a tests pause 581ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 783ms
     ✓ writes no row when status.jsonl does not exist 418ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 533ms
     ✓ aborts a rebase only when one is in progress 948ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 877ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 858ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 560ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 562ms
     ✓ --max-exceeded says a handover is due without any sentinel 486ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 459ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 542ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 696ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 325ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 302ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 274ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 518ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 512ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 556ms
     ✓ a debug run in SOAK mode always needs a handover 689ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1070ms
       ✓ counts subagents of an earlier chat the run's session rows name 1098ms
       ✓ records no context block, and still closes, outside a Claude Code session 1906ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1404ms
     ✓ records ending held and publish false on the workflow-done row 1307ms
     ✓ defaults the close row to ending done 1240ms
     ✓ refuses an unknown ending 544ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1320ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1028ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1263ms
     ✓ always writes the telemetry, whatever the runtime 925ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 625ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 554ms
     ✓ an unwritable stats path is logged and never fails the close 489ms
     ✓ appends the completeness row before the workflow-done row 596ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 604ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 462ms
     ✓ writes one completeness row per close 719ms
     ✓ leaves out the previous run's rows that share a second with this run's start 459ms
     ✓ still closes when the completeness check throws 567ms
     ✓ still closes when the completeness row write throws 466ms
     ✓ refuses without status.jsonl and writes nothing 185ms
     ✓ ship: run.pr, size of the squash commit, and coverage 474ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 799ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 491ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 365ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 478ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 489ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 569ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 464ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 471ms
     ✓ --record-step writes the close step's row before workflow-done 346ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 404ms
     ✓ --number without --outbox is a usage error 346ms
     ✓ --flush is ship only 139ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 475ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 504ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 534ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 547ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 391ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 195ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 180ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1250ms
     ✓ --flush with nothing to record commits and pushes nothing 683ms
     ✓ --flush carries the named worktree's logs into the dev commit 1209ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 1387ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1325ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1749ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1384ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2459ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1327ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1399ms
     ✓ --push on dev never carries a row whose references name another feature 1462ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1991ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 2847ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1392ms
     ✓ --push commits in the named worktree, not the checkout it runs from 653ms
     ✓ rejects --push with --flush, and --flush outside ship 115ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 1609ms
     ✓ preserves unlanded file deletions and ledger additions on close 3396ms
     ✓ preserves dirty work and uncertain branch evidence during close 3803ms
     ✓ preserves a local feature ref changed after its cleanup proof 3675ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1816ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2710ms
     ✓ a close that landed releases the lock 4484ms
     ✓ removes the worktree before it releases the lock 3836ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 5877ms
       ✓ closePr refuses when the PR base is unknown 5164ms
     ✓ leaves a worktree no workflow created, and its branch, in place 3366ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 324ms
     ✓ exits 12 when there is no versioned draft 237ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 240ms
     ✓ stamps the anchor from the runtime-resolved base commit 369ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 443ms
     ✓ promote copies the plan only 263ms
     ✓ rejects a workflow other than design or plan 214ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 486ms
     ✓ names the branch, not the remote-tracking ref, in each URL 589ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 512ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 456ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1036ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 749ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1647ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 742ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 762ms
     ✓ a second run's record does not let this FID's close commit 846ms
     ✓ record is present after workflows close and before the push 1889ms
     ✓ failed handover from dev removes the record and keeps recorded paths 3385ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 274ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 242ms
     ✓ a run with no issue holds the prompt alone 203ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 586ms
     ✓ --plan is appended when the file exists and skipped when it does not 398ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 760ms
     ✓ a missing prompt file exits 13 290ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 1080ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 964ms
     ✓ puts each --line after the summary, in flag order 1113ms
     ✓ refuses --final-return without --summary-file 235ms
     ✓ --summary prints the file and keeps a copy in --outbox 948ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 1059ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 270ms
     ✓ a missing summary file exits 13 before anything is written 220ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 321ms
     ✓ a folder outside the outbox sessions folder is kept 303ms
     ✓ without --session-dir prints no sessionRemoved 253ms
   ❯ bkit workflows summary (11)
     ✓ passes publish into the summary input 90ms
     ✓ summary is FAIL when a plan task is not done 33ms
     ✓ summary is CONCERNS when a deferral was written 36ms
     ✓ a deferral closed later no longer lowers the verdict, while its history stays on disk 28ms
     ✓ recomputes the verdict from resolved work without rewriting the earlier summary event 40ms
     × prints CONCERNS when a Fix now group's fix task and a test-fix FAIL are both resolved 54ms
     ✓ summary recommends /bkit-debug on FAIL 78ms
     ✓ summary reports the last attempt 22ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 25ms
     ✓ a design summary carries the organised design's open questions 25ms
     ✓ refuses a status file with no run of the workflow, and a missing one 5ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows summary > prints CONCERNS when a Fix now group's fix task and a test-fix FAIL are both resolved
AssertionError: expected 'FAIL' to be 'CONCERNS' // Object.is equality

Expected: "CONCERNS"
Received: "FAIL"

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:3317:28
    3315|     const r = await summarize(cwd);
    3316|     expect(r.code).toBe(0);
    3317|     expect(r.json.verdict).toBe("CONCERNS");
       |                            ^
    3318|     expect(r.json.failures).toBe(0);
    3319|     const md = fs.readFileSync(path.join(cwd, SREL, "build-summary.md"…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 161 passed (162)
   Start at  17:06:58
   Duration  142.43s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-4FINWf/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
