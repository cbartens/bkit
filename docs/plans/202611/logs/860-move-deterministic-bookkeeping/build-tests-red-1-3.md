Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 3

Plan: `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 11 | `.bkit/core/engine/commands/workflow/status.test.ts` "refuses to issue an invocation into a status file outside the issuing checkout" | red | failure: expected +0 not to be +0 // Object.is equality |
| 11 | `.bkit/core/engine/commands/workflow/run-facts.test.ts` "starts a step clock at the previous step row, not at an invocation row" | red | failure: expected { n: 1, totalMinutes: 1 } to deeply equal { n: 1, totalMinutes: 3 } |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/status.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/status.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/status.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/status.test.ts

[test-timeout-budget] load average 14.6 on 10 cores: unit limits 11800ms per test, 23600ms per hook (x2.36)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/commands/workflow/status.test.ts (80 tests | 1 failed) 2619ms
   ✓ debug evidence state (5)
     ✓ persists atomic selections and preserves identical evidence generations 12ms
     ✓ resumes saved evidence and replaces it only on explicit new selection 81ms
     ✓ clears saved CI routing immediately for explicit local selection 43ms
     ✓ counts reproduction and fixes only in the active generation 100ms
     ✓ orders covering gates for red tiers and preserves live off 164ms
   ✓ bkit status path (2)
     ✓ returns the main checkout's path outside a worktree, and whether it exists 51ms
     ✓ rejects a month that is not YYYYMM 0ms
   ✓ the status fold (4)
     ✓ skips a row it does not model (no type, an unknown type) and folds the rest 1ms
     ✓ ignores a row type it does not know 1ms
     ✓ refuses a line that is not JSON rather than folding around it (exit 3) 1ms
     ✓ a command reading the log reports the malformed line with exit 3 1ms
   ✓ bkit status route (20)
     ✓ reads the last verdict and failures of a step in the active run, per group 1ms
     ✓ reads a build-plan-execute row written before the step rename as build-plan-tasks 2ms
     ✓ prints the parentSha of the step's last row in the active run, per group 3ms
     ✓ counts absent failures as 0 when a verdict is present 1ms
     ✓ reads an absent failures count on FAIL as null: the count is unknown, not 0 1ms
     ✓ does not leak a completed run's verdict into a fresh run 1ms
     ✓ reads strategy across ALL runs and gives the next rung 1ms
     ✓ starts the ladder at STANDARD when no strategy is recorded 1ms
     ✓ prefers the run-level debugMode over an older step value, and reads pushMode and debugAttempt 1ms
     ✓ fails a --require'd mode that is missing or invalid 1ms
     ✓ is a usage error to require a step field without --step 0ms
     ✓ exits 3 when status.jsonl is missing 0ms
     ✓ falls back to the last step carrying debugMode / pushMode when no workflow-meta sets it 1ms
     ✓ reports an invalid mode as null, never as a mode 0ms
     ✓ climbs the ladder: PIVOT -> FINAL 1ms
     ✓ climbs the ladder: FINAL -> FINAL 1ms
     ✓ fails a --require'd strategy outside the ladder 0ms
     ✓ fails a --require'd verdict when the last DONE row carries none 1ms
     ✓ reads strategy per group, from the step's last DONE row, within its own workflow 1ms
     ✓ a non-numeric debugAttempt reads as 0 1ms
   ✓ bkit status route --prompt-file (debug Step 1) (12)
     ✓ a fresh run: attempt 1, NORMAL, no repro, every gate 60ms
     ✓ a resumed run keeps its attempt number 17ms
     ✓ fix rounds used up across runs (debug.fix.maxAttempts) enter SOAK 16ms
     ✓ the fix limit comes from bkit.workflows.debug.fix.maxAttempts 36ms
     ✓ [soak] and [repro] in the prompt 23ms
     ✓ a resumed run that soaked continues in SOAK 24ms
     ✓ soak rows of a finished run do not force SOAK on the next run 21ms
     ✓ an escalation recorded only in workflow-meta survives a resume 34ms
     ✓ [live=off] in the prompt drops the live gate; the issue body is not read 69ms
     ✓ finds status.jsonl from --fid and --month 125ms
     ✓ refuses --prompt-file for another workflow, and a missing --file without --fid 1ms
     ✓ a missing prompt file is a usage error 1ms
   ✓ bkit status route --workflow=build publish (7)
     ✓ lets the publish token override publish.local 42ms
     ✓ reads publish.local on LOCAL without a token 18ms
     ✓ coerces publish false to true on a non-LOCAL runtime 19ms
     ✓ accepts --prompt-file with --workflow=build 19ms
     ✓ ignores publish=maybe and falls through to config 29ms
     ✓ refuses publish without a runtime-resolved row 52ms
     ✓ prints publishSource for token, local, remote and coerced 111ms
   ✓ bkit status route --expect (4)
     ✓ passes when every field holds the expected value 1ms
     ✓ exits 4 naming a field that holds another value 1ms
     ✓ an expected field is also required: missing exits 4 1ms
     ✓ checks a step field with --step, and refuses an unknown field 1ms
   ✓ bkit status meta (9)
     ✓ appends a workflow-meta row the route read then sees 1ms
     ✓ records openedPr, and refuses the removed --soak-entry and --decision 1ms
     ✓ --debug-attempt=run records the active run's number 1ms
     ✓ meta refuses --plan-source 1ms
     ✓ rejects ["--debug-mode=TURBO"] 1ms
     ✓ rejects ["--push-mode=REMOTE"] 0ms
     ✓ rejects ["--debug-attempt=0"] 1ms
     ✓ rejects [] 1ms
     ✓ never starts a log 0ms
   ✓ bkit status row (6)
     ✓ appends a typed row with fields parsed as JSON where they are JSON 2ms
     ✓ refuses ["--type=step-done"] 3ms
     ✓ refuses ["--type=Ship_Gate"] 1ms
     ✓ refuses ["--type=x","--field=at=now"] 1ms
     ✓ refuses ["--type=x","--field=Bad=1"] 1ms
     ✓ never starts a log (exit 3) 0ms
   ✓ bkit status row owner-pause friction (6)
     ✓ status row owner-pause appends one human-confirm friction row 91ms
     ✓ status row owner-pause skips the friction row when no step-done follows the last owner-pause with the same reason 74ms
     ✓ status row owner-pause with a new reason appends its own row with no step-done in between 96ms
     ✓ status row owner-pause in a later pause appends a same-key recurrence 129ms
     ✓ status row writes no friction row for other types or with BKIT_ENGINE_JOURNAL=off 35ms
     ✓ status row owner-pause keeps the status row and exits 4 when the friction row cannot be written 91ms
   ❯ bkit status invocation (5)
     ✓ issues invocation metadata from an explicit run and registered step 212ms
     × refuses to issue an invocation into a status file outside the issuing checkout 130ms
     ✓ records the issued invocation in the run status log and rebuilds a deleted receipt 190ms
     ✓ binds group and attempt and registers setup, remediation and ship steps 304ms
     ✓ registers the no-plan conversion step 55ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/status.test.ts > bkit status invocation > refuses to issue an invocation into a status file outside the issuing checkout
AssertionError: expected +0 not to be +0 // Object.is equality
 ❯ .bkit/core/engine/commands/workflow/status.test.ts:1251:24
    1249|       mine,
    1250|     );
    1251|     expect(r.code).not.toBe(0);
       |                        ^
    1252|     expect(fs.readFileSync(otherFile, "utf-8")).toBe(before);
    1253|     expect(fs.readFileSync(path.join(mine, REL), "utf-8")).toBe(mineBe…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 79 passed (80)
   Start at  07:51:53
   Duration  3.30s (tests 83%, transform 10%, import 5%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-buJyls/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/run-facts.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/run-facts.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/run-facts.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/run-facts.test.ts

[test-timeout-budget] load average 19.1 on 10 cores: unit limits 14050ms per test, 28100ms per hook (x2.81)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping

 ❯ .bkit/core/engine/commands/workflow/run-facts.test.ts (43 tests | 1 failed) 2004ms
   ✓ lineClass (1)
     ✓ splits changed files into code, tests and docs 2ms
   ✓ timeBlock / minutesOf (1)
     ✓ is start to end in minutes, to one decimal 1ms
   ✓ runLines (5)
     ✓ counts code, tests and docs apart, and leaves out plans, run logs and the ledgers 379ms
     ✓ counts deleted lines into changed 384ms
     ✓ cuts at each merge on the first-parent chain, so merged-in work is not counted 526ms
     ✓ is null when first is not an ancestor of last, or either is missing 344ms
     ✓ is all zero for an empty range 154ms
   ❯ runStatusRows / stepsBlock / ciList (7)
     ✓ takes the workflow's rows from its start on, in time order 1ms
     ✓ leaves out engine-action rows (they carry no workflow) 2ms
     ✓ counts each step's rows and the minutes since the row before each; total = sum of byStep 1ms
     ✓ leaves a run's step minutes unchanged when journal rows land between step rows 0ms
     × starts a step clock at the previous step row, not at an invocation row 9ms
     ✓ is empty when the run has only its start row 0ms
     ✓ lists every close step's CI dispatch, in order, with outcome as status 0ms
   ✓ planBlock (6)
     ✓ counts task headings, not every `- [` line: sub-step checkboxes are not tasks 4ms
     ✓ planBlock reports converted when a convert row exists 2ms
     ✓ planBlock reads groups from the plan 2ms
     ✓ reads per task its Test first tests and distinct test files; null for a task without the field 2ms
     ✓ planTasks counts tasks per group 0ms
     ✓ is undefined when the feature has no plan file 1ms
   ✓ buildBlock (6)
     ✓ reads every verify and gaps-remediate round, the last holistic and challenge, and the red-test runs 2ms
     ✓ buildBlock keys verify attempts by group 0ms
     ✓ its totals match their parts: findings total = the four severities, redTests = the build-tests-red rows 2ms
     ✓ carries the latest challenge size gate on the challenge block 1ms
     ✓ counts challenge findings from appended tasks 1ms
     ✓ counts findings once the merge ran; empty without the build's steps 1ms
   ✓ restateOutcome (3)
     ✓ appends the run's outcome again with the dispatch added to ci; it supersedes the close's 68ms
     ✓ ending is close-failed when the dispatch is unresolved 50ms
     ✓ is logged and returns false with no workflow-done row carrying parentSha, or no outcome row for it 21ms
   ✓ agentContextBlock (11)
     ✓ per agent type: the largest context of any of its subagents and how many ran 13ms
     ✓ leaves out model calls outside the run, synthetic messages and malformed lines 7ms
     ✓ context block counts calls by their own time across the run's chats 4ms
     ✓ a chat fingerprint is fp: and the first 12 hex of sha256 of `<platform>:<id>` 0ms
     ✓ runChats: the run's session fingerprints, each once, in row order 0ms
     ✓ stepsBlock skips session and owner rows when timing a step 0ms
     ✓ stepsBlock times a gate step across its test-run rows 0ms
     ✓ a subagent without a meta file counts as `unknown` 2ms
     ✓ undefined, never a throw, without a session id, a transcript or a subagent in the run 4ms
     ✓ undefined, never a throw, when a folder cannot be read 2ms
     ✓ the block passes outcome-row validation 2ms
   ✓ claudeTranscripts (1)
     ✓ reads the session id from CLAUDE_CODE_SESSION_ID and the dir from CLAUDE_CONFIG_DIR 0ms
   ✓ planFiles (2)
     ✓ a single plan is the plan file 1ms
     ✓ reads only the plan file, never {FID}-plan-N.md files; none without it 4ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/run-facts.test.ts > runStatusRows / stepsBlock / ciList > starts a step clock at the previous step row, not at an invocation row
AssertionError: expected { n: 1, totalMinutes: 1 } to deeply equal { n: 1, totalMinutes: 3 }

- Expected
+ Received

  {
    "n": 1,
-   "totalMinutes": 3,
+   "totalMinutes": 1,
  }

 ❯ .bkit/core/engine/commands/workflow/run-facts.test.ts:248:50
    246|       step(4, "build-b"),
    247|     ];
    248|     expect(stepsBlock(issued).byStep["build-b"]).toEqual({ n: 1, total…
       |                                                  ^
    249|     expect(stepsBlock(issued)).toEqual(stepsBlock(plain));
    250|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 42 passed (43)
   Start at  07:51:59
   Duration  2.51s (tests 85%, transform 7%, import 6%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-ojid3V/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
