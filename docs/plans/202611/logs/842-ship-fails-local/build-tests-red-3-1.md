Enforced: true
Red: 4
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/842-ship-fails-local-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 9 | `.bkit/core/engine/commands/workflow/runs.test.ts` "requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse" | red | failure: [bkit-runs] unknown flag --require-reconciled : expected 2 to be 21 // Object.is equality |
| 9 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "routes late revalidation code and gate seventeen through reconciliation before merge" | red | failure: expected '## 🤖 Step 9 — Re-validate\n\n**If** …' to match /runs revalidate[^\n]*--require-reconc…/ |
| 10 | `.bkit/core/engine/commands/workflow/runs.test.ts` "rejects MCP green runs from another repository or workflow at the same head" | red | failure: {"id":1900,"workflow_id":456,"path":".github/workflows/bkit-ci.yml","repository":{"full_name":"foreign/repo"},"head_repository":{"full_name":"example/example"},"head_sha":"b499d99822aaceef7232cebc15d3aeabbbd684b4","head_branch":"feat/842-gate","event":"push","status":"completed","conclusion":"success","html_url":"https://github.com/example/example/actions/runs/1900"}: expected +0 not to be +0 // Object.is equality |
| 10 | `.bkit/core/engine/commands/workflow/runs.test.ts` "rejects MCP capstone jobs belonging to another run" | red | failure: {"id":19001,"name":"bkit-tests-check","status":"completed","conclusion":"success","run_id":9999,"run_url":"https://api.github.com/repos/example/example/actions/runs/1900","head_sha":"b499d99822aaceef7232cebc15d3aeabbbd684b4"}: expected +0 not to be +0 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/runs.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/runs.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/runs.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/runs.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts (192 tests | 3 failed) 18937ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 759ms
   ✓ preserves the requested event for selected-workflow verification 546ms
   ✓ requires selected other-workflow success at the exact pushed head 860ms
   ✓ bkit runs locate (11)
     ✓ locates CI evidence using prompt saved issue and local precedence 844ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 51ms
     ✓ filters branch and PR discovery by configured workflow and exact head 336ms
     ✓ freezes explicit workflow run attempt and all failed job pages 303ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 467ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 682ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 193ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 195ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 196ms
     ✓ rejects a workflow result count smaller than its returned records 192ms
     ✓ validates normalized fallback evidence against the requested identity 72ms
   ✓ fixture gh stub (10)
     ✓ runs?head_sha=green-capstone returns the captured workflow_runs list 8ms
     ✓ runs/<id>/jobs returns the captured jobs list, --paginate is accepted 10ms
     ✓ runs?head_sha=<unknown> returns total_count 0 (no-run shape) 7ms
     ✓ BKIT_FAKE_GH_API_ERROR=1: every api call exits 1 with stderr 7ms
     ✓ rate_limit returns the requested fixture state 8ms
     ✓ non-api argv exits non-zero (loud on an unmocked boundary) 6ms
     ✓ BKIT_FAKE_RATELIMITED=1: the run list fails rate-limit-shaped, rate_limit still answers 14ms
     ✓ --paginate emits one document per page; --slurp collapses them into an array 27ms
     ✓ rejects a '../'-laden SHA (no path traversal out of the runs dir) 7ms
     ✓ pr view is keyed by --repo; without it the checkout fixture is read 19ms
   ❯ bkit runs gate (74)
     ✓ refuses green CI when dev advanced beyond the validated code head 307ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 388ms
     ✓ checks the named repository base and fails closed on missing evidence 222ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 192ms
     × rejects MCP green runs from another repository or workflow at the same head 153ms
     × rejects MCP capstone jobs belonging to another run 148ms
     ✓ accepts a green capstone at the head (exit 0) and says so 23ms
     ✓ rejects a failed run (12) 22ms
     ✓ rejects no run at the head (10) 12ms
     ✓ rejects runs that have not completed (11) 12ms
     ✓ rejects a green run at a superseded head (14), given --branch 18ms
     ✓ --fetch refreshes origin/<branch> before gating 125ms
     ✓ --fetch needs --branch (2) 1ms
     ✓ without --branch a superseded head is 10, not 14 (no invented attribution) 10ms
     ✓ rejects a run without the capstone job (13) 22ms
     ✓ rejects a cancelled run (15) 12ms
     ✓ rejects a green run whose capstone concluded 'cancelled' (12) 23ms
     ✓ rejects a green run whose capstone concluded 'skipped' (12) 23ms
     ✓ rejects a green run whose capstone concluded 'timed_out' (12) 23ms
     ✓ rejects a green run whose capstone concluded 'neutral' (12) 37ms
     ✓ rejects a green run whose capstone concluded 'action_required' (12) 24ms
     ✓ rejects a green run whose capstone concluded 'stale' (12) 23ms
     ✓ rejects a green run whose capstone concluded 'startup_failure' (12) 23ms
     ✓ exit 12 failed steps (10)
       ✓ a stale register alone is regenerable; the capstone is left out 23ms
       ✓ both floor steps failing is regenerable 23ms
       ✓ any failed step off the list makes the whole result unregenerable 25ms
       ✓ a job that concluded 'failure' with no failed step is {job}/ and unregenerable 23ms
       ✓ a job that concluded 'timed_out' with no failed step is {job}/ and unregenerable 23ms
       ✓ a job that concluded 'cancelled' with no failed step is {job}/ and unregenerable 23ms
       ✓ a timed-out step counts as failed 23ms
       ✓ bkit.testing.ciGenerated adds steps to the floor 42ms
       ✓ a step name alone does not match a {job}/{step} entry in another job 23ms
       ✓ refusals other than a failed run carry no failed steps 12ms
     ✓ --repo scopes --pr resolution (2)
       ✓ reads the head from the named repo, not the checkout's own PR 31ms
       ✓ logs the disagreement when the resolved repo differs from --repo 21ms
     ✓ skipped lanes (16 is opt-in) (5)
       ✓ a skipped lane alone does not refuse — the capstone's green settles it — but is reported 22ms
       ✓ refuses a skipped lane named in bkit.testing.ciRequired (16) 22ms
       ✓ a required lane naming a different lane does not refuse 22ms
       ✓ refuses when any of several required lanes was skipped 22ms
       ✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 23ms
     ✓ a newer in-flight re-dispatch does not mask a completed green at the head 22ms
     ✓ tells an API error (20) from no run (10) 40ms
     ✓ shapes a rate-limit refusal from rate_limit (20) 18ms
     ✓ stderr noise on a successful gh call does not corrupt the JSON read 23ms
     ✓ an unparseable jobs response is an API error (20), not a missing capstone (13) 23ms
     ✓ gh missing from PATH exits 80 (use the MCP fallback), not an API error 1ms
     ✓ BKIT_SHIP_GATE_OVERRIDE (4)
       ✓ pinned to the refused head turns the refusal into 0 and appends the audit row 22ms
       ✓ a different SHA is ignored — the refusal stands 22ms
       ✓ honoured with no status file (no crash), the row goes to stderr 23ms
       ✓ an unwritable status file still exits 0 and emits the row to stderr (never invisible) 21ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 45ms
       ✓ bkit.testing.ciRequired resolves from package.json 26ms
       ✓ absent ciRequired means no refusal 23ms
       ✓ a malformed ciRequired falls back to none, never crashes 22ms
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 44ms
     ✓ missing --head is a usage error (2) 0ms
     ✓ an empty --head= is a usage error (2), not a gate refusal 4ms
     ✓ --event (5)
       ✓ --event push ignores a pull_request run: no push run is 10, not 11 12ms
       ✓ without --event the in-flight pull_request run reads as in progress (11) 12ms
       ✓ --event push selects the green push run beside an in-flight pull_request run 22ms
       ✓ --event push reds on a failed push run even when a newer pull_request run is green 20ms
       ✓ without --event the newer green pull_request run masks the failed push run 22ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 49ms
       ✓ a run still in progress whose capstone already passed passes 33ms
       ✓ a capstone still running is in progress (11) 24ms
       ✓ a failed capstone fails (12) even when every other job passed 24ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 47ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 45ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 115ms
       ✓ a source change past the validated head refuses (17) and names the path 100ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 112ms
       ✓ --validated equal to --head is the plain head check 22ms
       ✓ --validated without --month / --fid is a usage error (2) 79ms
       ✓ a validated sha that is not an ancestor refuses (17) 89ms
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
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 463ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 396ms
     ✓ e2e: green push run beside the PR's own in-flight run -> 0 29ms
     ✓ e2e: a red push run is not masked by a newer green PR run -> 1 22ms
     ✓ e2e: only the PR's own run exists -> absent, not in progress (3) 18ms
     ✓ usage: missing --head or a non-numeric minute value exits 2 1ms
   ✓ bkit runs wait (10)
     ✓ the dispatch probe matches the capstone's lane namespace, case-insensitive, by name or context 0ms
     ✓ is bounded: ceil(budget / interval) attempts, no sleep after the last 0ms
     ✓ found stops polling; every poll erroring is err with allErrored 0ms
     ✓ a sleep that overruns its window is blocked: hand the poll to the agent 0ms
     ✓ PR completed = no open checks; run targets are head-anchored 0ms
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 30ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 27ms
     ✓ CLI: a failed gh workflow run exits 5 29ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1051ms
     ✓ CLI: usage errors exit 2 8ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 101ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 158ms
     ✓ a failed re-trigger push names the cause in the log 511ms
     ✓ a failed re-trigger push leaves no orphan commit behind 301ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 296ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 159ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 93ms
     ✓ gh-error: every poll errored 82ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 143ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 143ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 162ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 161ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 97ms
     ✓ CLI: verdict JSON, body scan, exit codes 154ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 106ms
     ✓ CLI: --poll-result is validated, --attempts needs it 80ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 256ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 506ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 495ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 499ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 127ms
     ✓ re-trigger on dev only uses the record of its own FID 150ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 155ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 158ms
   ✓ bkit runs declared (2)
     ✓ exit 0 when .github/workflows/<bkit.testing.ciWorkflow> exists, 1 when not 11ms
     ✓ the default bkit-ci.yml counts when no bkit.testing.ciWorkflow is configured 4ms
   ✓ scanBody (8)
     ✓ flags [skip ci] inherited into the landed commit body 23ms
     ✓ flags [ci skip] inherited into the landed commit body 22ms
     ✓ flags [no ci] inherited into the landed commit body 23ms
     ✓ flags [skip actions] inherited into the landed commit body 22ms
     ✓ flags [actions skip] inherited into the landed commit body 22ms
     ✓ flags [SKIP CI] inherited into the landed commit body 22ms
     ✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 50ms
     ✓ an empty or unreadable sha is an error, not a clean result 21ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 42ms
     ✓ --pr refuses a title carrying a skip token (18) and --record writes the refusal row 13ms
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 95ms
     ✓ --snapshot scopes its run list and dev lookups to --repo 70ms
     ✓ --snapshot without --repo leaves its run list unscoped 41ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 43ms
     ✓ a refused capstone records FAIL with its reason 43ms
     ✓ an unreadable PR is an API error (20) with no head 11ms
     ✓ takes exactly one of --head, --pr, --squash-of 4ms
   ❯ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 90ms
       ✓ without --repo no call gains a --repo flag 111ms
       ✓ repoScopedGh appends --repo to workflow run, leaves gh api alone, and is a no-op without a repo 0ms
     × requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 282ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 78ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 70ms
     ✓ refuses an unknown --reason 56ms
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 63ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 100ms
     ✓ ref uppercases a Linear or Jira key 0ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 67ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 42ms
     ✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 43ms
     ✓ CI_DEV refuses the slug "a/b" (exit 9) 43ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 96ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 84ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 93ms
     ✓ an unknown phase exits 3; gh needing auth exits 80 55ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 103ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 108ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 118ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 113ms
     ✓ --file and --step go together 106ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs gate > rejects MCP green runs from another repository or workflow at the same head
