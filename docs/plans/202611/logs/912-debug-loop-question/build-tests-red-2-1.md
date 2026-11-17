Enforced: true
Red: 8
Accepted: 1
Updated: 0
Gaps: 1

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/912-debug-loop-question-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/ledgers/status.test.ts` "CI evidence selection contract > validates failedJobCount as a positive whole number outside the identity" | missing | "CI evidence selection contract > validates failedJobCount as a positive whole number outside the identity" did not run; the report holds "CI evidence selection contract > validates atomic CI and local selections with stable evidence identities", "CI evidence selection contract > failedJobCount > validates failedJobCount as a positive whole number outside the identity", "fold — event log → run array > folds a single run, step-done appends to the open run", "fold — event log → run array > preserves multiple phase runs in one log (design → plan → build)", "fold — event log → run array > attaches step-done to the latest run of its workflow across two runs of the same phase", … |
| 4 | `.bkit/core/engine/commands/workflow/runs.test.ts` "saves the failed job count without the capstone job" | red | failure: expected { mode: 'ci', …(12) } to match object { mode: 'ci', failedJobCount: 2 } (12 matching properties omitted from actual) |
| 4 | `.bkit/core/engine/commands/workflow/runs.test.ts` "counts the capstone job when it is the only failed job" | red | failure: expected { mode: 'ci', …(12) } to match object { mode: 'ci', failedJobCount: 1 } (12 matching properties omitted from actual) |
| 4 | `.bkit/core/engine/commands/workflow/runs.test.ts` "saves no failed job count when no job failed" | passed-accepted | passes; accepted by the tests step: current locateCi saves no failedJobCount field at all, so absence already holds |
| 4 | `.bkit/core/engine/commands/workflow/runs.test.ts` "counts fallback evidence jobs without the capstone job" | red | failure: expected { mode: 'ci', …(12) } to match object { mode: 'ci', failedJobCount: 1 } (12 matching properties omitted from actual) |
| 5 | `.bkit/core/engine/commands/workflow/tests.test.ts` "CI evidence test rounds > records the selected run's failed job count" | red | failure: expected { Object (source, verdict, ...) } to match object { source: 'ci', scope: 'ci:123', …(1) } (39 matching properties omitted from actual) |
| 5 | `.bkit/core/engine/ledgers/telemetry.test.ts` "test-run status row validation > accepts a counted CI evidence round and refuses 0" | red | failure: expected 'invalid CI evidence round' to be null |
| 5 | `.bkit/core/engine/checks/status-holes.test.ts` "check — hole classes > a counted CI round with its step-done row raises no CI evidence hole" | red | failure: expected [ { step: 'debug-run-tests', …(3) } ] to deeply equal [] |
| 6 | `.bkit/core/engine/commands/workflow/steps.test.ts` "finishes a CI round only with its own failed job count" | red | failure: expected 2 to be +0 // Object.is equality |
| 6 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown" | red | failure: expected { code: 1, json: { …(20) }, err: '' } to match object { code: 1, …(1) } (41 matching properties omitted from actual) |

## Gaps

- TASK 4 `.bkit/core/engine/ledgers/status.test.ts` "CI evidence selection contract > validates failedJobCount as a positive whole number outside the identity" `missing` — "CI evidence selection contract > validates failedJobCount as a positive whole number outside the identity" did not run; the report holds "CI evidence selection contract > validates atomic CI and local selections with stable evidence identities", "CI evidence selection contract > failedJobCount > validates failedJobCount as a positive whole number outside the identity", "fold — event log → run array > folds a single run, step-done appends to the open run", "fold — event log → run array > preserves multiple phase runs in one log (design → plan → build)", "fold — event log → run array > attaches step-done to the latest run of its workflow across two runs of the same phase", …

## Lint output — `.bkit/core/engine/ledgers/status.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/ledgers/status.test.ts

```

## Runner output — `.bkit/core/engine/ledgers/status.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/ledgers/status.test.ts

