Enforced: true
Red: 10
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 5, attempt 1

Plan: `docs/plans/202611/958-agents-orchestrator-write-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 17 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a question line written with an en dash, naming the line" | red | failure: expected +0 to be 6 // Object.is equality |
| 17 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a file with no question when the engine file holds no loop question" | red | failure: expected +0 to be 6 // Object.is equality |
| 18 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > an owner's Fix now in the decision file wins over an engine Accept (assumed)" | red | failure: expected 'Accept (assumed) — cosmetic (no owner…' to be 'Fix now — the owner chose a fix' // Object.is equality |
| 18 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > an owner's answer in the decision file wins over an engine line applied without asking" | red | failure: expected 'Accept — recommended; applied without…' to be 'Fix now — the owner chose a fix' // Object.is equality |
| 18 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions skip > keeps the re-run when the owner's Fix now beats an engine Accept (assumed)" | red | failure: expected +0 to be 1 // Object.is equality |
| 19 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a Status, Source changed or Gate line in the orchestrator's header" | red | failure: Status: OPEN: expected +0 to be 6 // Object.is equality |
| 20 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > does not count a fenced line under ## CRITICAL as an item" | red | failure: expected 6 to be +0 // Object.is equality |
| 20 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > a fenced ## line under ## CRITICAL does not end the section" | red | failure: expected 6 to be +0 // Object.is equality |
| 21 | `.bkit/core/engine/commands/workflow/audit-report.test.ts` "parseAuditReport > reads a row whose Evidence cell holds a backslash" | red | failure: audit report: a Findings table is not a well-formed table |
| 21 | `.bkit/core/engine/commands/workflow/audit-report.test.ts` "parseAuditReport > reads a lone short None row as no finding" | red | failure: audit report: a Findings table is not a well-formed table |

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

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts (72 tests | 4 failed) 1097ms
   ✓ bkit decisions apply --by=rerun (5)
     ✓ records the re-run under Q1 and closes the file 20ms
     ✓ refuses a file without Gate: FAIL or not OPEN 13ms
     ✓ refuses a Gate: FAIL file whose Q1 is an item, not the loop question 12ms
     ✓ refuses a loop file with an undecided item question 13ms
     ✓ refuses a file whose only Gate: FAIL line is in an item body 14ms
   ❯ bkit decisions skip (8)
     ✓ decisions skip exits 0 when all five conditions hold 13ms
     ✓ decisions skip exits 1 and names the fact for a Gate: FAIL header 11ms
     ✓ decisions skip exits 1 when the Source changed header is missing 12ms
     ✓ decisions skip exits 1 when an item is not Accept 12ms
     ✓ decisions skip exits 1 when the loop question is not Decide 12ms
     ✓ decisions skip exits 1 for a pause that is not from verify or holistic 13ms
     × keeps the re-run when the owner's Fix now beats an engine Accept (assumed) 15ms
     ✓ decisions skip exits 2 for a missing file 13ms
   ✓ bkit decisions apply --by=headless (4)
     ✓ takes each recommendation: an Accept is assumed, Fix now is written as such 20ms
     ✓ leaves hard blockers for the owner and exits with the hard-blocker code 19ms
     ✓ apply --by=headless leaves a Recommended: none item for the owner 18ms
     ✓ labels the runtime from the main checkout's Cursor marker when run in a build worktree 53ms
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
   ✓ bkit decisions apply --by=owner and pending (8)
     ✓ pending lists each assumed Accept nobody confirmed 23ms
     ✓ --confirm writes the owner's decision row and the real Accept; --reject marks it rejected 66ms
     ✓ apply --by=owner --confirm confirms an assumed item in a per-line file 42ms
     ✓ refuses an item that is not an assumed Accept, or a call without one of --confirm / --reject 18ms
     ✓ --defer writes one needs-decision deferral per listed item, then lists none 43ms
     ✓ --defer letters the options in the deferral row 40ms
     ✓ pending refuses a --fid that climbs out of the log folder and reads and writes nothing 17ms
     ✓ refuses a malformed --month 16ms
   ❯ bkit decisions check (6)
     ✓ refuses a question without lettered options, naming it 12ms
     ✓ refuses Q1 when the engine file holds the loop question 12ms
     × refuses a question line written with an en dash, naming the line 11ms
     × refuses a file with no question when the engine file holds no loop question 12ms
     × refuses a Status, Source changed or Gate line in the orchestrator's header 12ms
     ✓ accepts questions numbered from Q1 when the pause has no engine file 12ms
   ✓ bkit decisions counts (24)
     ✓ writes the attempt line, progress, base check and loop question into the engine file only 13ms
     ✓ recommends Decide when the last round changed no source 12ms
     ✓ recommends Try again when the last round made progress 11ms
     ✓ engine file recommends Stop when the base check is all and no questions are counted 12ms
     ✓ engine file recommends Decide when the base check is all and questions are counted 12ms
     ✓ writes Source changed and Gate into the engine file for a verify pause with no loop 12ms
     ✓ --loop=holistic counts only the rounds since the whole-feature check was last clean 12ms
     ✓ holistic limit pause prints the rounds run, never above max 11ms
     ✓ prints the group gate's failing tests per round for the verify loop 12ms
     ✓ --loop on an unknown trend says the limit is used up 13ms
     ✓ --loop on an unknown trend below the limit does not say the limit is used up 11ms
     ✓ base check all in adopt mode adds the merge sentence 24ms
     ✓ base check some with undetermined cases counts only the branch's as fixable 12ms
     ✓ --loop writes an effect for each loop option, Stop included when no item is counted 12ms
     ✓ prints the holistic gate's failing tests per round for the holistic loop 12ms
     ✓ --loop on an unknown trend recommends Try again without claiming progress 12ms
     ✓ base check all says a gate still red after resume comes from this branch 12ms
     ✓ base check some names the split 12ms
     ✓ base check none keeps the trend and names the branch 12ms
     ✓ base check unknown keeps the trend and says why 12ms
     ✓ Try again is offered for every base verdict 93ms
     ✓ base check prints how many failing tests are also red on base 23ms
     ✓ a missing or malformed base check is a usage error that names the problem 24ms
     ✓ --loop needs --file 12ms
   ✓ bkit decisions apply --by=headless (1)
     ✓ writes assumed decisions into the engine file and leaves the decision file unchanged 18ms
   ✓ bkit decisions apply --by=owner and pending (2)
     ✓ writes a confirmation into the engine file 44ms
     ✓ --answer writes the loop answer under the engine file's Q1 12ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions skip > keeps the re-run when the owner's Fix now beats an engine Accept (assumed)
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:409:20
    407|     );
    408|     const r = await run(["decisions", "skip", `--file=${file}`], root);
    409|     expect(r.code).toBe(1);
       |                    ^
    410|     expect(r.json.route).toBeNull();
    411|     expect(r.json.problem).toContain("Fix now");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions check > refuses a question line written with an en dash, naming the line
AssertionError: expected +0 to be 6 // Object.is equality

- Expected
+ Received

- 6
+ 0

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:978:20
    976|     fs.writeFileSync(file, fs.readFileSync(file, "utf-8").replace("**Q…
    977|     const r = await run(["decisions", "check", `--file=${file}`], root…
    978|     expect(r.code).toBe(6);
       |                    ^
    979|     expect(`${JSON.stringify(r.json)}${r.err}`).toContain("Q1 \u2013");
    980|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions check > refuses a file with no question when the engine file holds no loop question
AssertionError: expected +0 to be 6 // Object.is equality

- Expected
+ Received

- 6
+ 0

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:987:20
    985|     fs.writeFileSync(file, ["Question: CHALLENGE", "From: verify", "Gr…
    986|     const r = await run(["decisions", "check", `--file=${file}`], root…
    987|     expect(r.code).toBe(6);
       |                    ^
    988|   });
    989|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions check > refuses a Status, Source changed or Gate line in the orchestrator's header
AssertionError: Status: OPEN: expected +0 to be 6 // Object.is equality

- Expected
+ Received

- 6
+ 0

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:999:28
    997|       );
    998|       const r = await run(["decisions", "check", `--file=${file}`], ro…
    999|       expect(r.code, line).toBe(6);
       |                            ^
    1000|       expect(`${JSON.stringify(r.json)}${r.err}`, line).toContain(line…
    1001|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 68 passed (72)
   Start at  05:14:50
   Duration  1.30s (tests 88%, import 5%, transform 5%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-AmA4bM/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/open-decision.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/open-decision.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/open-decision.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/open-decision.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write

 ❯ .bkit/core/engine/commands/workflow/open-decision.test.ts (29 tests | 2 failed) 16ms
   ✓ decision file readers (4)
     ✓ decisionHeader reads the header block only, first value winning 1ms
     ✓ parseDecisionItems reads each item's number, title and answer 1ms
     ✓ optionAnswer turns a letter reply into the option it names 0ms
     ✓ undecidedBesidesLoop leaves the loop question out of the undecided list 0ms
   ❯ decision file readers (7)
     ✓ decisionItems reads the loop question and progress from the engine file 3ms
     ✓ the engine file's Decision line wins for one question 1ms
     × an owner's Fix now in the decision file wins over an engine Accept (assumed) 3ms
     × an owner's answer in the decision file wins over an engine line applied without asking 1ms
     ✓ decisionItems reads an old single-file layout like parseDecisionItems 1ms
     ✓ openDecision reads Gate and Source changed from the engine file's header 1ms
     ✓ a pause whose loop answer is Try again reads DECIDED 2ms
   ✓ gateRerun (8)
     ✓ re-runs a red-gate pause laid out in two files 1ms
     ✓ is true for an open red-gate pause whose only undecided question is the loop question 0ms
     ✓ is false for a gate that is not red 0ms
     ✓ is false for a pause that is not open 0ms
     ✓ is false for a From that re-runs nothing 0ms
     ✓ is false for an undecided item beside the loop question 0ms
     ✓ is false for a pause with no loop question 0ms
     ✓ is false for no open pause 0ms
   ✓ skipProblem (10)
     ✓ reads Source changed and the loop answer from the engine file 0ms
     ✓ is null when all five conditions hold 0ms
     ✓ names the first failing fact: no From header 0ms
     ✓ names the first failing fact: From is "tests", not verify or holistic 0ms
     ✓ names the first failing fact: Q2 is "Fix now — do it", not Accept 0ms
     ✓ names the first failing fact: Q2 is undecided, not Accept 0ms
     ✓ names the first failing fact: the loop question Q1 is "Try again", not Decide 0ms
     ✓ names the first failing fact: Gate: FAIL header: the gate is red 0ms
     ✓ names the first failing fact: no Source changed header 0ms
     ✓ names the first failing fact: Source changed is "true", not false 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/open-decision.test.ts > decision file readers > an owner's Fix now in the decision file wins over an engine Accept (assumed)
AssertionError: expected 'Accept (assumed) — cosmetic (no owner…' to be 'Fix now — the owner chose a fix' // Object.is equality

Expected: "Fix now — the owner chose a fix"
Received: "Accept (assumed) — cosmetic (no owner, LOCAL, 2026-11-17)"

 ❯ .bkit/core/engine/commands/workflow/open-decision.test.ts:176:25
    174|     );
    175|     const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
    176|     expect(q2.decision).toBe("Fix now — the owner chose a fix");
       |                         ^
    177|   });
    178|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/open-decision.test.ts > decision file readers > an owner's answer in the decision file wins over an engine line applied without asking
AssertionError: expected 'Accept — recommended; applied without…' to be 'Fix now — the owner chose a fix' // Object.is equality

Expected: "Fix now — the owner chose a fix"
Received: "Accept — recommended; applied without asking (GITHUB_ACTION)"

 ❯ .bkit/core/engine/commands/workflow/open-decision.test.ts:185:25
    183|     );
    184|     const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
    185|     expect(q2.decision).toBe("Fix now — the owner chose a fix");
       |                         ^
    186|   });
    187|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 27 passed (29)
   Start at  05:14:52
   Duration  93ms (setup 44%, tests 40%, transform 7%, import 6%, worker 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-RpDT3k/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/steps.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/steps.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts (174 tests | 2 failed) 17975ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 161ms
     ✓ finishes a CI round only with its own failed job count 150ms
     ✓ preserves local clamp enforcement when completing test rounds 42ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 45ms
     ✓ done prints progressLine 49ms
     ✓ progress output metadata 0ms
     ✓ gate progress number validation 45ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 122ms
     ✓ done --group writes group on the row 99ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 159ms
     ✓ --commit=none writes the row and leaves it uncommitted 49ms
     ✓ build-group-start records parentSha and group 50ms
     ✓ carries extra fields, parsed as JSON when they are JSON 95ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 37ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 37ms
     ✓ refuses an empty artifact 37ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 37ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 37ms
     ✓ rejects ["--verdict=MAYBE"] 37ms
     ✓ rejects ["--strategy=YOLO"] 37ms
     ✓ rejects ["--failures=-1"] 37ms
     ✓ rejects ["--field=verdict=PASS"] 36ms
     ✓ rejects ["--status=SKIPPED"] 38ms
     ✓ needs a message unless --commit=none 43ms
     ✓ reports a failed commit with exit 8 without writing the row 240ms
     ✓ a failed commit leaves no row staged in the index 207ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 258ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 239ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 216ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 198ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 227ms
   ✓ bkit steps verdict (11)
     ✓ returns the verdict and every header field 40ms
     ✓ reads a header with a leftover Fingerprint line 36ms
     ✓ a missing artifact exits 4 34ms
     ✓ empty artifact exits 0 36ms
     ✓ pending artifact exits 1 36ms
     ✓ no marker artifact exits 2 37ms
     ✓ disallowed artifact exits 3 37ms
     ✓ bad failures artifact exits 4 38ms
     ✓ a required field that is absent is invalid (re-prompt) 37ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 38ms
     ✓ only reads above the marker 38ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 98ms
     ✓ fails when no row was written for the step 36ms
     ✓ --ref reads the status file as committed on that ref, not from disk 109ms
     ✓ --ref exits 3 when the ref does not carry the status file 110ms
     ✓ fails on a placeholder left in the artifact 93ms
     ✓ fails when the row's verdict differs from the artifact's 99ms
     ✓ fails when the row does not list the artifact, or carries another attempt 100ms
     ✓ fails on a missing artifact 96ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 98ms
     ✓ refuses a negative or non-integer attempt (2) 37ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 43ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 43ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 39ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a row missing its attempt 43ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 43ms
     ✓ fails a diagnose row missing its strategy, passes with it 85ms
     ✓ fails a run-tests row missing its scope, and an empty scope 133ms
     ✓ steps finish records attempt and scope on a build-holistic-gate row 42ms
     ✓ names every missing field at once 42ms
     ✓ asks nothing of a step that writes none of them 42ms
     ✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 6ms
   ✓ ledger writer references (1)
     ✓ every configured writer has a prompt file 0ms
   ✓ placeholderLines (1)
     ✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 0ms
   ✓ bkit steps finish (21)
     ✓ preserves challenge findings in the event when a later round overwrites the report 45ms
     ✓ steps finish refuses route=continue that decisions skip would refuse 44ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 134ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 37ms
     ✓ --derived-artifact (4)
       ✓ a --derived-artifact holding a whole-line PENDING passes and is recorded 43ms
       ✓ a PENDING in --artifact still refuses while a --derived-artifact is passed 38ms
       ✓ a PENDING in --optional-artifact still refuses while a --derived-artifact is passed 37ms
       ✓ a missing --derived-artifact is skipped and not recorded 43ms
     ✓ re-asks (exit 6) when a field the prompt declares is missing 38ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 38ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 44ms
     ✓ a true | false header field is true when any agent sets it true 43ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 49ms
     ✓ records the header's Strategy on the row 48ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 49ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 117ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 38ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 84ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 150ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 196ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 151ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 196ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 285ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 183ms
     ✓ --post needs --number; without --post there is no tracker key 68ms
   ✓ bkit steps stub (4)
     ✓ copies the prior version under a PENDING header 38ms
     ✓ --strip-header drops the prior version's own header 37ms
     ✓ refuses --result-file as an unknown flag 37ms
     ✓ exits 4 when the prior version is missing or empty 37ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 37ms
     ✓ checks the FID's shape for the wired tracker 49ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 93ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 43ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 173ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 128ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 85ms
       ✓ gate --issue without --fid is a usage error 37ms
       ✓ gate --issue="" under none keeps today's check 42ms
     ✓ --attempt-of checks the row carries the derived counter 98ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 251ms
     ✓ writeStepRow refuses when a recorded path changed 295ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 136ms
     ✓ writeStepRow appends its commit sha to the record 253ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 397ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 96ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 188ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 181ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 189ms
     ✓ finds the run's plan beside its status file 0ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 123ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 305ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 217ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 171ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 115ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 293ms
     ✓ refuses the execute step when it changes another group's planned test, exit 11 111ms
     ✓ refuses the gaps-remediate step when it changes another group's planned test, exit 11 110ms
     ✓ the tests step's finish refuses an earlier task's changed planned test with exit 11 174ms
     ✓ the tests step's finish passes its own group's and taken-over tests 235ms
     ✓ lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row 186ms
     ✓ lets a code step through when its BLOCKED line names the changed test by the last segment of its name 184ms
     ✓ lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test 185ms
     ✓ records only the changed test when a BLOCKED line also names an unchanged one 202ms
     ✓ refuses only the changed planned tests no BLOCKED line of the log names 128ms
     ✓ the refusal names the BLOCKED line the engine reads 98ms
     ✓ the exit 11 help names the BLOCKED line that lets a change through 0ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 257ms
     ✓ refuses a later code step that changes a BLOCKED change again 187ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 279ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 287ms
     ✓ refuses a code step that writes a planned test whose red recorded its file missing, exit 11 114ms
     ✓ the refusal of a restored BLOCKED change names the recorded change as the lines to put back 192ms
     ✓ the refusal of a re-change says the logged reason is already recorded 190ms
     ✓ refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11 115ms
     ✓ a code step's finish adds one takeover task and one build-takeover row for a contradicted test, exit 11 136ms
     ✓ the contradiction's problem says the takeover task rewrites the test and no BLOCKED line keeps it 126ms
     ✓ the same contradicted finish run again adds no second task or row 139ms
     ✓ exit 11 names no contradiction and adds no task while the owning task is open 119ms
     ✓ a mixed refusal names both tests and words the problem for each kind 141ms
     ✓ a chain of takeovers gives one contradiction, from the latest owner 147ms
     ✓ refuses a code step whose BLOCKED-named change renames a planned test away, exit 11 116ms
     ✓ records the baseline blob on a BLOCKED-named change that only adds lines 191ms
     ✓ passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block 230ms
     ✓ still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11 160ms
     ✓ passes group 2's tests step that appends its test to a file whose group 1 test has no recorded block, before group 2's red 237ms
     ✓ passes group 2's tests step that creates the file a group 1 test was recorded missing in 221ms
     ✓ a changedTests record on a non-code-step row does not move the lock's baseline 106ms
     ✓ refuses a --field changedTests on a step finish 73ms
     ✓ the exit 11 refusal says verify reads a BLOCKED change's added lines 109ms
     ✓ exit codes list 11 as planned tests touched and 15 as source touched in the tests step 0ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 49ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 109ms
     ✓ does not count an artifact the run found committed when it started 141ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 85ms
     ✓ commits a package.json change outside bkit.workflows 144ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 259ms
   ✓ promptHeader (1)
     ✓ reads the Failures count rule of bkit-plan-review-1 0ms
   ✓ headerDeclaration (1)
     ✓ refuses an unknown count declaration 0ms
   ❯ bkit steps finish (11)
     ✓ checks Failures against the ## CRITICAL items and ignores OPTIONAL ones 50ms
     ✓ reads None under ## CRITICAL as zero items 47ms
     ✓ refuses a verify Fixable that disagrees with its gap lines 39ms
     ✓ counts only the Fixable gap lines under a verify gap-count line 48ms
     ✓ refuses a challenge PASS with a HIGH task block 37ms
     ✓ refuses a challenge CONCERNS with a CRITICAL task block 37ms
     ✓ hands back a challenge task block it cannot read 37ms
     ✓ refuses a report the old render wrote whose Failures counted an OPTIONAL item 37ms
     ✓ checks each agent's count in a two-agent finish 37ms
     × does not count a fenced line under ## CRITICAL as an item 40ms
     × a fenced ## line under ## CRITICAL does not end the section 38ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish > does not count a fenced line under ## CRITICAL as an item
AssertionError: expected 6 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 6

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3400:20
    3398|     );
    3399|     const r = await run(cwd, REVIEW);
    3400|     expect(r.code).toBe(0);
       |                    ^
    3401|     expect(r.json.problem).toBeUndefined();
    3402|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > bkit steps finish > a fenced ## line under ## CRITICAL does not end the section
AssertionError: expected 6 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 6

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:3428:20
    3426|     );
    3427|     const r = await run(cwd, REVIEW);
    3428|     expect(r.code).toBe(0);
       |                    ^
    3429|     expect(r.json.problem).toBeUndefined();
    3430|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 172 passed (174)
   Start at  05:14:53
   Duration  18.16s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-CEWR5p/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/audit-report.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/audit-report.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/audit-report.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/audit-report.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write

 ❯ .bkit/core/engine/commands/workflow/audit-report.test.ts (5 tests | 2 failed) 4ms
   ❯ parseAuditReport (5)
     ✓ reads IDs, severities, titles and keys from the Findings table 2ms
     ✓ refuses a row with an unknown key, naming its ID 0ms
     ✓ refuses a row with an empty severity, naming its ID 0ms
     × reads a row whose Evidence cell holds a backslash 1ms
     × reads a lone short None row as no finding 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/audit-report.test.ts > parseAuditReport > reads a row whose Evidence cell holds a backslash
Error: audit report: a Findings table is not a well-formed table
 ❯ bad .bkit/core/engine/commands/workflow/audit-report.ts:147:32
    145|  */
    146| export function parseAuditReport(text: string, slug: string): AuditRep…
    147|   const bad = (why: string) => new CommandError(EXIT.USAGE, `audit rep…
       |                                ^
    148|   const from = text.search(/^## Findings\s*$/m);
    149|   if (from < 0) throw bad("no `## Findings` section");
 ❯ parseAuditReport .bkit/core/engine/commands/workflow/audit-report.ts:154:45
 ❯ .bkit/core/engine/commands/workflow/audit-report.test.ts:84:20

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/audit-report.test.ts > parseAuditReport > reads a lone short None row as no finding
Error: audit report: a Findings table is not a well-formed table
 ❯ bad .bkit/core/engine/commands/workflow/audit-report.ts:147:32
    145|  */
    146| export function parseAuditReport(text: string, slug: string): AuditRep…
    147|   const bad = (why: string) => new CommandError(EXIT.USAGE, `audit rep…
       |                                ^
    148|   const from = text.search(/^## Findings\s*$/m);
    149|   if (from < 0) throw bad("no `## Findings` section");
 ❯ parseAuditReport .bkit/core/engine/commands/workflow/audit-report.ts:154:45
 ❯ .bkit/core/engine/commands/workflow/audit-report.test.ts:91:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 3 passed (5)
   Start at  05:15:12
   Duration  91ms (setup 45%, transform 21%, import 20%, tests 11%, worker 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-a5k94q/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
