Enforced: true
Red: 5
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 5, attempt 1

Plan: `docs/plans/202611/830-debug-diagnose-named-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 12 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "finishes local-only rounds through the actual Debug Step 3 commands" | red | failure: expected undefined to be 'local' // Object.is equality |
| 13 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "finishes replacement CI evidence with the unchanged debug run number" | red | failure: [bkit-steps] CI evidence does not match the active selection : expected { code: 2, json: null, …(1) } to match object { code: +0, json: { pass: true } } (1 matching property omitted from actual) |
| 13 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "finishes the first CI evidence round of the second debug run" | red | failure: [bkit-steps] CI evidence does not match the active selection : expected { code: 2, json: null, …(1) } to match object { code: +0, json: { pass: true } } (1 matching property omitted from actual) |
| 14 | `.bkit/core/engine/commands/workflow/runs.test.ts` "rejects fork verification runs that shadow a red selected workflow at the same head" | red | failure: expected +0 not to be +0 // Object.is equality |
| 14 | `.bkit/core/engine/commands/workflow/runs.test.ts` "preserves the requested event for selected-workflow verification" | red | failure: expected +0 not to be +0 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named

 ❯ .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts (7 tests | 3 failed) 14885ms
   ❯ Debug CI evidence sequence (7)
     × finishes local-only rounds through the actual Debug Step 3 commands 2323ms
     × finishes replacement CI evidence with the unchanged debug run number 1389ms
     × finishes the first CI evidence round of the second debug run 851ms
     ✓ checks the complete selected CI fix sequence against green and red final runs 2234ms
     ✓ reloads saved fixes and recollects explicitly replaced evidence generations 2631ms
     ✓ preserves local and repro overrides across actual workflow command sequences 4036ms
     ✓ blocks missing logs and wrong-branch evidence before source edits 1419ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts > Debug CI evidence sequence > finishes local-only rounds through the actual Debug Step 3 commands
AssertionError: expected undefined to be 'local' // Object.is equality

- Expected:
"local"

+ Received:
undefined

 ❯ .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts:343:36
    341|     const first = fresh.round();
    342|     expect(first).toMatchObject({ code: 0, json: { verdict: "PASS", ex…
    343|     expect.soft(first.json.source).toBe("local");
       |                                    ^
    344|     expect.soft(first.json.row.source).toBe("local");
    345|     const firstFinished = fresh.finishRound();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯

 FAIL  .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts > Debug CI evidence sequence > finishes local-only rounds through the actual Debug Step 3 commands
AssertionError: expected undefined to be 'local' // Object.is equality

- Expected:
"local"

+ Received:
undefined

 ❯ .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts:344:40
    342|     expect(first).toMatchObject({ code: 0, json: { verdict: "PASS", ex…
    343|     expect.soft(first.json.source).toBe("local");
    344|     expect.soft(first.json.row.source).toBe("local");
       |                                        ^
    345|     const firstFinished = fresh.finishRound();
    346|     expect.soft(firstFinished, firstFinished.err).toMatchObject({ code…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯

 FAIL  .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts > Debug CI evidence sequence > finishes local-only rounds through the actual Debug Step 3 commands
AssertionError: [bkit-steps] local test completion needs clamp evidence
: expected { code: 2, json: null, …(1) } to match object { code: +0, json: { pass: true } }
(1 matching property omitted from actual)

- Expected
+ Received

  {
-   "code": 0,
-   "json": {
-     "pass": true,
-   },
+   "code": 2,
+   "json": null,
  }

 ❯ .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts:346:51
    344|     expect.soft(first.json.row.source).toBe("local");
    345|     const firstFinished = fresh.finishRound();
    346|     expect.soft(firstFinished, firstFinished.err).toMatchObject({ code…
       |                                                   ^
    347|     expect(fresh.events().filter((event) => event.kind === "local-gate…
    348|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯

 FAIL  .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts > Debug CI evidence sequence > finishes local-only rounds through the actual Debug Step 3 commands
AssertionError: expected undefined to be 'local' // Object.is equality

- Expected:
"local"

+ Received:
undefined

 ❯ .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts:357:36
    355|     const local = override.round();
    356|     expect(local).toMatchObject({ code: 0, json: { verdict: "PASS", ex…
    357|     expect.soft(local.json.source).toBe("local");
       |                                    ^
    358|     expect.soft(local.json.row.source).toBe("local");
    359|     const finished = override.finishRound();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯

 FAIL  .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts > Debug CI evidence sequence > finishes local-only rounds through the actual Debug Step 3 commands
AssertionError: expected undefined to be 'local' // Object.is equality

- Expected:
"local"

+ Received:
undefined

 ❯ .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts:358:40
    356|     expect(local).toMatchObject({ code: 0, json: { verdict: "PASS", ex…
    357|     expect.soft(local.json.source).toBe("local");
    358|     expect.soft(local.json.row.source).toBe("local");
       |                                        ^
    359|     const finished = override.finishRound();
    360|     expect.soft(finished, finished.err).toMatchObject({ code: 0, json:…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯

 FAIL  .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts > Debug CI evidence sequence > finishes local-only rounds through the actual Debug Step 3 commands
AssertionError: [bkit-steps] local test completion needs clamp evidence
: expected { code: 2, json: null, …(1) } to match object { code: +0, json: { pass: true } }
(1 matching property omitted from actual)

- Expected
+ Received

  {
-   "code": 0,
-   "json": {
-     "pass": true,
-   },
+   "code": 2,
+   "json": null,
  }

 ❯ .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts:360:41
    358|     expect.soft(local.json.row.source).toBe("local");
    359|     const finished = override.finishRound();
    360|     expect.soft(finished, finished.err).toMatchObject({ code: 0, json:…
       |                                         ^
    361|   });
    362|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/8]⎯

 FAIL  .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts > Debug CI evidence sequence > finishes replacement CI evidence with the unchanged debug run number
AssertionError: [bkit-steps] CI evidence does not match the active selection
: expected { code: 2, json: null, …(1) } to match object { code: +0, json: { pass: true } }
(1 matching property omitted from actual)

- Expected
+ Received

  {
-   "code": 0,
-   "json": {
-     "pass": true,
-   },
+   "code": 2,
+   "json": null,
  }

 ❯ .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts:379:36
    377|     });
    378|     const finished = f.finishRound();
    379|     expect(finished, finished.err).toMatchObject({ code: 0, json: { pa…
       |                                    ^
    380|     expect(finished.json.row.attempt).toBe(replacement.json.row.attemp…
    381|     expect(finished.json.row).toMatchObject({ ciGeneration: 2, scope: …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/8]⎯

 FAIL  .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts > Debug CI evidence sequence > finishes the first CI evidence round of the second debug run
AssertionError: [bkit-steps] CI evidence does not match the active selection
: expected { code: 2, json: null, …(1) } to match object { code: +0, json: { pass: true } }
(1 matching property omitted from actual)

- Expected
+ Received

  {
-   "code": 0,
-   "json": {
-     "pass": true,
-   },
+   "code": 2,
+   "json": null,
  }

 ❯ .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts:405:36
    403|     });
    404|     const finished = f.finishRound();
    405|     expect(finished, finished.err).toMatchObject({ code: 0, json: { pa…
       |                                    ^
    406|     expect(finished.json.row.attempt).toBe(round.json.row.attempt);
    407|     expect(finished.json.row).toMatchObject({ ciGeneration: 1, scope: …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/8]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 4 passed (7)
   Start at  01:44:28
   Duration  14.96s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-yjmHWM/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/runs.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/runs.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/runs.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/runs.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts (185 tests | 2 failed) 30576ms
   × rejects fork verification runs that shadow a red selected workflow at the same head 672ms
   × preserves the requested event for selected-workflow verification 501ms
   ✓ requires selected other-workflow success at the exact pushed head 822ms
   ✓ bkit runs locate (11)
     ✓ locates CI evidence using prompt saved issue and local precedence 597ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 52ms
     ✓ filters branch and PR discovery by configured workflow and exact head 330ms
     ✓ freezes explicit workflow run attempt and all failed job pages 235ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 444ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 666ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 182ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 187ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 177ms
     ✓ rejects a workflow result count smaller than its returned records 181ms
     ✓ validates normalized fallback evidence against the requested identity 74ms
   ✓ fixture gh stub (10)
     ✓ runs?head_sha=green-capstone returns the captured workflow_runs list 9ms
     ✓ runs/<id>/jobs returns the captured jobs list, --paginate is accepted 10ms
     ✓ runs?head_sha=<unknown> returns total_count 0 (no-run shape) 6ms
     ✓ BKIT_FAKE_GH_API_ERROR=1: every api call exits 1 with stderr 6ms
     ✓ rate_limit returns the requested fixture state 8ms
     ✓ non-api argv exits non-zero (loud on an unmocked boundary) 6ms
     ✓ BKIT_FAKE_RATELIMITED=1: the run list fails rate-limit-shaped, rate_limit still answers 14ms
     ✓ --paginate emits one document per page; --slurp collapses them into an array 22ms
     ✓ rejects a '../'-laden SHA (no path traversal out of the runs dir) 6ms
     ✓ pr view is keyed by --repo; without it the checkout fixture is read 19ms
   ✓ bkit runs gate (68)
     ✓ accepts a green capstone at the head (exit 0) and says so 22ms
     ✓ rejects a failed run (12) 23ms
     ✓ rejects no run at the head (10) 12ms
     ✓ rejects runs that have not completed (11) 12ms
     ✓ rejects a green run at a superseded head (14), given --branch 18ms
     ✓ --fetch refreshes origin/<branch> before gating 134ms
     ✓ --fetch needs --branch (2) 1ms
     ✓ without --branch a superseded head is 10, not 14 (no invented attribution) 11ms
     ✓ rejects a run without the capstone job (13) 23ms
     ✓ rejects a cancelled run (15) 12ms
     ✓ rejects a green run whose capstone concluded 'cancelled' (12) 26ms
     ✓ rejects a green run whose capstone concluded 'skipped' (12) 24ms
     ✓ rejects a green run whose capstone concluded 'timed_out' (12) 25ms
     ✓ rejects a green run whose capstone concluded 'neutral' (12) 24ms
     ✓ rejects a green run whose capstone concluded 'action_required' (12) 25ms
     ✓ rejects a green run whose capstone concluded 'stale' (12) 26ms
     ✓ rejects a green run whose capstone concluded 'startup_failure' (12) 25ms
     ✓ exit 12 failed steps (10)
       ✓ a stale register alone is regenerable; the capstone is left out 24ms
       ✓ both floor steps failing is regenerable 25ms
       ✓ any failed step off the list makes the whole result unregenerable 25ms
       ✓ a job that concluded 'failure' with no failed step is {job}/ and unregenerable 25ms
       ✓ a job that concluded 'timed_out' with no failed step is {job}/ and unregenerable 25ms
       ✓ a job that concluded 'cancelled' with no failed step is {job}/ and unregenerable 24ms
       ✓ a timed-out step counts as failed 24ms
       ✓ bkit.testing.ciGenerated adds steps to the floor 44ms
       ✓ a step name alone does not match a {job}/{step} entry in another job 24ms
       ✓ refusals other than a failed run carry no failed steps 12ms
     ✓ --repo scopes --pr resolution (2)
       ✓ reads the head from the named repo, not the checkout's own PR 32ms
       ✓ logs the disagreement when the resolved repo differs from --repo 20ms
     ✓ skipped lanes (16 is opt-in) (5)
       ✓ a skipped lane alone does not refuse — the capstone's green settles it — but is reported 23ms
       ✓ refuses a skipped lane named in bkit.testing.ciRequired (16) 22ms
       ✓ a required lane naming a different lane does not refuse 23ms
       ✓ refuses when any of several required lanes was skipped 23ms
       ✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 23ms
     ✓ a newer in-flight re-dispatch does not mask a completed green at the head 22ms
     ✓ tells an API error (20) from no run (10) 42ms
     ✓ shapes a rate-limit refusal from rate_limit (20) 18ms
     ✓ stderr noise on a successful gh call does not corrupt the JSON read 22ms
     ✓ an unparseable jobs response is an API error (20), not a missing capstone (13) 24ms
     ✓ gh missing from PATH exits 80 (use the MCP fallback), not an API error 1ms
     ✓ BKIT_SHIP_GATE_OVERRIDE (4)
       ✓ pinned to the refused head turns the refusal into 0 and appends the audit row 24ms
       ✓ a different SHA is ignored — the refusal stands 23ms
       ✓ honoured with no status file (no crash), the row goes to stderr 23ms
       ✓ an unwritable status file still exits 0 and emits the row to stderr (never invisible) 22ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 47ms
       ✓ bkit.testing.ciRequired resolves from package.json 22ms
       ✓ absent ciRequired means no refusal 24ms
       ✓ a malformed ciRequired falls back to none, never crashes 23ms
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 46ms
     ✓ missing --head is a usage error (2) 0ms
     ✓ an empty --head= is a usage error (2), not a gate refusal 4ms
     ✓ --event (5)
       ✓ --event push ignores a pull_request run: no push run is 10, not 11 12ms
       ✓ without --event the in-flight pull_request run reads as in progress (11) 12ms
       ✓ --event push selects the green push run beside an in-flight pull_request run 23ms
       ✓ --event push reds on a failed push run even when a newer pull_request run is green 20ms
       ✓ without --event the newer green pull_request run masks the failed push run 23ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 45ms
       ✓ a run still in progress whose capstone already passed passes 34ms
       ✓ a capstone still running is in progress (11) 24ms
       ✓ a failed capstone fails (12) even when every other job passed 23ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 49ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 46ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 119ms
       ✓ a source change past the validated head refuses (17) and names the path 98ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 123ms
       ✓ --validated equal to --head is the plain head check 23ms
       ✓ --validated without --month / --fid is a usage error (2) 80ms
       ✓ a validated sha that is not an ancestor refuses (17) 90ms
   ✓ bkit runs mirror (18)
     ✓ green push run capstone -> 0 0ms
     ✓ waits through in-progress polls, then mirrors green 0ms
     ✓ waits through in-progress polls, then mirrors red (1) 0ms
     ✓ gate 12 (red) -> 1 with the gate's reason 0ms
     ✓ gate 15 (cancelled) -> 1 with the gate's reason 0ms
     ✓ gate 13 (capstone absent) -> 1 with the gate's reason 0ms
     ✓ gate 16 (required lane skipped) -> 1 with the gate's reason 0ms
     ✓ gate 7 (unknown gate exit (never a pass)) -> 1 with the gate's reason 0ms
     ✓ no push run past the absent window -> 3 naming [skip ci]; a superseded answer (14) counts as absent 0ms
     ✓ no push run yet inside the absent window keeps waiting 0ms
     ✓ still in progress at --max-minutes -> 4 0ms
     ✓ two API errors are retried; the third in a row -> 20 0ms
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 391ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 456ms
     ✓ e2e: green push run beside the PR's own in-flight run -> 0 29ms
     ✓ e2e: a red push run is not masked by a newer green PR run -> 1 22ms
     ✓ e2e: only the PR's own run exists -> absent, not in progress (3) 18ms
     ✓ usage: missing --head or a non-numeric minute value exits 2 4ms
   ✓ bkit runs wait (10)
     ✓ the dispatch probe matches the capstone's lane namespace, case-insensitive, by name or context 0ms
     ✓ is bounded: ceil(budget / interval) attempts, no sleep after the last 0ms
     ✓ found stops polling; every poll erroring is err with allErrored 0ms
     ✓ a sleep that overruns its window is blocked: hand the poll to the agent 0ms
     ✓ PR completed = no open checks; run targets are head-anchored 0ms
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 727ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 384ms
     ✓ CLI: a failed gh workflow run exits 5 374ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1382ms
     ✓ CLI: usage errors exit 2 11ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 107ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 160ms
     ✓ a failed re-trigger push names the cause in the log 277ms
     ✓ a failed re-trigger push leaves no orphan commit behind 269ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 296ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 165ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 93ms
     ✓ gh-error: every poll errored 84ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 145ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 145ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 166ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 162ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 86ms
     ✓ CLI: verdict JSON, body scan, exit codes 514ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 456ms
     ✓ CLI: --poll-result is validated, --attempts needs it 90ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 623ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 372ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 410ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 363ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 125ms
     ✓ re-trigger on dev only uses the record of its own FID 148ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 244ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 162ms
   ✓ bkit runs declared (2)
     ✓ exit 0 when .github/workflows/<bkit.testing.ciWorkflow> exists, 1 when not 11ms
     ✓ the default bkit-ci.yml counts when no bkit.testing.ciWorkflow is configured 4ms
   ✓ scanBody (8)
     ✓ flags [skip ci] inherited into the landed commit body 24ms
     ✓ flags [ci skip] inherited into the landed commit body 22ms
     ✓ flags [no ci] inherited into the landed commit body 22ms
     ✓ flags [skip actions] inherited into the landed commit body 24ms
     ✓ flags [actions skip] inherited into the landed commit body 23ms
     ✓ flags [SKIP CI] inherited into the landed commit body 22ms
     ✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 54ms
     ✓ an empty or unreadable sha is an error, not a clean result 23ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 481ms
     ✓ --pr refuses a title carrying a skip token (18) and --record writes the refusal row 477ms
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 451ms
     ✓ --snapshot scopes its run list and dev lookups to --repo 416ms
     ✓ --snapshot without --repo leaves its run list unscoped 395ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 398ms
     ✓ a refused capstone records FAIL with its reason 400ms
     ✓ an unreadable PR is an API error (20) with no head 346ms
     ✓ takes exactly one of --head, --pr, --squash-of 10ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 448ms
       ✓ without --repo no call gains a --repo flag 456ms
       ✓ repoScopedGh appends --repo to workflow run, leaves gh api alone, and is a no-op without a repo 0ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 426ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 773ms
     ✓ refuses an unknown --reason 68ms
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 416ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 828ms
     ✓ ref uppercases a Linear or Jira key 0ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 432ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 508ms
     ✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 416ms
     ✓ CI_DEV refuses the slug "a/b" (exit 9) 401ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 495ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 462ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 881ms
     ✓ an unknown phase exits 3; gh needing auth exits 80 421ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 837ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 480ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 488ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 483ms
     ✓ --file and --step go together 469ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > rejects fork verification runs that shadow a red selected workflow at the same head
AssertionError: expected +0 not to be +0 // Object.is equality
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:181:34
    179|   const f = verificationProvenanceFixture();
    180|   const implicit = await f.gate();
    181|   expect.soft(implicit.code).not.toBe(0);
       |                                  ^
    182|   expect.soft(implicit.json).toMatchObject({ passed: false, verifyingR…
    183|   const pushed = await f.gate("--event=push");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > rejects fork verification runs that shadow a red selected workflow at the same head
AssertionError: expected { code: +0, passed: true, …(19) } to match object { passed: false, verifyingRunId: 301 }
(19 matching properties omitted from actual)

- Expected
+ Received

  {
-   "passed": false,
-   "verifyingRunId": 301,
+   "passed": true,
+   "verifyingRunId": 302,
  }

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:182:30
    180|   const implicit = await f.gate();
    181|   expect.soft(implicit.code).not.toBe(0);
    182|   expect.soft(implicit.json).toMatchObject({ passed: false, verifyingR…
       |                              ^
    183|   const pushed = await f.gate("--event=push");
    184|   expect.soft(pushed.code).not.toBe(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > rejects fork verification runs that shadow a red selected workflow at the same head
AssertionError: expected +0 not to be +0 // Object.is equality
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:184:32
    182|   expect.soft(implicit.json).toMatchObject({ passed: false, verifyingR…
    183|   const pushed = await f.gate("--event=push");
    184|   expect.soft(pushed.code).not.toBe(0);
       |                                ^
    185|   expect.soft(pushed.json).toMatchObject({ passed: false, verifyingRun…
    186|   f.state.selected[1] = f.candidate(302, "success", { head_repository:…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > rejects fork verification runs that shadow a red selected workflow at the same head
AssertionError: expected { code: +0, passed: true, …(19) } to match object { passed: false, verifyingRunId: 301 }
(19 matching properties omitted from actual)

- Expected
+ Received

  {
-   "passed": false,
-   "verifyingRunId": 301,
+   "passed": true,
+   "verifyingRunId": 302,
  }

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:185:28
    183|   const pushed = await f.gate("--event=push");
    184|   expect.soft(pushed.code).not.toBe(0);
    185|   expect.soft(pushed.json).toMatchObject({ passed: false, verifyingRun…
       |                            ^
    186|   f.state.selected[1] = f.candidate(302, "success", { head_repository:…
    187|   const absent = await f.gate();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > rejects fork verification runs that shadow a red selected workflow at the same head
AssertionError: expected +0 not to be +0 // Object.is equality
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:188:32
    186|   f.state.selected[1] = f.candidate(302, "success", { head_repository:…
    187|   const absent = await f.gate();
    188|   expect.soft(absent.code).not.toBe(0);
       |                                ^
    189|   expect.soft(absent.json).toMatchObject({ passed: false, verifyingRun…
    190|   f.state.selected[1] = f.candidate(302, "success", {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > rejects fork verification runs that shadow a red selected workflow at the same head
AssertionError: expected { code: +0, passed: true, …(19) } to match object { passed: false, verifyingRunId: 301 }
(19 matching properties omitted from actual)

- Expected
+ Received

  {
-   "passed": false,
-   "verifyingRunId": 301,
+   "passed": true,
+   "verifyingRunId": 302,
  }

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:189:28
    187|   const absent = await f.gate();
    188|   expect.soft(absent.code).not.toBe(0);
    189|   expect.soft(absent.json).toMatchObject({ passed: false, verifyingRun…
       |                            ^
    190|   f.state.selected[1] = f.candidate(302, "success", {
    191|     repository: { full_name: "a-fork/example" },

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > rejects fork verification runs that shadow a red selected workflow at the same head
AssertionError: expected +0 not to be +0 // Object.is equality
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:194:41
    192|   });
    193|   const wrongRepository = await f.gate();
    194|   expect.soft(wrongRepository.code).not.toBe(0);
       |                                         ^
    195|   expect.soft(wrongRepository.json).toMatchObject({ passed: false, ver…
    196| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > rejects fork verification runs that shadow a red selected workflow at the same head
AssertionError: expected { code: +0, passed: true, …(19) } to match object { passed: false, verifyingRunId: 301 }
(19 matching properties omitted from actual)

- Expected
+ Received

  {
-   "passed": false,
-   "verifyingRunId": 301,
+   "passed": true,
+   "verifyingRunId": 302,
  }

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:195:37
    193|   const wrongRepository = await f.gate();
    194|   expect.soft(wrongRepository.code).not.toBe(0);
    195|   expect.soft(wrongRepository.json).toMatchObject({ passed: false, ver…
       |                                     ^
    196| });
    197|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > preserves the requested event for selected-workflow verification
AssertionError: expected +0 not to be +0 // Object.is equality
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:202:32
    200|   f.state.selected[1] = f.candidate(302, "success", { event: "pull_req…
    201|   const pushed = await f.gate("--event=push");
    202|   expect.soft(pushed.code).not.toBe(0);
       |                                ^
    203|   expect.soft(pushed.json).toMatchObject({ passed: false, verifyingRun…
    204|   f.state.selected.push(f.candidate(303, "success"));

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/10]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > preserves the requested event for selected-workflow verification
AssertionError: expected { code: +0, passed: true, …(19) } to match object { passed: false, verifyingRunId: 301 }
(19 matching properties omitted from actual)

- Expected
+ Received

  {
-   "passed": false,
-   "verifyingRunId": 301,
+   "passed": true,
+   "verifyingRunId": 302,
  }

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:203:28
    201|   const pushed = await f.gate("--event=push");
    202|   expect.soft(pushed.code).not.toBe(0);
    203|   expect.soft(pushed.json).toMatchObject({ passed: false, verifyingRun…
       |                            ^
    204|   f.state.selected.push(f.candidate(303, "success"));
    205|   const green = await f.gate("--event=push");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/10]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 183 passed (185)
   Start at  01:44:44
   Duration  30.73s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-0H2zXd/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