[test-timeout-budget] load average 42.9 on 10 cores: unit limits 25951ms per test, 51901ms per hook (x5.19)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question

 ❯ .bkit/core/engine/ledgers/status.test.ts (16 tests | 1 failed) 79ms
   ✓ CI evidence selection contract (1)
     ✓ validates atomic CI and local selections with stable evidence identities 4ms
   ❯ CI evidence selection contract > failedJobCount (1)
     × validates failedJobCount as a positive whole number outside the identity 19ms
   ✓ fold — event log → run array (7)
     ✓ folds a single run, step-done appends to the open run 15ms
     ✓ preserves multiple phase runs in one log (design → plan → build) 7ms
     ✓ attaches step-done to the latest run of its workflow across two runs of the same phase 1ms
     ✓ de-dupes identical lines (union duplication) — keeps one 2ms
     ✓ orders interleaved (union-shuffled) lines by `at` 0ms
     ✓ fold reads an old subPlan row as its group 8ms
     ✓ merges workflow-meta onto the run (debugAttempt) 1ms
   ✓ appendLine (1)
     ✓ serializes one event as a newline-terminated JSON line 1ms
   ✓ engine-action rows (4)
     ✓ key joins its parts with /, an absent part as -; hash is sha256 hex 1ms
     ✓ records a row and finds it only by the same key and hash 5ms
     ✓ skips malformed lines 1ms
     ✓ the fold ignores them 1ms
   ✓ ledger operation receipts (1)
     ✓ preserves tracker changed-hash actions while rejecting ledger operation collisions 4ms
   ✓ CI handoff events (1)
     ✓ preserves handoff events across status folding and rejects stale CI selection 5ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/ledgers/status.test.ts > CI evidence selection contract > failedJobCount > validates failedJobCount as a positive whole number outside the identity
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/ledgers/status.test.ts:94:70
     92|     expect(validateCiSelection(selection)).toBe(true);
     93|     expect(validateCiSelection({ ...selection, failedJobCount: 2 })).t…
     94|     expect(validateCiSelection({ ...selection, failedJobCount: 0 })).t…
       |                                                                      ^
     95|     expect(validateCiSelection({ ...selection, failedJobCount: -1 })).…
     96|     expect(validateCiSelection({ ...selection, failedJobCount: 1.5 }))…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 15 passed (16)
   Start at  22:46:18
   Duration  522ms (setup 36%, tests 26%, transform 21%, import 15%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-KwGtUY/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/runs.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/runs.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/runs.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/runs.test.ts

[test-timeout-budget] load average 43.1 on 10 cores: unit limits 26050ms per test, 52100ms per hook (x5.21)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts (202 tests | 3 failed) 55988ms
   ✓ Markdown CI references (5)
     ✓ preserves the identity of actions/runs/123 5ms
     ✓ preserves the identity of actions/runs/123/attempts/2 2ms
     ✓ preserves the identity of pull/456 2ms
     ✓ still rejects distinct run references in Markdown 2ms
     ✓ still rejects malformed IDs and attempts inside links 2ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1704ms
   ✓ preserves the requested event for selected-workflow verification 1120ms
   ✓ requires selected other-workflow success at the exact pushed head 2251ms
   ❯ bkit runs locate (15)
     ✓ locates CI evidence using prompt saved issue and local precedence 2094ms
     × saves the failed job count without the capstone job 807ms
     × counts the capstone job when it is the only failed job 808ms
     ✓ saves no failed job count when no job failed 599ms
     × counts fallback evidence jobs without the capstone job 246ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 256ms
     ✓ filters branch and PR discovery by configured workflow and exact head 828ms
     ✓ freezes explicit workflow run attempt and all failed job pages 639ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1495ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1745ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 458ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 488ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 506ms
     ✓ rejects a workflow result count smaller than its returned records 502ms
     ✓ validates normalized fallback evidence against the requested identity 335ms
   ✓ fixture gh stub (10)
     ✓ runs?head_sha=green-capstone returns the captured workflow_runs list 34ms
     ✓ runs/<id>/jobs returns the captured jobs list, --paginate is accepted 36ms
     ✓ runs?head_sha=<unknown> returns total_count 0 (no-run shape) 24ms
     ✓ BKIT_FAKE_GH_API_ERROR=1: every api call exits 1 with stderr 25ms
     ✓ rate_limit returns the requested fixture state 38ms
     ✓ non-api argv exits non-zero (loud on an unmocked boundary) 29ms
     ✓ BKIT_FAKE_RATELIMITED=1: the run list fails rate-limit-shaped, rate_limit still answers 56ms
     ✓ --paginate emits one document per page; --slurp collapses them into an array 147ms
     ✓ rejects a '../'-laden SHA (no path traversal out of the runs dir) 28ms
     ✓ pr view is keyed by --repo; without it the checkout fixture is read 76ms
   ✓ bkit runs gate (74)
     ✓ refuses green CI when dev advanced beyond the validated code head 1383ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1822ms
     ✓ checks the named repository base and fails closed on missing evidence 966ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 769ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 947ms
     ✓ rejects MCP capstone jobs belonging to another run 1139ms
     ✓ accepts a green capstone at the head (exit 0) and says so 84ms
     ✓ rejects a failed run (12) 92ms
     ✓ rejects no run at the head (10) 49ms
     ✓ rejects runs that have not completed (11) 47ms
     ✓ rejects a green run at a superseded head (14), given --branch 80ms
     ✓ --fetch refreshes origin/<branch> before gating 557ms
     ✓ --fetch needs --branch (2) 2ms
     ✓ without --branch a superseded head is 10, not 14 (no invented attribution) 50ms
     ✓ rejects a run without the capstone job (13) 81ms
     ✓ rejects a cancelled run (15) 47ms
     ✓ rejects a green run whose capstone concluded 'cancelled' (12) 97ms
     ✓ rejects a green run whose capstone concluded 'skipped' (12) 97ms
     ✓ rejects a green run whose capstone concluded 'timed_out' (12) 98ms
     ✓ rejects a green run whose capstone concluded 'neutral' (12) 118ms
     ✓ rejects a green run whose capstone concluded 'action_required' (12) 89ms
     ✓ rejects a green run whose capstone concluded 'stale' (12) 93ms
     ✓ rejects a green run whose capstone concluded 'startup_failure' (12) 84ms
     ✓ exit 12 failed steps (10)
       ✓ a stale register alone is regenerable; the capstone is left out 91ms
       ✓ both floor steps failing is regenerable 95ms
       ✓ any failed step off the list makes the whole result unregenerable 89ms
       ✓ a job that concluded 'failure' with no failed step is {job}/ and unregenerable 111ms
       ✓ a job that concluded 'timed_out' with no failed step is {job}/ and unregenerable 94ms
       ✓ a job that concluded 'cancelled' with no failed step is {job}/ and unregenerable 91ms
       ✓ a timed-out step counts as failed 86ms
       ✓ bkit.testing.ciGenerated adds steps to the floor 176ms
       ✓ a step name alone does not match a {job}/{step} entry in another job 100ms
       ✓ refusals other than a failed run carry no failed steps 45ms
     ✓ --repo scopes --pr resolution (2)
       ✓ reads the head from the named repo, not the checkout's own PR 140ms
       ✓ logs the disagreement when the resolved repo differs from --repo 90ms
     ✓ skipped lanes (16 is opt-in) (5)
       ✓ a skipped lane alone does not refuse — the capstone's green settles it — but is reported 104ms
       ✓ refuses a skipped lane named in bkit.testing.ciRequired (16) 96ms
       ✓ a required lane naming a different lane does not refuse 100ms
       ✓ refuses when any of several required lanes was skipped 84ms
       ✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 94ms
     ✓ a newer in-flight re-dispatch does not mask a completed green at the head 97ms
     ✓ tells an API error (20) from no run (10) 183ms
     ✓ shapes a rate-limit refusal from rate_limit (20) 72ms
     ✓ stderr noise on a successful gh call does not corrupt the JSON read 79ms
     ✓ an unparseable jobs response is an API error (20), not a missing capstone (13) 92ms
     ✓ gh missing from PATH exits 80 (use the MCP fallback), not an API error 4ms
     ✓ BKIT_SHIP_GATE_OVERRIDE (4)
       ✓ pinned to the refused head turns the refusal into 0 and appends the audit row 89ms
       ✓ a different SHA is ignored — the refusal stands 84ms
       ✓ honoured with no status file (no crash), the row goes to stderr 97ms
       ✓ an unwritable status file still exits 0 and emits the row to stderr (never invisible) 76ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 161ms
       ✓ bkit.testing.ciRequired resolves from package.json 74ms
       ✓ absent ciRequired means no refusal 87ms
       ✓ a malformed ciRequired falls back to none, never crashes 82ms
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 169ms
     ✓ missing --head is a usage error (2) 1ms
     ✓ an empty --head= is a usage error (2), not a gate refusal 18ms
     ✓ --event (5)
       ✓ --event push ignores a pull_request run: no push run is 10, not 11 41ms
       ✓ without --event the in-flight pull_request run reads as in progress (11) 65ms
       ✓ --event push selects the green push run beside an in-flight pull_request run 85ms
       ✓ --event push reds on a failed push run even when a newer pull_request run is green 77ms
       ✓ without --event the newer green pull_request run masks the failed push run 72ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 125ms
       ✓ a run still in progress whose capstone already passed passes 105ms
       ✓ a capstone still running is in progress (11) 71ms
       ✓ a failed capstone fails (12) even when every other job passed 78ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 136ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 129ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 326ms
       ✓ a source change past the validated head refuses (17) and names the path 288ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 375ms
       ✓ --validated equal to --head is the plain head check 82ms
       ✓ --validated without --month / --fid is a usage error (2) 252ms
       ✓ a validated sha that is not an ancestor refuses (17) 304ms
   ✓ bkit runs mirror (18)
     ✓ green push run capstone -> 0 1ms
     ✓ waits through in-progress polls, then mirrors green 1ms
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
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 432ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 480ms
     ✓ e2e: green push run beside the PR's own in-flight run -> 0 52ms
     ✓ e2e: a red push run is not masked by a newer green PR run -> 1 51ms
     ✓ e2e: only the PR's own run exists -> absent, not in progress (3) 49ms
     ✓ usage: missing --head or a non-numeric minute value exits 2 2ms
   ✓ bkit runs wait (10)
     ✓ the dispatch probe matches the capstone's lane namespace, case-insensitive, by name or context 1ms
     ✓ is bounded: ceil(budget / interval) attempts, no sleep after the last 1ms
     ✓ found stops polling; every poll erroring is err with allErrored 1ms
     ✓ a sleep that overruns its window is blocked: hand the poll to the agent 1ms
     ✓ PR completed = no open checks; run targets are head-anchored 1ms
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 80ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 67ms
     ✓ CLI: a failed gh workflow run exits 5 73ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1073ms
     ✓ CLI: usage errors exit 2 10ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 256ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 489ms
     ✓ a failed re-trigger push names the cause in the log 728ms
     ✓ a failed re-trigger push leaves no orphan commit behind 563ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1059ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 529ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 284ms
     ✓ gh-error: every poll errored 241ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 440ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 443ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 565ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 495ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 237ms
     ✓ CLI: verdict JSON, body scan, exit codes 457ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 274ms
     ✓ CLI: --poll-result is validated, --attempts needs it 235ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 715ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 1398ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 1300ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1315ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 375ms
     ✓ re-trigger on dev only uses the record of its own FID 411ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 420ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 422ms
   ✓ bkit runs declared (2)
     ✓ exit 0 when .github/workflows/<bkit.testing.ciWorkflow> exists, 1 when not 34ms
     ✓ the default bkit-ci.yml counts when no bkit.testing.ciWorkflow is configured 14ms
   ✓ scanBody (8)
     ✓ flags [skip ci] inherited into the landed commit body 61ms
     ✓ flags [ci skip] inherited into the landed commit body 62ms
     ✓ flags [no ci] inherited into the landed commit body 56ms
     ✓ flags [skip actions] inherited into the landed commit body 52ms
     ✓ flags [actions skip] inherited into the landed commit body 54ms
     ✓ flags [SKIP CI] inherited into the landed commit body 52ms
     ✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 99ms
     ✓ an empty or unreadable sha is an error, not a clean result 55ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 99ms
     ✓ --pr refuses a title carrying a skip token (18) and --record writes the refusal row 30ms
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 235ms
     ✓ --snapshot scopes its run list and dev lookups to --repo 168ms
     ✓ --snapshot without --repo leaves its run list unscoped 104ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 109ms
     ✓ a refused capstone records FAIL with its reason 107ms
     ✓ an unreadable PR is an API error (20) with no head 28ms
     ✓ takes exactly one of --head, --pr, --squash-of 11ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 203ms
       ✓ without --repo no call gains a --repo flag 274ms
       ✓ repoScopedGh appends --repo to workflow run, leaves gh api alone, and is a no-op without a repo 1ms
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 1277ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 197ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 162ms
     ✓ refuses an unknown --reason 114ms
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 153ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 248ms
     ✓ ref uppercases a Linear or Jira key 1ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 188ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 120ms
     ✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 115ms
     ✓ CI_DEV refuses the slug "a/b" (exit 9) 116ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 206ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 207ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 225ms
     ✓ an unknown phase exits 3; gh needing auth exits 80 135ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 239ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 269ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 298ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 268ms
     ✓ --file and --step go together 217ms
   ✓ bkit runs handoff (1)
     ✓ derives handoff decisions from persisted poll observations and target identity 1346ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs locate > saves the failed job count without the capstone job
AssertionError: expected { mode: 'ci', …(12) } to match object { mode: 'ci', failedJobCount: 2 }
(12 matching properties omitted from actual)

- Expected
+ Received

  {
-   "failedJobCount": 2,
    "mode": "ci",
  }

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:584:26
    582|     ];
    583|     expect((await f.locate()).code).toBe(0);
    584|     expect(f.selected()).toMatchObject({ mode: "ci", failedJobCount: 2…
       |                          ^
    585|   });
    586|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs locate > counts the capstone job when it is the only failed job