AssertionError: {"id":1900,"workflow_id":456,"path":".github/workflows/bkit-ci.yml","repository":{"full_name":"foreign/repo"},"head_repository":{"full_name":"example/example"},"head_sha":"b499d99822aaceef7232cebc15d3aeabbbd684b4","head_branch":"feat/842-gate","event":"push","status":"completed","conclusion":"success","html_url":"https://github.com/example/example/actions/runs/1900"}: expected +0 not to be +0 // Object.is equality
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:1147:53
    1145|       f.write([run], { total_count: 1, jobs: [f.job] });
    1146|       const refused = await f.gate();
    1147|       expect(refused.code, JSON.stringify(run)).not.toBe(0);
       |                                                     ^
    1148|       expect(refused.json).toMatchObject({ passed: false });
    1149|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs gate > rejects MCP capstone jobs belonging to another run
AssertionError: {"id":19001,"name":"bkit-tests-check","status":"completed","conclusion":"success","run_id":9999,"run_url":"https://api.github.com/repos/example/example/actions/runs/1900","head_sha":"b499d99822aaceef7232cebc15d3aeabbbd684b4"}: expected +0 not to be +0 // Object.is equality
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:1174:53
    1172|       f.write([f.run], pages(job));
    1173|       const refused = await f.gate();
    1174|       expect(refused.code, JSON.stringify(job)).not.toBe(0);
       |                                                     ^
    1175|       expect(refused.json).toMatchObject({ passed: false });
    1176|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs revalidate > requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse
AssertionError: [bkit-runs] unknown flag --require-reconciled
: expected 2 to be 21 // Object.is equality

- Expected
+ Received

- 21
+ 2

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:3084:33
    3082|       "--require-reconciled",
    3083|     );
    3084|     expect(late.code, late.err).toBe(21);
       |                                 ^
    3085|     expect(late.json).toMatchObject({
    3086|       reconcileRequired: true,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 189 passed (192)
   Start at  23:05:02
   Duration  19.09s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-XHNqDR/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/ship-invariants.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`

````

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/ship-invariants.test.ts

[test-timeout-budget] load average 1.1 on 10 cores: unit limits 5050ms per test, 10100ms per hook (x1.01)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local

 ❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (61 tests | 1 failed) 26ms
   ✓ deferred sweep — disabled-test evidence (4)
     ✓ adjudicates every scanner hit against the diff and current coverage 1ms
     ✓ requires scoped owner approval and current-contract evidence for retirement 0ms
     ✓ blocks scan errors, real disabling markers and unproven deletions 0ms
     ✓ records each disposition and requires complete adjudication before PASS 0ms
   ❯ ship reconciliation and retry contracts (7)
     ✓ reconciles and publishes feature code before bookkeeping on every ship path 1ms
     ✓ routes stale bases and refused merges through the bounded integration or validation loop 1ms
     × routes late revalidation code and gate seventeen through reconciliation before merge 2ms
     ✓ passes the actual merge target and defers branch deletion to guarded close 3ms
     ✓ routes MCP safety facts through engine decisions with transport accounting 1ms
     ✓ refreshes merge-aware feature coverage immediately before both reuse decisions 0ms
     ✓ ties deferred sweep and docs reuse to the recorded feature code state 1ms
   ✓ bkit-ship.md — staging hygiene (banned patterns) (2)
     ✓ has no `git add -A` anywhere (full content) 0ms
     ✓ has no literal `git add` anywhere — every stage goes through bkit ledgers 0ms
   ✓ bkit-ship.md — push-timing invariant (feature-branch pushes before merge) (7)
     ✓ pushes feature code during entry and base reconciliation, integration, bookkeeping and fixes 0ms
     ✓ regenerates only in the Merge Gate, after a red CI run, never up front in Base Check 0ms
     ✓ never force-pushes, with or without lease 0ms
     ✓ the Integrate push is a plain push of the locally merged branch 0ms
     ✓ the pre-merge bookkeeping push is a plain push — never forced 0ms
     ✓ the pre-merge bookkeeping commit stages through bkit ledgers --scope=pr, after the step-done row 0ms
     ✓ pushes the branch to open a missing PR only when ahead of dev, non-force, before bkit prs open 0ms
   ✓ bkit-ship.md — bookkeeping and status writes (4)
     ✓ Step 1 resolves the status log through bkit status path, inside the worktree 0ms
     ✓ Step 1 opens the run in the worktree straight after the lock, before any tracker write 0ms
     ✓ no fence reassigns STATUS — every status write takes the resolved {STATUS} 0ms
     ✓ every ship audit row is written through a command, into {STATUS} 1ms
   ✓ every workflow writes its own workflow-started row (#492) (5)
     ✓ bkit-design.md opens its run with bkit workflows start --workflow=design 1ms
     ✓ bkit-plan.md opens its run with bkit workflows start --workflow=plan 1ms
     ✓ bkit-build.md opens its run with bkit workflows start --workflow=build 1ms
     ✓ bkit-debug.md opens its run with bkit workflows start --workflow=debug 1ms
     ✓ bkit-ship.md opens its run with bkit workflows start --workflow=ship 0ms
   ✓ no workflow bash block appends to status.jsonl or .bkit/issues.jsonl with >> (#467) (6)
     ✓ bkit-design.md 0ms
     ✓ bkit-plan.md 0ms
     ✓ bkit-build.md 0ms
     ✓ bkit-debug.md 0ms
     ✓ bkit-ship.md 0ms
     ✓ RED-PROOF: the hand-append shapes are caught 0ms
   ✓ bkit-ship.md — Step 6 SHIPPED row comes from bkit roadmap feature --strict (#380) (2)
     ✓ appends the SHIPPED row mechanically into the worktree ledger, not through the update-docs prompt 0ms
     ✓ a row that did not land stops the step — no re-grep of the ledger 0ms
   ✓ bkit-ship.md — canonical 14 ship-* step-key set (1)
     ✓ publishes the canonical 14 ship-* step-key set (no invented names) 1ms
   ✓ bkit-ship.md — the merge is pinned to the head the gate passed (3)
     ✓ never merges through raw gh pr merge 0ms
     ✓ the merge gate runs before bkit prs merge, which is pinned to the gate's head 0ms
     ✓ F4a: the merge gate is handed the run's status log, and snapshots before deciding 0ms
   ✓ bkit-ship.md — dev writes live in commands (1)
     ✓ no fence checks out, commits to or pushes dev by hand; sync-dev, close and flush do 0ms
   ✓ bkit-ship.md — build-challenge remediation regressions (4)
     ✓ F1: Integrate merges origin/dev through bkit branches sync --merge and commits nothing by hand 0ms
     ✓ F2: no single-quoted jq program carries a shell ${...} expansion 0ms
     ✓ F3: ship never requests a server-side update-branch, through bkit or raw gh 0ms
     ✓ F5: gate code 11 (poll) routes to Step 9 alongside codes 10, 14 and 17 0ms
   ✓ bkit-ship.md — #363: the auto-route marker comes from labels re-read at the merge (2)
     ✓ no cross-Bash-tool-call handoff survives anywhere in the workflow 0ms
     ✓ Step 10 re-reads the labels through the tracker and passes them to the merge 0ms
   ✓ bkit-ship.md — Failure Path single-write contract (8)
     ✓ records the failure through bkit workflows fail, booked where the runtime books 0ms
     ✓ flushes through bkit workflows handover --flush, once 0ms
     ✓ runs no git push, commit or second write of its own 0ms
     ✓ does not route any step back into the Failure Path 0ms
     ✓ writes .deferred-blocked with touch under BOOK_ROOT 0ms
     ✓ gitignores routing sentinels in the rendered file and the template source 0ms
     ✓ wires bkit ledgers into exactly 2 bash regions 0ms
     ✓ every bkit ledgers stage / commit stops the step on a non-zero exit 0ms
   ✓ bkit-ship.md — issue-less runs and the main guard (5)
     ✓ Step 10 label re-read skips when ISSUE_ID is empty 0ms
     ✓ naming warning comes from worktrees setup, which reads the issue only when there is one 1ms
     ✓ Step 10 MCP merge asserts base dev 0ms
     ✓ Step 14.3 labels skip when ISSUE_ID is empty 0ms
     ✓ a ship on dev or main prints the engine refusal and stops 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/ship-invariants.test.ts > ship reconciliation and retry contracts > routes late revalidation code and gate seventeen through reconciliation before merge
AssertionError: expected '## 🤖 Step 9 — Re-validate\n\n**If** …' to match /runs revalidate[^\n]*--require-reconc…/

- Expected:
/runs revalidate[^\n]*--require-reconciled/

+ Received:
"## 🤖 Step 9 — Re-validate

**If** `RECONCILE_REQUIRED` = true → clear it → Step 3 before validation. A previous `DONE` row alone never proves coverage of imported feature code.

1. Resolve the head CI must pass at. The block re-validates when the code moved **or** `REVALIDATE_REASON` = `gate-refusal`: it probes for a run at it first, dispatches only when none, and waits for it to complete. Drop `--reason` when `REVALIDATE_REASON` is empty:
   ```bash
   \"{BKIT}\" runs revalidate --pr=\"{PR_NUMBER}\" --entry-head=\"{ENTRY_HEAD}\" --code-head=\"{CODE_HEAD}\" --branch=\"{SHIP_BRANCH}\" --month=\"{YYYYMM}\" --fid=\"{FID}\" --file=\"{STATUS}\" --reason=\"{REVALIDATE_REASON}\" --repo=\"{OWNER_REPO}\"
   ```
   Hold `validatedHead` as `VALIDATED_HEAD`.

### 🔒 Gate 9 — Re-validate

```bash
\"{BKIT}\" steps gate --workflow=ship --step=ship-bookkeeping-push --file=\"{STATUS}\" --progress-number=9 --placeholder=VALIDATED_HEAD={VALIDATED_HEAD}
```

- [ ] Validated head resolved
- [ ] CI re-validated (`runs revalidate`)

---

## 🤖 Step 10 — Merge Gate + Merge PR"

 ❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts:216:24
    214|     const ship = readShip();
    215|     const revalidate = step(ship, 9);
    216|     expect(revalidate).toMatch(/runs revalidate[^\n]*--require-reconci…
       |                        ^
    217|     expect(revalidate).toMatch(/`reconcileRequired`[^\n]*RECONCILE_REQ…
    218|     const lateCode = section(revalidate, /^   - \*\*If\*\* exit 21\b/,…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 60 passed (61)
   Start at  23:05:22
   Duration  96ms (tests 59%, setup 26%, import 6%, transform 5%, worker 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-r8p15G/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
````