AssertionError: expected { mode: 'ci', …(12) } to match object { mode: 'ci', failedJobCount: 1 }
(12 matching properties omitted from actual)

- Expected
+ Received

  {
-   "failedJobCount": 1,
    "mode": "ci",
  }

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:594:26
    592|     ];
    593|     expect((await f.locate()).code).toBe(0);
    594|     expect(f.selected()).toMatchObject({ mode: "ci", failedJobCount: 1…
       |                          ^
    595|   });
    596|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs locate > counts fallback evidence jobs without the capstone job
AssertionError: expected { mode: 'ci', …(12) } to match object { mode: 'ci', failedJobCount: 1 }
(12 matching properties omitted from actual)

- Expected
+ Received

  {
-   "failedJobCount": 1,
    "mode": "ci",
  }

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:633:26
    631|     f.data.error = true;
    632|     expect((await f.locate(`--evidence-file=${evidence}`)).code).toBe(…
    633|     expect(f.selected()).toMatchObject({ mode: "ci", failedJobCount: 1…
       |                          ^
    634|   });
    635|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 199 passed (202)
   Start at  22:46:23
   Duration  56.94s (tests 99%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-5Ieg69/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/tests.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tests.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tests.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tests.test.ts

[test-timeout-budget] load average 23.2 on 10 cores: unit limits 16101ms per test, 32201ms per hook (x3.22)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts (154 tests | 1 failed) 21565ms
   ❯ CI evidence test rounds (4)
     ✓ records a CI evidence round without executing a local gate 22ms
     × records the selected run's failed job count 23ms
     ✓ runs local gates only after current-generation remediation or soak 567ms
     ✓ rejects CI rounds without active matching debug selection 14ms
   ✓ resolveGate (6)
     ✓ picks the deepest declared candidate, not the first declared in package.json 12ms
     ✓ falls back to a shallower candidate when the deeper one is undeclared 25ms
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 24ms
     ✓ no package.json, no scripts, or unparseable -> null 45ms
     ✓ debug's live-first chain stops at the deepest declared tier 25ms
     ✓ with no e2e gate, debug runs the integration gate build runs 25ms
   ✓ bkit tests run (16)
     ✓ a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run 21ms
     ✓ a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81 13ms
     ✓ a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4 13ms
     ✓ tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate 15ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 544ms
     ✓ a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4 13ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 155ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 429ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 256ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 803ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 140ms
     ✓ no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix) 75ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 144ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 317ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 404ms
     ✓ --gate and --log are required 23ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 283ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 253ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 276ms
     ✓ PASS is 0 failures with or without reports 282ms
     ✓ clears a previous attempt's reports before the gate runs 210ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 210ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 242ms
     ✓ a log under the outbox is named main-checkout relative in the record 253ms
     ✓ a log small enough is copied whole: not clamped, raw null 201ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 185ms
     ✓ --artifact needs --fid and --step 15ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 348ms
     ✓ numbers runs within the workflow's active run and per step 365ms
     ✓ without --file no row is written and the output carries row null 256ms
     ✓ --file needs --workflow and --step, and an existing status.jsonl, before the gate runs 19ms
   ✓ parseJunit (5)
     ✓ reads names, outcomes and failure messages, decoding entities 18ms
     ✓ keeps a failure's text as detail, CDATA as written and tags stripped 18ms
     ✓ survives a raw > inside an attribute and a closing tag inside CDATA 19ms
     ✓ keeps each case's classname and file attribute 19ms
     ✓ no testcase elements -> empty 20ms
   ✓ reportFailures (1)
     ✓ returns the failing and erroring cases of every report, or null with none 21ms
   ✓ judgeRed / judgeGreen — the named test, never the exit code alone (9)
     ✓ a red is the named test failing or erroring 19ms
     ✓ state: no report (misspelled path) 24ms
     ✓ state: load error named after the file 16ms
     ✓ state: zero tests 18ms
     ✓ state: the named test passed (code written first) 17ms
     ✓ state: the named test skipped (filter matched nothing) 25ms
     ✓ state: other tests only 18ms
     ✓ a name only matches whole trailing segments 17ms
     ✓ green needs every case of the named test to pass 17ms
   ✓ readTestFirst (5)
     ✓ reads test, n/a, missing and malformed entries per task 20ms
     ✓ reads several tests per task, one per sub-bullet; a name may hold a `;` 19ms
     ✓ reads a task's TEST EXCEPTION field apart from its TEST FIRST tests, with its plan lines 24ms
     ✓ narrows to one group's tasks 25ms
     ✓ reads no task from old-format task lines 30ms
   ✓ taskSizes (1)
     ✓ counts tests and distinct test files per task; n/a, missing and malformed count 0 27ms
   ✓ checkPlanText (4)
     ✓ sizes each group and task, and lists each problem with its line 23ms
     ✓ refuses a task that depends on itself 21ms
     ✓ an unclosed code fence is reported as such, not as missing task markers 23ms
     ✓ reads a CRLF plan's Reuse Inventory 24ms
   ✓ shipped task examples (9)
     ✓ the shipped plan template's example parses 21ms
     ✓ the change-shape example in trackers.md parses 27ms
     ✓ change issue form example passes plan-check 31ms
     ✓ trackers.md change example shows every task field 24ms
     ✓ the shipped change form shows every plan cap with its settings default 23ms
     ✓ this repo's change form shows every plan cap with its settings default 24ms
     ✓ trackers.md shows each plan cap it names with its settings default 22ms
     ✓ README.md shows each plan cap it names with its settings default 23ms
     ✓ this repo's change form shows the caps this repo's package.json sets 23ms
   ✓ bkit tests plan-check (35)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 92ms
     ✓ states the caps the template and workflows doc name 27ms
     ✓ every prompt that sizes a task or group takes the caps from its Context 37ms
     ✓ plan-check refuses a task without DONE WHEN 69ms
     ✓ plan-check refuses DEPENDS ON a later group 97ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 99ms
     ✓ plan-check matches a Markdown heading symbol 111ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 53ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 54ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 53ms
     ✓ plan-check skips existence on ticked tasks 53ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 81ms
     ✓ plan-check refuses an unmapped matrix row 52ms
     ✓ plan-check refuses a delete with no supersession row 84ms
     ✓ plan-check refuses a matrix row mapped to two tasks 50ms
     ✓ plan-check refuses rows left in the old column order under the template header 49ms
     ✓ plan-check refuses rows with an extra cell under the template header 49ms
     ✓ plan-check refuses a task no matrix row maps to 52ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 78ms
     ✓ plan-check refuses a matrix header with no Task column, naming the column to add 50ms
     ✓ plan-check refuses a matrix header with an extra leading # column 46ms
     ✓ plan-check refuses a matrix header with Task not last 48ms
     ✓ plan-check refuses synonym matrix column names 52ms
     ✓ plan-check refuses a matrix header with no closing pipe 48ms
     ✓ plan-check accepts the template matrix header in any letter case 46ms
     ✓ plan-check refuses a Task cell naming an undefined task 49ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 79ms
     ✓ plan-check refuses a group with 6 tasks 46ms
     ✓ plan-check refuses a group with 26 planned tests 64ms
     ✓ plan-check accepts 5 tasks and 25 tests in one group 60ms
     ✓ plan-check report lists groups, not a verdict 59ms
     ✓ plan-check refuses a task over the per-task caps, naming the task and the cap 55ms
     ✓ plan-check follows bkit.workflows.tasks 94ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 85ms
     ✓ a missing plan file is a usage error 18ms
   ✓ testBlock — a planned test's own lines, by name and indentation (12)
     ✓ takes the named test's opening line, its deeper lines and its closer, and nothing of its neighbours 19ms
     ✓ an edit to a neighbour leaves the hash alone; an edit to the test's own lines changes it 18ms
     ✓ testSpan gives the 1-based first and last line of the block, and lineDiff counts the lines removed and added 18ms
     ✓ finds a test planned by its suite path (`suite > test`) through its last segment 21ms
     ✓ starts at the call when the name sits on its own line under an open paren 20ms
     ✓ is stack-agnostic: pytest 19ms
     ✓ is stack-agnostic: go 19ms
     ✓ is stack-agnostic: rspec 21ms
     ✓ passes over a comment that quotes the name: the test, not the comment, is locked 24ms
     ✓ passes over a suite titled like the test, so its neighbours stay free to change 23ms
     ✓ falls back to a suite line when nothing else carries the name 20ms
     ✓ is null when the name is not in the file, or there is no file 21ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 376ms
     ✓ a planned test that passes is a vacuous gap, exit 1 360ms
     ✓ a planned test absent from a loaded report is a missing gap 298ms
     ✓ a file that fails to load is a red of kind red-not-loaded 352ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 392ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 129ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 493ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 287ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 342ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 99ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 582ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 467ms
       ✓ a later unproven result never replaces a proven red of the same lines 63ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 529ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 498ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 590ms
     ✓ green: a passed-accepted test is already landed, not a gap 361ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 400ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 92ms
     ✓ green refuses a plan with no task markers 78ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 373ms
     ✓ green: --group audits only that group's tasks 341ms
     ✓ green: --group naming a group with no tasks is refused 83ms
     ✓ green: a code fence never closed is the reason, not missing task markers 71ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 396ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 431ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 396ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 555ms
     ✓ green: lists each gap kind, with the runner output 384ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 683ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 227ms
       ✓ green clears an exception-only task from a human commit 167ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests.test.ts > CI evidence test rounds > records the selected run's failed job count
AssertionError: expected { Object (source, verdict, ...) } to match object { source: 'ci', scope: 'ci:123', …(1) }
(39 matching properties omitted from actual)

- Expected
+ Received

  {
-   "failures": 2,
+   "failures": null,
    "scope": "ci:123",
    "source": "ci",
  }

 ❯ .bkit/core/engine/commands/workflow/tests.test.ts:224:25
    222|     const result = await run(f.args);
    223|     expect(result.code).toBe(1);
    224|     expect(result.json).toMatchObject({ source: "ci", scope: "ci:123",…
       |                         ^
    225|     expect(result.json.row).toMatchObject({ type: "test-run", source: …
    226|     const rows = fs

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 153 passed (154)
   Start at  22:47:21
   Duration  21.86s (tests 99%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-3op8Y9/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/ledgers/telemetry.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/ledgers/telemetry.test.ts

```

## Runner output — `.bkit/core/engine/ledgers/telemetry.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/ledgers/telemetry.test.ts

[test-timeout-budget] load average 16.5 on 10 cores: unit limits 12750ms per test, 25500ms per hook (x2.55)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ❯ .bkit/core/engine/ledgers/telemetry.test.ts (300 tests | 1 failed) 381ms
   ❯ test-run status row validation (2)
     ✓ accepts bounded CI evidence rows while preserving local exit validation 2ms
     × accepts a counted CI evidence round and refuses 0 7ms
   ✓ identity — per-kind composite tuples (7)
     ✓ compliance: keyed by (repo, by.workflow, run.parentSha, rule.id) 0ms
     ✓ outcome: keyed by (repo, by.workflow, run.parentSha) — run.pr fallback when no parentSha 0ms
     ✓ counter: keyed by (repo, by.workflow, run.parentSha, counter.name) 0ms
     ✓ friction: keyed by (kind, repo, key) 0ms
     ✓ deferral: keyed by (kind, repo, key) 0ms
     ✓ failure: keyed by (kind, repo, key) 0ms
     ✓ composite tuple is DISTINCT from bare ts — same ts, different key → different identity 0ms
   ✓ severity — per-kind requirement + closed enum (61)
     ✓ friction carries severity 0ms
     ✓ deferral carries severity 0ms
     ✓ failure carries severity 0ms
     ✓ compliance does NOT carry severity 0ms
     ✓ outcome does NOT carry severity 0ms
     ✓ counter does NOT carry severity 0ms
     ✓ knowledge does NOT carry severity 0ms
     ✓ decision does NOT carry severity 0ms
     ✓ VALID_SEVERITIES is exactly CRITICAL|HIGH|MEDIUM|LOW 0ms
     ✓ accepts severity CRITICAL 1ms
     ✓ accepts severity HIGH 0ms
     ✓ accepts severity MEDIUM 0ms
     ✓ accepts severity LOW 0ms
     ✓ rejects a friction row with severity missing 0ms
     ✓ rejects a deferral row with severity missing 0ms
     ✓ rejects a failure row with severity missing 0ms
     ✓ rejects off-enum severity "low" 0ms
     ✓ rejects off-enum severity "normal" 0ms
     ✓ rejects off-enum severity "critical" 0ms
     ✓ rejects off-enum severity "blocker" 0ms
     ✓ rejects off-enum severity "advisory" 0ms
     ✓ rejects off-enum severity "Critical" 0ms
     ✓ rejects off-enum severity "" 0ms
     ✓ rejects severity on a kind that must not carry it 0ms
     ✓ accepts triage status "OPEN" on the severity kinds 0ms
     ✓ accepts triage status "TRIAGED" on the severity kinds 0ms
     ✓ accepts triage status "CLOSED" on the severity kinds 0ms
     ✓ rejects off-ladder status "WORKED_AROUND" on a severity kind 0ms
     ✓ rejects off-ladder status "Resolving" on a severity kind 0ms
     ✓ rejects off-ladder status "resolved" on a severity kind 0ms
     ✓ rejects off-ladder status "open" on a severity kind 0ms
     ✓ rejects off-ladder status "ACTIVE" on a severity kind 0ms
     ✓ rejects off-ladder status "" on a severity kind 0ms
     ✓ accepts decision status "ACTIVE" 0ms
     ✓ accepts decision status "SUPERSEDED" 0ms
     ✓ rejects triage status "OPEN" on a decision 0ms
     ✓ rejects triage status "CLOSED" on a decision 0ms
     ✓ rejects triage status "TRIAGED" on a decision 0ms
     ✓ accepts knowledge status "ACTIVE" 0ms
     ✓ accepts knowledge status "SUPERSEDED" 0ms
     ✓ accepts a knowledge row with status absent 0ms
     ✓ rejects triage status "OPEN" on knowledge 0ms
     ✓ rejects triage status "CLOSED" on knowledge 0ms
     ✓ rejects triage status "TRIAGED" on knowledge 0ms
     ✓ rejects status on a kind that must not carry it 0ms
     ✓ DEFERRAL_REASONS is exactly the four justifications, low-severity and the adjudicator verdict 0ms
     ✓ accepts deferral reason "scope-declared" 0ms
     ✓ accepts deferral reason "hard-blocked" 0ms
     ✓ accepts deferral reason "needs-decision" 0ms
     ✓ accepts deferral reason "own-cycle" 0ms
     ✓ accepts deferral reason "low-severity" 0ms
     ✓ accepts deferral reason "unjustified" 0ms
     ✓ rejects a deferral row with reason missing 0ms
     ✓ rejects off-enum deferral reason "blocked" 0ms
     ✓ rejects off-enum deferral reason "out of scope" 0ms
     ✓ rejects off-enum deferral reason "no time" 0ms
     ✓ rejects off-enum deferral reason "SCOPE-DECLARED" 0ms
     ✓ rejects off-enum deferral reason "" 0ms
     ✓ rejects reason on a kind that must not carry it 0ms
     ✓ parse still reads legacy free-text status rows 0ms
     ✓ parse still reads pre-severity rows 0ms
   ✓ updating a row — supersede by same-key append (4)
     ✓ a later same-key row wins the fold; the earlier one stays as history 0ms
     ✓ fold is last-wins by ts, not by file order 0ms
     ✓ fold orders ISO-string and missing ts deterministically, whatever the file order 0ms
     ✓ a reworded key forks the entry instead of updating it 0ms
   ✓ triage ladder — OPEN -> TRIAGED -> CLOSED (3)
     ✓ TRIAGE_STATUSES is exactly OPEN|TRIAGED|CLOSED 0ms
     ✓ the triaged kinds are exactly the severity-carrying kinds 0ms
     ✓ a triage sweep appends TRIAGED, and the entry stays open 0ms
   ✓ feature kind — .bkit/issues.jsonl (#380) (13)
     ✓ is a valid kind, keyed by (kind, repo, key) 0ms
     ✓ FEATURE_STATUSES is exactly the six-value phase ladder 0ms
     ✓ accepts status DESIGNED 0ms
     ✓ accepts status PLANNED 0ms
     ✓ accepts status BUILT 0ms
     ✓ accepts status DEBUGGED 0ms
     ✓ accepts status SHIPPED 0ms
     ✓ accepts status ABANDONED 1ms
     ✓ rejects a missing status — the roadmap has no phase to project without it 0ms
     ✓ rejects an off-ladder status 0ms
     ✓ does not carry severity — feature is not in SEVERITY_KINDS 0ms
     ✓ requires key, category, and description 0ms
     ✓ a same-key append folds last-wins to the latest phase 0ms
   ✓ chat kind — .bkit/stats.jsonl chat rows (5)
     ✓ is a valid kind keyed by kind + repo + key 0ms
     ✓ rejects a row without the join keys readers depend on 0ms
     ✓ carries no severity or status 0ms
     ✓ a resumed chat's new row folds over the first one 0ms
     ✓ leaves a workflow's telemetry report unchanged 1ms
   ✓ run kind — .bkit/stats.jsonl run rows (6)
     ✓ is a valid kind keyed by kind + repo + key 0ms
     ✓ rejects a row without the join keys readers depend on 0ms
     ✓ takes only the five endings 0ms
     ✓ carries no severity or status 0ms
     ✓ a grown run log's new row folds over the first one 0ms
     ✓ leaves the telemetry report of the same workflow unchanged 0ms
   ✓ jsonl.md examples — validated against the codec (6)
     ✓ every full example row is a valid event 3ms
     ✓ every example field is a Generic Field or listed in its kind's Per-Kind Fields row 2ms
     ✓ every kind has a worked example 2ms
     ✓ no example puts an agent name in by.step 1ms
     ✓ by.model appears exactly where by.subagent does — never on an orchestrator row 1ms
     ✓ the triaged kinds' examples carry severity and references 1ms
   ✓ repo slug — one resolver, from the git remote (13)
     ✓ parses "https://github.com/owner/repo.git" -> "owner/repo" 0ms
     ✓ parses "https://github.com/owner/repo" -> "owner/repo" 0ms
     ✓ parses "git@github.com:owner/repo.git" -> "owner/repo" 0ms
     ✓ parses "ssh://git@github.com/owner/repo.git" -> "owner/repo" 0ms
     ✓ parses "  https://github.com/owner/repo.git\n" -> "owner/repo" 0ms
     ✓ returns empty rather than guessing for "" 0ms
     ✓ returns empty rather than guessing for "not-a-url" 0ms
     ✓ returns empty rather than guessing for "https://github.com/" 0ms
     ✓ returns empty rather than guessing for "reponame" 0ms
     ✓ a scoped npm package name must NEVER become the slug 0ms
     ✓ resolves the slug from a repo's origin remote 45ms
     ✓ returns empty for a git repo with no origin remote 35ms
     ✓ returns empty for a directory that is not a git repo 13ms
   ✓ resolveGitSha — parentSha must be a real SHA before it reaches a row (7)
     ✓ resolves a rev to a hex SHA the grader's guard accepts 13ms
     ✓ never returns the rev it was given 13ms
     ✓ gives DIFFERENT SHAs for different revs — so identity cannot collapse runs 25ms
     ✓ returns empty for unresolvable "no-such-rev" 11ms
     ✓ returns empty for unresolvable "HEAD~99999" 12ms
     ✓ returns empty for unresolvable "" 11ms
     ✓ returns empty outside a git repo rather than throwing 10ms
   ✓ workflowTelemetry — ledger-health readout (no workflow) (5)
     ✓ names the unknown-version bucket instead of leaving it empty 1ms
     ✓ reports 0 malformed as a single 0 when nothing is malformed 0ms
     ✓ counts malformed lines by parsing, not by regex 1ms
     ✓ counts per-workflow ENTITIES, so an updated row is not counted twice 1ms
     ✓ omits the chain line when no workflow is given 0ms
   ✓ validate — A2-mandatory envelope fields (19)
     ✓ accepts a valid compliance event 0ms
     ✓ accepts a valid outcome event 0ms
     ✓ accepts an outcome event with valid per-tier ship.coverage 0ms
     ✓ rejects an outcome event with non-object ship.coverage 0ms
     ✓ rejects an outcome event with a non-numeric coverage metric 0ms
     ✓ accepts a valid counter event 0ms
     ✓ accepts a valid friction event 0ms
     ✓ accepts a valid deferral event 0ms
     ✓ accepts a valid failure event 0ms
     ✓ rejects event missing mandatory field: ts 0ms
     ✓ rejects event missing mandatory field: kind 0ms
     ✓ rejects event missing mandatory field: repo 0ms
     ✓ rejects event missing mandatory field: bkit 0ms
     ✓ rejects event missing mandatory field: by 0ms
     ✓ rejects event missing by.step 0ms
     ✓ rejects event missing bkit.version 0ms
     ✓ rejects unknown kind 0ms
     ✓ rejects non-object input 0ms
     ✓ rejects counter with invalid counter.source 0ms
   ✓ fold — composite-identity dedup (6)
     ✓ folds same-key compliance rows to latest (higher ts) 0ms
     ✓ two same-ts same-key rows (merge=union duplicate) fold to ONE via composite identity 0ms
     ✓ two same-ts DIFFERENT-key rows (same ts, different rule) → TWO entries 0ms
     ✓ folds outcome rows by (repo, run.pr) 0ms
     ✓ folds friction rows by (kind, repo, key) 0ms
     ✓ empty events → empty state 0ms
   ✓ lineage — firstTs / updates on keyed rows (14)
     ✓ AGED_KINDS names the five keyed ledger kinds 0ms
     ✓ validate accepts firstTs <= ts and a positive-integer updates on every aged kind 0ms
     ✓ validate rejects a firstTs later than ts, or not a number 0ms
     ✓ validate rejects updates that is zero, negative or fractional 0ms
     ✓ validate rejects firstTs / updates on kinds outside AGED_KINDS 0ms
     ✓ lineage counts rows and takes the earliest ts 0ms
     ✓ lineage continues a stamped row's count and keeps its firstTs 0ms
     ✓ lineage counts same-ts rows once, keeping the larger stamped count 0ms
     ✓ lineage leaves firstTs out when no row carries a numeric ts 0ms
     ✓ placeLineage puts firstTs + updates right after ts, replacing stale values 0ms
     ✓ withLineage stamps a first row firstTs = ts, updates = 1 0ms
     ✓ withLineage carries forward from same-identity prior rows only 0ms
     ✓ withLineage replaces caller-supplied firstTs / updates 0ms
     ✓ withLineage passes keyless and non-aged rows through untouched 0ms
   ✓ parse — tolerant reader (8)
     ✓ parses valid NDJSON lines 0ms
     ✓ skips blank lines, does NOT count them as malformed 0ms
     ✓ counts a malformed (truncated trailing) line via malformedLineCount, does NOT throw 0ms
     ✓ counts a malformed line in the MIDDLE of the file, does NOT throw 0ms
     ✓ parses empty string → zero events, zero malformed 0ms
     ✓ NEVER throws on any input (fuzz) 1ms
     ✓ keeps ALL well-formed rows regardless of bkitVersion (no version gating) 0ms
     ✓ parse keeps an old row with subPlans 0ms
   ✓ outcome — shape and inline-jq parity (7)
     ✓ close-gate-shaped outcome validates successfully 0ms
     ✓ validate refuses plan.source brief on write 0ms
     ✓ accepts held in outcome and run endings 0ms
     ✓ keeps publish false on the outcome row 0ms
     ✓ rejects a non-boolean publish 0ms
     ✓ folds outcome by (repo, run.pr) 0ms
     ✓ inline-jq parity: jq-shaped row parses identically under parse() 0ms
   ✓ appendLine (1)
     ✓ serializes event to JSON string parseable back to same shape 0ms
   ✓ constants (1)
     ✓ MAX_ROWS_BEFORE_ROLLUP is a concrete number (not TODO) 0ms
   ✓ foldFrom — several ledger files (5)
     ✓ reads hot file and returns rowCount 1ms
     ✓ folds two files together 1ms
     ✓ missing paths are silently skipped 0ms
     ✓ emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP 24ms
     ✓ surfaces malformedLineCount from hot file 1ms
   ✓ workflowTelemetry — per-workflow summary signals (2)
     ✓ produces lines with rowCount, malformed, and per-version counts 1ms
     ✓ emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded 21ms
   ✓ workflowTelemetry — this-run vs med·5 baseline (7)
     ✓ shows THIS run's values against med·5 of the previous same-workflow runs 1ms
     ✓ workflowTelemetry splits the baseline on converted 1ms
     ✓ shows an ending row for a held close 0ms
     ✓ prints — for the baseline until at least 3 prior runs exist 0ms
     ✓ omits absent conditional metrics but shows ledgers.friction.added even at 0 1ms
     ✓ adds a this-run compliance line matched by run.parentSha 0ms
     ✓ adds the run's *_ATTEMPT counter matched by run.parentSha 1ms
   ✓ humanizeDuration (5)
     ✓ formats 45 seconds as 45s 0ms
     ✓ formats 480 seconds as 8m 0ms
     ✓ formats 1980 seconds as 33m 0ms
     ✓ formats 3600 seconds as 1h 0ms
     ✓ formats 7860 seconds as 2h11m 0ms
   ✓ telemetry-invariant (7)
     ✓ WS3-T4: bkit-telemetry-invariant — counters.verifyAttempt == count of plan-verify rows (7)
       ✓ invariant passes when verifyAttempt count matches plan-verify step count (1 attempt) 0ms
       ✓ invariant passes when verifyAttempt count matches plan-verify step count (3 attempts) 0ms
       ✓ fold deduplicates verifyAttempt counter by (repo, by.workflow, run.parentSha, counter.name) identity 0ms
       ✓ non-verifyAttempt counter rows do not count toward the invariant 0ms
       ✓ malformed JSONL lines are tolerated; invariant still passes over valid rows 0ms
       ✓ verifyAttempt counter.source must be shell-bus post-WS3 (structural trust tier) 0ms
       ✓ invariant holds with empty log (zero attempts == zero verify steps) 0ms
   ✓ mintTs (2)
     ✓ moves a whole-second clock reading 1 ms on 1ms
     ✓ follows `after` when the clock has not passed it, never landing on a whole second 0ms
   ✓ writerProblem (14)
     ✓ admits a listed subagent and the listed orchestrator 0ms
     ✓ admits a direct chat (utility) on decision rows 0ms
     ✓ admits a direct chat (utility) on deferral rows 0ms
     ✓ admits a direct chat (utility) on knowledge rows 0ms
     ✓ accepts a knowledge row written by bkit-build-plan-tests 0ms
     ✓ admits a direct chat (utility) on friction rows 0ms
     ✓ admits a direct chat (utility) on compliance rows 0ms
     ✓ admits a direct chat (utility) on counter rows 0ms
     ✓ admits a direct chat (utility) on outcome rows 0ms
     ✓ refuses an unlisted subagent or orchestrator 0ms
     ✓ admits the auto orchestrator on friction rows 0ms
     ✓ holds model to subagent rows 0ms
     ✓ admits any author on an any-agent kind 0ms
     ✓ admits each closing workflow on the stats kinds, and refuses audit and any subagent 0ms
   ✓ writer sets in telemetry.ts match the jsonl.md table (9)
     ✓ every kind appears in exactly one ledger 0ms
     ✓ decisions / decision: the doc row names docs/decisions.jsonl and the same writers 1ms
     ✓ deferrals / deferral: the doc row names docs/deferrals.jsonl and the same writers 0ms
     ✓ failures / failure: the doc row names docs/failures.jsonl and the same writers 0ms
     ✓ knowledge / knowledge: the doc row names docs/knowledge.jsonl and the same writers 0ms
     ✓ friction / friction: the doc row names .bkit/friction.jsonl and the same writers 0ms
     ✓ stats / compliance: the doc row names .bkit/stats.jsonl, a close-step writer and no subagent 0ms
     ✓ stats / counter: the doc row names .bkit/stats.jsonl, a close-step writer and no subagent 0ms
     ✓ stats / outcome: the doc row names .bkit/stats.jsonl, a close-step writer and no subagent 0ms
   ✓ normalize — schema-1 rows to schema 2 (13)
     ✓ compliance: rule / result / evidence / parentSha move into run and rule; phase is dropped 0ms
     ✓ counter: counterName / Value / Source and parentSha move into counter and run 0ms
     ✓ outcome: run fields move into their blocks; the fields with no place are dropped 0ms
     ✓ chat: every schema-1 field lands in its block, and the totals hold 4ms
     ✓ run: every schema-1 field lands in its block, and the totals hold 1ms
     ✓ a keyed kind (deferral) moves its top fields into bkit / by and keeps its payload 0ms
     ✓ a row carrying schema passes through unchanged 0ms
     ✓ bkitVersion "none" becomes bkit.version null 0ms
     ✓ a non-object reads as an empty row 0ms
     ✓ phase is dropped, outcome redTests moves into build, any kind's parentSha into run 0ms
     ✓ chat: an opencode row's bash categories land on its lowercase bash tool 0ms
     ✓ chat: usage.total.tokens is the sum of its models, as a fresh scan writes it 0ms
     ✓ null or empty workflow / subagent / model are left out of by 0ms
   ✓ fold — schema-1 and schema-2 rows of one identity (1)
     ✓ fold the two into one entry; the newer ts wins whichever shape it has 0ms
   ✓ totals — validate refuses a total that does not match its parts (22)
     ✓ lines.total.added = code + tests + docs 0ms
     ✓ lines.total.deleted = code + tests + docs 0ms
     ✓ lines.total.files = code + tests + docs 0ms
     ✓ lines.total.changed = added + deleted 0ms
     ✓ time.totalMinutes = end - start, within 0.1 0ms
     ✓ chat time.activeMinutes = the sum of time.spans 0ms
     ✓ usage.*.tokens.read = input + cacheWrite + cacheRead 0ms
     ✓ usage.total.turns / tokens = the sum of usage.byModel 0ms
     ✓ usage.total.compactions = usage.main + every agent's usage 0ms
     ✓ usage.total.context.peak = the max of usage.main and every agent instance 0ms
     ✓ agents.total.n = the sum of byAgent 0ms
     ✓ agents.total.errors = the sum of byAgent 0ms
     ✓ agents.byAgent.*.n = the length of its instances 0ms
     ✓ tools.total.calls = the sum of byTool 0ms
     ✓ tools.total.errors = the sum of byTool 0ms
     ✓ bkit.cli.total = the sum of byVerb 0ms
     ✓ steps.total.n = the sum of byStep 0ms
     ✓ steps.total.totalMinutes = the sum of byStep, within 0.1 per part 0ms
     ✓ steps.total.activeMinutes = the sum of byStep, within 0.1 per part 0ms
     ✓ totalsProblem sums groups 0ms
     ✓ build.redTests = steps.byStep["build-tests-red"].n 0ms
     ✓ build.challenge.findings.total = the sum of the four severities 0ms
   ✓ validate — schema-2 top section (18)
     ✓ refuses a row without schema: 3 0ms
     ✓ refuses a top-level bkitVersion 0ms
     ✓ refuses a top-level workflow 0ms
     ✓ refuses a top-level step 0ms
     ✓ refuses a top-level subagent 0ms
     ✓ refuses a top-level model 0ms
     ✓ refuses by.model without by.subagent 0ms
     ✓ accepts an outcome with time: null 0ms
     ✓ accepts bkit.version null on chat and run rows 0ms
     ✓ refuses bkit.version null on a compliance row 0ms
     ✓ refuses bkit.version null on a counter row 0ms
     ✓ refuses bkit.version null on a outcome row 0ms
     ✓ refuses bkit.version null on a friction row 0ms
     ✓ refuses bkit.version null on a deferral row 0ms
     ✓ refuses bkit.version null on a failure row 0ms
     ✓ refuses bkit.version null on a knowledge row 0ms
     ✓ refuses bkit.version null on a decision row 0ms
     ✓ refuses bkit.version null on a feature row 0ms
   ✓ verified model attribution (1)
     ✓ accepts verified unavailable model without confusing configured and observed models 0ms
   ✓ queryLedger — canonical winners before filtering (1)
     ✓ folds numeric timestamps and equal timestamp ties before filtering 1ms
   ✓ provenance compatibility through the ledger read paths (5)
     ✓ keeps a old row with no provenance row intact through validate, normalize, fold and compact 0ms
     ✓ keeps a observed model row intact through validate, normalize, fold and compact 0ms
     ✓ keeps a unavailable model row intact through validate, normalize, fold and compact 0ms
     ✓ keeps a unknown optional field row intact through validate, normalize, fold and compact 0ms
     ✓ diagnoses a row with no timestamp or no key instead of reading it as clean 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/ledgers/telemetry.test.ts > test-run status row validation > accepts a counted CI evidence round and refuses 0
AssertionError: expected 'invalid CI evidence round' to be null

- Expected:
null

+ Received:
"invalid CI evidence round"

 ❯ .bkit/core/engine/ledgers/telemetry.test.ts:134:32
    132|       artifact: "docs/plans/202611/logs/1-x/run-tests-1.md",
    133|     };
    134|     expect(testRunProblem(ci)).toBeNull();
       |                                ^
    135|     expect(testRunProblem({ ...ci, failures: null })).toBeNull();
    136|     expect(testRunProblem({ ...ci, failures: 0 })).not.toBeNull();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 299 passed (300)
   Start at  22:47:44
   Duration  563ms (tests 84%, setup 7%, import 6%, transform 3%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-6qhkNQ/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/checks/status-holes.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/checks/status-holes.test.ts

```

## Runner output — `.bkit/core/engine/checks/status-holes.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/checks/status-holes.test.ts

[test-timeout-budget] load average 16.5 on 10 cores: unit limits 12750ms per test, 25500ms per hook (x2.55)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question

 ❯ .bkit/core/engine/checks/status-holes.test.ts (77 tests | 1 failed) 1151ms
   ✓ source derivation (6)
     ✓ derives the expected step universe for every workflow 119ms
     ✓ reports table drift without failing 1ms
     ✓ records every BKIT literal in a step as a required call 0ms
     ✓ derives a required call from each {BKIT} literal of every live step section 57ms
     ✓ parses a synthetic md with headings + literals 0ms
     ✓ flags a status write that lives outside any numbered step (orphanSteps) 0ms
   ✓ classifyRun (6)
     ✓ classifies a clean Path A run (no conflict-resolve) 0ms
     ✓ classifies a Path B run (conflict-resolve present) 0ms
     ✓ classifies a MERGED-on-entry run (Step 2 routed to Step 13 before its writes) 0ms
     ✓ does NOT read a double hole as MERGED_ON_ENTRY (regression) 0ms
     ✓ classifies an aborted run (workflow-failed, no close-workflow) 0ms
     ✓ classifies an in-progress run (no close-workflow, no workflow-failed) 0ms
   ✓ computeMandatoryForPath (5)
     ✓ Path A excludes conflict-resolve + retry-loop steps 0ms
     ✓ Path B includes conflict-resolve, excludes retry-loop steps 0ms
     ✓ MERGED-on-entry excludes the entire middle 0ms
     ✓ ABORTED returns empty mandatory set 0ms
     ✓ IN_PROGRESS returns empty mandatory set 0ms
   ✓ detectHoles (7)
     ✓ reports no holes for a clean Path A run 0ms
     ✓ reports ship-regression-guard as missing when skipped in a completed Path A run 0ms
     ✓ reports conflict-resolve as missing when skipped in a completed Path B run 0ms
     ✓ surfaces invented step names as unexpected (ship-resume-human-override) 0ms
     ✓ does NOT flag absence of failure-diagnose/remediate (retry-loop steps) 0ms
     ✓ aborted run: flags pre-abort holes but not post-abort absences 0ms
     ✓ in-progress run: no holes reported 0ms
   ✓ auditStatusJsonl (end-to-end) (10)
     ✓ Path A: no holes against real bkit-ship.md 10ms
     ✓ Path A with engine-action rows interleaved: same report 20ms
     ✓ Path B: no holes against real bkit-ship.md 10ms
     ✓ MERGED-on-entry: no holes against real bkit-ship.md 10ms
     ✓ retry-loop Path B: no holes (failure steps optional) 10ms
     ✓ holey fixture: ship-regression-guard missing surfaces in advisory report 10ms
     ✓ invented name (ship-resume-human-override) surfaces as unexpected 10ms
     ✓ aborted run with pre-abort hole detected 10ms
     ✓ empty status.jsonl → IN_PROGRESS, no holes, no crash 10ms
     ✓ unparseable lines skipped without crash 10ms
   ✓ formatAdvisoryReport (2)
     ✓ includes ADVISORY prefix + fail-open note 10ms
     ✓ includes path classification in output 10ms
   ✓ CLI main() — advisory exit 0 (4)
     ✓ exits 0 with advisory output on a known-holey fixture (no throw) 11ms
     ✓ finds bkit-ship.md from the built dist/ layout, not only from source 70ms
     ✓ main() with no args writes skip message and returns (exit 0) 0ms
     ✓ main() with missing file writes skip message and returns (exit 0) 0ms
   ✓ step conditionality (2)
     ✓ classifies a step conditional only under the column-0 marker rule 50ms
     ✓ does not report a conditional step as a step hole 0ms
   ✓ resume re-run of a red group gate (1)
     ✓ reports no hole for a build-decision row followed by a second build-group-gate row under the same verify attempt 0ms
   ✓ CLI sweep summary (2)
     ✓ prints a sweep summary line and exits 0 37ms
     ✓ checks each run of one workflow in a file on its own 57ms
   ❯ check — hole classes (27)
     ✓ audits evidence-first debug rounds without requiring a local discovery run 2ms
     × a counted CI round with its step-done row raises no CI evidence hole 6ms
     ✓ ignores stale CI context-fetch requirements after local replacement 0ms
     ✓ ignores stale CI context-fetch requirements after new generation 0ms
     ✓ ignores stale CI context-fetch requirements after changed identity 0ms
     ✓ ignores stale CI context-fetch requirements after invalid selection 0ms
     ✓ a tracker-none run that journals every rendered call is CLEAN 168ms
     ✓ names an evidence hole with its missing calls 1ms
     ✓ a run whose journal starts mid-run reports no evidence hole for steps finished before its first engine-call row 0ms
     ✓ a run whose journal saw only ambient calls reports no evidence hole for steps whose finish call was not journaled 0ms
     ✓ a visit whose row writer sits below workflows close is judged steps-only when the journal saw none of its calls 0ms
     ✓ reports a missing required step as a step hole 0ms
     ✓ reports unexercised calls without marking the run holey 0ms
     ✓ charges calls below a step's finish line to that step 118ms
     ✓ calls outside the journal window are matched but never required 1ms
     ✓ never requires the workflows start call, which a fresh run cannot journal 100ms
     ✓ reports an untaken route arm as unexercised 58ms
     ✓ credits a repeated route-arm call to the step that names it next 1ms
     ✓ never reports the rows build writes outside its numbered steps as unexpected 57ms
     ✓ gives each group-loop repeat its own gaps 0ms
     ✓ charges a row two steps write to the step whose visit it sits in 1ms
     ✓ treats a call written after an inline If arrow in the same sentence as a route arm 0ms
     ✓ treats a numbered If sub-step as a route arm 0ms
     ✓ treats a named block an If line picks as a route arm 0ms
     ✓ charges a call below a step's first finish line to that step when its optional finish is skipped 0ms
     ✓ matches a call the Contract allows at any point 100ms
     ✓ matches workflow-level calls outside any step 0ms
   ✓ check — verdict metadata (5)
     ✓ gives a pre-journal run a steps-only verdict 0ms
     ✓ names a call no contract step owns 0ms
     ✓ excludes its own journaled call 0ms
     ✓ takes the last completeness row and recomputes when rows follow it 0ms
     ✓ reports a hole in a long-closed run with no baseline 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > check — hole classes > a counted CI round with its step-done row raises no CI evidence hole
AssertionError: expected [ { step: 'debug-run-tests', …(3) } ] to deeply equal []

- Expected
+ Received

- []
+ [
+   {
+     "index": 1,
+     "missing": [
+       {
+         "flags": [
+           "ci-run",
+         ],
+         "noun": "tests",
+         "verb": "run",
+       },
+     ],
+     "number": 1,
+     "step": "debug-run-tests",
+   },
+ ]

 ❯ .bkit/core/engine/checks/status-holes.test.ts:1134:69
    1132|     const contract = deriveContract(md, "debug");
    1133|     const holes = check(rows, contract).evidenceHoles;
    1134|     expect(holes.filter((hole) => hole.step === "debug-run-tests")).to…
       |                                                                     ^
    1135|     expect(holes.some((hole) => JSON.stringify(hole).includes("tests r…
    1136|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 76 passed (77)
   Start at  22:47:46
   Duration  1.46s (tests 84%, import 8%, transform 6%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-FbKrbb/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/steps.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/steps.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/steps.test.ts

[test-timeout-budget] load average 15.5 on 10 cores: unit limits 12250ms per test, 24500ms per hook (x2.45)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts (129 tests | 1 failed) 17269ms
   ❯ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 324ms
     × finishes a CI round only with its own failed job count 99ms
     ✓ preserves local clamp enforcement when completing test rounds 77ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 84ms
     ✓ done prints progressLine 98ms
     ✓ progress output metadata 0ms
     ✓ gate progress number validation 81ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 208ms
     ✓ done --group writes group on the row 167ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 291ms
     ✓ --commit=none writes the row and leaves it uncommitted 96ms
     ✓ build-group-start records parentSha and group 89ms
     ✓ carries extra fields, parsed as JSON when they are JSON 193ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 74ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 75ms
     ✓ refuses an empty artifact 72ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 75ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 73ms
     ✓ rejects ["--verdict=MAYBE"] 82ms
     ✓ rejects ["--strategy=YOLO"] 72ms
     ✓ rejects ["--failures=-1"] 64ms
     ✓ rejects ["--field=verdict=PASS"] 63ms
     ✓ rejects ["--status=SKIPPED"] 62ms
     ✓ needs a message unless --commit=none 72ms
     ✓ reports a failed commit with exit 8 without writing the row 472ms
     ✓ a failed commit leaves no row staged in the index 249ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 297ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 265ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 556ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 337ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 552ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 52ms
     ✓ a missing artifact exits 4 46ms
     ✓ empty artifact exits 0 46ms
     ✓ pending artifact exits 1 46ms
     ✓ no marker artifact exits 2 43ms
     ✓ disallowed artifact exits 3 47ms
     ✓ bad failures artifact exits 4 47ms
     ✓ a required field that is absent is invalid (re-prompt) 55ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 112ms
     ✓ only reads above the marker 53ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 142ms
     ✓ fails when no row was written for the step 56ms
     ✓ --ref reads the status file as committed on that ref, not from disk 160ms
     ✓ --ref exits 3 when the ref does not carry the status file 163ms
     ✓ fails on a placeholder left in the artifact 128ms
     ✓ fails when the row's verdict differs from the artifact's 135ms
     ✓ fails when the row does not list the artifact, or carries another attempt 128ms
     ✓ fails on a missing artifact 124ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 117ms
     ✓ refuses a negative or non-integer attempt (2) 45ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 51ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 52ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 46ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 52ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 51ms
     ✓ fails a diagnose row missing its strategy, passes with it 97ms
     ✓ fails a run-tests row missing its scope, and an empty scope 153ms
     ✓ names every missing field at once 49ms
     ✓ asks nothing of a step that writes none of them 52ms
     ✓ ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes 41ms
   ✓ ledger writer references (1)
     ✓ every configured writer has a prompt file 0ms
   ✓ placeholderLines (1)
     ✓ flags a bare PENDING or a field left at PENDING, not prose that mentions it 0ms
   ✓ bkit steps finish (16)
     ✓ preserves challenge findings in the event when a later round overwrites the report 52ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 156ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 45ms
     ✓ re-asks (exit 6) when a field the prompt declares is missing 44ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 46ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 51ms
     ✓ a true | false header field is true when any agent sets it true 51ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 62ms
     ✓ records the header's Strategy on the row 60ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 63ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 144ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 52ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 110ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 196ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 245ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 198ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 287ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 427ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 248ms
     ✓ --post needs --number; without --post there is no tracker key 89ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 50ms
     ✓ --strip-header drops the prior version's own header 49ms
     ✓ exits 4 when the prior version is missing or empty 50ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 50ms
     ✓ checks the FID's shape for the wired tracker 62ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 120ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 58ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 261ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 206ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 125ms
       ✓ gate --issue without --fid is a usage error 53ms
       ✓ gate --issue="" under none keeps today's check 54ms
     ✓ --attempt-of checks the row carries the derived counter 130ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 334ms
     ✓ writeStepRow refuses when a recorded path changed 373ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 168ms
     ✓ writeStepRow appends its commit sha to the record 310ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 430ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 108ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 240ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 230ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 133ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 380ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 268ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 226ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 154ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 356ms
     ✓ exit codes list 11 as planned tests touched and 15 as source touched in the tests step 0ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 61ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 135ms
     ✓ does not count an artifact the run found committed when it started 190ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 122ms
     ✓ commits a package.json change outside bkit.workflows 189ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 354ms
   ✓ bkit steps stub --result-file (12)
     ✓ derives supported header fields and rejects stale bodies without false PASS 82ms
     ✓ registers every named header kind 8ms
     ✓ renders and verifies the header of every prompt that declares one 153ms
     ✓ renders no PASS from a result that omits its evidence 93ms
     ✓ refuses line breaks in header-bound result values 63ms
     ✓ retains special verdict judgments and legacy stub behavior 88ms
     ✓ derives audit IDs totals ledger payloads and coverage from one result 71ms
     ✓ derives a fresh audit key when the ledger already holds it 62ms
     ✓ keeps the audit key when the same finding is rendered again after its append 62ms
     ✓ reads held audit keys from the linked worktree's own ledger 100ms
     ✓ refuses a result file left from an earlier round 60ms
     ✓ audit result render keeps an existing anchored report intact 60ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/steps.test.ts > test-round completion evidence > finishes a CI round only with its own failed job count
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/steps.test.ts:225:27
    223|     counted.save();
    224|     const finished = await run(counted.cwd, [...counted.args, "--failu…
    225|     expect(finished.code).toBe(0);
       |                           ^
    226|     expect(finished.json.row).toMatchObject({ step: "debug-run-tests",…
    227|     expect(stepDone(counted)).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 128 passed (129)
   Start at  22:47:49
   Duration  17.72s (tests 98%, transform 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-cx0OFR/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts

[test-timeout-budget] load average 12.2 on 10 cores: unit limits 10600ms per test, 21200ms per hook (x2.12)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question

 ❯ .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts (8 tests | 1 failed) 29101ms
   ❯ Debug CI evidence sequence (8)
     ✓ finishes local-only rounds through the actual Debug Step 3 commands 4390ms
     × records the failed job count and reads an uncounted local round as unknown 1110ms
     ✓ finishes replacement CI evidence with the unchanged debug run number 2338ms
     ✓ finishes the first CI evidence round of the second debug run 1263ms
     ✓ checks the complete selected CI fix sequence against green and red final runs 3479ms
     ✓ reloads saved fixes and recollects explicitly replaced evidence generations 5760ms
     ✓ preserves local and repro overrides across actual workflow command sequences 8266ms
     ✓ blocks missing logs and wrong-branch evidence before source edits 2494ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts > Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown
AssertionError: expected { code: 1, json: { …(20) }, err: '' } to match object { code: 1, …(1) }
(41 matching properties omitted from actual)

- Expected
+ Received

  {
    "code": 1,
    "json": {
-     "failures": 2,
+     "failures": null,
      "source": "ci",
    },
  }

 ❯ .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts:381:21
    379|     expect(f.select().state).toMatchObject({ ciRun: "123", ciGeneratio…
    380|     const ciRound = f.round();
    381|     expect(ciRound).toMatchObject({ code: 1, json: { source: "ci", fai…
       |                     ^
    382|     expect(ciRound.json.row.failures).toBe(2);
    383|     expect(f.finishRound(), "finish CI round").toMatchObject({ code: 0…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 7 passed (8)
   Start at  22:48:07
   Duration  29.21s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-jTe21u/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
